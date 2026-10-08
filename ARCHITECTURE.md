# Script AI — Architecture & Setup Guide

## Project Structure

```
Script AI/
├── index.html        ← Landing Page (/)
├── ai.html           ← AI Workspace (/ai.html)
├── style.css         ← Complete Design System
├── analytics.js      ← Event Tracking & Referral System
├── workspace.js      ← Workspace Controller (all AI logic)
├── server.js         ← Secure Backend (n8n proxy)
├── .env.example      ← Environment Variables Template
└── assets/           ← Static assets
```

## API Contract

### POST /api/analyze
**Request:**
```json
{
  "channel_url": "https://youtube.com/@channel",
  "user_id": "usr_xxx",
  "platform": "youtube",
  "session_id": "ses_xxx"
}
```
**Expected Response from n8n:**
```json
{
  "status": "completed",
  "channel": {
    "name": "اسم القناة",
    "handle": "@handle",
    "subscribers": 128000,
    "views": 2400000,
    "video_count": 45,
    "thumbnail": "https://..."
  },
  "analysis": {
    "top_topics": [
      { "name": "Gaming", "percentage": 72 }
    ],
    "top_videos": [
      { "title": "...", "views": 500000, "date": "2026-01" }
    ],
    "patterns": [
      { "label": "فيديوهات طويلة تؤدي أفضل" }
    ],
    "insights": [
      "فيديوهات Gaming تحقق 3x أكثر من متوسط قناتك"
    ]
  },
  "ideas": [
    {
      "title": "أفضل 10 إعدادات Gaming",
      "topic": "Gaming",
      "reason": "مبني على أفضل فيديوهاتك",
      "hook": "هل تعرف أن 90% من الغيمرز يرتكبون هذا الخطأ؟",
      "score": 94
    }
  ]
}
```

### POST /api/script
**Request:**
```json
{
  "idea": { "title": "...", "topic": "...", "hook": "..." },
  "tone": "عفوي",
  "length": "متوسط",
  "channel_data": { "name": "...", "subscribers": 128000 },
  "user_id": "usr_xxx"
}
```
**Expected Response from n8n:**
```json
{
  "title": "عنوان السكريبت",
  "hook": "...",
  "introduction": "...",
  "main_content": "...",
  "cta": "...",
  "ending": "..."
}
```

## n8n Setup

1. في n8n أنشئ Workflow للتحليل:
   - Webhook Node ← يستقبل `channel_url`
   - YouTube API Node ← يجلب بيانات القناة
   - AI Agent Node ← يحلل البيانات
   - Respond to Webhook ← يرجع JSON

2. انسخ Webhook URL وضعه في متغيرات البيئة:
```
set N8N_ANALYZE_WEBHOOK=http://localhost:5678/webhook/YOUR-ID/chat
```

3. شغّل السيرفر:
```
node server.js
```

## Analytics Events

| Event | متى يُرسَل |
|-------|-----------|
| `page_view` | عند فتح أي صفحة |
| `landing_cta_clicked` | عند الضغط على "ابدأ صناعة محتوى" |
| `aipageopened` | عند فتح workspace |
| `channel_submitted` | عند إدخال رابط |
| `analysis_started` | عند بدء التحليل |
| `analysis_completed` | بعد نجاح التحليل |
| `idea_selected` | عند اختيار فكرة |
| `script_generated` | عند توليد سكريبت |
| `script_copied` | عند نسخ السكريبت |
| `script_saved` | عند حفظ السكريبت |
| `share_clicked` | عند الضغط على شارك |
| `share_completed` | عند نسخ رابط المشاركة |
| `referral_visit` | عند زيارة رابط Referral |

## Referral Links

روابط المشاركة تأخذ الشكل:
```
https://scriptai.com/?ref=abc12345
```

يتم تتبعها وحفظها تلقائياً حتى يتم التسجيل.

## Security Checklist

- ✅ لا API Keys في الـ Frontend
- ✅ n8n Webhooks محمية خلف الـ Backend فقط
- ✅ Rate Limiting (20 طلب / دقيقة / IP)
- ✅ Input Validation على كل endpoint
- ✅ Path Traversal Protection
- ✅ Security Headers (X-Frame-Options, X-Content-Type-Options)
- ✅ CORS محدود بـ Origin محددة

## User Flow

```
/ (Landing Page)
  ↓ "ابدأ صناعة محتوى"
/ai.html (Workspace)
  ↓ إدخال رابط قناة
  ↓ "حلّل القناة"
  ↓ POST /api/analyze → Backend → n8n → AI
  ↓ عرض النتائج (قناة + مواضيع + فيديوهات + insights)
  ↓ "عرض أفكار المحتوى"
  ↓ بطاقات الأفكار
  ↓ "اكتب السكريبت"
  ↓ POST /api/script → Backend → n8n → AI
  ↓ عرض السكريبت (Hook + مقدمة + محتوى + CTA + خاتمة)
  ↓ نسخ / حفظ / مشاركة
```
