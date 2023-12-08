const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

let app = express();
const server = http.createServer(app);
let io = new Server(server);

app.use(express.static("client"));

app = require(__dirname+"/server.js")(app);

io = require(__dirname+"/server/io/socket.js")(io);

server.listen(8080, () => console.log("Listening"));
