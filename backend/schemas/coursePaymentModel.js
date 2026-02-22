const mongoose = require('mongoose');

const coursePaymentSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
        transactionId: { type: String, default: () => `TXN-${Date.now()}` },
    },
    { timestamps: true }
);

module.exports = mongoose.model('CoursePayment', coursePaymentSchema);
