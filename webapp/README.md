# ASK REAL ESTATE FAISALABAD — Web App

React (Vite) + Express + **MongoDB Atlas**

```
webapp/
  client/   → React frontend (port 5173)
  server/   → Express API (port 5000)
```

## 1. MongoDB Atlas

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) پر مفت cluster بنائیں
2. Database User بنائیں
3. Network Access میں `0.0.0.0/0` (یا اپنے IP) allow کریں
4. Connect → Drivers → connection string کاپی کریں

## 2. Server سیٹ اپ

```bash
cd server
copy .env.example .env
# .env میں MONGODB_URI اور JWT_SECRET سیٹ کریں
npm install
npm run seed    # Properties.csv → Atlas
npm run dev
```

API: `http://localhost:5000/api/health`

Admin پہلی بار خود بن جاتا ہے (`ADMIN_EMAIL` / `ADMIN_PASSWORD` سے `.env` میں)۔

## 3. Client سیٹ اپ

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

Site: `http://localhost:5173`

لوکل پر Vite proxy `/api` کو `localhost:5000` پر بھیجتی ہے — `VITE_API_URL` خالی چھوڑ سکتے ہیں۔

## 4. آن لائن ڈپلائمنٹ

### Backend (Render)

1. نیا Web Service → اس `server` فولڈر کو منتخب کریں
2. Build: `npm install` · Start: `npm start`
3. Env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (آپ کا frontend URL), `ADMIN_*`

### Frontend (Netlify / Vercel)

1. `client` فولڈر deploy کریں
2. Build: `npm run build` · Publish: `dist`
3. Env: `VITE_API_URL=https://YOUR-API.onrender.com`

Atlas Network Access میں Render IPs یا `0.0.0.0/0` allow رکھیں۔

## API خلاصہ

| Method | Path |
|--------|------|
| GET | `/api/health` |
| GET | `/api/meta/site` |
| POST | `/api/auth/register` · `/api/auth/login` |
| GET | `/api/auth/me` |
| GET | `/api/properties` · `/api/properties/:id` |
| POST | `/api/submissions` |
| GET | `/api/submissions/mine` |
| GET/POST/DELETE | `/api/wishlist` |
| POST | `/api/inquiries` |

## اگلا مرحلہ (Phase 2)

Dealer CRM panel — clients، submissions review، matching۔
