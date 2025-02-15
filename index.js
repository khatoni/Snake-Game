const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const configureWsServer = require("./infrastructure/ws-server");
const authApiRouter = require("./routes/auth");
const pagesRouter = require("./routes/pages");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { errorLogger, errorHandler } = require("./infrastructure/error");

const PORT = process.env.PORT || 3000;

// Configure
const app = express();
const server = http.createServer(app);
const webSocketServer = configureWsServer(server);

connectDB();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/pages"));
app.use(
	cors({
		exposedHeaders: "Authorization",
	})
);
app.use(express.json());
app.use(express.static(path.resolve("static")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/", pagesRouter);
app.use("/auth", authApiRouter);
app.use("*", (req, res) => {
	res.redirect("/");
});

// Error handling
app.use(errorLogger);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
	console.log(
		`Server is running on port ${PORT}. Visit http://localhost:${PORT}`
	);
});