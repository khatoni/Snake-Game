const jwt = require("jsonwebtoken");
const infrConstants = require("../constants/infrastructure");
const config = require("../config/config").getConfig();

const redirectToLogin = (res) => {
	res.clearCookie(infrConstants.authCookieName);
	res.status(401);
	return res.redirect("/auth/login");
}

/**
 *
 * @param {string} token
 * @returns {UserObject | null} User object or undefined if token is invalid
 */
const tryValidateToken = (token) => {
	try {
		const userObj = jwt.verify(token, config.privateKey);
		if (userObj.exp < Date.now() / 1000) {
			return null;
		}

		return userObj;
	} catch (e) {
		return null;
	}
};

const authenticate = (req, res, next) => {
	const token = req.cookies[infrConstants.authCookieName];

	if (!token) {
		return redirectToLogin(res);
	}

	try {
		const userObj = tryValidateToken(token);
		if (!userObj) {
			return redirectToLogin(res);
		}

		req.userId = userObj.userId;
		req.username = userObj.username;
		next();
	} catch (e) {
		return redirectToLogin(res);
	}
};

const checkLoggedIn = function (req, res, next) {
	const token = req.cookies[infrConstants.authCookieName];

	// if no token or invalid token
	if (!token || !tryValidateToken(token)) {
		res.clearCookie(infrConstants.authCookieName);
		next();
		return;
	}

	return res.redirect("/");
};

module.exports = {
	authenticate,
	checkLoggedIn
};
