// Setup requestAnimationFrame and cancelAnimationFrame for use in the game code
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = 
		window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	
	if (!window.requestAnimationFrame)
	window.requestAnimationFrame = function(callback, element) {
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
		timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};
	
	if (!window.cancelAnimationFrame)
	window.cancelAnimationFrame = function(id) {
		clearTimeout(id);
	};
}());
//var storia;

$(window).on("load", function(){
	mouse.init();
	board.init();
});

var board={
	context: null,
	activegroup: null,
    startX: 0,
    startY: 0,
	width: 500,
	height: 500,
	scale: 1,
	arrows: [],
	scenes: [],
	move:(newX, newY)=>{

    },
    getScene: (x, y) =>{
        for(let i=0; i<storia.scene.length; i++){
      		if(x * board.scale > (storia.scene[i].x*board.scale - board.startX) && x * board.scale < (storia.scene[i].x*board.scale + (board.const.scene.width * board.scale) - board.startX) 
      	    && y * board.scale > (storia.scene[i].y*board.scale - board.startY) && y * board.scale < (storia.scene[i].y*board.scale + (board.const.scene.height * board.scale) - board.startY)){
				return board.scenes[i];
			}
		}
	},
	init: function(){
		// 	url:"/prova.json",
		// 	success: (data)=>{
				//storia = JSON.parse(data);
				for(let i = 0; i < storia.scene.length; i++){
					let scena = storia.scene[i];
					if(scena.x && scena.y){
						for(let j = 0; j < scena.risposte.length; j++){
							let risposta = scena.risposte[i];
							if(risposta.to){
								for(let k = 0; k < risposta.to.length; k++){
									let to = risposta.to!=null?storia.scene[risposta.to[k]]:null;
									if(to){
										board.arrows.push(new freccia(scena, to, k))
									}
								}
							}
						}
						board.scenes.push(new graphicalScene(i,scena));
					}
				}
				// for(let i=0; i<board.arrows; i++){
				// 	groups.push(new group());
				// }


				// for(scena in storia.scene){
				// 	if(storia.scene[scena].x && storia.scene[scena].y){
				// 		storia.scene[scena].risposte.forEach(risposta=>{
				// 			for(var i=0; risposta.to.length; i++){
				// 				if(risposta.to[i])
				// 					board.arrows.push(new freccia(storia.scene[scena], risposta.to[i], i))
				// 			}
				// 		});
				// 		board.scenes.push(new graphicalScene(n,storia.scene[scena]));
				// 		n++;
				// 	}
				// }
				board.context = $("#canvas")[0].getContext('2d');
				board.AnimationFrame=window.requestAnimationFrame(board.DrawAll, board.context);
		// 	}
		// });
	},
	const:{
		scene:{
			width:50,
			height:30
		}
	},
	DrawAll:function(){
		board.context.fillStyle = "#FFFFFF";
		board.context.fillRect(0,0,$("#canvas").width(),$("#canvas").height());
	
		for(var j = 0; j < board.scenes.length; j++){
			board.scenes[j].draw();
		}
		for( var i = 0; i < board.arrows.length; i ++){
			board.arrows[i].draw();
		}
		board.AnimationFrame=window.requestAnimationFrame(board.DrawAll, board.context);
	}
}

var groups=[]

groups.newgroup=function(){
	this.append(new group())
}

class group{
	constructor(){
		this.color=getRandomColor();
	}
}

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
		if(this.core.x+board.const.scene.width>board.width)
			this.core.x=board.width-board.const.scene.width;
		if(this.core.y+board.const.scene.heigth>board.height)
			this.core.y=board.height-board.const.scene.height;
	}
	draw(){
		board.context.fillStyle = "#FF0000";
		let x = this.core.x * board.scale - board.startX;
		let width = board.const.scene.width * board.scale;
		let y = this.core.y * board.scale - board.startY;
		let height =  board.const.scene.height * board.scale;
		board.context.fillRect(x,y,width,height);
	}
}

class freccia{
	constructor(from, to, ngroup=1){
		this.from=from;
		this.to=to;
		this.ngroup;
	}
	draw(){
		if(!board.activegroup || activegroup==this.ngroup){
			board.context.beginPath();
			board.context.moveTo(this.from.x - board.startX , this.from.y - board.startY);
			board.context.lineTo(this.to.x - board.startX, this.to.y - board.startY);
			board.context.strokeStyle = "#000000";
			board.context.stroke();
		}
	}

}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
	  color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
  }