
class freccia{ 
	constructor(from, to, ngroup=0){ //il costruttore prende l'oggetto in input della scena di partenza e di arrivo ed il gruppo alla quale è assegnata 
		this.from=from;
		this.to=to;
		this.ngroup = ngroup;
	}
	draw(x = null, y = null){ //la draw va solo se non c'è un gruppo attivo o se il gruppo è quello della freccia 
		if(board.activegroup === null ||  board.activegroup==this.ngroup){
			board.context.beginPath();
			board.context.lineWidth=4;
			let xF = this.from.x, yF = this.from.y, xT, yT; 
			if(this.to != null && this.from.x < this.to.x){ //calcoli necessari per angolare la freccia a senconda di dove parte e arriva (se non è la freccia non è la frecciacontext)
				xF = this.from.x + board.const.scene.width;
				xT = this.to.x
			}else if(this.to != null && this.from.x > this.to.x){
				xF = this.from.x;
				xT = this.to.x + board.const.scene.width;
			}else if(this.to != null){ 
				xF = this.from.x + board.const.scene.width / 2;
				xT = this.to.x + board.const.scene.width / 2;
			}

			if(this.to != null && this.from.y < this.to.y){
				yF = this.from.y + board.const.scene.height;
				yT = this.to.y
			}else if(this.to != null && this.from.y > this.to.y){
				yF = this.from.y;
				yT = this.to.y + board.const.scene.height;
			}else if(this.to != null){ 
				yF = this.from.y + board.const.scene.height / 2;
				yT = this.to.y + board.const.scene.height / 2;
			}
			let dx = (xT - xF)* board.scale; //calcoli necessari per disegnare i segmenti finali della freccia (>)
			let dy = (yT - yF) * board.scale;
			let angle = Math.atan2(dy, dx);
			board.context.moveTo((xF) * board.scale - board.startX , (yF) * board.scale - board.startY);
			board.context.lineTo(x?x: xT * board.scale - board.startX, y?y: yT * board.scale - board.startY);
			board.context.lineTo((xT * board.scale - 20 * Math.cos(angle - Math.PI / 6)) - board.startX, (yT * board.scale - 20 * Math.sin(angle - Math.PI / 6)) - board.startY);
			board.context.moveTo(xT * board.scale - board.startX, yT * board.scale - board.startY);
			board.context.lineTo((xT * board.scale - 20 * Math.cos(angle + Math.PI / 6)) - board.startX, (yT * board.scale - 20 * Math.sin(angle + Math.PI / 6)) - board.startY);
			board.context.strokeStyle = storia.categoria=="Singolo"?"#000000":groups[this.ngroup]; //il colore è quello del gruppo o nero se singolo 
			board.context.stroke();
		}
	}
}
