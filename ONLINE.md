# ASK REAL ESTATE — آن لائن کرنے کا طریقہ (ترتیب سے)

آپ کا ڈیٹا پہلے سے **MongoDB Atlas** میں ہے۔ آن لائن صرف ویب سرور (Render) لگانا ہے۔

---

## مرحلہ 1 — GitHub اکاؤنٹ / ریپو

1. [github.com](https://github.com) پر لاگ اِن / Sign Up
2. **New repository** بنائیں  
   - Name: `ask-real-estate-faisalabad`  
   - Public یا Private  
   - **README مت لگائیں** (خالی ریپو)
3. یہ فولڈر GitHub پر بھیجیں (نیچے کمانڈز)

PowerShell میں:

```powershell
cd "E:\IT\Whatsapp\ASK REAL ESTATE FAISALABAD"
git init
git add .
git commit -m "ASK Real Estate dynamic site with MongoDB Atlas"
git branch -M main
git remote add origin https://github.com/آپکا-یوزرنیم/ask-real-estate-faisalabad.git
git push -u origin main
```

**نوٹ:** `.env` فائل push نہیں ہو گی (gitignore میں ہے) — یہ محفوظ ہے۔

---

## مرحلہ 2 — Render پر سائٹ

1. [render.com](https://render.com) → Sign Up (GitHub سے)
2. **New +** → **Web Service**
3. اپنے GitHub ریپو `ask-real-estate-faisalabad` کو Connect کریں
4. سیٹنگز:

| فیلڈ | ویلیو |
|------|--------|
| Name | `ask-real-estate-faisalabad` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance | Free |

5. **Environment** میں یہ Variables لگائیں:

| Key | Value |
|-----|--------|
| `MONGODB_URI` | وہی URI جو `.env` میں ہے (Atlas connection string) |
| `JWT_SECRET` | کوئی لمبا خفیہ جملہ (مثلاً رینڈم حروف) |
| `ADMIN_EMAIL` | `abdulsamadkhattak5@gmail.com` |
| `ADMIN_PASSWORD` | مضبوط پاس ورڈ (ڈیلر لاگ اِن کے لیے) |
| `ADMIN_NAME` | `حافظ عبدالصمد خٹک` |
| `ADMIN_PHONE` | `03215315603` |

6. **Create Web Service** / Deploy دبائیں  
7. ۲–۵ منٹ بعد لنک ملے گا جیسے:

`https://ask-real-estate-faisalabad.onrender.com`

---

## مرحلہ 3 — ڈیٹا چیک

Atlas میں پہلے سے 100 پراپرٹیز ہیں، اس لیے دوبارہ seed عام طور پر ضروری نہیں۔

چیک کریں:

- سائٹ: `https://آپکا-لنک.onrender.com/`
- API: `https://آپکا-لنک.onrender.com/api/health`  
  → `"dynamic": true, "connected": true` ہونا چاہیے
- لسٹنگز: `https://آپکا-لنک.onrender.com/api/public/listings`

اگر لسٹنگز خالی ہوں تو Render → Shell:

```bash
npm run seed
```

---

## مرحلہ 4 — Atlas Network Access

Render کے سرورز مختلف IPs سے کنیکٹ ہوتے ہیں۔ اس لیے Atlas میں پہلے سے رکھیں:

**Network Access → Allow Access from Anywhere → `0.0.0.0/0`**

(آپ نے یہ کر لیا ہے)

---

## مرحلہ 5 — اپنی ڈومین (اختیاری)

1. Render → Settings → Custom Domain
2. اپنی ڈومین لگائیں (مثلاً `askrealestate.pk`)
3. DNS میں Render کے بتائے CNAME ریکارڈ لگائیں

---

## خلاصہ ترتیب

1. GitHub ریپو + کوڈ push  
2. Render Web Service + Env vars  
3. Deploy → لائیو لنک  
4. `/api/health` چیک  
5. (اختیاری) اپنی ڈومین  

---

## مدد

جب GitHub ریپو بن جائے اور لنک بھیج دیں، میں push / Render سیٹنگ چیک کرنے میں مدد کر سکتا ہوں۔  
اگر چاہیں تو یہاں لکھیں: **«github بنا لیا»** یا **«render شروع کریں»**۔
