const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String }],          // 4 options
    correctIndex: { type: Number, required: true }, // index of the correct option
});

const quizSchema = new mongoose.Schema(
    {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        questions: [questionSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
