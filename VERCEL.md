# Vercel پر ڈپلائمنٹ

آپ کی سائٹ پہلے سے **Render** پر لائیو ہے۔ Vercel الگ آپشن ہے۔

**نوٹ:** Render (ہمیشہ چلنے والا سرور) اس پروجیکٹ کے لیے بہتر ہے۔ Vercel serverless ہے — پہلی request سست ہو سکتی ہے۔

---

## مرحلہ 1 — GitHub اپڈیٹ

Vercel فائلیں (`vercel.json` + سرور فکس) GitHub پر push کریں۔

---

## مرحلہ 2 — Vercel

1. [vercel.com](https://vercel.com) → GitHub سے Sign Up / Login  
2. **Add New… → Project**  
3. ریپو منتخب کریں: `Abdul-Samad56/ask-real-estate-faisalabad`  
4. Framework Preset: **Other**  
5. Root Directory: `.` (خالی / root)  
6. Build Command: خالی چھوڑیں (یا چھوڑ دیں)  
7. Output Directory: خالی  

---

## مرحلہ 3 — Environment Variables

Vercel → Project → **Settings → Environment Variables** (Production + Preview):

| Key | Value |
|-----|--------|
| `MONGODB_URI` | وہی Atlas string جو Render پر ہے |
| `JWT_SECRET` | لمبا خفیہ پاس |
| `ADMIN_EMAIL` | `abdulsamadkhattak5@gmail.com` |
| `ADMIN_PASSWORD` | آپ کا ایڈمن پاس ورڈ |
| `ADMIN_NAME` | `حافظ عبدالصمد خٹک` |
| `ADMIN_PHONE` | `03215315603` |

`MONGODB_URI` بغیر quotes پیسٹ کریں۔

---

## مرحلہ 4 — Deploy

**Deploy** دبائیں۔ لنک ملے گا جیسے:

`https://ask-real-estate-faisalabad.vercel.app`

چیک: `https://….vercel.app/api/health` → `connected: true`

---

## Render vs Vercel

| | Render (ابھی لائیو) | Vercel |
|--|---------------------|--------|
| لنک | https://ask-real-estate-faisalabad.onrender.com | نیا `.vercel.app` |
| قسم | Web Service | Serverless |
| سفارش | اس سائٹ کے لیے بہتر | آپشنل |

دونوں ایک ساتھ چل سکتے ہیں — ایک ہی Atlas DB استعمال کریں گے۔
