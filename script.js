//variável que receberá imagens do servidor
let messages = [];
let user;

function enterPage() {
	let name = document.querySelector(".input-user input").value;
	//definindo nome do usuario pra variavel global
	user = name;

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
		//manter conexao do usuarui
		setInterval(keepConection, 5000);
	});
	promise.catch(console.log("erro na primeira tentativa"));
}

function keepConection() {
	const obj = {
		name: user,
	};
	const promise = axios.post(
		"https://mock-api.driven.com.br/api/v6/uol/status",
		obj
	);
	promise.then(console.log("ok - keeping user conected"));
	promise.catch(console.log("failed to keep user conected"));
}

function showSideBar() {
	document.querySelector(".sidebar-page").classList.toggle("hide");
}

function getMessages() {
	const promise = axios.get(
		"https://mock-api.driven.com.br/api/v6/uol/messages"
	);
	promise.then(renderMessages);
	promise.catch("error while trying get messages");
}

function renderMessages(answer) {
	messages = answer.data;
	console.log(messages);
	const screenMessages = document.querySelector(".messages-section");

	for (let i = 0; i < messages.length; i++) {
		//definindo variaveis que vão ser alteradas ao longo do projeto
		let messageId,
			detail = "";

		let time = messages[i].time;
		let from = messages[i].from;
		let to = messages[i].to;
		let text = messages[i].text;

		//se mensagem for pra usário ela é mostrada
		if (to === user || to === "Todos") {
			if (
				messages[i].text.includes("entra") ||
				messages[i].text.includes("sai")
			) {
				messageId = "log-in-out";
				to = "";
			} else if (messages[i].text.includes("reservadamente")) {
				messageId = "private";
				detail = " reservadamente para ";
			} else {
				messageId = "normal";
				detail = " para ";
			}
			screenMessages.innerHTML += `
			<div id="${messageId}" class="message">
				<span class="time">${time}</span>
				<span class="fromWho">${from}</span>
				<span class="detail">${detail}</span>
				<span class="toWho">${to}:</span>
				<span class="message-text"> ${text}</span>
			</div>
		`;
		}
	}

	const lastMessage = screenMessages.lastElementChild;
	lastMessage.scrollIntoView();
}

function sendMessage() {
	const input = document.querySelector("footer input");

	const object = {
		from: user,
		to: "Todos",
		text: input.value,
		type: "message",
	};

	const promise = axios.post(
		"https://mock-api.driven.com.br/api/v6/uol/messages",
		object
	);
	promise.then(function allOk() {
		console.log("message sent successfully");
		input.value = "";
	});
	promise.catch("error while trying to send message");
}
