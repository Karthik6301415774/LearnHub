const User = require('../schemas/userModel');
const Course = require('../schemas/courseModel');
const EnrolledCourse = require('../schemas/enrolledCourseModel');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @desc   Register user
// @route  POST /api/users/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, type } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password, type: type || 'student' });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            type: user.type,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Login user
// @route  POST /api/users/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            type: user.type,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Get current user profile
// @route  GET /api/users/profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Get all courses (with search & filter)
// @route  GET /api/users/courses
const getAllCourses = async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};
        if (search) filter.C_title = { $regex: search, $options: 'i' };
        if (category) filter.C_categories = { $regex: category, $options: 'i' };
        const courses = await Course.find(filter).populate('userID', 'name email');
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Get single course
// @route  GET /api/users/courses/:id
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('userID', 'name email');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Enroll / purchase course
// @route  POST /api/users/enroll/:courseId
const enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const alreadyEnrolled = await EnrolledCourse.findOne({
            studentId: req.user._id,
            courseId: course._id,
        });
        if (alreadyEnrolled) return res.status(400).json({ message: 'Already enrolled' });

        const enrollment = await EnrolledCourse.create({
            studentId: req.user._id,
            courseId: course._id,
            isPaid: course.C_price === 0,
        });

        // add to course enrolled list
        await Course.findByIdAndUpdate(course._id, { $addToSet: { enrolled: req.user._id } });

        res.status(201).json(enrollment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Pay for a course
// @route  POST /api/users/pay/:courseId
const payCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const enrollment = await EnrolledCourse.findOne({
            studentId: req.user._id,
            courseId: course._id,
        });
        if (!enrollment) return res.status(404).json({ message: 'Not enrolled. Enroll first.' });
        if (enrollment.isPaid) return res.status(400).json({ message: 'Already paid' });

        enrollment.isPaid = true;
        await enrollment.save();

        const CoursePayment = require('../schemas/coursePaymentModel');
        await CoursePayment.create({
            studentId: req.user._id,
            courseId: course._id,
            amount: course.C_price,
        });

        res.json({ message: 'Payment successful', enrollment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Get enrolled courses for student
// @route  GET /api/users/my-courses
const getMyCourses = async (req, res) => {
    try {
        const enrollments = await EnrolledCourse.find({ studentId: req.user._id }).populate('courseId');
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Update progress / resume course
// @route  PUT /api/users/progress/:courseId
const updateProgress = async (req, res) => {
    try {
        const { sectionIndex, completed } = req.body;
        const enrollment = await EnrolledCourse.findOne({
            studentId: req.user._id,
            courseId: req.params.courseId,
        });
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        enrollment.lastSectionIndex = sectionIndex;
        if (completed) {
            const course = await Course.findById(req.params.courseId);
            const total = course.sections.length;
            const sectionId = course.sections[sectionIndex]?._id;
            if (sectionId && !enrollment.completedSections.includes(sectionId)) {
                enrollment.completedSections.push(sectionId);
            }
            enrollment.progress = Math.round((enrollment.completedSections.length / total) * 100);
            if (enrollment.progress >= 100) enrollment.completedAt = new Date();
        }
        await enrollment.save();
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllCourses,
    getCourseById,
    enrollCourse,
    payCourse,
    getMyCourses,
    updateProgress,
};
