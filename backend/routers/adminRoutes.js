const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createCourse,
    getTeacherCourses,
    updateCourse,
    deleteCourse,
    addSection,
    deleteSection,
    getAllUsers,
    deleteUser,
    getAllEnrollments,
    getStats,
    getPendingTeachers,
    approveTeacher,
    rejectTeacher,
    uploadUpiQr,
    getUpiQr,
    getAllPayments,
    approvePayment,
    rejectPayment,
    createLiveSession,
    getLiveSessions,
    getAllLiveSessions,
    toggleLiveSession,
    deleteLiveSession,
    createQuiz,
    getQuizzes,
    deleteQuiz,
    createPractice,
    getPractices,
    deletePractice,
} = require('../controllers/adminController');
const { protect, adminOnly, teacherOrAdmin } = require('../middlewares/authMiddleware');

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    },
});
const upload = multer({ storage });

// Teacher routes
router.post('/courses', protect, teacherOrAdmin, upload.single('thumbnail'), createCourse);
router.get('/my-courses', protect, teacherOrAdmin, getTeacherCourses);
router.put('/courses/:id', protect, teacherOrAdmin, upload.single('thumbnail'), updateCourse);
router.delete('/courses/:id', protect, teacherOrAdmin, deleteCourse);
router.post('/courses/:id/sections', protect, teacherOrAdmin, upload.single('video'), addSection);
router.delete('/courses/:id/sections/:sectionId', protect, teacherOrAdmin, deleteSection);

// Admin-only routes
router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/enrollments', protect, adminOnly, getAllEnrollments);
router.get('/stats', protect, adminOnly, getStats);

// Teacher approval routes (Admin only)
router.get('/pending-teachers', protect, adminOnly, getPendingTeachers);
router.put('/approve-teacher/:id', protect, adminOnly, approveTeacher);
router.delete('/reject-teacher/:id', protect, adminOnly, rejectTeacher);

// Settings / UPI QR — GET is public so students can load it
router.post('/settings/upi-qr', protect, adminOnly, upload.single('qr'), uploadUpiQr);
router.get('/settings/upi-qr', getUpiQr);

// Payments
router.get('/payments', protect, adminOnly, getAllPayments);
router.put('/payments/:id/approve', protect, adminOnly, approvePayment);
router.delete('/payments/:id/reject', protect, adminOnly, rejectPayment);

// Live Sessions
router.post('/live-sessions', protect, teacherOrAdmin, createLiveSession);
router.get('/live-sessions', protect, teacherOrAdmin, getLiveSessions);
router.get('/all-live-sessions', protect, adminOnly, getAllLiveSessions);
router.put('/live-sessions/:id/toggle', protect, teacherOrAdmin, toggleLiveSession);
router.delete('/live-sessions/:id', protect, teacherOrAdmin, deleteLiveSession);

// Quiz
router.post('/courses/:courseId/quiz', protect, teacherOrAdmin, createQuiz);
router.get('/courses/:courseId/quiz', protect, teacherOrAdmin, getQuizzes);
router.delete('/quiz/:id', protect, teacherOrAdmin, deleteQuiz);

// Practice Session
router.post('/courses/:courseId/practice', protect, teacherOrAdmin, createPractice);
router.get('/courses/:courseId/practice', protect, teacherOrAdmin, getPractices);
router.delete('/practice/:id', protect, teacherOrAdmin, deletePractice);

module.exports = router;
