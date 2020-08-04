class freccia{
	constructor(from, to, ngroup=0){
		this.from=from;
		this.to=to;
		this.ngroup = ngroup;
	}
	draw(x = null, y = null){
		if(!board.activegroup || activegroup==this.ngroup){
			board.context.beginPath();
			board.context.moveTo(this.from.x + (board.const.scene.width/2) * board.scale - board.startX , this.from.y + (board.const.scene.height) * board.scale - board.startY);
			board.context.lineTo(x?x:this.to.x + (board.const.scene.width/2) * board.scale - board.startX, y?y:this.to.y * board.scale - board.startY);
			board.context.strokeStyle = "#000000";
			board.context.stroke();
		}
	}
}
