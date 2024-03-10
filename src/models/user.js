const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: {
        type: String,
        default: 'user',
    },
    status: {
        type: String,
        default: 'active',
    },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
