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
	contextMenu.init();
	initGroups();
});

var board={
	context: null,
	activegroup: 0,
	dropping: false,
    startX: 0,
    startY: 0,
	scale: 1,
	arrows: [],
	scenes:[],
	frecciaContext: null,
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
      		if(storia.scene[i].x!=null&&storia.scene[i].y!=null &&
			   x  > (storia.scene[i].x * board.scale - board.startX) && x < (storia.scene[i].x * board.scale + (board.const.scene.width * board.scale) - board.startX) 
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
								for(let k = 0; k < storia.ngruppi; k++){
									let to = risposta.to!=-1?storia.scene[risposta.to[k]]:null;
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
				$(".miniNav .listItem").click(function(){$(".miniNav .listItem").not(this).removeClass("attivato"); $(this).addClass("attivato");})
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
		edit("#scena"+scena.id);
		board.PopulateMenu($(".miniNav .attivato").attr("id"));
	},
	PopulateMenu:(filter)=>{
		let all = false;
		let loaded = false;
		switch(filter){
			case "all":
				all=true;
				break;
			case "notLoaded":
				loaded=false;
				break;
			case "loaded":
				loaded=true;
				break;
		}
		$("#menulist").html("");
		let j=0;
		board.scenes.forEach(scena=>{
			if(all || (loaded && scena.core.x && scena.core.y) || (!loaded && (!scena.core.x || !scena.core.y))){
				$("#menulist").append($("#menuScena").html().replace("$ID", scena.id).replace("$NOME",scena.core.nome));
				$("#menuScena"+scena.id).click(function(){scena.open()});
			}
		})
	},
	erase:function(from, to){
		for(let i = 0; i < board.arrows.length; i++){
			if(board.arrows[i].from == from && board.arrows[i].to == board.scenes[to].core && board.arrows[i].ngroup == board.activegroup){
				board.arrows.splice(i, 1);
			}
		}
	},
	DrawAll:function(){
		board.context.fillStyle = "#bfc8d9";
		board.context.fillRect(0,0,$("#canvas").width(),$("#canvas").height());
	
		for(var j = 0; j < board.scenes.length; j++){
			board.scenes[j].draw();
		}
		for( var i = 0; i < board.arrows.length; i ++){
			board.arrows[i].draw();
		}
		if(board.frecciaContext){
			board.frecciaContext.draw(mouse.x, mouse.y)
		}
		board.AnimationFrame=window.requestAnimationFrame(board.DrawAll, board.context);
		if(board.dropping){
			board.context.fillStyle = "rgba(0, 0, 255, 0.6)";
			board.context.fillRect(0,0,$("#canvas").width(),$("#canvas").height());
		}
	}
}