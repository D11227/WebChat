const username = document.getElementById('username');
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const joinBtn = document.getElementById('join-btn');
const createBtn = document.getElementById('create-btn');

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

toastr.options = {
	"closeButton": false,
	"debug": false,
	"newestOnTop": true,
	"progressBar": true,
	"positionClass": "toast-top-right",
	"preventDuplicates": false,
	"onclick": null,
	"showDuration": "300",
	"hideDuration": "1000",
	"timeOut": "5000",
	"extendedTimeOut": "1000",
	"showEasing": "swing",
	"hideEasing": "linear",
	"showMethod": "fadeIn",
	"hideMethod": "fadeOut"
}

document.getElementById('login-btn').addEventListener('click', () => {
	if (username == "") return;
	
	myUsername = username.value;
	Network.login();
	
	loginScreen.style.display = "none";
	chatScreen.style.display = "flex";
});

document.getElementById("open-join-modal").addEventListener("click", () => {
	document.getElementById("join-modal").classList.toggle("active");
});

document.getElementById("open-create-modal").addEventListener("click", () => {
	document.getElementById("create-modal").classList.toggle("active");
});

joinBtn.addEventListener('click', () => {
	const id = document.getElementById('group-id').value;
	Network.joinGroup(id);
	document.getElementById("join-modal").classList.toggle("active");
});

createBtn.addEventListener('click', () => {
	const name = document.getElementById('group-name').value;
	const id = uid();
	Network.createGroup(id, name);
	document.getElementById("create-modal").classList.toggle("active");
});

function updateGroups() {
	let html = '';
	const groupsList = document.getElementById('groups-list');
	Object.keys(groups).map(id => {
		html += `
			<a href="#" onclick="joinGroup('${id}')" id="group_${id}" class="group_id">
				<div class="group">
					<h3>${groups[id].name}</h3>
					<p>No message</p>
				</div>
			</a>
		`;	
	});
	groupsList.innerHTML = html;
}

function joinGroup(id) {
	currentGroup = groups[id];
	Array.from(document.getElementsByClassName('group_id')).map(x => x.children[0].classList.remove('current_group'));
	document.getElementById(`group_${id}`).children[0].classList.add('current_group');
}

window.onbeforeunload = function() {
	Object.keys(groups).map(id => Network.leaveGroup(id));
}
