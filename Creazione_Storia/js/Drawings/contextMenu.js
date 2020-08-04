var contextMenu = {
    from: null,
    risposta: null,
    freccia: null,

    init: function(){
        $(window).click(function(){
            contextMenu.hide();
        });
    },
    show(id){

        contextMenu.from = board.scenes[id];
        contextMenu.risposta = null;

        let risposta=$("#contextRisposta").html().replace("$ID", contextMenu.id);
        $("#contextMenu ol").html("");
        for(let i = 0; i < board.scenes[id].core.risposte.length; i++){
			let li = risposta.replace("$RISP", i);
			if (contextMenu.from.core.risposte[i].to[board.activegroup]!=null){
				li = li.replace("$TO", contextMenu.from.core.risposte[i].to[board.activegroup]);
			}else{
				li = li.replace("$TO", "non ancora inserito");
			}
            $("#contextMenu ol").append(li);
            $("#contextMenu ol li").last().click(function(){
                contextMenu.select(i);
            });
        }
        
        var offset = $('#canvas').offset();

        $("#contextMenu").css({left: mouse.x + offset.left, top: mouse.y + offset.top});
        $("#contextMenu").addClass("richiamato");
        
    },
    hide(){
        $("#contextMenu").removeClass("richiamato");
    },
    select(n){
        contextMenu.risposta = n;
        board.frecciaContext = new freccia(contextMenu.from.core, null);
    },
    linkwith(scena){
        if(scena && scena.core!=contextMenu.from){
            board.frecciaContext.to = scena.core;
            board.arrows.push(board.frecciaContext);
            contextMenu.from.core.risposte[contextMenu.risposta].to[board.activegroup] = scena.id;
        }
        board.frecciaContext = null;
    }
}