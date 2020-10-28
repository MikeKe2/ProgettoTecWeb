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

var storia;

$(window).on("load", function(){
	$("#Help").hide()
	Array.prototype.last=function(){
		return this[this.length-1];
	}

	var element = $("#canvas")[0];
	$(window).resize(board.resizeCanvas);
	mouse.init();
	board.init();
	contextMenu.init();
	initGroups();
	window.mobileAndTabletCheck = function() {
		let check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	};
	$("#backImage").click(function(){location.href="http://dr-pepper.it"});
	$("#saveImage").click(function(){alert("Non supportato")});
	$("#helpImage").click(function(){$("#Help").toggle()});
	$("#downloadImage").click(function(){

	});
});

var board={
	canvas:null,
	context: null,
	activegroup: 0,
	dropping: false,
    startX: 0,
	startY: 0,
	pinch:false,
	scale: 1,
	toDelete: function(){
		return mouse.grabbing&& mouse.x>board.canvas.width-50 && mouse.y>board.canvas.height-50;
	},
	arrows: [],
	scenes: [],
	cestinoImg: null,
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
		board.canvas = $("#canvas")[0];
		const width = board.canvas.clientWidth;
		const height = board.canvas.clientHeight;
   		if (board.canvas.width !== width || board.canvas.height !== height) {
			board.canvas.width = width;
			board.canvas.height = height;
		}
	},
	init: function(){

		board.resizeCanvas();
		$.ajax({
		 	url:"localhost:8000/stories/"+"/"+$("#visibility").html()+"/"+$("#user").html()+"/"+$("#name").html()+":8000",
		 	success: (data)=>{
				console.log(data);
				storia = data;
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
				board.canvas = $("#canvas")[0];
				board.context = board.canvas.getContext('2d');
				board.AnimationFrame=window.requestAnimationFrame(board.DrawAll, board.context);
				$("#aggiungiScena").click(board.newscene);
				this.PopulateMenu("all");
				$("#all").click(function(){board.PopulateMenu("all");});
				$("#notLoaded").click(function(){board.PopulateMenu("notLoaded");});
				$("#loaded").click(function(){board.PopulateMenu("loaded");});
				$(".miniNav .listItem").click(function(){$(".miniNav .listItem").not(this).removeClass("attivato"); $(this).addClass("attivato");})

				$("#downloadImage").click(download);
				$("#settingsImage").click(settingsToggle);
				$("#canvas").on("touchstart", board.startPinch);
				
				this.checkOrientation();

				screen.orientation.onchange = function (){
					board.checkOrientation();
				};
				board.cestinoImg = new Image();
				board.cestinoImg.src = "/Editor/img/cestino.png";
		 	}
		});
	},
	const:{
		scene:{
			width:150,
			height:80
		},
		canvas:{
			width:function(){
				return board.canvas.width;
			},
			height:function() {
				return board.canvas.height;
			}
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
				$("#menuScena"+scena.id).on("touchstart", dragTouch);
				$("#menuScena"+scena.id).on("touchmove", dropMove);
				$("#menuScena"+scena.id).on("touchend", dropTouch);
			}
		})
	},
	eraseArrow:function(from, to){
		for(let i = 0; i < board.arrows.length; i++){
			if(board.arrows[i].from == from && board.arrows[i].to == board.scenes[to].core && board.arrows[i].ngroup == board.activegroup){
				board.arrows.splice(i, 1);
			}
		}
	},
	DrawAll:function(){
		board.context.fillStyle = "#bfc8d9";
		board.context.fillRect(0,0,board.canvas.width,board.canvas.height);
	
		for(var j = 0; j < board.scenes.length; j++){
			board.scenes[j].draw();
		}
		for( var i = 0; i < board.arrows.length; i ++){
			board.arrows[i].draw();
		}
		if(board.frecciaContext && !window.mobileAndTabletCheck())
			board.frecciaContext.draw(mouse.x, mouse.y)

		board.AnimationFrame=window.requestAnimationFrame(board.DrawAll, board.context);
		if(board.dropping){
			board.context.fillStyle = "rgba(0, 0, 255, 0.6)";
			board.context.fillRect(0,0,board.canvas.width,board.canvas.height);
		}

		board.context.fillStyle = board.toDelete()?"rgb(0,200,0)":"rgb(200,0,0)";
		board.context.fillRect(board.canvas.width-52, board.canvas.height-52, 52, 52);
		board.context.fillStyle = "#bfc8d9";
		board.context.fillRect(board.canvas.width-51, board.canvas.height-51, 50, 50);
		board.context.drawImage(board.cestinoImg, board.canvas.width-51, board.canvas.height-51, 50, 50);
	},

	checkOrientation:function(){
		if(screen.orientation.type.match(/\w+/)[0] == "portrait"){
			$(".container").hide();
			$("#turnAround").show();
		}
		else{
			$(".container").show();
			$("#turnAround").hide();
		}
	},
	
	//TODO debuggare multitouch
	startPinch:function(e){
		if(e.touches.length == 2){
			this.pinch = true;
			console.log("ci sono 2 dita!");
		
		}
	},

	rem:function(id){
		board.scenes[id].graphicalDelete();
		storia.scene.splice(id,1);
		board.scenes.splice(id,1);
		for(let i = id; i < board.scenes.length; i++){
			board.scenes[i].id--;
		}
		board.PopulateMenu($(".miniNav .attivato").attr("id"));
	}
}