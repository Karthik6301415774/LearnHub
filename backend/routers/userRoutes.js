const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    getAllCourses,
    getCourseById,
    enrollCourse,
    payCourse,
    getMyCourses,
    updateProgress,
} = require('../controllers/userControllers');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseById);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.post('/enroll/:courseId', protect, enrollCourse);
router.post('/pay/:courseId', protect, payCourse);
router.get('/my-courses', protect, getMyCourses);
router.put('/progress/:courseId', protect, updateProgress);

module.exports = router;
