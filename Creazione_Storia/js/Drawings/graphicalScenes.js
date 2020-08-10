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
			//selezionare widget giusto
			html = html.replace("$WIDGET", this.core.widget);
			//select con l'audio
			html = html.replace("$AUDIO", this.core.tracciaAudio);

			html = html.replace("$VALUTATORE", this.core.valutatore?"ON":"OFF");
			$("#editValutatore"+this.id).prop( "checked", this.core.valutatore);
			
			$(".container").append(html);

			let rispID=0;
			this.core.risposte.forEach(risposta => {
				html = $("#risposta").html();
				for(let i=0; i < 7; i++){
					html=html.replace("$ID", this.id);
					html = html.replace("$RISP", rispID);
				}
				html = html.replace("$VALORE", risposta.valore).replace("$VALORE", risposta.valore);
				html = html.replace("$LINK", risposta.to[board.activegroup] != -1 ? storia.scene[risposta.to[board.activegroup]].nome: "non ancora inserito");
				html = html.replace("$TEMPO", risposta.maxTime ? risposta.maxTime : "illimitato").replace("$TEMPO", risposta.maxTime);
				html = html.replace("$POINTS", risposta.points).replace("$POINTS", risposta.points);
				$("#risposte"+this.id).append(html);
				$("#collapser"+this.id+"_"+rispID).click(collapsehandler);
				rispID++;
			});
			$(id+" .header").css({"background-color":storia.categoria=="singolo"?"purple":groups[board.activegroup]});

			$(id+" .rispostaCollapse").hide();
			initScene(id);
		}
		else
			close("#scena"+this.id);
	}
	linkmenu(){
		contextMenu.show(this.id);
	}
}