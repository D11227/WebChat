const ws = new WebSocket("ws://localhost:8080/chat");

var myUsername = null;
var currentGroup = null;
var groups = {};
var messages = {};

const Network = {
	send: function(object) {
		setTimeout(function() {
			ws.send(JSON.stringify(object));
		}, 0);
	},

	login: function() {
		Network.send({what: "login", username: myUsername});
	},

	joinGroup: function(id) {
		Network.send({what: "join-group", id: id});
	},

	createGroup: function(id, name) {
		Network.send({what: "create-group", id: id, name: name});
		toastr.success("Created group successfully!");
	},

	leaveGroup: function(id) {
		Network.send({what: "leave-group", id: id});

		delete groups[id];
		delete messages[id];
	}
};

ws.addEventListener("open", (e) => {
	console.log("Connected to WebSocket.");
});

ws.addEventListener("message", (e) => {
	const data = JSON.parse(e.data);
	console.log(data);

	if (data.what == 'update-group') {
		groups[data.group.id] = data.group;

		updateGroups();
	}
	else if (data.what == "error") {
		toastr.error(data.content);
	}
});

ws.addEventListener("close", (e) => {
	Object.keys(groups).map(id => Network.leaveGroup(id));
	console.log("Disconnected to WebSocket.");
});