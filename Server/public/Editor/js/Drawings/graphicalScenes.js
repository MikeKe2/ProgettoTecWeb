class graphicalScene{
	constructor(id,scena){
		this.id = id;
		this.core = scena;
	}
	move(offsetx, offsety){
		this.core.x+=offsetx/board.scale;
		this.core.y+=offsety/board.scale;
		if(this.core.x<0.1)
			this.core.x=0.1;
		if(this.core.y<0.1)
			this.core.y=0.1;
	}
	draw(){
		if(this.core.x && this.core.y){
			let x = this.core.x * board.scale - board.startX;
			let width = board.const.scene.width * board.scale;
			let y = this.core.y * board.scale - board.startY;
			let height =  board.const.scene.height * board.scale;
			board.context.fillStyle = "#000000";
			board.context.fillRect(x - 2,y - 2,width + 4,height + 4);
			board.context.fillStyle = "#FABC2A";
			board.context.fillRect(x,y,width,height);
			board.context.font = 20*board.scale+"px Arial";
			board.context.fillStyle = "#000000";
			board.context.fillText(this.core.nome, this.core.x*board.scale-board.startX, this.core.y*board.scale-board.startY+20*board.scale);
			//board.context.fillText(this.core.nome, this.core.x*board.scale-board.startX, this.core.y*board.scale-board.startY);
			//TODO decidere estetica

			if(board.frecciaContext && board.frecciaContext.from!=this.core){
				board.context.beginPath();
				board.context.lineWidth=2;

				board.context.moveTo((this.core.x + 20) * board.scale - board.startX , (this.core.y - 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x - 5) * board.scale - board.startX , (this.core.y - 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x - 5) * board.scale - board.startX , (this.core.y + 20) * board.scale - board.startY);
				
				board.context.moveTo((this.core.x - 5) * board.scale - board.startX , (this.core.y + board.const.scene.height - 20) * board.scale - board.startY);
				board.context.lineTo((this.core.x - 5) * board.scale - board.startX , (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + 20) * board.scale - board.startX , (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);

				board.context.moveTo((this.core.x + board.const.scene.width - 20) * board.scale - board.startX , (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX , (this.core.y + board.const.scene.height + 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX , (this.core.y + board.const.scene.height - 20) * board.scale - board.startY);

				board.context.moveTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX , (this.core.y + 20) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width + 5) * board.scale - board.startX , (this.core.y - 5) * board.scale - board.startY);
				board.context.lineTo((this.core.x + board.const.scene.width - 20) * board.scale - board.startX , (this.core.y - 5) * board.scale - board.startY);
				
				board.context.strokeStyle = "#000000";
				board.context.stroke();
			}
		}
	}
	open(){
		if(!$("#scena"+this.id)[0]){
			let id = "#scena"+this.id;
			let html = $("#scena").html();
			for(let i = 0; i<12; i++){
				html = html.replace("$ID",this.id);
			}
			html = html.replace("$NAME", this.core.nome).replace("$NAME", this.core.nome);
			html = html.replace("$DESCRIPTION", this.core.descrizione).replace("$DESCRIPTION", this.core.descrizione);
			html = html.replace("$IMMAGINE", this.core.img).replace("$IMMAGINE", this.core.img);
			html = html.replace("$DESCIMM", this.core.imgdescription).replace("$DESCIMM", this.core.imgdescription);
			//selezionare widget giusto
			html = html.replace("$WIDGET", this.core.widget);
			//select con l'audio
			html = html.replace("$AUDIO", this.core.tracciaAudio!= null? this.core.tracciaAudio : "nessun audio inserito");

			html = html.replace("$VALUTATORE", this.core.valutatore?"ON":"OFF");
			$("#editValutatore"+this.id).prop( "checked", this.core.valutatore);
			
			$(".container").append(html);

			this.populateRisp();

			$(id+" .header").css({"background-color":storia.categoria=="singolo"?"purple":groups[board.activegroup]});

			initScene(id);
		}
		else
			close("#scena"+this.id);
	}
	populateRisp(){
		$("#scena"+this.id+" ol").html("");
		let html="";
		let rispID=0;
		this.core.risposte.forEach(risposta => {
			html = $("#risposta").html();
			for(let i=0; i < 8; i++){
				html = html.replace("$ID", this.id);
				html = html.replace("$RISP", rispID);
			}
			html = html.replace("$VALORE", risposta.valore).replace("$VALORE", risposta.valore);
			html = html.replace("$LINK", risposta.to[board.activegroup] != -1 ? storia.scene[risposta.to[board.activegroup]].nome: "non ancora inserito");
			html = html.replace("$TEMPO", risposta.maxTime ? risposta.maxTime : "illimitato").replace("$TEMPO", risposta.maxTime);
			html = html.replace("$POINTS", risposta.points).replace("$POINTS", risposta.points);
			$("#risposte"+this.id).append(html);
			$("#collapser"+this.id+"_"+rispID).click(collapsehandler);

			$("#elimina"+this.id+"_"+rispID).click(delRisp);
			$("#editMaxTime"+this.id+"_"+rispID).prop("disabled", rispID == this.core.risposte.length-1);
			if(rispID == this.core.risposte.length-1)
				$("#editMaxTime"+this.id+"_"+rispID).val(0);
			rispID++;
		});
		$("#scena"+this.id+" .rispostaCollapse").hide();

	}
	linkmenu(){
		contextMenu.show(this.id);
	}
	graphicalDelete(){
		this.core.x=null;
		this.core.y=null;
		for(let i = 0; i < board.arrows.length; i++){
			if(board.arrows[i].to == this.core || board.arrows[i].from == this.core){
				board.arrows.splice(i, 1);
				i--;
			}
		}
		storia.scene.forEach(scena=>{
			scena.risposte.forEach(risposta=>{
				for(let i=0; i<risposta.to.length; i++){
					if(risposta.to[i]==this.id)
						risposta.to[i]=-1;
				}
			})
		});
		storia.scene[this.id].to=Array(storia.ngruppi).fill(-1);
	}
}