const mongoose = require('mongoose');
const { Schema } = mongoose;

const exerciseSchema = new Schema({
    username: { type: String, required: true},
    description: { type: String, required: true},
    duration: { type: Number, required: true},
    date: { type: Date, required: true},
}, {
    timestamps: true, // Correct usage to automatically add createdAt and updatedAt fields
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
