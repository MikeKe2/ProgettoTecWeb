// Setup requestAnimationFrame and cancelAnimationFrame for use in the game code
(function () {
	var lastTime = 0;
	//ricerca del animation frame a seconda del browser utilizzato, usato per ottimizzare l'uso della canvas
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame =
			window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function (callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () {
					callback(currTime + timeToCall);
				},
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
}());

var storia; //variabile che contiene la storia caricata che si vuole modificare 

$(window).on("load", function () {
	//setup della pagina, si nascondono le parti non utili all'avvio e si inizializzano i vari componenti dello strumento
	$("#Help").hide()
	Array.prototype.last = function () { //funzione utile che restituisce l'ultimo elemento di un array. Era spesso utile e creare una funzone dedicata era più pulito
		return this[this.length - 1];
	}

	var element = $("#canvas")[0];
	$(window).resize(board.resizeCanvas);
	mouse.init();
	board.init();
	contextMenu.init();
	window.mobileAndTabletCheck = function () { //funzione che riconosce device mobili. Utile per adattare la pagina se necessario   
		let check = false;
		(function (a) {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
		})(navigator.userAgent || navigator.vendor || window.opera);
		return check;
	};
	$("#backImage").click(function () { //setup pulsante back
		if (confirm("Stai per lasciare la pagina, sei sicuro?"))
			location.href = "https://site181993.tw.cs.unibo.it/"
	});
	$("#saveImage").click(function () { //setup pulsante save con controllo sulla validità della storia 
		if (checkStory())
			$.post("/stories/" + $("#user").html() + "/" + $("#visibility").html() + "/" + $("#name").html(), {
				data: storia
			}, () => {
				alert("Salvataggio Completato")
			});
	});
	$("#helpImage").click(function () {
		$("#Help").toggle()
	}); //setup pulsante di tutorial 
	$("#downloadImage").click(function () {
		download()
	}); //setup pulsante download
	$("#settingsImage").click(settingsToggle);
});

var board = {
	canvas: null,
	context: null, //variabile per l'utilizzo della canvas
	activegroup: 0, //gruppo correntemente attivo e modificabile
	dropping: false, //controllo sul drag and drop sulla canvas 
	startX: 0, //x ed y a cui inizia la board, utile per mantenere la posizione dei vari elementi nella board
	startY: 0,
	scale: 1, //scale della board, gestisce lo zoom 
	arrows: [], //array delle freccie
	scenes: [], //array delle scene 
	cestinoImg: null, //immagine del cestino
	frecciaContext: null, //freccia che segue il mouse quando l'utente vuole creare un nuovo collegamento tra scene 
	toDelete: function () { //controlla che l'utente voglia eliminare la scena dalla board verificando che sia stata trascinata nella zona del cestino
		return mouse.grabbing && mouse.x > board.canvas.width - 50 && mouse.y > board.canvas.height - 50;
	},
	move: (offsetX, offsetY) => { //funziona che sposta la schermata (con bordo superiore e sinistro)
		board.startX += offsetX / board.scale;
		board.startY += offsetY / board.scale;
		if (board.startX < 0)
			board.startX = 0;
		if (board.startY < 0)
			board.startY = 0;
	},
	getScene: (x, y) => { //funziona che scorre tutte le scene, restituisce quella sottostante all'area cliccata dall'utente 
		for (let i = 0; i < storia.scene.length; i++) {
			if (storia.scene[i].x != null && storia.scene[i].y != null &&
				x > (storia.scene[i].x * board.scale - board.startX) && x < (storia.scene[i].x * board.scale + (board.const.scene.width * board.scale) - board.startX) &&
				y > (storia.scene[i].y * board.scale - board.startY) && y < (storia.scene[i].y * board.scale + (board.const.scene.height * board.scale) - board.startY)) {
				return board.scenes[i];
			}
		}
	},
	resizeCanvas() { //fa resize della canvas a seconda della dimensione dello schermo
		board.canvas = $("#canvas")[0];
		const width = board.canvas.clientWidth;
		const height = board.canvas.clientHeight;
		if (board.canvas.width !== width || board.canvas.height !== height) {
			board.canvas.width = width;
			board.canvas.height = height;
		}
	},
	init: function () { //inizializzazione della board

		board.resizeCanvas();
		$.ajax({ //get della storia dal server 
			url: "/stories/" + $("#user").html() + "/" + $("#visibility").html() + "/" + $("#name").html(),
			success: (data) => {
				storia = data;
				if (storia.creatore || storia.creatore != $("#user").html())
					storia.creatore = $("#user").html();
				for (let i = 0; i < storia.scene.length; i++) { //aggiunta di tutte le scene, freccie e scene speciali (inizio e fine sono speciali)
					let scena = storia.scene[i];
					scena.x = scena.x * 1;
					scena.y = scena.y * 1;
					if (scena.x && scena.y && scena.risposte && scena.risposte.length > 0) {
						for (let j = 0; j < scena.risposte.length; j++) {
							let risposta = scena.risposte[j];
							if (risposta.to) {
								for (let k = 0; k < storia.ngruppi; k++) {
									let to = risposta.to * 1 != -1 ? storia.scene[risposta.to[k]] : null;
									if (to) {
										board.arrows.push(new freccia(scena, to, k))
									}
								}
							}
						}
					} else if (!scena.risposte) {
						scena.risposte = [];
					}
					board.scenes.push((i == 0 || i == 1) ? new SpecialScene(i, scena) : new graphicalScene(i, scena));
				}
				initGroups();
				board.canvas = $("#canvas")[0];
				board.context = board.canvas.getContext('2d');
				board.AnimationFrame = window.requestAnimationFrame(board.DrawAll, board.context);
				$("#aggiungiScena").click(board.newscene); //setup del pulsante di creazione nuova scena 
				this.PopulateMenu("all");
				$("#all").click(function () {
					board.PopulateMenu("all");
				}); //setup del pulsante del filtro tutti sul menù destro delle scene 
				$("#notLoaded").click(function () {
					board.PopulateMenu("notLoaded");
				}); //setup del pulsante del filtro non caricate sul menù destro delle scene 
				$("#loaded").click(function () {
					board.PopulateMenu("loaded");
				}); //setup del pulsante del filtro caricate sul menù destro delle scene 
				$(".miniNav .listItem").click(function () {
					$(".miniNav .listItem").not(this).removeClass("attivato");
					$(this).addClass("attivato");
				}) //setup della funzione che evidenzia il filtro scelto al click

				this.checkOrientation();

				screen.orientation.onchange = function () { //controlla l'orientamento dello schermo ad ogni cambiamento di orientamento
					board.checkOrientation();
				};
				board.cestinoImg = new Image();
				board.cestinoImg.src = "/Editor/img/cestino.png";
			}
		});
	},
	const: { //costanti per la dimensione di scene e board
		scene: {
			width: 150,
			height: 80
		},
		canvas: {
			width: function () {
				return board.canvas.width;
			},
			height: function () {
				return board.canvas.height;
			}
		}
	},
	newscene: function () { //funzione di crezione di una nuova scena, la aggiunge alla variabile storia e alle scene nella board,
		storia.scene.push({
			nome: "scena" + (storia.scene.length - 2),
			descrizione: "Inserisci descrizione...",
			widget: null,
			tracciaAudio: null,
			valutatore: false,
			x: null,
			y: null,
			risposte: []
		});
		let scena = new graphicalScene(storia.scene.length - 1, storia.scene.last());
		board.scenes.push(scena);
		scena.open(); //apre la finestra per la modifica


		scena.graphicalSelect(id);
		edit("#scena" + scena.id);
		board.PopulateMenu($(".miniNav .attivato").attr("id")); //e ricarica le scene caricate nel menù laterale delle scene
	},
	PopulateMenu: (filter) => { //funzione per popolare il menù laterale delle scene a seconda del filtro scelto
		let all = false;
		let loaded = false;
		switch (filter) {
			case "all":
				all = true;
				break;
			case "notLoaded":
				loaded = false;
				break;
			case "loaded":
				loaded = true;
				break;
		}
		$("#menulist").html("");
		let j = 0;
		if (board.scenes.length > 2) {
			for (let i = 2; i < board.scenes.length; i++) {
				//scorre tutte le scene e controlla se rispetta i vincoli del filtro
				let scena = board.scenes[i];
				if (all || (loaded && scena.core.x && scena.core.y) || (!loaded && (!scena.core.x || !scena.core.y))) { 
					$("#menulist").append($("#menuScena").html().replace("$ID", scena.id).replace("$NOME", scena.core.nome));
					$("#menuScena" + scena.id).click(function () {
						scena.open()
					});
					$("#menuScena" + scena.id).on("touchstart", dragTouch);
					$("#menuScena" + scena.id).on("touchmove", dropMove);
					$("#menuScena" + scena.id).on("touchend", dropTouch);
				}
			}
		}
	},
	//funzione per eliminare la freccia, le scorre tutte ed elimina la prima che corrisponde ai criteri, 
	//ce ne può essere più d'una ma basta eliminare la prima dato che è un indicatore puramente grafico
	eraseArrow: function (from, to) { 
		for (let i = 0; i < board.arrows.length; i++) {
			if (board.arrows[i].from == from && board.arrows[i].to == board.scenes[to].core && board.arrows[i].ngroup == board.activegroup) {
				board.arrows.splice(i, 1);
				return;
			}
		}
	},
	DrawAll: function () { //funzione richiamata ad ogni ciclo per il disegno sulla board
		board.context.fillStyle = "#bfc8d9";
		board.context.fillRect(0, 0, board.canvas.width, board.canvas.height); //viene prima coperta con il colore di sfondo

		for (var j = 0; j < board.scenes.length; j++) { //per ogni scena nella board richiama la sua draw 
			board.scenes[j].draw();
		}
		for (var i = 0; i < board.arrows.length; i++) { //per ogni freccia sulla board richiama la sua draw
			board.arrows[i].draw();
		}
		if (board.frecciaContext && !window.mobileAndTabletCheck()) //disegna la freccia per il nuovo collegamento se si cerca di crearlo e se non si è su mobile 
			board.frecciaContext.draw(mouse.x, mouse.y)

		if (board.dropping) { //aggiunge un layer sulla board se si sta cercando di fare drop con una scena dal menù laterale, serve per dare l'indicazione che si possa droppare la scena nella board
			board.context.fillStyle = "rgba(0, 0, 255, 0.6)";
			board.context.fillRect(0, 0, board.canvas.width, board.canvas.height);
		}

		board.context.fillStyle = board.toDelete() ? "rgb(0,200,0)" : "rgb(200,0,0)"; //colora l'area del cestino di rosso o verde a seconda se si cerca di cancellare una scena o meno 
		board.context.fillRect(board.canvas.width - 52, board.canvas.height - 52, 52, 52);
		board.context.fillStyle = "#bfc8d9";
		board.context.fillRect(board.canvas.width - 51, board.canvas.height - 51, 50, 50);
		board.context.drawImage(board.cestinoImg, board.canvas.width - 51, board.canvas.height - 51, 50, 50);
		board.AnimationFrame = window.requestAnimationFrame(board.DrawAll, board.context); // richiama la funzione quando necessario
	},

	checkOrientation: function () { //controlla l'orientamento dello schermo e se è in modalita portrait chiede di girare lo schermo in landscape 
		if (screen.orientation.type.match(/\w+/)[0] == "portrait") {
			$(".container").hide();
			$("#turnAround").show();
		} else {
			$(".container").show();
			$("#turnAround").hide();
		}
	},

	rem: function (id) { //rimuove del tutto la scena il cui id è passato in input e ricarica la barra laterale 
		board.scenes[id].graphicalDelete();
		storia.scene.splice(id, 1);
		board.scenes.splice(id, 1);
		for (let i = id; i < board.scenes.length; i++) {
			board.scenes[i].id--;
		}
		board.PopulateMenu($(".miniNav .attivato").attr("id"));
	}
}