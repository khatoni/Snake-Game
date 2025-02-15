const mongoose = require("mongoose");
const config = require("../config/config").getConfig();

const connectDB = () => {
	mongoose.connect(config.databaseUrl, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
};

module.exports = connectDB;
