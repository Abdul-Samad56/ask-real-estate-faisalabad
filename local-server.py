#!/usr/bin/env python3
"""
ASK REAL ESTATE local server.

Run this file to serve the static website and save owner accounts/listings in
data/ask_real_estate.sqlite3 on this PC.
"""
from __future__ import annotations

import base64
import csv
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import subprocess
import sys
import time
import uuid
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "ask_real_estate.sqlite3"
HOST = "127.0.0.1"
PORT = int(os.environ.get("ASK_LOCAL_PORT", "8000"))
ADMIN_EMAILS = {"abdulsamadkhattak5@gmail.com"}
SESSION_SECONDS = 30 * 24 * 60 * 60

SHEET_HEADERS: dict[str, list[str]] = {
    "OwnerSubmissions": [
        "Timestamp", "ID", "Purpose", "Type", "Title", "Price (PKR)", "Area", "City", "Size",
        "Beds", "Baths", "Floors", "Address", "Description", "Owner Name", "Owner Phone",
        "Owner Email", "Photo Count", "Status",
    ],
    "Inquiries": ["Timestamp", "Name", "Phone", "Inquiry Type", "Role", "Property Type", "Message"],
    "Properties": [
        "Timestamp", "ID", "Title", "Purpose", "Type", "Price (PKR)", "City", "Area", "Size",
        "Beds", "Baths", "Owner", "Phone", "Published", "Featured", "Description", "Photo Count",
    ],
    "Clients": [
        "Timestamp", "ID", "Name", "Phone", "Purpose", "Type", "Budget Min", "Budget Max",
        "City", "Areas", "Status", "Notes",
    ],
}


def sheet_csv_path(sheet_name: str) -> Path | None:
    if sheet_name not in SHEET_HEADERS:
        return None
    return DATA_DIR / f"{sheet_name}.csv"


def write_csv_file(file_path: Path, headers: list[str], rows: list[list]) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    with file_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(rows)


def append_csv_row(file_path: Path, headers: list[str], row: list) -> None:
    if not file_path.exists():
        write_csv_file(file_path, headers, [row])
        return
    with file_path.open("a", encoding="utf-8-sig", newline="") as handle:
        csv.writer(handle).writerow(row)


def init_excel_database() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    for name, headers in SHEET_HEADERS.items():
        path = sheet_csv_path(name)
        if path and not path.exists():
            write_csv_file(path, headers, [])


def submission_excel_row(row: sqlite3.Row) -> list:
    try:
        images = json.loads(row["image_urls"] or "[]")
    except json.JSONDecodeError:
        images = []
    return [
        row["created_at"],
        row["id"],
        row["purpose"],
        row["type"],
        row["title"] or "",
        row["price"] if row["price"] is not None else "",
        row["area"] or "",
        row["city"] or "",
        row["size"] or "",
        row["beds"] if row["beds"] is not None else "",
        row["baths"] if row["baths"] is not None else "",
        row["floors"] if row["floors"] is not None else "",
        row["address"] or "",
        row["description"] or "",
        row["owner_name"] or "",
        row["owner_phone"] or "",
        row["owner_email"] or "",
        len(images),
        row["status"] or "pending",
    ]


def sync_sqlite_to_excel() -> None:
    path = sheet_csv_path("OwnerSubmissions")
    if not path:
        return
    with db() as conn:
        rows = conn.execute("select * from owner_submissions order by created_at asc").fetchall()
    write_csv_file(path, SHEET_HEADERS["OwnerSubmissions"], [submission_excel_row(row) for row in rows])


def open_data_folder() -> dict:
    DATA_DIR.mkdir(exist_ok=True)
    if sys.platform == "win32":
        subprocess.Popen(["explorer", str(DATA_DIR)])
    return {"ok": True, "path": str(DATA_DIR)}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def db() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("pragma foreign_keys = on")
    return conn


