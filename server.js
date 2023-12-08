module.exports = app => {
	console.log("Creating server routes");

	app.get("/api/test", (req, res) => res.send("test"));

	return app;
}
