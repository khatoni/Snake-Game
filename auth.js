const env = process.env.NODE_ENV;
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const errorMessages = require('../constants/errorMessages');
const config = require('../config/config')[env];

const authenticate = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        return res
            .status(401)
            .json({
            error: errorMessages.missingAuth
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const userObj = jwt.verify(token, config.privateKey);
        req.userId = userObj.userId;
        req.username = userObj.username;
        next();
    } catch (e) {
        return res
            .status(401)
            .json({
            error: errorMessages.notAuthenticated
        });
    }
};

const verifyToken = async (token) => {
    try {
        const userObj = jwt.verify(token, config.privateKey);
        const user = await User.findById(userObj.userId);
        
        if (user !== null) {
            return {
                status: true,
                id: user._id,
                username: user.username
            }
        } else {
            return {
                status: false
            }
        }
    } catch (err) {
        console.error(err)
        return {
            status: false
        }
    }
};

module.exports = {
    authenticate,
    verifyToken
}