def init_db() -> None:
    with db() as conn:
        conn.executescript(
            """
            create table if not exists profiles (
                id text primary key,
                full_name text,
                phone text,
                email text not null unique,
                password_hash text not null,
                password_salt text not null,
                avatar_url text default '',
                provider text default 'local',
                role text not null default 'user',
                created_at text not null,
                updated_at text not null
            );

            create table if not exists auth_sessions (
                token text primary key,
                user_id text not null references profiles(id) on delete cascade,
                expires_at integer not null,
                created_at text not null
            );

            create table if not exists owner_submissions (
                id text primary key,
                user_id text not null references profiles(id) on delete cascade,
                purpose text not null,
                type text not null,
                area text,
                city text default 'فیصل آباد',
                price real,
                size text,
                beds integer default 0,
                baths integer default 0,
                floors integer default 0,
                title text,
                address text,
                description text,
                owner_name text,
                owner_phone text,
                owner_email text,
                image_urls text default '[]',
                status text not null default 'pending',
                created_at text not null
            );
            """
        )


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt = salt or base64.b64encode(os.urandom(16)).decode("ascii")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("ascii"), 120_000)
    return base64.b64encode(digest).decode("ascii"), salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    candidate, _ = hash_password(password, salt)
    return hmac.compare_digest(candidate, password_hash)


