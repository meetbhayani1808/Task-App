const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Otp = require('../models/otp');
const { transporter } = require('../utils/mail');
require('dotenv').config();

function generateRandomNumber(size) {
    const min = Math.pow(10, size - 1);
    const max = Math.pow(10, size) - 1;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function signup(req, res) {
    try {
        if ((await User.countDocuments()) === 0) {
            req.body.roles = 'admin';
        }
        req.body.password = await bcrypt.hash(req.body.password, 8);
        const user = await User.create(req.body);

        return res.status(200).json({
            success: true,
            message: 'user is create successfully!',
            data: { userCreated: user },
        });
    } catch (e) {
        console.log(e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Email does not exist',
            });
        }
        if (user.status != 'active') {
            return res.status(400).json({
                success: false,
                message: 'Not allowed by Admin',
            });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                message: 'Invalid password',
            });
        }
        const token = await jwt.sign({ _id: user._id.toString(), scope: 'login' }, '1808', { expiresIn: '24h' });
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { user, token },
        });
    } catch (e) {
        console.log(e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function updateName(req, res) {
    try {
        const _id = req.user._id;

        const updatedUser = await User.findByIdAndUpdate(_id, { $set: { name: req.body.name } }, { new: true });

        return res.status(200).json({
            success: true,
            message: 'update name success',
            data: updatedUser,
        });
    } catch (e) {
        console.log(`🚀 ~ updateName ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function resetPassword(req, res) {
    try {
        const user = req.user;
        const currentPassword = req.body.currentPassword;
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'password is incorrect',
            });
        }

        req.body.newPassword = await bcrypt.hash(req.body.newPassword, 8);
        await User.findByIdAndUpdate(user._id, { $set: { password: req.body.newPassword } });

        res.status(200).json({
            success: true,
            message: 'Password update successfully',
        });
    } catch (e) {
        console.log(`🚀 ~ resetPassword ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function generateOtp(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });

        console.log(`🚀 ~ generateOtp ~ user:`, user);

        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'please enter valid email',
            });
        }

        let generateOtp = generateRandomNumber(process.env.OTP_SIZE);
        const mailOptions = {
            from: 'meetbhayani123@gmail.com',
            to: user.email,
            subject: 'OTP For Forget Password',
            html: `<h1>${generateOtp}</h1>`,
        };

        generateOtp = await bcrypt.hash(generateOtp.toString(), 8);
        let otp = await Otp.findOne({ userId: user._id });

        if (!otp) {
            otp = await Otp.create({
                otp: generateOtp,
                generatedOtpCount: 1,
                userId: user._id,
            });
        } else {
            const currentTime = new Date();
            const expireTime = otp.updatedAt.setHours(otp.updatedAt.getHours() + 24);

            if (currentTime > expireTime) {
                otp = await Otp.findByIdAndUpdate(
                    otp._id,
                    { $set: { generatedOtpCount: 0, invalidOtpCount: 0 } },
                    { new: true }
                );
            }

            if (otp.generatedOtpCount >= 5) {
                return res.status(400).json({
                    success: false,
                    message: 'your max try is done after 24 hour allowed forget password',
                    data: otp,
                });
            }

            otp = await Otp.findByIdAndUpdate(
                otp._id,
                { $set: { otp: generateOtp }, $inc: { generatedOtpCount: 1 } },
                { new: true }
            );
        }

        await transporter.sendMail(mailOptions);
        console.log('Email is send to your email Id');

        return res.status(200).json({
            success: true,
            message: 'Otp send to your mail',
            data: otp,
        });
    } catch (e) {
        console.log(`🚀 ~ generateOtp ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function otpVerify(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'please enter valid email',
            });
        }

        const otpDetails = await Otp.findOne({ userId: user._id });
        if (!otpDetails) {
            return res.status(400).json({
                status: false,
                message: 'Generate New Otp',
            });
        }

        const currentTime = new Date();
        const expireTime = otpDetails.updatedAt.setHours(otpDetails.updatedAt.getHours() + 24);

        if (currentTime > expireTime) {
            otpDetails = await Otp.findByIdAndUpdate(
                otpDetails._id,
                { $set: { generatedOtpCount: 0, invalidOtpCount: 0 } },
                { new: true }
            );
        }

        if (otpDetails.invalidOtpCount >= 5) {
            return res.status(400).json({
                success: false,
                message: 'your max try is done after 24 hour allowed forget password',
            });
        }
        otpDetails.updatedAt.setMinutes(otpDetails.updatedAt.getMinutes() + 10);

        const otp = req.body.otp;
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'please enter otp!',
            });
        }

        if (currentTime >= otpDetails.updatedAt) {
            return res.status(400).json({
                success: false,
                message: 'Otp is expire!',
            });
        }
        const isValidOtp = await bcrypt.compare(otp, otpDetails.otp);

        if (!isValidOtp) {
            await Otp.findByIdAndUpdate(otpDetails._id, { $inc: { invalidOtpCount: 1 } });
            return res.status(400).json({
                success: false,
                message: 'Otp is invalid',
            });
        }

        const token = await jwt.sign(
            { _id: user._id.toString(), otpId: otpDetails._id.toString(), scope: 'forget password' },
            '1808',
            {
                expiresIn: '10m',
            }
        );
        return res.status(200).json({
            status: true,
            message: 'otp is verify successfully',
            token,
        });
    } catch (e) {
        console.log(`🚀 ~ otpVerify ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function forgetPassword(req, res) {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 8);
        const OtpId = await Otp.findById(req.decode.otpId);

        if (!OtpId) {
            return res.status(400).json({
                message: 'generate new otp!',
            });
        }
        await User.findByIdAndUpdate(req.user._id, { $set: { password: req.body.password } });

        await Otp.findOneAndDelete({ userId: req.user._id });
        return res.status(200).json({
            success: true,
            message: 'Password update successfully',
        });
    } catch (e) {
        console.log(`🚀 ~ forgetPassword ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function statusUpdate(req, res) {
    const admin = req.user;
    try {
        if (admin.roles == 'admin') {
            const _id = req.body._id;
            const user = await User.findOne({ _id });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'user is not found!',
                });
            }

            await User.findByIdAndUpdate(_id, { $set: { status: req.body.status } });
            res.status(200).json({
                success: true,
                message: 'status update successfully',
            });
        }
    } catch (e) {
        console.log(`🚀 ~ statusUpdate ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

module.exports = {
    signup,
    login,
    updateName,
    resetPassword,
    generateOtp,
    otpVerify,
    forgetPassword,
    statusUpdate,
};

//   (async function () {
//     const nodemailer = require("nodemailer");

//     const transporter = nodemailer.createTransport({
//         service: "Gmail",
//         host: "smtp.gmail.com",
//         port: 465,
//         secure: true,
//         auth: {
//           user: "meetbhayani123@gmail.com",
//           pass: "ghbqikwtgimgukvz",
//         },
//       });
//       const mailOptions = {
//         from: "meetbhayani123@gmail.com",
//         to: "rajbasu0018@gmail.com",
//         subject: "OTP For Forget Password",
//         html: "<h1>Your OTP is 34141</h1>",
//       };

//       const x = await transporter.sendMail(mailOptions);

//       console.log(`🚀 ~ x:`, x)

//   })();
