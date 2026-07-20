/**
 * Google Sheets — ترتیب / Setup
 * ─────────────────────────────────────────────────────────────
 * 1) Google Sheet بنائیں (نئی spreadsheet)
 * 2) Extensions → Apps Script → google-apps-script/Code.gs کا کوڈ پیسٹ کریں
 * 3) API_SECRET وہی رکھیں جو نیچے secret میں ہے
 * 4) Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5) Web app URL نیچے webAppUrl میں پیسٹ کریں
 * 6) enabled: true کریں
 * ─────────────────────────────────────────────────────────────
 */
const GoogleSheetsConfig = {
    enabled: false,
    webAppUrl: '',
    secret: '',
};

/** ڈیلر پینل → ترتیبات سے بھی محفوظ ہو سکتا ہے (localStorage) */
