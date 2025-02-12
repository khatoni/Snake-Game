const { Router } = require("express");

const router = Router();

const { register, login } = require("../controllers/auth");

router.post("/login", (req, res) => {
	try {
		login(req, res);
	} catch (error) {
		console.log(error);
	}
});

router.post("/register", (req, res) => {
	try {
		register(req, res);
	} catch (error) {
		console.log(error);
	}
})

module.exports = router;
