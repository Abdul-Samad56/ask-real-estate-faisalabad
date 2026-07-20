# ASK REAL ESTATE FAISALABAD

فیصل آباد پراپرٹی پورٹل — **Dynamic** (Node.js + Express + MongoDB Atlas)

## لوکل چلائیں

```bash
cp .env.example .env
# .env میں MONGODB_URI لگائیں
npm install
npm run seed
npm start
```

کھولیں: http://localhost:8000/

## آن لائن (Render)

دیکھیں: [ONLINE.md](./ONLINE.md)

## Scripts

| Command | کام |
|---------|-----|
| `npm start` | Dynamic سرور (Atlas) |
| `npm run seed` | Properties.csv → Atlas |
| `npm run sqlite` | پرانا SQLite موڈ |
