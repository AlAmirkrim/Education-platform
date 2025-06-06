const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// إعداد الجلسات
app.use(session({
  secret: 'educational-platform-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 2 * 60 * 60 * 1000  // 2 ساعة كقيمة افتراضية
  }
}));

// إعداد الخادم
app.use(express.json());
app.use(express.static('.'));

// مسار ملف البيانات
const DATA_FILE = path.join(__dirname, 'data.json');
const CLEAN_DATA_FILE = path.join(__dirname, 'data-clean.json');

// تحميل البيانات من الملف
let data = {};

const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileContent);
      console.log('تم تحميل البيانات من ملف data.json');
    } else if (fs.existsSync(CLEAN_DATA_FILE)) {
      const fileContent = fs.readFileSync(CLEAN_DATA_FILE, 'utf8');
      data = JSON.parse(fileContent);
      console.log('تم تحميل البيانات من ملف data-clean.json');
      // إنشاء ملف data.json من البيانات النظيفة
      saveData();
    } else {
      console.log('ملف البيانات غير موجود، سيتم إنشاء ملف جديد مع بيانات تجريبية');
      data = createDefaultData();
      saveData();
    }
  } catch (error) {
    console.error('خطأ في تحميل البيانات:', error);
    console.log('إنشاء بيانات افتراضية...');
    data = createDefaultData();
    saveData();
  }
};

// إنشاء البيانات الافتراضية
function createDefaultData() {
  return {
    users: [
      {
        id: 1,
        email: "teacher@example.com",
        username: "معلم_تجريبي",
        firstName: "أحمد",
        lastName: "محمد",
        userType: "teacher",
        passwordHash: "$2a$10$8K1p/a0dC2VWtAoOeexIp.5XlZbK4zqNTTRJKN2n6qJtVQq1rE8GO",
        specialization: "الرياضيات",
        experience: "5 سنوات",
        bio: "معلم رياضيات متخصص في التعليم الإلكتروني",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      },
      {
        id: 2,
        email: "student@example.com",
        username: "طالب_تجريبي",
        firstName: "فاطمة",
        lastName: "علي",
        userType: "student",
        passwordHash: "$2a$10$8K1p/a0dC2VWtAoOeexIp.5XlZbK4zqNTTRJKN2n6qJtVQq1rE8GO",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    ],
    lessons: [
      {
        id: 1,
        title: "مقدمة في الجبر",
        description: "درس تمهيدي في أساسيات الجبر للمبتدئين",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        subject: "الرياضيات",
        grade: "الصف التاسع",
        pdfUrls: [],
        teacherId: 1,
        views: 0,
        likes: 0,
        likedBy: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      },
      {
        id: 2,
        title: "المعادلات الخطية",
        description: "شرح مفصل للمعادلات الخطية وطرق حلها",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        subject: "الرياضيات",
        grade: "الصف العاشر",
        pdfUrls: [],
        teacherId: 1,
        views: 0,
        likes: 0,
        likedBy: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    ],
    nextUserId: 3,
    nextLessonId: 3
  };
}

// حفظ البيانات في الملف
const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('خطأ في حفظ البيانات:', error);
  }
};

// تحميل البيانات عند بدء التشغيل
loadData();

// دوال مساعدة للتخزين في ملف JSON
class JSONStorage {
  async getUser(id) {
    return data.users.find(user => user.id === parseInt(id)) || null;
  }

  async getUserByEmail(email) {
    return data.users.find(user => user.email === email) || null;
  }

