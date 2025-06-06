منصة تعليمية عربية
منصة تعليمية باللغة العربية تسمح للمعلمين برفع الدروس وللطلاب بمشاهدتها مع نظام مصادقة كامل.

المميزات
🔐 نظام تسجيل دخول آمن للمعلمين والطلاب
📚 إنشاء وإدارة الدروس للمعلمين
🎥 عرض الدروس مع فيديوهات YouTube
👍 نظام الإعجابات والمشاهدات
📊 إحصائيات للمعلمين
👤 إدارة الملف الشخصي
التقنيات المستخدمة
Backend: Node.js + Express
Authentication: bcryptjs + express-session
Database: JSON File Storage
Frontend: HTML, CSS, JavaScript
إعداد المشروع
1. تحميل المشروع
git clone <repository-url>
cd <project-name>
2. تثبيت المتطلبات
npm install
3. إعداد ملف البيانات
cp data.template.json data.json
4. تشغيل المشروع
npm run dev
سيعمل الخادم على: http://localhost:5000

الحسابات التجريبية
معلم
البريد الإلكتروني: teacher@example.com
كلمة المرور: 123456
طالب
البريد الإلكتروني: student@example.com
كلمة المرور: 123456
هيكل الملفات
├── server.js              # الخادم الرئيسي
├── data.template.json     # قالب البيانات
├── data.json             # ملف البيانات (لا يرفع على Git)
├── index.html            # الصفحة الرئيسية
├── login.html            # صفحة تسجيل الدخول
├── register.html         # صفحة إنشاء حساب
├── lessons.html          # صفحة الدروس
├── teachers.html         # صفحة المعلمين
├── teacher-dashboard.html # لوحة تحكم المعلم
├── css/                  # ملفات التنسيق
└── js/                   # ملفات JavaScript
API Endpoints
المصادقة
POST /api/login - تسجيل الدخول
POST /api/register - إنشاء حساب جديد
POST /api/logout - تسجيل الخروج
GET /api/auth-status - حالة المصادقة
الدروس
GET /api/lessons - جميع الدروس
GET /api/lessons/:id - درس محدد
POST /api/lessons - إنشاء درس (معلمين فقط)
PUT /api/lessons/:id - تحديث درس
DELETE /api/lessons/:id - حذف درس
POST /api/lessons/:id/view - زيادة المشاهدات
POST /api/lessons/:id/like - إعجاب/إلغاء إعجاب
المعلمين
GET /api/teachers - جميع المعلمين
GET /api/teacher-lessons - دروس المعلم الحالي
GET /api/teacher-stats - إحصائيات المعلم
الملف الشخصي
PUT /api/update-profile - تحديث الملف الشخصي
DELETE /api/delete-account - حذف الحساب
التخزين
يستخدم المشروع ملف JSON للتخزين الدائم:

data.json: يحتوي على جميع البيانات (مستخدمين، دروس)
data.template.json: قالب البيانات الافتراضية
البيانات تبقى محفوظة حتى مع إعادة التشغيل
الأمان
كلمات المرور مشفرة باستخدام bcrypt
الجلسات آمنة مع express-session
ملف البيانات الحقيقي محمي من Git
التطوير
للمطورين الجدد:

انسخ المشروع
ثبت المتطلبات: npm install
أعد البيانات: cp data.template.json data.json
شغل المشروع: npm run dev
المساهمة
Fork المشروع
أنشئ فرع جديد للميزة
اكتب الكود مع التعليقات
ارسل Pull Request
الترخيص
هذا المشروع مفتوح المصدر.
