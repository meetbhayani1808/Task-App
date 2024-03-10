const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'meetbhayani123@gmail.com',
        pass: 'ghbqikwtgimgukvz',
    },
});

module.exports = {
    transporter
}