const User = require('../schemas/userModel');
const Course = require('../schemas/courseModel');
const EnrolledCourse = require('../schemas/enrolledCourseModel');
const CoursePayment = require('../schemas/coursePaymentModel');
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
};
