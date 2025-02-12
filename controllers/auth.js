const errorMessages = require("../constants/errorMessages");
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = 'development';
const config = require('../config/config')[env];

const generateToken = (data) => {
	const token = jwt.sign(data, config.privateKey, { expiresIn: "1h" });
	return token;
};

const register = async function (req, res) {
	const { username, password } = req.body;
	try {
		const user = await User.findOne({ username });

		if (user !== null) {
			return res.status(400).json({
				error: errorMessages.userExists,
			});
		}

		validateRequestData(username, password, res);

		const hashedPassword = await hashPassword(password);

		const newUser = new User({ username, password: hashedPassword });
		const userObj = await newUser.save();

		const token = generateToken({
			userId: userObj._id,
			username: userObj.username,
		});
		res.cookie('token', token, {
			httpOnly: true,  
			secure: true,    
			sameSite: 'Strict', 
			maxAge: 60 * 60 * 1000, // 1 hour
		});
		return res.status(201).json({
			token,
			userId: userObj._id,
			username: userObj.username,
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			error: errorMessages.databaseUpdateError,
		});
	}
};

const login = async function (req, res) {
	const { username, password } = req.body;
	
	try {
		
		const user = await User.findOne({ username });

		if (user === null) {
			return res.status(404).json({
				error: errorMessages.invalidUsernamePassword,
			});
		}

		const status = await bcrypt.compare(password, user.password);

		if (status) {
			const token = generateToken({
				userId: user._id,
				username: user.username,
			});
			res.cookie('token', token, {
				httpOnly: true,  
				secure: true,    
				sameSite: 'Strict', 
				maxAge: 60 * 60 * 1000, // 1 hour
			});
			return res.status(200).json({
				userId: user._id,
				username: user.username,
			});
		} else {
			return res.status(400).json({
				error: errorMessages.wrongCredentials,
			});
		}
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			error: errorMessages.wrongCredentials,
		});
	}
};

const validateRequestData = function (username, password, res) {
	if (!username) {
		return res.status(400).json({
			error: errorMessages.usernameRequired,
		});
	}

	if (username.length < 3 || username.length > 30) {
		return res.status(400).json({
			error: errorMessages.usernameLength,
		});
	}

	if (!username.match(/^[A-Za-z0-9 ]+$/)) {
		return res.status(400).json({
			error: errorMessages.usernameContainsInvalindSymbols,
		});
	}

	if (!password) {
		return res.status(400).json({
			error: errorMessages.passwordRequired,
		});
	}

	if (password.length < 8) {
		return res.status(400).json({
			error: errorMessages.passwordLength,
		});
	}
};

const hashPassword = async function (password) {
	const salt = await bcrypt.genSalt();
	return await bcrypt.hash(password, salt);
};

module.exports = { register, login };