  async getUserByUsername(username) {
    return data.users.find(user => user.username === username) || null;
  }

  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      id: data.nextUserId++,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      userType: userData.userType,
      passwordHash: hashedPassword,
      specialization: userData.specialization || null,
      experience: userData.experience || null,
      bio: userData.bio || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.users.push(newUser);
    saveData();
    return newUser;
  }

  async getAllTeachers() {
    const teachers = data.users.filter(user => user.userType === 'teacher');
    return teachers.map(teacher => {
      const teacherLessons = data.lessons.filter(lesson => lesson.teacherId === teacher.id);
      return {
        ...teacher,
        lessonsCount: teacherLessons.length
      };
    });
  }

  async getAllLessons() {
    return data.lessons.map(lesson => {
      const teacher = data.users.find(user => user.id === lesson.teacherId);
      return {
        ...lesson,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'غير معروف'
      };
    });
  }

  async getLesson(id) {
    const lesson = data.lessons.find(lesson => lesson.id === parseInt(id));
    if (lesson) {
      const teacher = data.users.find(user => user.id === lesson.teacherId);
      return {
        ...lesson,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'غير معروف'
      };
    }
    return null;
  }

  async getLessonsByTeacher(teacherId) {
    return data.lessons.filter(lesson => lesson.teacherId === parseInt(teacherId));
  }

  async createLesson(lessonData) {
    const newLesson = {
      id: data.nextLessonId++,
      title: lessonData.title,
      description: lessonData.description,
      videoUrl: lessonData.videoUrl,
      subject: lessonData.subject,
      grade: lessonData.grade,
      pdfUrls: lessonData.pdfUrls || [],
      teacherId: lessonData.teacherId,
      views: 0,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.lessons.push(newLesson);
    saveData();
    return newLesson;
  }

  async updateLesson(id, teacherId, updates) {
    const lessonIndex = data.lessons.findIndex(lesson => 
      lesson.id === parseInt(id) && lesson.teacherId === parseInt(teacherId)
    );
    
    if (lessonIndex !== -1) {
      data.lessons[lessonIndex] = {
        ...data.lessons[lessonIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveData();
      return data.lessons[lessonIndex];
    }
    return null;
  }

  async deleteLesson(id, teacherId) {
    const lessonIndex = data.lessons.findIndex(lesson => 
      lesson.id === parseInt(id) && lesson.teacherId === parseInt(teacherId)
    );
    
    if (lessonIndex !== -1) {
      data.lessons.splice(lessonIndex, 1);
      saveData();
      return true;
    }
    return false;
  }

  async incrementViews(lessonId) {
    const lesson = data.lessons.find(lesson => lesson.id === parseInt(lessonId));
    if (lesson) {
      lesson.views += 1;
      lesson.updatedAt = new Date().toISOString();
      saveData();
    }
  }

  async toggleLike(lessonId, userId) {
    const lesson = data.lessons.find(lesson => lesson.id === parseInt(lessonId));
    if (!lesson) {
      throw new Error('الدرس غير موجود');
    }

    const userIdStr = String(userId);
    const likedByIndex = lesson.likedBy.indexOf(userIdStr);
    
    let hasLiked;
    if (likedByIndex > -1) {
      // إزالة الإعجاب
      lesson.likedBy.splice(likedByIndex, 1);
      lesson.likes -= 1;
      hasLiked = false;
    } else {
      // إضافة الإعجاب
      lesson.likedBy.push(userIdStr);
      lesson.likes += 1;
      hasLiked = true;
    }
    
    lesson.updatedAt = new Date().toISOString();
    saveData();
    return { hasLiked, likes: lesson.likes };
  }

  async hasUserLiked(lessonId, userId) {
    const lesson = data.lessons.find(lesson => lesson.id === parseInt(lessonId));
    if (!lesson) {
      return false;
    }
    return lesson.likedBy.includes(String(userId));
  }

  async updateProfile(userId, updates) {
    const userIndex = data.users.findIndex(user => user.id === parseInt(userId));
    if (userIndex !== -1) {
      data.users[userIndex] = {
        ...data.users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveData();
      return data.users[userIndex];
    }
    return null;
  }

  async deleteUser(userId) {
    const userIndex = data.users.findIndex(user => user.id === parseInt(userId));
    if (userIndex !== -1) {
      // حذف دروس المعلم إذا كان معلماً
      data.lessons = data.lessons.filter(lesson => lesson.teacherId !== parseInt(userId));
      data.users.splice(userIndex, 1);
      saveData();
      return true;
    }
    return false;
  }
}

const storage = new JSONStorage();

// Routes
// تسجيل الدخول
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // تحديد مدة الجلسة حسب خيار "تذكرني"
    const sessionDuration = remember ? 
      30 * 24 * 60 * 60 * 1000 : // 30 يوم للتذكر
      2 * 60 * 60 * 1000;        // 2 ساعة بدون تذكر

    // تحديث إعدادات الجلسة
    req.session.cookie.maxAge = sessionDuration;
    req.session.userId = user.id;
    req.session.userType = user.userType;
    req.session.rememberMe = remember || false;

    console.log(`تسجيل دخول: ${user.email} - تذكرني: ${remember ? 'نعم' : 'لا'} - مدة الجلسة: ${remember ? '30 يوم' : '2 ساعة'}`);

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: userWithoutPassword,
      sessionDuration: sessionDuration
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// إنشاء حساب جديد
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, firstName, lastName, userType, password, specialization, experience, bio } = req.body;
    
    // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    // التحقق من عدم وجود مستخدم بنفس اسم المستخدم
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'اسم المستخدم مستخدم بالفعل' });
    }

    const userData = {
      email,
      username,
      firstName,
      lastName,
      userType,
      password,
      specialization: userType === 'teacher' ? specialization : null,
      experience: userType === 'teacher' ? experience : null,
      bio: userType === 'teacher' ? bio : null
    };

    const newUser = await storage.createUser(userData);
    req.session.userId = newUser.id;
    req.session.userType = newUser.userType;

    const { passwordHash, ...userWithoutPassword } = newUser;
    res.json({
      message: 'تم إنشاء الحساب بنجاح',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('خطأ في إنشاء الحساب:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تسجيل الخروج
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في تسجيل الخروج' });
    }
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  });
});

