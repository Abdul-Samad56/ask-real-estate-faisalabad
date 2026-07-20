# تیز لوڈنگ / Cold Start ختم کرنا

## مسئلہ کیوں آتا ہے؟

Render **Free** پلان پر اگر کچھ دیر کوئی نہ کھولے تو سروس **سو جاتی** ہے۔  
اگلی بار کھولنے پر "APPLICATION LOADING / SERVICE WAKING UP" آتا ہے (۳۰–۶۰ سیکنڈ)۔

یہ بگ نہیں — مفت پلان کی حد ہے۔

## حل ۱ — Keep-alive (مفت، اب سیٹ اپ)

ریپو میں GitHub Action لگا دی گئی ہے جو ہر **۱۰ منٹ** پر سائٹ ping کرتی ہے تاکہ سوئے نہیں۔

GitHub → Actions → **Keep Render Awake** → Enable workflows (اگر پوچھے)

پھر عام طور پر سائٹ جلدی کھلے گی۔

## حل ۲ — UptimeRobot (اضافی)

1. [uptimerobot.com](https://uptimerobot.com) مفت اکاؤنٹ  
2. Add Monitor → HTTP(s)  
3. URL: `https://ask-real-estate-faisalabad.onrender.com/api/health`  
4. Interval: **5 minutes**

## حل ۳ — سب سے تیز (پیڈ)

Render → آپ کی سروس → **Upgrade** to **Starter** (~$7/ماہ)  
→ Always On، cold start نہیں۔

---

**خلاصہ:** مفت میں keep-alive استعمال کریں؛ مکمل یقین کے لیے Starter پلان۔
