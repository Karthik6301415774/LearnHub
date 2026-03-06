const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
    {
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        sessionUrl: { type: String, required: true }, // Zoom / Meet / YouTube live link
        scheduledAt: { type: Date, required: true },
        isLive: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('LiveSession', liveSessionSchema);
