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
            let to = contextMenu.from.core.risposte[i].to[board.activegroup];
			if (to != -1){
                li = li.replace("$TO", to);
			}else{
                li = li.replace("$TO", "non ancora inserito");
			}
            $("#contextMenu ol").append(li);
            
            $("#contextMenu ol li").last().click(function(){
                if(to != -1){
                    board.erase(contextMenu.from.core, to);
                    contextMenu.from.core.risposte[i].to[board.activegroup]=-1;
                }
                contextMenu.select(i);
            });
        }
        
        $("#contextMenu ol").append(risposta.replace("$RISP","Add").replace("$TO","+"));
        $("#contextMenu ol li").last().click(function(){
            let risp = {
                valore : null, 
                to:Array(storia.ngruppi).fill(-1),
                remainingTime: null,
                points:null
            };
            board.scenes[id].core.risposte.push(risp);

            //TODO separare creazione risposta per essere richiamata anche da un bottone

            contextMenu.select(contextMenu.from.core.risposte.length-1);
        });

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