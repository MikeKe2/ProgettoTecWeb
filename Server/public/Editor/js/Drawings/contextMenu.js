var contextMenu = {
    from: null,
    risposta: null,
    freccia: null,

    init: function(){
        $(".container").click(contextMenu.hide);
        $(".container").on("touchstart", contextMenu.hide);
    },
    show(id){

        contextMenu.from = board.scenes[id];
        contextMenu.risposta = null;

        let risposta=$("#contextRisposta").html().replace("$ID", contextMenu.id);
        $("#contextMenu ol").html("");
        for(let i = 0; i < board.scenes[id].core.risposte.length; i++){
            let li = risposta.replace("$RISP", i);
            let to = contextMenu.from.core.risposte[i].to[board.activegroup];
			if (to != -1){
                li = li.replace("$TO", storia.scene[to].nome);
			}else{
                li = li.replace("$TO", "Non ancora inserito");
			}
            $("#contextMenu ol").append(li);
            
            $("#contextMenu ol li:last-child button").click(function(){
                if(to != -1){
                    board.eraseArrow(contextMenu.from.core, to);
                    contextMenu.from.core.risposte[i].to[board.activegroup]=-1;
                }
                contextMenu.select(i);
            });
        }
        if(id && id!=0){
            $("#contextMenu ol").append(risposta.replace("$RISP","Add").replace("$TO","+"));
            $("#contextMenu ol li").last().click(function(){
                let risp = {
                    valore: 0, 
                    to:Array(storia.ngruppi).fill(-1),
                    remainingTime: 0,
                    points: 0
                };
                board.scenes[id].core.risposte.push(risp);

                contextMenu.select(contextMenu.from.core.risposte.length-1);
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
        board.frecciaContext = new freccia(contextMenu.from.core, null, board.activegroup);
        contextMenu.hide();
    },
    linkwith(scena){
        if(scena && scena!=contextMenu.from && scena.id != 0){
            board.frecciaContext.to = scena.core;
            board.arrows.push(board.frecciaContext);
            contextMenu.from.core.risposte[contextMenu.risposta].to[board.activegroup] = scena.id;
        }
        board.frecciaContext = null;
    }
}