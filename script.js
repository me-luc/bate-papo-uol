let user;
let userTo = "Todos";
let messageType = "message";

/* ===== FUNÇÃO INICIAL P/ ENTRAR EM PÁGINA ===== */
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
		//manter conexao do usuario
		setInterval(keepConection, 5000);
	});
	promise.catch(function errorCatch(error) {
		if (error.response.status === 400) {
			document.querySelector(".input-user p").classList.remove("hide");
		}
	});
}

/* ===== ATUALIZAR DETALHES DA MENSAGEM ===== */
function updateMessageDetail() {
	const detailMessage = document.querySelector("footer p");
	let detail;
	if (messageType == "private_message") {
		detail = "reservadamente";
	} else {
		detail = "público";
	}

	detailMessage.innerHTML = `Escrevendo (${detail}) para ${userTo}`;
}

/* ===== MANTER CONEXÃO DO USUÁRIO ATIVA ===== */
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

/* ===== EXIBIR MENU LATERAL ===== */
function showSideBar() {
	document.querySelector(".sidebar-page").classList.toggle("hide");

	//renderizar participantes
	const promise = axios.get(
		"https://mock-api.driven.com.br/api/v6/uol/participants"
	);
	promise.then(renderParticipants);

	updateMessageDetail();
}

/* ===== RENDERIZAR PARTE DOS PARTICIPANTES ===== */
function renderParticipants(answer) {
	const participants = answer.data;
	const participantsScreen = document.querySelector(".participants");
	//variavel para guardar seleção anterior
	const previousSelection = document.querySelector(".person.selected");

	//lendo array de objetos e inserindo na tela
	for (let i = 0; i < participants.length; i++) {
		let aux = "";
		let userAux = "";

		if (previousSelection !== null) {
			userAux = previousSelection.innerHTML;
		}

		//colocando todos na posicao inicial
		if (i == 0) {
			let hideAux = "hide";
			if (
				previousSelection == null ||
				previousSelection.innerHTML == "Todos"
			) {
				aux = "selected";
				hideAux = "";
			}

			participantsScreen.innerHTML = `
				<div class="person ${aux}" onclick="changeToWho(this)" data-test="all">
					<div class="box">
						<ion-icon
							class="icon-options"
							name="people"></ion-icon>
						<p class="toUsername">Todos</p>
					</div>
					<ion-icon
						class="icon-options check ${hideAux}"
						data-test="check"
						name="checkbox">
					</ion-icon>
				</div>
			`;
			aux = "";
		}
		//checar se participante não é o proprio usuário
		if (participants[i].name !== user) {
			if (participants[i].name === userAux) {
				aux = "selected";
			}

			participantsScreen.innerHTML += `
			<div class="person ${aux}" onclick="changeToWho(this)" data-identifier="participant">
				<div class="box">
					<ion-icon
						class="icon-options" onclick="changePrivacy(this)"
						name="person-circle-outline"></ion-icon>
					<p>${participants[i].name}</p>
				</div>
				<ion-icon
					class="icon-options check hide"
					data-test="check"
					name="checkbox"></ion-icon>
			</div>		
		`;
		}
	}
}

/* ===== PEGAR MENSAGENS DO SEVRIDOR ===== */
function getMessages() {
	const promise = axios.get(
		"https://mock-api.driven.com.br/api/v6/uol/messages"
	);
	promise.then(renderMessages);
	promise.catch("error while trying get messages");
}

/* ===== RENDERIZAR MENSAGENS =====*/
function renderMessages(answer) {
	const messages = answer.data;
	console.log(messages);
	const screenMessages = document.querySelector(".messages-section");
	screenMessages.innerHTML = "";

	for (let i = 0; i < messages.length; i++) {
		//definindo variaveis que vão ser alteradas ao longo do projeto
		let messageId, detail;

		let time = messages[i].time;
		let from = messages[i].from;
		let to = messages[i].to;
		let text = messages[i].text;
		let type = messages[i].type;

		//formatando tempo
		let hour = time.substring(0, 2);
		time = time.replace(hour, Number(hour) + 9);

		//filtro: se mensagem for privada usário ela é mostrada
		if (
			type === "message" ||
			(type == "private_message" && to == user) ||
			to == "Todos" ||
			from == user
		) {
			if (
				text.includes("entra na sala...") ||
				text.includes("sai da sala...")
			) {
				messageId = "log-in-out";
				detail = "";
				to = "";
			} else if (type == "private_message") {
				messageId = "private";
				detail = " reservadamente para ";
			} else {
				messageId = "normal";
				detail = " para ";
			}
			screenMessages.innerHTML += `
			<div id="${messageId}" class="message" data-test="message">
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

/* ======= SEND MESSAGE ======= */
function sendMessage() {
	const input = document.querySelector("footer input");

	const object = {
		from: user,
		to: userTo,
		text: input.value,
		type: messageType,
	};

	const promise = axios.post(
		"https://mock-api.driven.com.br/api/v6/uol/messages",
		object
	);
	promise.then(function allOk() {
		console.log("message sent successfully");
		input.value = "";
	});
	promise.catch(function catchError(answer) {
		//pegar possiveis erros
		//desconctar porcausa de erro inreconhecivel
		alert(`Erro ${answer.response.status}! Você foi desconectado do chat`);
		window.location.reload();
	});
}

/* ===== MUDANDO PRIVACIDADE ===== */
function changePrivacy(element) {
	//pegar seleção anterior
	const previousSelection = document.querySelector(
		".privacy-options .selected"
	);
	const previousIcon = previousSelection.lastElementChild;
	const icon = element.lastElementChild;

	//pega o elemento anterior e remove selecionado \ esconde o icone check
	previousSelection.classList.remove("selected");
	previousIcon.classList.add("hide");
	//pega o elemento atual e marca selecionado \ amostra o icone check
	element.classList.add("selected");
	icon.classList.remove("hide");

	const current = document.querySelector(".privacy-options .selected p");
	if (current.innerHTML == "Público") {
		messageType = "message";
	}
	if (current.innerHTML == "Reservadamente") {
		messageType = "private_message";
	}

	updateMessageDetail();
}

/* ===== MUDANDO DESTINATARIO ===== */
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

	userTo = element.querySelector("p").innerHTML;

	updateMessageDetail();
}

/* ===== INSERIR MENSAGEM COM ENTER ===== */
document
	.querySelector("footer input")
	.addEventListener("keypress", function (event) {
		if (event.key === "Enter") {
			sendMessage();
		}
	});
