var mouse={
	x: 0,
	y: 0,
    down: false,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
    time: 0, 
    grabbing:null,
    onCanvas:false,
    timer:null,
    init:function(){

        //touch device
        $("#canvas").on("touchstart", mouse.touchstart);
        $("#canvas").on("touchmove", mouse.touchmove);
        $("#canvas").on("touchend", mouse.touchend);


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
        if(d.getTime()-mouse.time<150){
            mouse.clickhandler();
        }
        if(board.toDelete())
            mouse.grabbing.graphicalDelete();
        
        mouse.grabbing=null;
        mouse.down=false;
	},
	midclick: function(){
        board.removefromboard(board.getScene(mouse.x,mouse.y));
    },
	rightclick: function(ev){
        let scena = board.getScene(mouse.x, mouse.y);
        if (scena){
            ev.preventDefault();
            scena.linkmenu();
        }
    },
	zoomout: function(){
        if (board.scale > 0.14){
            board.scale /= 1.15;
            
            board.startX = board.startX/1.15 > mouse.x * 0.15?board.startX/1.15 - mouse.x * 0.15:0;
            board.startY = board.startY/1.15 > mouse.y * 0.15?board.startY/1.15 - mouse.y * 0.15:0;
            
        }
    },
	zoomin: function(){
        if (board.scale < 18){
            board.scale *= 1.15;
            
            board.startX = board.startX*1.15 + mouse.x * 0.15;
            board.startY = board.startY*1.15 + mouse.y * 0.15;
        }
    },
	mousemovehandler:(ev)=>{
        var offset = $('#canvas').offset();

        let newx = ev.pageX - offset.left;
        let newy = ev.pageY - offset.top;

        if(newx<=0)
            newx=0.01;
        if(newy<=0)
            newy=0.01;
        
        if(mouse.grabbing)
            mouse.grabbing.move(newx - mouse.x, newy - mouse.y);
        else if(mouse.down)
            board.move(mouse.x - newx, mouse.y - newy);


        mouse.x = newx;
        mouse.y = newy;
    },
	clickhandler:function(){
        if(mouse.grabbing || board.frecciaContext){
            if(board.frecciaContext)
                contextMenu.linkwith(mouse.grabbing);
            else
                mouse.grabbing.open();
        }
    },
    dragover:function(ev){
        board.dropping=true;
        mouse.mousemovehandler(ev);
    },
	dragleave:function(ev){
        board.dropping=false;
    },
    touchstart:function(ev){
        ev.pageX=ev.touches[0].clientX;
        ev.pageY=ev.touches[0].clientY;
        var offset = $('#canvas').offset();
        mouse.x = ev.pageX - offset.left;
        mouse.y = ev.pageY - offset.top;
        ev.button=0;
        mouse.mousedownhandler(ev);
        mouse.timer=window.setTimeout(mouse.touchhold,1500)
    },
    touchmove:function(ev){
        window.clearTimeout(mouse.timer);
        ev.pageX=ev.touches[0].clientX;
        ev.pageY=ev.touches[0].clientY;
        if(!$("#contextMenu").hasClass("richiamato"))
            mouse.mousemovehandler(ev);
    },
    touchend:function(ev){
        window.clearTimeout(mouse.timer);
        mouse.mouseuphandler(ev);
    },
    touchhold:function(ev){
        if(mouse.grabbing)
            mouse.grabbing.linkmenu();
    }
}
  
    
  