const { Router } = require("express");

const router = Router();

const { register, login } = require("../controllers/auth");
const { authenticate } = require("../infrastructure/auth");
const infrConstants = require("../constants/infrastructure");

router.get("/login", (req, res) => {
	res.render("login", {error: null});
});

router.post("/login", async (req, res) => {
	await login(req, res);
});

router.get("/register", (req, res) => {
	res.render("register", {error: null});
});

router.post("/register", async (req, res) => {
	await register(req, res);
});

router.post('/logout', authenticate, (req, res) => {
    res.clearCookie(infrConstants.authCookieName);
    res.redirect(301, '/');
});

module.exports = router;
