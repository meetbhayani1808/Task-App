const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = function (scope = 'login') {
    return async function (req, res, next) {
        try {
            let token;
            if (!req.header('Authorization')) {
                return res.status(400).json({
                    message: 'token is require',
                });
            }
            token = req.header('Authorization').replace('Bearer ', '');
            if (!token) {
                return res.status(400).json({
                    message: 'token is require',
                });
            }

            const decode = jwt.verify(token, '1808');

            if (decode.scope !== scope) {
                return res.status(400).json({
                    message: 'token is invalid',
                });
            }

            const user = await User.findOne({ _id: decode._id });
            if (!user) {
                return res.status(400).json({
                    message: 'login again',
                });
            }
            if (user.status === 'inactive') {
                return re.status(400).json({
                    message: 'user is not allowed by admin',
                });
            }
            req.user = user;
            req.decode = decode;
            next();
        } catch (e) {
            console.log(`🚀 ~ auth ~ e):`, e);
            return res.status(400).json({
                success: false,
                message: e.message,
            });
        }
    };
};

module.exports = {
    auth,
};
