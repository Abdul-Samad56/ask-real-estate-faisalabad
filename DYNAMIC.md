# ASK REAL ESTATE — Static → Dynamic (MongoDB Atlas)

## پہلے (static)
- ڈیمو لسٹنگز `localStorage` میں
- SQLite صرف اسی PC پر

## اب (dynamic)
- لسٹنگز، یوزرز، سبمشنز **MongoDB Atlas** میں
- ویب سائٹ `/api/public/listings` سے لائیو ڈیٹا لیتی ہے
- لاگ اِن / پراپرٹی سبمٹ سرور پر محفوظ

## چلانے کا طریقہ

1. Atlas cluster + user + Network Access `0.0.0.0/0`
2. Connection string کاپی کریں
3. PowerShell:

```powershell
cd "E:\IT\Whatsapp\ASK REAL ESTATE FAISALABAD"
copy .env.example .env
# .env میں MONGODB_URI لگائیں
npm install
npm run seed
npm start
```

4. کھولیں: **http://localhost:8000/**

یا `start-local-server.bat` (اگر `.env` موجود ہو تو Atlas موڈ خود چلتا ہے)

## آن لائن (Render)

1. GitHub پر یہ فولڈر push کریں
2. Render Web Service:
   - Build: `npm install`
   - Start: `npm start`
   - Env: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`
3. Seed ایک بار: Render Shell میں `npm run seed`
