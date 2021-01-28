let avventura = new Vue({
	el: "#avventura",
	data: {
		nowOn: 0,
		scene: [],
		storia: null,
		time: null,
		gruppo: 0,
		punti: 0,
		widget: null,
		risposta_data: null,
		musica: ""
	},
	mounted: async function () {
		$.getJSON(urlStoria, function (data) {
				avventura.scene = data.scene;
				avventura.nowOn = 0;
				avventura.storia = data;
				$("#storyName").html(avventura.storia.nome);
				avventura.Background(avventura.storia.creatore, avventura.storia.background);
			})
			.fail(() => {
				alert("Mi dispiace ma la storia che hai richiesto non è stata trovata, ora verrai reindirizzato alla pagina con tutte le storie disponibili");
				window.location.href = "https://site181993.tw.cs.unibo.it/avventure";
			})
			.done(() => {
				if (sessionStorage.getItem('Username') && sessionStorage.getItem('Scene')) {
					$("#login").fadeOut();
					$("#login").off("click");
					$("#avventura").show();
					$("nav").show();
					username = sessionStorage.getItem('Username');
					socket.emit("add user", username, (avventura.storia.nome));
					
					avventura.nowOn = sessionStorage.getItem("Scene");
					avventura.punti = sessionStorage.getItem("Points");
					socket.emit("scene", username, avventura.storia.nome, avventura.nowOn);
					avventura.Load(avventura.scene[avventura.nowOn]);
				}
			});
	},
	methods: {
		Next: function (to) {
			if (to) {
				$("#description").focus()
				this.nowOn = to.to[parseInt(this.gruppo)];
				this.punti += parseInt(to.punti);
				if (avventura.storia.scene[this.nowOn].tracciaAudio != "") {
					// ho provato con vue ma non sono riuscita a farlo andare :c però funziona
					$("#track").attr("src", `/media/${avventura.storia.creatore}/audios/${avventura.storia.scene[this.nowOn].tracciaAudio}`);
					music = $("#music")[0];
					music.pause();
					music.load();
					music.oncanplaythrough = music.play();
				}
				this.widget = null;
				if(this.scene[this.nowOn].widget != "")
					this.Load(this.scene[this.nowOn]);
				this.time = start();

				sessionStorage.setItem("Scene", this.nowOn);
				sessionStorage.setItem("Points", this.punti);
				//Inviamo al valutatore i dati sul giocatore
				socket.emit("scene", username, this.storia.nome, this.nowOn);
				socket.emit('score', username, this.storia.nome, (this.punti));

			} else {
				$("#myPopup").addClass("show");
			}
		},

		Load: function (scena) {
			$.ajax({
				url: '/media/' + this.storia.creatore + '/widgets/' + scena.widget,
				success: function (data) {
					avventura.widget = scena.widget != "image.html" ? data :
						data.replace("$SRC", '/media/' + avventura.storia.creatore + '/images/' + scena.img).replaceAll("$DESC", scena.imgdescription);
					$("#widget").html(avventura.widget);
				},
				error: function (err) {
					console.log(err);
				}
			});
		},

		Background: function (creatore, background) {
			if (background == "")
				return;
			$("#avventura").css({
				'background-image': `url(/users/${creatore}/images/${background})`,
				'background-repeat': 'no-repeat',
				'background-position': 'center'
			});
		},

		Evaluate: function () {

			//Scena Iniziale
			if (this.nowOn == 1) { //Scena Finale
				sessionStorage.clear();
				location.reload();
				return;
			}
			let finalTime = end(this.time);
			if (this.scene[this.nowOn].valutatore == "true") {
				this.risposta_data = risultato();
				socket.emit("answerToEvaluator", username, avventura.storia.nome, (this.risposta_data));
				return waitEvaluator();
			} else {
				if (!this.widget || this.scene[this.nowOn].widget == "image.html") {
					this.Next(this.scene[this.nowOn].risposte[0]);
					return;
				}
				this.risposta_data = risultato();
				let risposta = null;

				for (let i = 0; i < this.scene[this.nowOn].risposte.length; i++) {
					if (this.scene[this.nowOn].risposte[i].valore.toLowerCase() == this.risposta_data.toLowerCase() && (finalTime < parseInt(this.scene[this.nowOn].risposte[i].maxTime))) {
						if (!risposta || risposta.maxTime < this.scene[this.nowOn].risposte[i].maxTime)
							risposta = this.scene[this.nowOn].risposte[i];
					}
				}

				if (risposta){
					this.Next(risposta);
					return;
				}

				for (let i = 0; i < this.scene[this.nowOn].risposte.length; i++) {
					if (this.scene[this.nowOn].risposte[i].valore.toLowerCase() == this.risposta_data.toLowerCase() && (parseInt(this.scene[this.nowOn].risposte[i].maxTime)) == 0) {
						if (!risposta || risposta.maxTime < this.scene[this.nowOn].risposte[i].maxTime)
							risposta = this.scene[this.nowOn].risposte[i];
					}
				}
				this.Next(risposta);
			}
		}

	}
});

function start() {
	return new Date();
};

function end(startTime) {
	let endTime = new Date();
	let timeDiff = endTime - startTime; //in ms
	// strip the ms
	timeDiff /= 1000;

	// get seconds 
	let seconds = Math.round(timeDiff);
	return seconds;
}

async function waitEvaluator(_callback) {
	$("#loading").show();
	await socket.on('answerFromEvaluator', (answer_number) => {
		$("#loading").hide();
		let risposta = avventura.scene[avventura.nowOn].risposte[parseInt(answer_number.message, 10)];
		avventura.Next(risposta);
	});
};

$(() => {
	$('#nextBtn').blur(()=>{$("#myPopup").removeClass("show")});

	$("nav").hide();

	$(".usernameInput").focus();

	$('#login').click(() => {
		$(".usernameInput").focus();
	});

	$(".valutatore").click(() => {
		$("#loginModal").modal("show");

		//handle the form's "submit" event
		$("#loginForm").submit((e) => {
			e.preventDefault();

			if ($("#modalpass").val() == avventura.storia.password) {
				//$('#loginModal').modal('toggle');
				//$(".spinner.border").show();
				alert("Access Granted!");
				window.location.pathname += "/Valutatore";
			} else
				alert("Password is incorrect.");
		});
	});

	/*When the help button is clicked, it send a requesto to the evaluator*/
	$('#helpRequested').click(function (e) {
		e.preventDefault();
		socket.emit('help', avventura.storia.nome, username);
		$('#helpRequested').prop("disabled", true);
		$('#helpRequested').html("<i class='bi bi-question-square'></i>");
	});

	$("#MuteMusic").click((e) => {
		e.preventDefault();
		music.muted = !music.muted;
		if (music.muted) {
			/*music[0].pause();
			music[0].currentTime = 0;*/
			$("#MuteMusic").html("<i class='bi bi-volume-mute-fill'></i>");
		} else {
			/*music[0].load();
			music[0].oncanplaythrough = music[0].play();*/
			$("#MuteMusic").html("<i class='bi bi-volume-up-fill'></i>");
		}
	});

	$('#loginModal').on('shown.bs.modal', () => {
		$("#modalpass").focus();
	});

	/*TODO: FIX THIS MESS*/
	$('#modalChat').on('shown.bs.modal', () => {
		$('#modalChat').animate({
			scrollTop: $('#modalChat .messages').height()
		}, 500);
	});
});