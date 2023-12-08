module.exports = io => {
	let onlineUsers = 0;

	io.on("connection", socket => {
		let username = socket.handshake.auth.user;
		let ratelimit = {messages: 0, lastMessage: (new Date()), timeout: 60, timeoutDate: undefined};

		onlineUsers++;

		io.emit("message", {user: "System", message:`${username} arrived!`, online: onlineUsers});

		socket.on("message", message => {

			if (message.split(" ")[0] === "/nick") {

				let nick = message.split(" ").slice(1).join("-");

				if (nick.length < 4 || nick.length > 12 || nick.toLowerCase() === "system") {
					socket.emit("message", {user:"System", message:"Nickname is invalid. Valid nicknames are 4 to 12 characters long.", online: onlineUsers});
				} else {
					io.emit("message", {user:"System", message:`${username} changed to ${nick}`, online: onlineUsers});
					username = nick;
				}

			} else {
				if ((new Date()) - ratelimit.lastMessage > 5000) {
					ratelimit.lastMessage = new Date();
					ratelimit.messages = 0;
				} else if (ratelimit.messages === 10 && (!ratelimit.timeoutDate || (new Date()) - ratelimit.timeoutDate > ratelimit.timeout * 1000)) {
					socket.emit("message", {user:"System",message:"You have been ratelimited for 60 seconds",online:onlineUsers});
					ratelimit.timeoutDate = (new Date());
				} else if (ratelimit.messages === 10) {
					socket.emit("message", {user:"System",message:`You are timedout for ${60-(Math.round(((new Date()) - ratelimit.timeoutDate) / 1000))} seconds`,online:onlineUsers});
				}
				ratelimit.messages++;

				if (!ratelimit.timeoutDate || (new Date()) - ratelimit.timeoutDate > ratelimit.timeout * 1000) {
					io.emit("message", {user: username, message, online: onlineUsers})
				}
			}

		});

		socket.on("disconnect", () => {
			onlineUsers--;

			io.emit("message", {user: "System", message: `${username} left`, online: onlineUsers});
		});

		socket.emit("message", {user: "System", message: "Welcome to the chat! Use /nick {nickname} to change your nickname.", online: onlineUsers});
	});
	
	return io;
}
