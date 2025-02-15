// TODO: this is real world example will come as env variables
module.exports = {
    env: process.env.NODE_ENV || "development",
	development: {
		privateKey: "DEV-TEST",
		databaseUrl: "mongodb://0.0.0.0:27017/test",
	},
	production: {
		privateKey: "DEV-TEST",
		databaseUrl: "mongodb+srv://test1:nUjeYMeHxKWPHpun@cluster0.ivd90.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    },
    getConfig: function () {
        return this[this.env];
    }
};