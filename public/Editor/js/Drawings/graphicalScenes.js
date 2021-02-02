class graphicalScene {
	constructor(id, scena) { //costruttore, per la scena serve un id (non usato nel json) ed un core (identico a quello del json), il colore è diverso per scene standard e speciali
		this.id = id;
		this.core = scena;
		this.color = "#FABC2A";
	}
	move(offsetx, offsety) { //sposta la scena seguendo il mouse controllando di non andare in una zona della board non raggiungibile 
		this.core.x += offsetx / board.scale;
		this.core.y += offsety / board.scale;
		if (this.core.x < 0.1)
			this.core.x = 0.1;
		if (this.core.y < 0.1)
			this.core.y = 0.1;
	}
	draw() { //fuzione che disegna la scena
		if (this.core.x && this.core.y) { //la scena è nella board solo se ha i campi x ed y settati, altrimenti vuol dire che è solo nel menù laterale e non deve essere disegnata 
			let x = this.core.x * board.scale - board.startX; //vengono disegnati due rettangoli (uno esterno per bordo ed uno interno) partendo dall'angolo in altro a sinistra 
			let width = board.const.scene.width * board.scale;
			let y = this.core.y * board.scale - board.startY;
			let height = board.const.scene.height * board.scale;
			board.context.fillStyle = "#000000";
			board.context.fillRect(x - 2, y - 2, width + 4, height + 4);
			board.context.fillStyle = this.color;
			board.context.fillRect(x, y, width, height);
			board.context.font = Math.min(20, 300 / this.core.nome.length) * board.scale + "px Arial";
			board.context.fillStyle = "#000000";
			board.context.fillText(this.core.nome, this.core.x * board.scale - board.startX, this.core.y * board.scale - board.startY + 20 * board.scale);

			if (board.frecciaContext && board.frecciaContext.from != this.core) { //se si sta cercando di creare un nuovo collegamento da un'altra scena si evidenziano le scene a cui è possibile collegare la scena di partenza tramite la creazione di bordi tratteggiati extra 
				board.context.beginPath();
				board.context.lineWidth = 2;

				board.context.moveTo((this.core.x + 20) * board.scale - board.startX, (this.core.y - 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x - 5) * board.scale - board.startX, (this.core.y - 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x - 5) * board.scale - board.startX, (this.core.y + 20) * board.scale - board.startY);

				board.context.moveTo((this.core.x - 5) * board.scale - board.startX, (this.core.y + board.const.scene.height - 20) * board.scale - board.startY);
				board.context.lineTo((this.core.x - 5) * board.scale - board.startX, (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + 20) * board.scale - board.startX, (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);

				board.context.moveTo((this.core.x + board.const.scene.width - 20) * board.scale - board.startX, (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX, (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX, (this.core.y + board.const.scene.height - 20) * board.scale - board.startY);

				board.context.moveTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX, (this.core.y + 20) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX, (this.core.y - 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width - 20) * board.scale - board.startX, (this.core.y - 5) * board.scale - board.startY);

				board.context.strokeStyle = "#000000";
				board.context.stroke();
			}
		}
	}
	open() { //funzione per aprire la scena, si cerca il template nell'html e lo si compila con i campi specifici (la funzione controlla che la scena non sia già aperta, se lo è la chiude)
		let id = this.id;
		if (!$("#scena" + id)[0]) {
			let s_id = "#scena" + id;
			if (this.core.valutatore == "false")
				this.core.valutatore = false;
			let html = $("#scena").html()
				.replaceAll("$ID", id)
				.replaceAll("$NAME", this.core.nome)
				.replaceAll("$DESCRIPTION", this.core.descrizione)
				.replaceAll("$IMMAGINE", this.core.img)
				.replaceAll("$DESCIMM", this.core.imgdescription)
				.replace("$WIDGET", this.core.widget)
				.replace("$AUDIO", this.core.tracciaAudio != null ? this.core.tracciaAudio : "nessun audio inserito")
				.replace("$VALUTATORE", this.core.valutatore ? "ON" : "OFF");

			$(".container").append(html);
			$("#editValutatore" + id).prop("checked", this.core.valutatore);


			getMedia("images", "#editImmagine" + id);
			getMedia("widgets", "#editWidget" + id);
			getMedia("audios", "#editAudio" + id);
			if (this.core.widget != "image.html") {
				$("#immagineWidget" + id).hide();
			}
			$("#editWidget" + id).on('change', function () {
				if (this.value != "image.html") {
					$("#immagineWidget" + id).hide();
				} else {
					$("#immagineWidget" + id).show();
				}
			});

			this.populateRisp();

			$(s_id + " .header").css({
				"background-color": storia.categoria == "Singolo" ? "purple" : groups[board.activegroup]
			}); //la barra superiore è del colore del gruppo attivo o viola se la storia è singola 
			initScene(s_id); //vengono aggiunti gli handler alle funzioni e si rende possibile lo spostamento della finestra 
		} else
			close("#scena" + id);
	}
	populateRisp() { //popola i campi delle risposte prendendo il template e sostituendo i campi corretti
		$("#scena" + this.id + " ol").html("");
		let html = "";
		let rispID = 0;
		this.core.risposte.forEach(risposta => {
			html = $("#risposta").html()
				.replaceAll("$ID", this.id)
				.replaceAll("$RISP", rispID)
				.replaceAll("$VALORE", risposta.valore)
				.replace("$LINK", risposta.to[board.activegroup] != -1 ? storia.scene[risposta.to[board.activegroup]].nome : "non ancora inserito")
				.replace("$TEMPO", risposta.maxTime > 0 ? risposta.maxTime : "illimitato")
				.replace("$TEMPO", risposta.maxTime)
				.replaceAll("$POINTS", risposta.points);

			$("#scena" + this.id + " ol").append(html);
			$("#collapser" + this.id + "_" + rispID).click(collapsehandler);

			$("#elimina" + this.id + "_" + rispID).click(delRisp);
			rispID++;
		});
		$("#scena" + this.id + " .rispostaCollapse").hide();

	}
	linkmenu() { //apre il context menu sull'id di questa scena 
		contextMenu.show(this.id);
	}
	graphicalDelete() { //cancella le coordinate ed elimina tutte le freccie da e verso questa scena 
		this.core.x = null;
		this.core.y = null;
		for (let i = 0; i < board.arrows.length; i++) {
			if (board.arrows[i].to == this.core || board.arrows[i].from == this.core) {
				board.arrows.splice(i, 1);
				i--;
			}
		}
		storia.scene.forEach(scena => {
			scena.risposte.forEach(risposta => {
				for (let i = 0; i < risposta.to.length; i++) {
					if (risposta.to[i] == this.id)
						risposta.to[i] = -1;
				}
			})
		});
		for (let i = 0; i < this.core.risposte.length; i++) {
			this.core.risposte[i].to = Array(storia.ngruppi).fill(-1);
		}
		board.PopulateMenu($(".miniNav .attivato").attr("id"));
	}
	graphicalSelect() {
		selectByValue("#editAudio" + this.id, this.core.tracciaAudio);
		selectByValue("#editWidget" + this.id, this.core.widget);
		selectByValue("#editImmagine" + this.id, this.core.img)
	}
}
class SpecialScene extends graphicalScene { //la special scene è pressochè identica ad una scena normale tranne per alcune funzioni non presenti ed una draw leggermente diversa così come il context menu

	constructor(id, scena) {
		super(id, scena);
		this.color = "#e85fd4";
	}

	draw() {
		if (this.core.x && this.core.y) {
			let x = this.core.x * board.scale - board.startX;
			let width = board.const.scene.width * board.scale;
			let y = this.core.y * board.scale - board.startY;
			let height = board.const.scene.height * board.scale;
			board.context.fillStyle = "#000000";
			board.context.fillRect(x - 2, y - 2, width + 4, height + 4);
			board.context.fillStyle = this.color; //il colore è diverso
			board.context.fillRect(x, y, width, height);
			board.context.font = 20 * board.scale + "px Arial";
			board.context.fillStyle = "#000000";
			board.context.fillText(this.core.nome, this.core.x * board.scale - board.startX, this.core.y * board.scale - board.startY + 20 * board.scale);

			if (board.frecciaContext && board.frecciaContext.from != this.core && this.core.nome != "inizio") { // in questo caso si evidenzia solo la fine e non l'inizio
				board.context.beginPath();
				board.context.lineWidth = 2;

				board.context.moveTo((this.core.x + 20) * board.scale - board.startX, (this.core.y - 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x - 5) * board.scale - board.startX, (this.core.y - 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x - 5) * board.scale - board.startX, (this.core.y + 20) * board.scale - board.startY);

				board.context.moveTo((this.core.x - 5) * board.scale - board.startX, (this.core.y + board.const.scene.height - 20) * board.scale - board.startY);
				board.context.lineTo((this.core.x - 5) * board.scale - board.startX, (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + 20) * board.scale - board.startX, (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);

				board.context.moveTo((this.core.x + board.const.scene.width - 20) * board.scale - board.startX, (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX, (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX, (this.core.y + board.const.scene.height - 20) * board.scale - board.startY);

				board.context.moveTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX, (this.core.y + 20) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX, (this.core.y - 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width - 20) * board.scale - board.startX, (this.core.y - 5) * board.scale - board.startY);

				board.context.strokeStyle = "#000000";
				board.context.stroke();
			}
		}
	}

	linkmenu() { //si controlla che la fine non abbia contextmenu
		if (this.id == 1)
			contextMenu.hide();
		else
			super.linkmenu();
	}

	open() {
		return;
	}

	graphicalDelete() {
		return;
	}

	populateRisp() {
		return;
	}
}

function selectByValue(id, val) {
	$(id + ' option[value="' + val + '"]').prop('selected', true);
}