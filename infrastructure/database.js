const mongoose = require("mongoose");
const configObj = require("../config/config");

const connectDB = () => {
    const config = configObj["production"];
	//const config = configObj.getConfig();
	const options = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	};
	//if (config.env === "production") {
	//	(options.user = config.dbUser), (options.password = config.dbPassword);
	//}
	mongoose.connect(config.databaseUrl, options);
};

module.exports = connectDB;
