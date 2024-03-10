const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    signup, 
    login,
    updateName,
    resetPassword,
    generateOtp,
    otpVerify,
    forgetPassword,
    statusUpdate,
} = require('../controller/userController');

router.post('/signup', signup);

router.post('/login', login);

router.patch('/updateName', auth(), updateName);

router.patch('/resetPassword', auth(), resetPassword);

router.patch('/generateOtp', generateOtp);

router.post('/otpVerify', otpVerify);

router.patch('/forgetPassword', auth('forget password'), forgetPassword);

router.patch('/statusUpdate', auth(), statusUpdate);
module.exports = router;
