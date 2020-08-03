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
	Array.prototype.last=function(){
		return this[this.length-1];
	}

	var element = $("#canvas")[0];
	$(window).resize(board.resizeCanvas);
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
	scenes:[],
	move:(offsetX, offsetY)=>{
		board.startX+=offsetX/board.scale;
		board.startY+=offsetY/board.scale;
		if(board.startX<0)
			board.startX=0;
		if(board.startY<0)
			board.startY=0;
    },
    getScene: (x, y) =>{
        for(let i=0; i<storia.scene.length; i++){
      		if(x  > (storia.scene[i].x * board.scale - board.startX) && x < (storia.scene[i].x * board.scale + (board.const.scene.width * board.scale) - board.startX) 
      	    && y  > (storia.scene[i].y * board.scale - board.startY) && y < (storia.scene[i].y * board.scale + (board.const.scene.height * board.scale) - board.startY)){
				return board.scenes[i];
			}
		}
	},
	resizeCanvas(){
		let canvas = $("#canvas")[0];
		
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
   		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
	},
	init: function(){

		board.resizeCanvas();
		
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
					}
					board.scenes.push(new graphicalScene(i,scena));
				}
				board.context = $("#canvas")[0].getContext('2d');
				board.AnimationFrame=window.requestAnimationFrame(board.DrawAll, board.context);
				$("#aggiungiScena").click(board.newscene);
				this.PopulateMenu("all");

				$("#all").click(function(){board.PopulateMenu("all");});
				$("#notLoaded").click(function(){board.PopulateMenu("notLoaded");});
				$("#loaded").click(function(){board.PopulateMenu("loaded");});
				$(".miniNav a").click(function(){$(".miniNav a").not(this).removeClass("attivato"); $(this).addClass("attivato");})
		// 	}
		// });
	},
	const:{
		scene:{
			width:150,
			height:80
		}
	},
	newscene:function(){
		storia.scene.push({
			nome: "scena"+ storia.scene.length,
            descrizione: "Inserisci descrizione...",
            widget: null,
            tracciaAudio: null,
            valutatore : false,
            timemax: null,
            x:null,
            y:null,
            risposte: []
		});
		let scena = new graphicalScene(storia.scene.length - 1, storia.scene.last());
		board.scenes.push(scena);
		scena.open();
		board.PopulateMenu("all");
		//todo popolare ultima selezione e non "all"
	},
	PopulateMenu:(filter)=>{
		let all = false;
		let loaded = false;
		switch(filter){
			case "all":
				all=true;
				break;
			case "notLoaded":
				loaded=true;
				break;
			case "loaded":
				loaded=false;
				break;
		}
		$("#menulist").html("");
		let j=0;
		board.scenes.forEach(scena=>{
			if(all || (loaded && scena.x && scena.y) || (!loaded && (!scena.x || !scena.y))){
				$("#menulist").append($("#menuScena").html().replace("$ID", scena.id).replace("$NOME",scena.core.nome));
				$("#menuScena"+scena.id).click(function(){scena.open()});
			}
		})
	},
	DrawAll:function(){
		board.context.fillStyle = "#00FF00";
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