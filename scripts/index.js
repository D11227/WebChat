const ws = new WebSocket("ws://localhost:8080/chat");

ws.addEventListener("open", (e) => {
	console.log("Connected to WebSocket.");
});

ws.addEventListener("message", (e) => {
	console.log(e.data);
});

ws.addEventListener("close", (e) => {
	console.log("Disconnected to WebSocket.");
});
