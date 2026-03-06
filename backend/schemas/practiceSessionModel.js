const mongoose = require('mongoose');

const practiceSchema = new mongoose.Schema(
    {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        dueDate: { type: Date },
        submissionType: { type: String, enum: ['text', 'link', 'file'], default: 'text' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('PracticeSession', practiceSchema);
