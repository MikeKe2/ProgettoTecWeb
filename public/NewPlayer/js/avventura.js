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

					avventura.nowOn = parseInt(sessionStorage.getItem("Scene"));
					avventura.punti = parseInt(sessionStorage.getItem("Points"));
					socket.emit("scene", username, avventura.storia.nome, avventura.nowOn);
					avventura.Load(avventura.scene[avventura.nowOn]);
				}
			});
	},
	methods: {
		Next: function (to) {
			if (to) {
				$("#description").focus()
				this.nowOn = parseInt(to.to[parseInt(this.gruppo)]);
				this.punti += parseInt(to.points) || 0;
				if (avventura.storia.scene[this.nowOn].tracciaAudio != "") {
					// ho provato con vue ma non sono riuscita a farlo andare :c però funziona
					$("#track").attr("src", `/media/${avventura.storia.creatore}/audios/${avventura.storia.scene[this.nowOn].tracciaAudio}`);
					music = $("#music")[0];
					music.pause();
					music.load();
					music.oncanplaythrough = music.play();
				}
				this.widget = null;
				if (this.scene[this.nowOn].widget != undefined)
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
			if(scena.widget == "")
				return;
			$.ajax({
				url: '/media/' + this.storia.creatore + '/widgets/' + scena.widget,
				success: (data) => {
					avventura.widget = scena.widget != "image.html" ? data :
						data.replace("$SRC", '/media/' + avventura.storia.creatore + '/images/' + scena.img).replaceAll("$DESC", scena.imgdescription);
					$("#widget").html(avventura.widget);
				},
				error: (err) => {
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
			
			if (this.nowOn == 1) { //Scena Finale
				sessionStorage.clear();
				location.reload();
				return;
			}
			let finalTime = end(this.time);
			if (this.scene[this.nowOn].valutatore == "true") {
				this.risposta_data = risultato();
				console.log(this.risposta_data);
				socket.emit("answerToEvaluator", username, avventura.storia.nome, (this.risposta_data));
				waitEvaluator();
				return;
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

				if (risposta) {
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
