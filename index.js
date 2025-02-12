const express = require("express");
const http = require("http");
const path = require("path");
const configureWsServer = require("./infrastructure/ws-server");
const authApiRouter = require("./routes/auth");
const pagesRouter = require("./routes/pages");
const { connectDB } = require("./config/database");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const webSocketServer = configureWsServer(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/pages"));
app.use(express.static(path.resolve("static")));
app.use(express.json());

app.use("/", pagesRouter);
app.use("/api/auth", authApiRouter);

app.use("*", (req, res) => {
	res.status(404).json({
		error: "Route Not Found",
	});
});

connectDB();

server.listen(PORT, () => {
	console.log(
		`Server is running on port ${PORT}. Visit http://localhost:${PORT}`
	);
});