def profile_public(row: sqlite3.Row | None) -> dict | None:
    if not row:
        return None
    return {
        "id": row["id"],
        "full_name": row["full_name"],
        "phone": row["phone"],
        "email": row["email"],
        "avatar_url": row["avatar_url"],
        "provider": row["provider"],
        "role": row["role"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def submission_public(row: sqlite3.Row, profile: sqlite3.Row | None = None) -> dict:
    data = dict(row)
    try:
        data["image_urls"] = json.loads(data.get("image_urls") or "[]")
    except json.JSONDecodeError:
        data["image_urls"] = []
    if profile:
        data["profile"] = profile_public(profile)
    return data


class AskHandler(SimpleHTTPRequestHandler):
    server_version = "ASKLocalServer/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self) -> None:
        if self.path.startswith("/api/"):
            self.handle_api("GET")
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path.startswith("/api/"):
            self.handle_api("POST")
            return
        self.send_error(HTTPStatus.METHOD_NOT_ALLOWED)

    def do_PATCH(self) -> None:
        if self.path.startswith("/api/"):
            self.handle_api("PATCH")
            return
        self.send_error(HTTPStatus.METHOD_NOT_ALLOWED)

    def do_DELETE(self) -> None:
        if self.path.startswith("/api/"):
            self.handle_api("DELETE")
            return
        self.send_error(HTTPStatus.METHOD_NOT_ALLOWED)

    def read_json(self) -> dict:
        length = int(self.headers.get("content-length", "0") or "0")
        if not length:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw or "{}")

    def send_json(self, data: dict | list, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def error_json(self, message: str, status: int = 400) -> None:
        self.send_json({"ok": False, "error": message}, status)

    def bearer_token(self) -> str:
        auth = self.headers.get("authorization", "")
        if auth.lower().startswith("bearer "):
            return auth[7:].strip()
        return ""

    def current_user(self) -> sqlite3.Row | None:
        token = self.bearer_token()
        if not token:
            return None
        now = int(time.time())
        with db() as conn:
            row = conn.execute(
                """
                select p.* from auth_sessions s
                join profiles p on p.id = s.user_id
                where s.token = ? and s.expires_at > ?
                """,
                (token, now),
            ).fetchone()
            return row

    def require_user(self) -> sqlite3.Row | None:
        user = self.current_user()
        if not user:
            self.error_json("پہلے لاگ ان کریں", 401)
            return None
        return user

    def create_session(self, user_id: str) -> str:
        token = secrets.token_urlsafe(32)
        with db() as conn:
            conn.execute(
                "insert into auth_sessions (token, user_id, expires_at, created_at) values (?, ?, ?, ?)",
                (token, user_id, int(time.time()) + SESSION_SECONDS, utc_now()),
            )
        return token

    def handle_api(self, method: str) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        try:
            if method == "GET" and path == "/api/health":
                self.send_json({"ok": True, "database": str(DB_PATH)})
                return
            if method == "POST" and path == "/api/auth/register":
                self.register()
                return
            if method == "POST" and path == "/api/auth/login":
                self.login()
                return
            if method == "POST" and path == "/api/auth/logout":
                self.logout()
                return
            if method == "GET" and path == "/api/auth/me":
                user = self.require_user()
                if user:
                    self.send_json({"ok": True, "user": profile_public(user)})
                return
            if method == "GET" and path == "/api/submissions":
                self.list_my_submissions()
                return
            if method == "POST" and path == "/api/submissions":
                self.create_submission()
                return
            if method == "DELETE" and path.startswith("/api/submissions/"):
                self.delete_my_submission(path.rsplit("/", 1)[-1])
                return
            if method == "GET" and path == "/api/admin/submissions":
                self.list_all_submissions()
                return
            if method == "PATCH" and path.startswith("/api/admin/submissions/"):
                self.update_submission(path.rsplit("/", 1)[-1])
                return
            if method == "DELETE" and path.startswith("/api/admin/submissions/"):
                self.delete_submission(path.rsplit("/", 1)[-1])
                return
            if method == "POST" and path == "/api/sheet/save":
                self.sheet_save()
                return
            if method == "POST" and path == "/api/sheet/rebuild":
                self.sheet_rebuild()
                return
            if method == "POST" and path == "/api/sheet/open-folder":
                self.send_json(open_data_folder())
                return
            if method == "GET" and path == "/api/sheet/files":
                self.send_json(
                    {
                        "ok": True,
                        "folder": str(DATA_DIR),
                        "files": [
                            {
                                "sheet": name,
                                "file": f"{name}.csv",
                                "exists": sheet_csv_path(name).exists(),
                            }
                            for name in SHEET_HEADERS
                        ],
                    }
                )
                return
            self.error_json("API route نہیں ملا", 404)
        except json.JSONDecodeError:
            self.error_json("JSON درست نہیں", 400)
        except sqlite3.IntegrityError as exc:
            if "profiles.email" in str(exc):
                self.error_json("یہ ای میل پہلے سے رجسٹر ہے — لاگ ان کریں", 409)
            else:
                self.error_json(str(exc), 400)
        except Exception as exc:  # Keep the local server useful while debugging.
            self.error_json(str(exc), 500)

    def register(self) -> None:
        data = self.read_json()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        full_name = (data.get("fullName") or data.get("full_name") or "").strip()
        phone = (data.get("phone") or "").strip()
        if not email or len(password) < 6:
            self.error_json("درست ای میل اور کم از کم 6 حروف کا پاس ورڈ درکار")
            return
        password_hash, salt = hash_password(password)
        user_id = str(uuid.uuid4())
        now = utc_now()
        role = "admin" if email in ADMIN_EMAILS else "user"
        with db() as conn:
            conn.execute(
                """
                insert into profiles
                (id, full_name, phone, email, password_hash, password_salt, role, created_at, updated_at)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, full_name, phone, email, password_hash, salt, role, now, now),
            )
            user = conn.execute("select * from profiles where id = ?", (user_id,)).fetchone()
        token = self.create_session(user_id)
        self.send_json({"ok": True, "token": token, "user": profile_public(user)})

    def login(self) -> None:
        data = self.read_json()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        with db() as conn:
            user = conn.execute("select * from profiles where email = ?", (email,)).fetchone()
        if not user or not verify_password(password, user["password_hash"], user["password_salt"]):
            self.error_json("غلط ای میل یا پاس ورڈ", 401)
            return
        token = self.create_session(user["id"])
        self.send_json({"ok": True, "token": token, "user": profile_public(user)})

    def logout(self) -> None:
        token = self.bearer_token()
        if token:
            with db() as conn:
                conn.execute("delete from auth_sessions where token = ?", (token,))
        self.send_json({"ok": True})

    def list_my_submissions(self) -> None:
        user = self.require_user()
        if not user:
            return
        with db() as conn:
            rows = conn.execute(
                "select * from owner_submissions where user_id = ? order by created_at desc",
                (user["id"],),
            ).fetchall()
        self.send_json([submission_public(row) for row in rows])

    def create_submission(self) -> None:
        user = self.require_user()
        if not user:
            return
        data = self.read_json()
        submission_id = str(uuid.uuid4())
        now = utc_now()
        images = data.get("images") or data.get("image_urls") or []
        with db() as conn:
            conn.execute(
                """
                insert into owner_submissions
                (id, user_id, purpose, type, area, city, price, size, beds, baths, floors,
                 title, address, description, owner_name, owner_phone, owner_email, image_urls, status, created_at)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
                """,
                (
                    submission_id,
                    user["id"],
                    data.get("purpose") or "",
                    data.get("type") or "",
                    data.get("area") or "",
                    data.get("city") or "فیصل آباد",
                    data.get("price") or 0,
                    data.get("size") or "",
                    data.get("beds") or 0,
                    data.get("baths") or 0,
                    data.get("floors") or 0,
                    data.get("title") or "",
                    data.get("address") or "",
                    data.get("description") or "",
                    data.get("ownerName") or data.get("owner_name") or "",
                    data.get("ownerPhone") or data.get("owner_phone") or "",
                    data.get("ownerEmail") or data.get("owner_email") or "",
                    json.dumps(images, ensure_ascii=False),
                    now,
                ),
            )
            row = conn.execute("select * from owner_submissions where id = ?", (submission_id,)).fetchone()
        sync_sqlite_to_excel()
        self.send_json(submission_public(row), 201)

    def delete_my_submission(self, submission_id: str) -> None:
        user = self.require_user()
        if not user:
            return
        with db() as conn:
            cur = conn.execute(
                "delete from owner_submissions where id = ? and user_id = ?",
                (submission_id, user["id"]),
            )
        if cur.rowcount == 0:
            self.error_json("یہ پراپرٹی آپ کے اکاؤنٹ میں نہیں", 404)
            return
        sync_sqlite_to_excel()
        self.send_json({"ok": True})

    def list_all_submissions(self) -> None:
        with db() as conn:
            rows = conn.execute(
                """
                select s.*, p.id as p_id, p.full_name, p.phone as profile_phone, p.email as profile_email,
                       p.avatar_url, p.provider, p.role, p.created_at as profile_created_at,
                       p.updated_at as profile_updated_at
                from owner_submissions s
                left join profiles p on p.id = s.user_id
                order by s.created_at desc
                """
            ).fetchall()
        out = []
        for row in rows:
            profile = None
            if row["p_id"]:
                profile = {
                    "id": row["p_id"],
                    "full_name": row["full_name"],
                    "phone": row["profile_phone"],
                    "email": row["profile_email"],
                    "avatar_url": row["avatar_url"],
                    "provider": row["provider"],
                    "role": row["role"],
                    "created_at": row["profile_created_at"],
                    "updated_at": row["profile_updated_at"],
                }
            item = submission_public(row)
            item["profile"] = profile
            out.append(item)
        self.send_json(out)

    def update_submission(self, submission_id: str) -> None:
        data = self.read_json()
        status = data.get("status")
        if status not in {"pending", "reviewed", "converted", "rejected"}:
            self.error_json("status درست نہیں")
            return
        with db() as conn:
            conn.execute("update owner_submissions set status = ? where id = ?", (status, submission_id))
            row = conn.execute("select * from owner_submissions where id = ?", (submission_id,)).fetchone()
        if not row:
            self.error_json("record نہیں ملا", 404)
            return
        sync_sqlite_to_excel()
        self.send_json(submission_public(row))

    def delete_submission(self, submission_id: str) -> None:
        with db() as conn:
            conn.execute("delete from owner_submissions where id = ?", (submission_id,))
        sync_sqlite_to_excel()
        self.send_json({"ok": True})

    def sheet_save(self) -> None:
        data = self.read_json()
        sheet = str(data.get("sheet") or "")
        row = data.get("row")
        file_path = sheet_csv_path(sheet)
        if not file_path or not isinstance(row, list):
            self.error_json("sheet یا row درست نہیں")
            return
        append_csv_row(file_path, SHEET_HEADERS[sheet], row)
        self.send_json({"ok": True, "file": str(file_path)})

    def sheet_rebuild(self) -> None:
        data = self.read_json()
        sheet = str(data.get("sheet") or "")
        headers = data.get("headers") or SHEET_HEADERS.get(sheet)
        rows = data.get("rows") or []
        file_path = sheet_csv_path(sheet)
        if not file_path or not isinstance(headers, list) or not isinstance(rows, list):
            self.error_json("sheet درست نہیں")
            return
        write_csv_file(file_path, headers, rows)
        self.send_json({"ok": True, "file": str(file_path), "rows": len(rows)})


def main() -> int:
    init_db()
    init_excel_database()
    httpd = ThreadingHTTPServer((HOST, PORT), AskHandler)
    print(f"ASK REAL ESTATE local server running:")
    print(f"  http://localhost:{PORT}/")
    print(f"Database:")
    print(f"  {DB_PATH}")
    print(f"Excel database (MS Excel):")
    print(f"  {DATA_DIR}")
    print("Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
