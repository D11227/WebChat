const ws = new WebSocket("ws://localhost:8080/chat");

ws.addEventListener("open", (e) => {
	console.log("Connected to WebSocket.");
});

ws.addEventListener("message", (e) => {
	const data = JSON.parse(e.data);
	console.log(data);
});

ws.addEventListener("close", (e) => {
	console.log("Disconnected to WebSocket.");
});
