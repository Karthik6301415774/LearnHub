const User = require('../schemas/userModel');
const Course = require('../schemas/courseModel');
const EnrolledCourse = require('../schemas/enrolledCourseModel');
const LiveSession = require('../schemas/liveSessionModel');
const Quiz = require('../schemas/quizModel');
const PracticeSession = require('../schemas/practiceSessionModel');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @desc   Register user
// @route  POST /api/users/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, type, phone, dob } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        // Students are auto-approved; teachers need admin approval
        const userType = type || 'student';
        const isApproved = userType !== 'teacher'; // students/admin = true, teachers = false

        const user = await User.create({ name, email, password, phone, dob, type: userType, isApproved });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            type: user.type,
            isApproved: user.isApproved,
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
        // Block unapproved teachers
        if (user.type === 'teacher' && !user.isApproved) {
            return res.status(403).json({ message: 'Your teacher account is pending admin approval. Please wait for approval.' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            type: user.type,
            isApproved: user.isApproved,
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

// @desc   Pay for a course (submit payment proof, awaiting admin approval)
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

        const CoursePayment = require('../schemas/coursePaymentModel');

        // Check if a pending payment already exists (prevent duplicates)
        const existing = await CoursePayment.findOne({
            studentId: req.user._id,
            courseId: course._id,
            status: 'pending',
        });
        if (existing) return res.status(400).json({ message: 'Payment already submitted and waiting for admin approval.' });

        const { transactionId } = req.body;

        // Create a PENDING payment record — admin must approve it
        await CoursePayment.create({
            studentId: req.user._id,
            courseId: course._id,
            amount: course.C_price,
            status: 'pending',
            transactionId: transactionId || `UPI-${Date.now()}`,
        });

        // Do NOT mark isPaid yet — admin must approve
        res.json({ message: 'Payment submitted! Awaiting admin approval.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Get enrolled courses for student (with payment status)
// @route  GET /api/users/my-courses
const getMyCourses = async (req, res) => {
    try {
        const CoursePayment = require('../schemas/coursePaymentModel');
        const enrollments = await EnrolledCourse.find({ studentId: req.user._id }).populate('courseId');

        // For each enrollment, check if there is a pending/failed payment record
        const enriched = await Promise.all(enrollments.map(async (e) => {
            const obj = e.toObject();
            if (e.courseId?.C_price > 0 && !e.isPaid) {
                const payment = await CoursePayment.findOne({
                    studentId: req.user._id,
                    courseId: e.courseId._id,
                }).sort({ createdAt: -1 });
                obj.paymentStatus = payment?.status || null; // 'pending', 'failed', or null
            } else {
                obj.paymentStatus = e.isPaid ? 'completed' : null;
            }
            return obj;
        }));

        res.json(enriched);
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

// @desc   Generate OTP for password reset
// @route  POST /api/users/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        await user.save();

        // Normally we would send an SMS/Email here. 
        // For development, we return the OTP to easily simulate it.
        res.json({ message: 'OTP sent to your email/phone successfully', _dev_otp: otp });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Verify OTP
// @route  POST /api/users/verify-otp
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.resetOtp !== otp || Date.now() > user.resetOtpExpires) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Reset Password
// @route  POST /api/users/reset-password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.resetOtp !== otp || Date.now() > user.resetOtpExpires) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.password = newPassword;
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc   Get extra features (Live Session, Quizzes, Practice) for a specific enrolled course
// @route  GET /api/users/courses/:courseId/extras
const getCourseExtras = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        // Verify enrollment
        const enrollment = await EnrolledCourse.findOne({ studentId: req.user._id, courseId });
        if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

        const [liveSessions, quizzes, practices] = await Promise.all([
            LiveSession.find({ courseId }).sort({ scheduledAt: 1 }),
            Quiz.find({ courseId }).sort({ createdAt: 1 }),
            PracticeSession.find({ courseId }).sort({ dueDate: 1 }),
        ]);

        res.json({ liveSessions, quizzes, practices });
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
    forgotPassword,
    verifyOtp,
    resetPassword,
    getCourseExtras,
};
