const { Router } = require("express");

const router = Router();

const { register, login } = require("../controllers/auth");
const { authenticate } = require("../infrastructure/auth");
const infrConstants = require("../constants/infrastructure");

router.get("/login", (req, res) => {
	res.render("login");
});

router.get("/register", (req, res) => {
	res.render("register");
});

router.post("/login", async (req, res) => {
	try {
		await login(req, res);
	} catch (error) {
		console.error(error);
	}
});

router.post("/register", async (req, res) => {
	try {
		await register(req, res);
	} catch (error) {
		console.error(error);
	}
});

router.post('/logout', authenticate, (req, res) => {
    res.clearCookie(infrConstants.authCookieName);

    res.redirect(301, '/');
});

module.exports = router;
