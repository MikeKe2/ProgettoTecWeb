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
	scale: 1,
	arrows: [],
	scenes: [],
	move:(offsetX, offsetY)=>{
		board.startX+=offsetX*board.scale;
		board.startY+=offsetY*board.scale;
		if(board.startX<0)
			board.startX=0;
		if(board.startY<0)
			board.startY=0;
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