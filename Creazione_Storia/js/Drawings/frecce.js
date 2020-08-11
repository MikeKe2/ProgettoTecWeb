class freccia{
	constructor(from, to, ngroup=0){
		this.from=from;
		this.to=to;
		this.ngroup = ngroup;
	}
	draw(x = null, y = null){
		if(board.activegroup === null ||  board.activegroup==this.ngroup){
			board.context.beginPath();
			board.context.lineWidth=4;
			let xF, yF, xT, yT; 
			if(this.from.x < this.to.x){
				xF = this.from.x + board.const.scene.width;
				xT = this.to.x
			}else if(this.from.x > this.to.x){
				xF = this.from.x;
				xT = this.to.x + board.const.scene.width;
			}else{ 
				xF = this.from.x + board.const.scene.width / 2;
				xT = this.to.x + board.const.scene.width / 2;
			}

			if(this.from.y < this.to.y){
				yF = this.from.y + board.const.scene.height;
				yT = this.to.y
			}else if(this.from.y > this.to.y){
				yF = this.from.y;
				yT = this.to.y + board.const.scene.height;
			}else{ 
				yF = this.from.y + board.const.scene.height / 2;
				yT = this.to.y + board.const.scene.height / 2;
			}

			board.context.moveTo((xF) * board.scale - board.startX , (yF) * board.scale - board.startY);
			board.context.lineTo(x?x:(xT) * board.scale - board.startX, y?y:yT * board.scale - board.startY);
			board.context.strokeStyle = storia.categoria=="singolo"?"#000000":groups[this.ngroup];
			board.context.stroke();
		}
	}
}
