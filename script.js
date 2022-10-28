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

	promise.then(function showMainPage(answer) {
		if (answer.status === 200) {
			document.querySelector(".input-user p").classList.add("hide");
			console.log("SUCCESS LOGIN");
		}
		//exibindo a pagina principal e escondendo a pagina de input nome
		document.querySelector(".username-page").classList.add("hide");
		document.querySelector(".main-page").classList.remove("hide");
		//pegar mensagens e renderizar e atualizar a cada 3 segundos
		getMessages();
		setInterval(getMessages, 3000);
		//manter conexao do usuarui
		setInterval(keepConection, 5000);
	});
	promise.catch(function errorCatch(error) {
		if (error.response.status === 400) {
			document.querySelector(".input-user p").classList.remove("hide");
		}
	});
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

	//renderizar participantes
	const promise = axios.get(
		"https://mock-api.driven.com.br/api/v6/uol/participants"
	);
	promise.then(renderParticipants);
}

function renderParticipants(answer) {
	const participants = answer.data;
	const participantsScreen = document.querySelector(".participants");

	//começando com a opção todos
	participantsScreen.innerHTML = `
		<div class="person selected" onclick="changeToWho(this)">
			<div class="box">
				<ion-icon
					class="icon-options"
					name="people"></ion-icon>
				<p class="toUsername">Todos</p>
			</div>
			<ion-icon
				class="icon-options check"
				name="checkbox"></ion-icon>
		</div>
	`;

	for (let i = 0; i < participants.length; i++) {
		participantsScreen.innerHTML += `
			<div class="person" onclick="changeToWho(this)">
				<div class="box">
					<ion-icon
						class="icon-options" onclick="changePrivacy(this)"
						name="person-circle-outline"></ion-icon>
					<p>${participants[i].name}</p>
				</div>
				<ion-icon
					class="icon-options check hide"
					name="checkbox"></ion-icon>
			</div>		
		`;
	}
}

//MUDANDO DESTINATARIO
function changeToWho(element) {
	const previousSelection = document.querySelector(".participants .selected");
	const previousIcon = previousSelection.lastElementChild;
	const icon = element.lastElementChild;

	//pega o elemento anterior e remove selecionado \ esconde o icone check
	previousSelection.classList.remove("selected");
	previousIcon.classList.add("hide");
	//pega o elemento atual e marca selecionado \ amostra o icone check
	element.classList.add("selected");
	icon.classList.remove("hide");
}

function getMessages() {
	const promise = axios.get(
		"https://mock-api.driven.com.br/api/v6/uol/messages"
	);
	promise.then(renderMessages);
	promise.catch("error while trying get messages");
}

function renderMessages(answer) {
	const messages = answer.data;
	console.log(messages);
	const screenMessages = document.querySelector(".messages-section");
	screenMessages.innerHTML = "";

	for (let i = 70; i < messages.length; i++) {
		//definindo variaveis que vão ser alteradas ao longo do projeto
		let messageId,
			detail = "";

		let time = messages[i].time;
		let from = messages[i].from;
		let to = messages[i].to;
		let text = messages[i].text;
		let type = messages[i].type;

		//filtro: se mensagem for privada usário ela é mostrada
		if (
			type === "message" ||
			(type == "private_message" && to == user) ||
			to == "Todos"
		) {
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
		} else {
			console.log(`---- ${type} MESSAGE NOT DIRECTED TO ${user}
			message from ${from} to ${to} -> ${text}`);
		}
	}

	const lastMessage = screenMessages.lastElementChild;
	//add new message effet
	lastMessage.classList.add("new-message");
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
	promise.catch(function catchError() {
		//pegar possiveis erros

		alert("Erro ao enviar mensagem, você foi desconectado do chat");
		window.location.reload();
	});
}

document
	.querySelector("footer input")
	.addEventListener("keypress", function (event) {
		if (event.key === "Enter") {
			sendMessage();
		}
	});
