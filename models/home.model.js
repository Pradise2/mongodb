const mongoose = require('mongoose');
const { Schema } = mongoose;

const homeSchema = new Schema({
    username: { type: String, default: "abc" },
    userId: { type: String, required: true, unique: true },
    homeBalance: { type: Number, required: true, default: 0 },
    tapClaim: { type: Number, required: true, default: 0 },
    tapPoint: { type: Number, required: true, default: 1000 },
    tapTime: { type: Number, required: true, default: 300 },
    LastActiveTime: { type: Number, default: () => Math.floor(Date.now() / 1000) },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const Home = mongoose.model('Home', homeSchema);

module.exports = Home;