// التحقق من حالة تسجيل الدخول
app.get('/api/auth-status', async (req, res) => {
  try {
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        const { passwordHash, ...userWithoutPassword } = user;
        
        // إضافة معلومات الجلسة للرد
        const sessionInfo = {
          rememberMe: req.session.rememberMe || false,
          maxAge: req.session.cookie.maxAge,
          expiresAt: new Date(Date.now() + req.session.cookie.maxAge).toISOString()
        };
        
        return res.json({ 
          authenticated: true, 
          user: userWithoutPassword,
          session: sessionInfo
        });
      }
    }
    res.json({ authenticated: false });
  } catch (error) {
    console.error('خطأ في التحقق من حالة المصادقة:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على جميع المعلمين
app.get('/api/teachers', async (req, res) => {
  try {
    const teachers = await storage.getAllTeachers();
    res.json(teachers);
  } catch (error) {
    console.error('خطأ في الحصول على المعلمين:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على جميع الدروس
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await storage.getAllLessons();
    res.json(lessons);
  } catch (error) {
    console.error('خطأ في الحصول على الدروس:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على درس محدد
app.get('/api/lessons/:id', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    const lesson = await storage.getLesson(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'الدرس غير موجود' });
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('خطأ في الحصول على الدرس:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// زيادة عدد المشاهدات
app.post('/api/lessons/:id/view', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    await storage.incrementViews(lessonId);
    res.json({ message: 'تم تحديث عدد المشاهدات' });
  } catch (error) {
    console.error('خطأ في تحديث المشاهدات:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// إضافة/إزالة إعجاب
app.post('/api/lessons/:id/like', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    const userId = req.session.userId || `guest_${req.ip}`;
    
    const result = await storage.toggleLike(lessonId, userId);
    res.json(result);
  } catch (error) {
    console.error('خطأ في تبديل الإعجاب:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// التحقق من حالة الإعجاب
app.get('/api/lessons/:id/like-status', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    const userId = req.session.userId || `guest_${req.ip}`;
    
    const hasLiked = await storage.hasUserLiked(lessonId, userId);
    res.json({ hasLiked });
  } catch (error) {
    console.error('خطأ في التحقق من حالة الإعجاب:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// إنشاء درس جديد (للمعلمين فقط)
app.post('/api/lessons', async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'teacher') {
      return res.status(401).json({ message: 'يجب أن تكون معلماً لإنشاء درس' });
    }

    const { title, description, videoUrl, subject, grade, pdfUrls } = req.body;
    
    // تنظيف وفلترة ملفات PDF
    let cleanPdfUrls = [];
    if (pdfUrls && Array.isArray(pdfUrls)) {
      cleanPdfUrls = pdfUrls
        .filter(url => url && url.trim() !== '')
        .map(url => url.trim())
        .slice(0, 3); // حد أقصى 3 ملفات
    }
    
    const lessonData = {
      title,
      description,
      videoUrl,
      subject,
      grade,
      pdfUrls: cleanPdfUrls,
      teacherId: req.session.userId
    };

    const newLesson = await storage.createLesson(lessonData);
    res.json(newLesson);
  } catch (error) {
    console.error('خطأ في إنشاء الدرس:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على دروس المعلم
app.get('/api/teacher-lessons', async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'teacher') {
      return res.status(401).json({ message: 'غير مصرح لك بالوصول' });
    }

    const lessons = await storage.getLessonsByTeacher(req.session.userId);
    res.json(lessons);
  } catch (error) {
    console.error('خطأ في الحصول على دروس المعلم:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تحديث درس
app.put('/api/lessons/:id', async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'teacher') {
      return res.status(401).json({ message: 'غير مصرح لك بالوصول' });
    }

    const lessonId = parseInt(req.params.id);
    const updates = { ...req.body };

    // تنظيف وفلترة ملفات PDF
    if (updates.pdfUrls && Array.isArray(updates.pdfUrls)) {
      updates.pdfUrls = updates.pdfUrls
        .filter(url => url && url.trim() !== '')
        .map(url => url.trim())
        .slice(0, 3); // حد أقصى 3 ملفات
    }

    const updatedLesson = await storage.updateLesson(lessonId, req.session.userId, updates);
    
    if (!updatedLesson) {
      return res.status(404).json({ message: 'الدرس غير موجود أو غير مصرح لك بتعديله' });
    }

    res.json(updatedLesson);
  } catch (error) {
    console.error('خطأ في تحديث الدرس:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// حذف درس
app.delete('/api/lessons/:id', async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'teacher') {
      return res.status(401).json({ message: 'غير مصرح لك بالوصول' });
    }

    const lessonId = parseInt(req.params.id);
    const deleted = await storage.deleteLesson(lessonId, req.session.userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'الدرس غير موجود أو غير مصرح لك بحذفه' });
    }

    res.json({ message: 'تم حذف الدرس بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف الدرس:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تحديث الملف الشخصي
app.put('/api/update-profile', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const { username, firstName, lastName, specialization, experience, bio } = req.body;
    
    // التحقق من عدم وجود مستخدم آخر بنفس اسم المستخدم
    if (username) {
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== req.session.userId) {
        return res.status(400).json({ message: 'اسم المستخدم مستخدم بالفعل' });
      }
    }

    const updates = {};
    if (username) updates.username = username;
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (specialization !== undefined) updates.specialization = specialization;
    if (experience !== undefined) updates.experience = experience;
    if (bio !== undefined) updates.bio = bio;

    const updatedUser = await storage.updateProfile(req.session.userId, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    res.json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// حذف الحساب
app.delete('/api/delete-account', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const deleted = await storage.deleteUser(req.session.userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('خطأ في تدمير الجلسة:', err);
      }
    });

    res.json({ message: 'تم حذف الحساب بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف الحساب:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// إحصائيات المعلم
app.get('/api/teacher-stats', async (req, res) => {
  try {
    if (!req.session.userId || req.session.userType !== 'teacher') {
      return res.status(401).json({ message: 'غير مصرح لك بالوصول' });
    }

    const teacherLessons = await storage.getLessonsByTeacher(req.session.userId);
    const totalViews = teacherLessons.reduce((sum, lesson) => sum + lesson.views, 0);
    const totalLikes = teacherLessons.reduce((sum, lesson) => sum + lesson.likes, 0);

    res.json({
      totalLessons: teacherLessons.length,
      totalViews: totalViews,
      totalLikes: totalLikes
    });
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات المعلم:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// بدء الخادم
app.listen(PORT, '0.0.0.0', () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
  console.log(`عدد المستخدمين: ${data.users.length}`);
  console.log(`عدد الدروس: ${data.lessons.length}`);
  console.log('بيانات تجريبية:');
  console.log('- معلم: teacher@example.com / 123456');
  console.log('- طالب: student@example.com / 123456');
  console.log('تم تفعيل التخزين الدائم في ملف data.json');
});
