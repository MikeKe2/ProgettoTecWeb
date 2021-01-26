var mouse={
	x: 0,
    y: 0,
    down: false,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
    time: 0, 
    grabbing:null,
    onCanvas:false,
    timer:null,
    init:function(){
        //imposta gli handler di tutti gli eventi

        //touch 
        $("#canvas").on("touchstart", mouse.touchstart);
        $("#canvas").on("touchmove", mouse.touchmove);
        $("#canvas").on("touchend", mouse.touchend);

        //mouse
        $('.container').mousemove(mouse.mousemovehandler);
        $("#canvas").bind("dragover", mouse.dragover); 
        $("#canvas").bind("dragleave", mouse.dragleave); 
        $("#canvas").bind("drop", mouse.dragleave); 
		$('#canvas').mousedown(mouse.mousedownhandler); 
		$('#canvas').contextmenu(mouse.rightclick);
		$('#canvas').mouseup(mouse.mouseuphandler);
        $('#canvas').mouseout(mouse.mouseuphandler);
        $('#canvas').mousewheel((turn, delta)=>{
            if(delta==1) {
                mouse.zoomin();
            }
            else{
                mouse.zoomout();
            }
        });
	},
	mousedownhandler:(ev)=>{
        //questo handler serve solo per spostare le scene
        //quindi controlla che sia il tasto sinistro
        if(ev.button==0){
            mouse.grabbing=board.getScene(mouse.x, mouse.y);
            mouse.down=true;
            let d = new Date();
            mouse.time = d.getTime();

            ev.originalEvent.preventDefault();
        }
	},
	mouseuphandler:(ev)=>{
        let d=new Date();
        //se stava trascinando non fa niente

        //se ha cliccato chiama l'handler giusto
        if(d.getTime()-mouse.time<150){
            mouse.clickhandler();
        }

        //se la scena è sul cestino la elimina
        if(board.toDelete())
            mouse.grabbing.graphicalDelete();
        
        //dereferenzia variabili mouse
        mouse.grabbing=null;
        mouse.down=false;
	},
	rightclick: function(ev){
        //richiama la finestra per collegare le scene
        let scena = board.getScene(mouse.x, mouse.y);
        if (scena){
            ev.preventDefault();
            scena.linkmenu();
        }
    },
	zoomout: function(){
        //cambia la scala zoomout
        if (board.scale > 0.14){
            board.scale /= 1.15;
            
            board.startX = board.startX/1.15 > mouse.x * 0.15?board.startX/1.15 - mouse.x * 0.15:0;
            board.startY = board.startY/1.15 > mouse.y * 0.15?board.startY/1.15 - mouse.y * 0.15:0;
            
        }
    },
	zoomin: function(){
        //cambia la scala zoomin
        if (board.scale < 18){
            board.scale *= 1.15;
            
            board.startX = board.startX*1.15 + mouse.x * 0.15;
            board.startY = board.startY*1.15 + mouse.y * 0.15;
        }
    },
	mousemovehandler:(ev)=>{
        var offset = $('#canvas').offset();

        //calcola la posizione corrente del mouse nel grafo 
        let newx = ev.pageX - offset.left;
        let newy = ev.pageY - offset.top;

        //non si può spostare troppo in alto o troppo a sinistra
        if(newx<=0)
            newx=0.01;
        if(newy<=0)
            newy=0.01;
        
        //sposta la scena o la board
        if(mouse.grabbing)
            mouse.grabbing.move(newx - mouse.x, newy - mouse.y);
        else if(mouse.down)
            board.move(mouse.x - newx, mouse.y - newy);

        //aggiorna posizione del mouse
        mouse.x = newx;
        mouse.y = newy;
    },
	clickhandler:function(){
        //seleziona la scena da collegare o apre la scena
        if(mouse.grabbing || board.frecciaContext){
            if(board.frecciaContext)
                contextMenu.linkwith(mouse.grabbing);
            else
                mouse.grabbing.open();
        }
    },
    dragover:function(ev){
        //dropping quando si sposta una una scena nel grafo dalla lista
        board.dropping=true;
        mouse.mousemovehandler(ev);
    },
	dragleave:function(ev){
        //resetta dropping quando la scena viene lasciata
        board.dropping=false;
    },
    touchstart:function(ev){
        //imposti le variabili per il touch
        ev.pageX=ev.touches[0].clientX;
        ev.pageY=ev.touches[0].clientY;
        var offset = $('#canvas').offset();
        mouse.x = ev.pageX - offset.left;
        mouse.y = ev.pageY - offset.top;

        //simula il comportamento del click sinistro del mouse
        ev.button=0;
        mouse.mousedownhandler(ev);
        mouse.timer=window.setTimeout(mouse.touchhold,1500)
    },
    touchmove:function(ev){
        //imposta le variabili per ii touch
        window.clearTimeout(mouse.timer);
        ev.pageX=ev.touches[0].clientX;
        ev.pageY=ev.touches[0].clientY;

        //poi se non hai tenuto premuto stai spostando
        if(!$("#contextMenu").hasClass("richiamato"))
            mouse.mousemovehandler(ev);
    },
    touchend:function(ev){
        //smetti di controllare il touch
        window.clearTimeout(mouse.timer);
        //si comporta come il mouseup (smette di spostare o clicca)
        mouse.mouseuphandler(ev);
    },
    touchhold:function(ev){
        //tieni premuto per aprire il menù delle risposte
        if(mouse.grabbing)
            mouse.grabbing.linkmenu();
    }
}
  
    
  