//questo oggetto gestisce la finestra aperta con il click destro del mouse
//init() inizializza gli eventlistener
//show() funzione che popola la finestra e la mostra
//hide() nasconde la finestra
//select(n) quando viene selezionata la n-essima voce del menu
//linkwith(scena) una volta selezionata una voce collega la freccia a "scena" 


var contextMenu = {
    from: null,
    risposta: null,
    freccia: null,

    init: function(){
        $(".container").click(contextMenu.hide);
        $(".container").on("touchstart", contextMenu.hide);
    },
    show(id){

        //imposta i dati della scena selezionata
        contextMenu.from = board.scenes[id];
        contextMenu.risposta = null;

        //compilazione delle opzioni del menu
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
            
            //aggiunge funzione alle opzioni
            $("#contextMenu ol li:last-child button").click(function(){
                //elimina la freccia esistente se l'opzione è già collegata
                if(to != -1){
                    board.eraseArrow(contextMenu.from.core, to);
                    contextMenu.from.core.risposte[i].to[board.activegroup]=-1;
                }
                contextMenu.select(i);
            });
        }
        //aggiungi risposte solo se non è la scena iniziale
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

        //posiziona la finestra e la rende visibile
        $("#contextMenu").css({left: mouse.x + offset.left, top: mouse.y + offset.top});
        $("#contextMenu").addClass("richiamato");
    },
    hide(){
        $("#contextMenu").removeClass("richiamato");
    },
    select(n){
        //salva la risposta scelta
        contextMenu.risposta = n;

        //aggiunge la freccia che segue il mouse
        board.frecciaContext = new freccia(contextMenu.from.core, null, board.activegroup);
        
        //nasconde il menu
        contextMenu.hide();
    },
    linkwith(scena){
        //collega la freccia alla prossima scena e l'aggiunge alla lista di frecce
        //solo se è stata selezionata una freccia valida
        if(scena && scena!=contextMenu.from && scena.id != 0){
            board.frecciaContext.to = scena.core;
            board.arrows.push(board.frecciaContext);
            contextMenu.from.core.risposte[contextMenu.risposta].to[board.activegroup] = scena.id;
        }
        //rimuove la freccia che segue il mouse
        board.frecciaContext = null;
    }
}