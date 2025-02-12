// const env = process.env.NODE_ENV;
const env = "development";
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const infrConstants = require("../constants/infrastructure");
const config = require("../config/config")[env];

const authenticate = (req, res, next) => {
	const token = req.cookies[infrConstants.authCookieName];

	if (!token) {
		return res.redirect("/auth/login");
	}

	try {
		const userObj = jwt.verify(token, config.privateKey);
		// check if token is expired
		req.userId = userObj.userId;
		req.username = userObj.username;
		next();
	} catch (e) {
		return res.redirect("/auth/login");
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
				username: user.username,
			};
		} else {
			return {
				status: false,
			};
		}
	} catch (err) {
		console.error(err);
		return {
			status: false,
		};
	}
};

module.exports = {
	authenticate,
	verifyToken,
};
