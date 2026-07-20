# آن لائن لائیو — MongoDB Atlas + Render

ایک ہی لنک پر پوری سائٹ (React + API + Atlas)۔

## مرحلہ 1 — MongoDB Atlas (۵ منٹ)

1. براؤزر میں کھولیں: https://cloud.mongodb.com/
2. Google / Email سے لاگ اِن یا Sign Up
3. **Create** → Free **M0** cluster (مثلاً AWS، قریبی ریجن)
4. **Database Access** → Add User  
   - Username + Password بنائیں (پاس ورڈ محفوظ رکھیں)
5. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
6. **Database** → **Connect** → **Drivers** → connection string کاپی کریں:

```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/ask_real_estate?retryWrites=true&w=majority
```

`USERNAME` اور `PASSWORD` اپنی ویلیوز سے بدل دیں۔  
اگر پاس ورڈ میں `@ # %` ہوں تو URL-encode کریں۔

7. وہ مکمل string یہاں چیٹ میں بھیج دیں — میں `.env` لگا کر seed چلا دوں گا۔

---

## مرحلہ 2 — لوکل کنکشن (ٹیسٹ)

`webapp/server/.env`:

```
PORT=5000
MONGODB_URI=آپ_کی_Atlas_string
JWT_SECRET=کوئی_لمبا_خفیہ_جملہ
CLIENT_URL=http://localhost:5000
ADMIN_EMAIL=abdulsamadkhattak5@gmail.com
ADMIN_PASSWORD=اپنا_مضبوط_پاس_ورڈ
```

پھر:

```powershell
cd "E:\IT\Whatsapp\ASK REAL ESTATE FAISALABAD\webapp\client"
npm run build

cd ..\server
npm run seed
npm start
```

لوکل لنک: **http://localhost:5000/**

---

## مرحلہ 3 — Render پر لائیو

1. GitHub پر نیا repo بنائیں، `webapp` کا کوڈ push کریں  
   (یا Render پر Blueprint / Git connect)
2. [render.com](https://render.com) → New → Web Service
3. Root: `webapp` فولڈر (یا جہاں `render.yaml` ہے)
4. Build:

```
npm --prefix client install && npm --prefix client run build && npm --prefix server install
```

5. Start:

```
npm --prefix server start
```

6. Environment:

| Key | Value |
|-----|--------|
| `MONGODB_URI` | Atlas string |
| `JWT_SECRET` | لمبا رینڈم |
| `ADMIN_EMAIL` | abdulsamadkhattak5@gmail.com |
| `ADMIN_PASSWORD` | مضبوط پاس ورڈ |
| `CLIENT_URL` | `https://آپکا-سروس.onrender.com` |

7. Deploy → لنک ملے گا جیسے:

**https://ask-real-estate.onrender.com**

Atlas seed Render پر ایک بار چلانے کے لیے Shell میں:

```
npm --prefix server run seed
```

یا لوکل سے پہلے ہی seed کر لیں (وہی Atlas DB)۔

---

## اہم

- پرانی Netlify سائٹ بند ہے؛ نئی لائیو سائٹ **Render + Atlas** ہو گی
- localhost:8000 پرانی static سائٹ ہے — Atlas سے منسلک نہیں
- نیا سسٹم: `webapp/` → React + Express + MongoDB Atlas
