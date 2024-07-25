const mongoose = require('mongoose');
const { Schema } = mongoose;

const referralSchema = new Schema({
    username: { type: String },
    userId: { type: String, required: true },
    referralBonus: { type: Number, required: true , default: 0}
});

const squadSchema = new Schema({
    username: { type: String },
    userId: { type: String, required: true },
    claimedReferral: { type: Number, required: true, default: 0 },
    referralCount:{ type: Number},
    newUserIds: { type: [String] },
    referralEarning: { type: Number, default: 0 },
    referrals: [referralSchema] , // Define as an array of referralSchema
    totalBalance: { type: Number, required: true, default: 0 }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

const Squad = mongoose.model('Squad', squadSchema);

module.exports = Squad;
