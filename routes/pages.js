// alt shift f
const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
	res.render("home");
});

router.get("/login", (req, res) => {
	res.render("login");
});

router.get("/register", (req, res) => {
	res.render("register");
});

router.get("/single-player", (req, res) => {
	res.render("single-player");
});

router.get("/multi-player", (req, res) => {
	res.render("multi-player");
});

module.exports = router;
