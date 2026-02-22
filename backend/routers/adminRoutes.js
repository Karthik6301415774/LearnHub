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

module.exports = router;
