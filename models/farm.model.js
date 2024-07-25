const mongoose = require('mongoose');
const { Schema } = mongoose;

const farmSchema = new Schema({
    username: { type: String, default: "abc" },
    userId: { type: String, required: true },
    farmReward: { type: Number, required: true, default: 0 },
    farmTime: { type: Number, required: true, default: 60 },
    LastActiveFarmTime: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    farmTotal:{type: Number, required:true, default:0},
    farmStatus: {
        type: String,
        enum: ['start', 'farming', 'claim'], // Define allowed values
        default: 'start' // Set default status
    }
}, {
    timestamps: true
});

const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm;
