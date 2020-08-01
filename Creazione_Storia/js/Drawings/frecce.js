class freccia{
	constructor(from, to, ngroup=1){
		this.from=from;
		this.to=to;
		this.ngroup;
	}
	draw(){
		if(!board.activegroup || activegroup==this.ngroup){
			board.context.beginPath();
			board.context.moveTo(this.from.x * board.scale - board.startX , this.from.y * board.scale - board.startY);
			board.context.lineTo(this.to.x * board.scale - board.startX, this.to.y * board.scale - board.startY);
			board.context.strokeStyle = "#000000";
			board.context.stroke();
		}
	}
}
