class graphicalScene{
	constructor(id,scena){
		this.id = id;
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
		console.log("open");
		let html = $("#scena").html();
		for(let i = 0; i<9; i++){
			html.replace("$ID",this.id);
		}
		html.replace("$NAME", this.core.name);
		html.replace("$DESCRIPTION", this.core.description);
		html.replace("$WIDGET", this.core.widget);
		html.replace("$AUDIO", this.core.tracciaAudio);
		html.replace("$VALUTATORE", this.core.valutatore);
		html.replace("$TIME", this.core.timemax);
        $(".container").append(html);
        let id = "#scena"+this.id;
        dragElement($(id));
	}
}