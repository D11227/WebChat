const username = document.getElementById('username');
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const avatar = document.getElementById('myAvatar');
const name = document.getElementById('myName');
const joinBtn = document.getElementById('join-btn');
const createBtn = document.getElementById('create-btn');
const copyBtn = document.getElementById('copy-btn');
const closeBtns = document.getElementsByClassName('close-btn');
const copyToClipboardBtn = document.getElementById('copy-clipboard-btn');
const inputMessage = document.getElementById('input-message');

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

Array.from(closeBtns).map(x => x.addEventListener('click', function() {
	this.parentNode.parentNode.classList.toggle('active');
}));

document.getElementById('login-btn').addEventListener('click', () => {
	if (username == "") return;
	
	myUsername = username.value;
	myAvatar = new NameToAvatar(myUsername).draw();
	Network.login();
	
	avatar.src = myAvatar;
	name.innerText = myUsername;
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
	const id = document.getElementById('group-id');
	if (id.value == "") return;

	Network.joinGroup(id.value);
	id.value = "";
	document.getElementById("join-modal").classList.toggle("active");
});

createBtn.addEventListener('click', () => {
	const name = document.getElementById('group-name');
	if (name.value == "") return;

	const id = uid();
	Network.createGroup(id, name.value);
	name.value = "";
	document.getElementById("create-modal").classList.toggle("active");
});

copyBtn.addEventListener('click', () => {
	document.getElementById('copy-modal').classList.toggle('active');
});

copyToClipboardBtn.addEventListener('click', () => {
	document.getElementById('copyfield').style.background = '#3BA55D';
	copyToClipboardBtn.style.background = '#3BA55D';
	navigator.clipboard.writeText(currentGroup.id);

	setTimeout(() => {
		document.getElementById('copyfield').style.background = '#4752C4';
		copyToClipboardBtn.style.background = '#4752C4';
	}, 3000);
});

inputMessage.addEventListener('keyup', (e) => {
	if (e.keyCode == 13 && currentGroup.id != undefined) {
		const msg = inputMessage.value;
		inputMessage.value = '';
		if (msg == "") return;
		
		Network.sendMessage(msg);
	}
});

function updateGroups() {
	let html = '';
	const groupsList = document.getElementById('groups-list');
	Object.keys(groups).map(id => {
		const lastMessage = (messages[id].slice(-1).length)
			? `${messages[id].slice(-1)[0].username}: ${(messages[id].slice(-1)[0].type == "welcome") ? "Just joined!" : messages[id].slice(-1)[0].msg}`
			            : 'No message';
		html += `
			<a href="#" onclick="joinGroup('${id}')" id="group_${id}" class="group_id">
				<div class="group">
					<h3>${groups[id].name}</h3>
					<p>${lastMessage}</p>
					<span>
						<i class="fas fa-minus"></i>
					</span>
				</div>
			</a>
		`;	
	});
	groupsList.innerHTML = html;
}

function updateMessages() {
	let html = '';
	const messagesList = document.getElementById('messages-list');
	messages[currentGroup.id].map((msg, i, array) => {
		let a = `<img class="avatar" src="${msg.avatar}"/>`, displayMessage; 
		if (array[i - 1] != undefined) var sameId = array[i - 1].userId == msg.userId;
		if (sameId) a = '';
		if (msg.type == "welcome") displayMessage = `<img style="width: 100px; height: 100px;"src="${msg.msg}"/>`;
		else displayMessage = `<p>${msg.msg}</p>`;

		html += `
			<li><div class="user-message" ${(!sameId && array[i - 1] != undefined) ? `style="margin-top: 10px"` : ''}>
				${a}
				<div class="content" ${(sameId) ? `style="margin-left: 55px"` : ''}>
					${(!sameId) ? `<div class="username">
						<p>${msg.username}</p>
					</div>` : ''}
				${displayMessage}
				</div>	
			</div></li>
		`;
	});
	messagesList.innerHTML = html;
}

function joinGroup(id) {
	currentGroup = groups[id];
	updateMessages();
	Array.from(document.getElementsByClassName('group_id')).map(x => x.children[0].classList.remove('current_group'));
	document.getElementById(`group_${id}`).children[0].classList.add('current_group');
	
	document.getElementById('current_group_name').innerText = currentGroup.name;
	document.getElementById('link').value = currentGroup.id;
	document.getElementById('group-name-invite').innerText = `"${currentGroup.name}"`;
}

window.onbeforeunload = function() {
	Object.keys(groups).map(id => Network.leaveGroup(id));
}
