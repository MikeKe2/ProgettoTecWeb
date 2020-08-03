var contextMenu = {
    scenaID: null,
    risposta: null,
    freccia: null,

    init: function(){
        $(window).click(function(){
            contextMenu.hide();
        });
    },
    show(id){

        this.scenaID = board.scenes[id];
        this.risposta = null;

        let risposta=$("#contextRisposta").html().replace("$ID", this.id);
        $("#contextMenu ol").html("");
        for(let i = 0; i < board.scenes[id].core.risposte.length; i++){
			let li = risposta.replace("$RISP", i);
			if (this.scenaID.core.risposte[i].to[board.activegroup]){
				li = li.replace("$TO", this.scenaID.core.risposte[i].to[board.activegroup]);
			}else{
				li = li.replace("$TO", "non ancora inserito");
			}
            $("#contextMenu ol").append(li);
            $("#contextMenu ol li").last().click(function(){
                //contextMenu.hide();
                contextMenu.select(i);
            });
        }
        
        $("#contextMenu").css({left: mouse.x, top: mouse.y});
        $("#contextMenu").addClass("richiamato");
        
    },
    hide(){
        $("#contextMenu").removeClass("richiamato");
    },
    select(n){
        risposta=board.scenes[id].core.risposta[n];
    },
    linkwith(id){
        
    }
}