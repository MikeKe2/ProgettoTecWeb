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
        for(scena in storia.scene){
			if(x * board.scale > (scena.x - board.startX) && x * board.scale < (scena.x + (board.const.scene.width * board.scale) - board.startX) 
			&& y * board.scale > (scena.y - board.startY) && y * board.scale < (scena.y + (board.const.scene.height * board.scale) - board.startY)){
				console.log(scena);
                return scena;
            }
        }
    },
	addtoboard: (scena)=>{
		scena.x = mouse.x * scale + board.startX;
		scena.y = mouse.y * scale + board.startY;
    },
	removefromboard: (scena)=>{

    },
    init: function(){
		// $.ajax({
        //     global: false,
		// 	dataType: "json",
		// 	crossDomain:true,
		// 	url:"/prova.json",
		// 	success: (data)=>{
				//storia = JSON.parse(data);
				var n=0;
				for(scena in storia.scenes){
					if(scena.x && scena.y){
						for(risposta in scena.risposte){
							for(var i=0; risposta.to.length; i++){
								if(scena.risposta.to[i])
									board.arrow.append(new freccia(scena, scena.risposta.to[i], i))
							}
						}
						board.scenes.append(new graphicalScene(n,scena));
						n++;
					}
				}
				$("#canvas")[0].getContext('2d');
				this.AnimationFrame=window.requestAnimationFrame(board.DrawAll, board.context);
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
		for(var j = 0; j < board.scenes.length; j++){
			board.scenes[j],draw();
		}
		for( var i = 0; i < board.arrows.length; i ++){
			board.arrows[i].draw();
		}
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
	}
	draw(){
		board.context.fillStyle = "#FF0000";
		board.context.fillRect(this.core.x - board.startX, this.core.y - board.startY, this.core.x - board.startX + board.const.scene.width * board.scale, this.core.y - board.startY + board.const.scene.height * board.scale);
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
			board.context.moveTo(from.x - board.startX , from.y - board.startY);
			board.context.lineTo(to.x - board.startX, to.y - board.startY);
			board.context.strokeStyle = groups[this.ngroup].color;
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