const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    videoUrl: { type: String }, // Stores path to uploaded video file
    description: { type: String },
    duration: { type: String },
});

const courseSchema = new mongoose.Schema(
    {
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        C_educator: { type: String, required: true },
        C_categories: { type: String, required: true },
        C_title: { type: String, required: true },
        C_description: { type: String, required: true },
        sections: [sectionSchema],
        C_price: { type: Number, default: 0 },
        enrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        prerequisites: { type: String, default: '' },
        thumbnail: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
