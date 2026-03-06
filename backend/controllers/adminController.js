const User = require('../schemas/userModel');
const Course = require('../schemas/courseModel');
const EnrolledCourse = require('../schemas/enrolledCourseModel');
const CoursePayment = require('../schemas/coursePaymentModel');
const SiteSettings = require('../schemas/siteSettingsModel');
const LiveSession = require('../schemas/liveSessionModel');
const Quiz = require('../schemas/quizModel');
const PracticeSession = require('../schemas/practiceSessionModel');
const path = require('path');

// @desc   Teacher: Create a course
// @route  POST /api/admin/courses
const createCourse = async (req, res) => {
    try {
        const { C_educator, C_categories, C_title, C_description, C_price, prerequisites } = req.body;
        const thumbnail = req.file ? `/uploads/${req.file.filename}` : '';
        const course = await Course.create({
            userID: req.user._id,
            C_educator: C_educator || req.user.name,
            C_categories,
            C_title,
            C_description,
            C_price: Number(C_price) || 0,
            prerequisites: prerequisites || '',
            thumbnail,
        });
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher: Get own courses
// @route  GET /api/admin/my-courses
const getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course.find({ userID: req.user._id });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher/Admin: Update course
// @route  PUT /api/admin/courses/:id
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (req.user.type !== 'admin' && course.userID.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this course' });
        }

        const { C_educator, C_categories, C_title, C_description, C_price, prerequisites } = req.body;
        if (C_educator) course.C_educator = C_educator;
        if (C_categories) course.C_categories = C_categories;
        if (C_title) course.C_title = C_title;
        if (C_description) course.C_description = C_description;
        if (C_price !== undefined) course.C_price = Number(C_price);
        if (prerequisites !== undefined) course.prerequisites = prerequisites;
        if (req.file) course.thumbnail = `/uploads/${req.file.filename}`;

        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher: Delete course (only if no enrolled students)
// @route  DELETE /api/admin/courses/:id
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (req.user.type !== 'admin' && course.userID.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (req.user.type === 'teacher' && course.enrolled.length > 0) {
            return res.status(400).json({ message: 'Cannot delete: students are enrolled' });
        }

        await Course.findByIdAndDelete(req.params.id);
        await EnrolledCourse.deleteMany({ courseId: req.params.id });
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher: Add a section with optional video
// @route  POST /api/admin/courses/:id/sections
const addSection = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (req.user.type !== 'admin' && course.userID.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, duration } = req.body;
        const videoUrl = req.file ? `/uploads/${req.file.filename}` : '';

        course.sections.push({ title, description, duration, videoUrl });
        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher: Delete section
// @route  DELETE /api/admin/courses/:id/sections/:sectionId
const deleteSection = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (req.user.type !== 'admin' && course.userID.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        course.sections = course.sections.filter(
            (s) => s._id.toString() !== req.params.sectionId
        );
        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================  ADMIN ONLY  ==================

// @desc   Admin: Get all users
// @route  GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Delete user
// @route  DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Get all enrollments
// @route  GET /api/admin/enrollments
const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await EnrolledCourse.find()
            .populate('studentId', 'name email')
            .populate('courseId', 'C_title C_price');
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Get stats
// @route  GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalEnrollments = await EnrolledCourse.countDocuments();
        const totalRevenue = await CoursePayment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        res.json({
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalRevenue: totalRevenue[0]?.total || 0,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Get pending (unapproved) teacher accounts
// @route  GET /api/admin/pending-teachers
const getPendingTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ type: 'teacher', isApproved: false }).select('-password');
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Approve a teacher
// @route  PUT /api/admin/approve-teacher/:id
const approveTeacher = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.type !== 'teacher') {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        user.isApproved = true;
        await user.save();
        res.json({ message: 'Teacher approved successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Reject (delete) a teacher account
// @route  DELETE /api/admin/reject-teacher/:id
const rejectTeacher = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Teacher rejected and removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Upload UPI QR code image
// @route  POST /api/admin/settings/upi-qr
const uploadUpiQr = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const imageUrl = `/uploads/${req.file.filename}`;
        await SiteSettings.findOneAndUpdate(
            { key: 'upi_qr' },
            { key: 'upi_qr', value: imageUrl },
            { upsert: true, new: true }
        );
        res.json({ message: 'UPI QR updated successfully', imageUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Get UPI QR image (public)
// @route  GET /api/admin/settings/upi-qr
const getUpiQr = async (req, res) => {
    try {
        const setting = await SiteSettings.findOne({ key: 'upi_qr' });
        res.json({ imageUrl: setting?.value || null });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Get all payments with student + course info
// @route  GET /api/admin/payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await CoursePayment.find()
            .populate('studentId', 'name email phone')
            .populate('courseId', 'C_title C_price C_educator')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Approve a pending payment → mark enrollment as paid
// @route  PUT /api/admin/payments/:id/approve
const approvePayment = async (req, res) => {
    try {
        const payment = await CoursePayment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        if (payment.status === 'completed') return res.status(400).json({ message: 'Already approved' });

        payment.status = 'completed';
        await payment.save();

        // Mark the enrollment as paid so student can access the course
        await EnrolledCourse.findOneAndUpdate(
            { studentId: payment.studentId, courseId: payment.courseId },
            { isPaid: true }
        );

        res.json({ message: 'Payment approved. Student now has access.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Reject a pending payment → delete record so student can retry
// @route  DELETE /api/admin/payments/:id/reject
const rejectPayment = async (req, res) => {
    try {
        const payment = await CoursePayment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        payment.status = 'failed';
        await payment.save();

        res.json({ message: 'Payment rejected. Student notified to retry.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================  LIVE SESSIONS  ==================

// @desc   Teacher: Create live session
// @route  POST /api/admin/live-sessions
const createLiveSession = async (req, res) => {
    try {
        const { courseId, title, description, sessionUrl, scheduledAt } = req.body;
        const session = await LiveSession.create({
            teacherId: req.user._id,
            courseId,
            title,
            description,
            sessionUrl,
            scheduledAt,
        });
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher/Admin: Get live sessions for a course
// @route  GET /api/admin/live-sessions?courseId=xxx
const getLiveSessions = async (req, res) => {
    try {
        const filter = {};
        if (req.user.type === 'teacher') filter.teacherId = req.user._id;
        if (req.query.courseId) filter.courseId = req.query.courseId;
        const sessions = await LiveSession.find(filter)
            .populate('courseId', 'C_title')
            .populate('teacherId', 'name email')
            .sort({ scheduledAt: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Admin: Get ALL live sessions
// @route  GET /api/admin/all-live-sessions
const getAllLiveSessions = async (req, res) => {
    try {
        const sessions = await LiveSession.find()
            .populate('courseId', 'C_title')
            .populate('teacherId', 'name email')
            .sort({ scheduledAt: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher: Toggle isLive flag
// @route  PUT /api/admin/live-sessions/:id/toggle
const toggleLiveSession = async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        session.isLive = !session.isLive;
        await session.save();
        res.json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher: Delete live session
// @route  DELETE /api/admin/live-sessions/:id
const deleteLiveSession = async (req, res) => {
    try {
        await LiveSession.findByIdAndDelete(req.params.id);
        res.json({ message: 'Session deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================  QUIZ  ==================

// @desc   Teacher: Create quiz for a course
// @route  POST /api/admin/courses/:courseId/quiz
const createQuiz = async (req, res) => {
    try {
        const { title, description, questions } = req.body;
        const quiz = await Quiz.create({
            courseId: req.params.courseId,
            teacherId: req.user._id,
            title,
            description,
            questions,
        });
        res.status(201).json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Get quizzes for a course
// @route  GET /api/admin/courses/:courseId/quiz
const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ courseId: req.params.courseId });
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher: Delete quiz
// @route  DELETE /api/admin/quiz/:id
const deleteQuiz = async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================  PRACTICE SESSION  ==================

// @desc   Teacher: Create practice session
// @route  POST /api/admin/courses/:courseId/practice
const createPractice = async (req, res) => {
    try {
        const { title, description, dueDate, submissionType } = req.body;
        const practice = await PracticeSession.create({
            courseId: req.params.courseId,
            teacherId: req.user._id,
            title,
            description,
            dueDate,
            submissionType,
        });
        res.status(201).json(practice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Get practice sessions for a course
// @route  GET /api/admin/courses/:courseId/practice
const getPractices = async (req, res) => {
    try {
        const practices = await PracticeSession.find({ courseId: req.params.courseId });
        res.json(practices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Teacher: Delete practice session
// @route  DELETE /api/admin/practice/:id
const deletePractice = async (req, res) => {
    try {
        await PracticeSession.findByIdAndDelete(req.params.id);
        res.json({ message: 'Practice deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
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
};
