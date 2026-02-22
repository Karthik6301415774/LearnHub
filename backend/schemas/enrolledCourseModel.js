const mongoose = require('mongoose');

const enrolledCourseSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        progress: { type: Number, default: 0 }, // percent 0-100
        completedSections: [{ type: mongoose.Schema.Types.ObjectId }],
        lastSectionIndex: { type: Number, default: 0 },
        isPaid: { type: Boolean, default: false },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model('EnrolledCourse', enrolledCourseSchema);
