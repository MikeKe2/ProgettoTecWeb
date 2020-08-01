class graphicalScene{
	constructor(id,scena){
		this.id = id;
		this.opened = false;
		this.core = scena;
	}
	move(offsetx, offsety){
		this.core.x+=offsetx*board.scale;
		this.core.y+=offsety*board.scale;
		if(this.core.x<0)
			this.core.x=0;
		if(this.core.y<0)
			this.core.y=0;
	}
	draw(){
		board.context.fillStyle = "#FF0000";
		let x = this.core.x * board.scale - board.startX;
		let width = board.const.scene.width * board.scale;
		let y = this.core.y * board.scale - board.startY;
		let height =  board.const.scene.height * board.scale;
		board.context.fillRect(x,y,width,height);
	}
	open(){
		
		if(!this.opened){
			let id = "#scena"+this.id;
			let html = $("#scena").html();
			for(let i = 0; i<9; i++){
				html = html.replace("$ID",this.id);
			}
			html = html.replace("$NAME", this.core.nome);
			html = html.replace("$DESCRIPTION", this.core.descrizione);
			html = html.replace("$WIDGET", this.core.widget);
			html = html.replace("$AUDIO", this.core.tracciaAudio);
			html = html.replace("$VALUTATORE", this.core.valutatore);
			html = html.replace("$TIME", this.core.timemax);
			
			$(".container").append(html);

			let rispID=0;
			this.core.risposte.forEach(risposta => {
				html = $("#risposta").html();
				for(let i=0; i < 4; i++){
					html = html.replace("$RISP",rispID);
					html=html.replace("$ID",this.id);
				}
				html = html.replace("$VALORE", risposta.valore);
				html = html.replace("$LINK", risposta.to);
				html = html.replace("$TEMPO", risposta.remainingTime);
				html = html.replace("$POINT", risposta.points);
				rispID++;
				$("#risposte"+this.id).append(html);
			});

			this.opened = true;
			initScene(id);
		}
	}
}