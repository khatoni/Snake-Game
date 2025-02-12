// alt shift f
const { Router } = require("express");
const {authenticate, verify} = require("../infrastructure/auth")

const router = Router();

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
