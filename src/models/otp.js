const mongoose = require('mongoose');
// const User = require('./user');

const OtpSchema = new mongoose.Schema(
    {
        otp: {
            type: String,
        },
        generatedOtpCount: {
            type: Number,
            default: 0,
        },
        invalidOtpCount: {
            type: Number,
            default: 0,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const otp = mongoose.model('Otp', OtpSchema);

module.exports = otp;
