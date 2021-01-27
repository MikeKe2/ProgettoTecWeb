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
		risposta_data: null
	},
	mounted: async function () {
		$.getJSON(urlStoria, function (data) {
				this.scene = data.scene;
				this.nowOn = 0;
				this.storia = data;
				$("#storyName").html(this.storia.nome);
				//this.Background(this.storia.autore, this.storia.background);
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
				}
			});

	},
	methods: {
		Next: function () {
			let to = this.Evaluate()
			if (to) {
				this.nowOn = to.to[this.gruppo];
				this.punti += to.punti;
				this.widget = null;
				this.Load(this.scene[this.nowOn]);
				this.time = start();
			} else {
				//risposta errata
			}
		},

		Load: function (scena) {
			$.Ajax({
				method: 'get',
				url: '/media/' + this.storia.creatore + '/widget/' + scena.widget,
				success: function (data) {
					this.widget = data;
					$("#widget-image").attr("alt", scena.imgdescription);
					$("#widget-image").attr("aria-label", scena.imgdescription);
					if (scena.widget = "image.html") {
						$.Ajax({
							method: 'get',
							url: '/media/' + this.storia.creatore + '/images/' + scena.img,
							success: function (img) {
								$("#widget-image").attr("src", img);
							},
							error: function (err) {
								console.log(err);
							}
						});
					}
				},
				error: function (err) {
					console.log(err);
				}
			});
		},

		/*Dubito sinceramente funzioni*/
		Background: function (autore, background) {
			$.get(`/users/${autore}/images/${background}/`, (data) => {
					$("#avventura").css({
						'background-image': data,
						'background-repeat': 'no-repeat',
						'background-position': 'center'
					});
				})
				.fail(function (err) {
					console.log(err);
				});
		},


		Evaluate: function () {
			let finalTime = end(this.time);
			if (this.scene[this.nowOn].valutatore == "true") {
				socket.emit("answerToEvaluator", username, avventura.storia.nome, (risposta_data));
				return waitEvaluator();
			} else {
				for (risposta in this.scene[this.nowOn].risposte) {
					if (risposta.valore == this.risposta_data && finalTime < risposta.maxTime) {
						return risposta;
					}
				}
				return false;
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
		sessionStorage.setItem("Scene", /*storia.scene[scena_corr].risposte[parseInt(data.message, 10)].to[gruppo]*/ );
		sessionStorage.setItem("Points", punteggio);
		return parseint(answer_number.message, 10);
		/*punteggio += parseInt(storia.scene[scena_corr].risposte[parseInt(data.message, 10)].points, 10);
		nextScene(storia.scene[scena_corr].risposte[parseInt(data.message, 10)].to[gruppo]);*/
	});
};

$(() => {
	$("nav").hide();

	$(".usernameInput").focus();

	$('#login').click(() => {
		$(".usernameInput").focus();
	});

	$(".valutatore").click(() => {
		$("#loginModal").modal("show");

		//handle the form's "submit" event
		$("#loginForm").submit((e) => {
			e.preventDefault(); //stop a full postback

			if ($("#modalpass").val() == avventura.storia.password) {
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
		try {
			if (!player[0].paused) {
				player[0].pause();
				player[0].currentTime = 0;
				$("#MuteMusic").html("<i class='bi bi-volume-mute-fill'></i>");
			} else {
				player[0].load();
				player[0].oncanplaythrough = player[0].play();
				$("#MuteMusic").html("<i class='bi bi-volume-up-fill'></i>");
			}
		} catch (error) {
			/*const element = document.querySelector('.animatebutton');
			element.classList.add('animated', 'shake');
			setTimeout(function () {
			    element.classList.remove('shake');
			}, 1000);*/
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