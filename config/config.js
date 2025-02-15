// TODO: this is real world example will come as env variables
module.exports = {
    env: process.env.NODE_ENV || "development",
	development: {
		privateKey: "DEV-TEST",
		databaseUrl: "mongodb://0.0.0.0:27017/test",
	},
	production: {
		privateKey: "DEV-TEST",
		databaseUrl: "",
    },
    getConfig: function () {
        return this[this.env];
    }
};