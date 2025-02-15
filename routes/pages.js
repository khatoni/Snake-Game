const { Router } = require("express");
const router = Router();
const { authenticate } = require("../infrastructure/auth");

router.get("/", authenticate, async (req, res) => {
	res.render("home");
});

router.get("/single-player", authenticate, async (req, res) => {
	res.render("single-player");
});

router.get("/multi-player", authenticate, async (req, res) => {
	res.render("multi-player");
});

module.exports = router;
