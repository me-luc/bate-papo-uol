//variável que receberá imagens do servidor
let messages = [];

function enterPage() {
	let name = document.querySelector(".input-user input").value;
	alert(name);
	const promise = axios.post(
		"https://mock-api.driven.com.br/api/v6/uol/participants",
		{
			name: name,
		}
	);
	promise.then(function showMainPage() {
		//exibindo a pagina principal e escondendo a pagina de input nome
		document.querySelector(".username-page").classList.add("hide");
		document.querySelector(".main-page").classList.remove("hide");
		//pegar mensagens e renderizar e atualizar a cada 3 segundos
		getMessages();
		setInterval(getMessages, 3000);
	});
}

function checkUser() {}

function showSideBar() {
	document.querySelector(".sidebar-page").classList.toggle("hide");
}

function getMessages() {
	const promise = axios.get(
		"https://mock-api.driven.com.br/api/v6/uol/messages"
	);
	promise.then(renderMessages);
	promise.catch();
}

function renderMessages(answer) {
	messages = answer.data;
	console.log(messages);
	const screenMessages = document.querySelector(".messages-section");

	for (let i = 0; i < messages.length; i++) {
		screenMessages.innerHTML += `
		<div id="normal" class="message">
			<span class="time">${messages[i].time}</span>
			<span class="fromWho">${messages[i].from}</span>
			<span class="detail"> para </span>
			<span class="toWho">${messages[i].from}: </span>
			<span class="message-text">${messages[i].text}</span>
		</div>
	`;
	}

	const lastMessage = screenMessages.lastElementChild;
	lastMessage.scrollIntoView();
}
