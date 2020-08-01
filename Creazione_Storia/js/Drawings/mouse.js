var mouse={
	x: 0,
	y: 0,
    down: false,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
    time: 0, 
    init:function(){
		$('#canvas').mousemove(mouse.mousemovehandler);
		$('#canvas').mousedown(mouse.mousedownhandler);
		$('#canvas').mouseup(mouse.mouseuphandler);
        $('#canvas').mouseout(mouse.mouseuphandler);
        $('#canvas').mousewheel((turn, delta)=>{
            if(delta==1) {
                mouse.zoomout();
            }
            else{
                mouse.zoomin();
            }
        });
	},
	mousedownhandler:(ev)=>{
        mouse.interprete(ev)
		mouse.downX = mouse.x;
		mouse.downY = mouse.y;
        ev.originalEvent.preventDefault();
        let d = new Date();
        mouse.time = d.getTime();
		
	},
	mouseuphandler:(ev)=>{
		mouse.down = false;
        mouse.dragging = false;
        let d=new Date();
        if(d.getTime()-mouse.time<100){
            mouse.clickhandler();
        }
	},
	midclick: function(){
        board.removefromboard(board.getScene(mouse.x,mouse.y));
    },
	rightclick: function(){
        let scena = bard.getScene(mouse.x, mouse.y);
        if (scena)
            scena.linkmenu();
    },
	zoomin: function(){
        board.scale /= 1.25;
    },
	zoomout: function(){
        board.scale *= 1.25;
    },
	mousemovehandler:(ev)=>{
        var offset = $('#canvas').offset();

        let newx = ev.pageX - offset.left;
        let newy = ev.pageY - offset.top;
		
		if (mouse.down) {
            let scena = board.getScene(mouse.x, mouse.y);
            if(scena)
                scena.move(newx - mouse.x, newy - mouse.y);
            else{
                board.move(mouse.x - newx, mouse.y - newy);
            }
        }

        mouse.x = newx;
        mouse.y = newy;
    },
	clickhandler:function(){
        var scena = board.getScene(mouse.x,mouse.y);
        if(scena){
            scena.open();
        }
    },
    interprete: (ev)=>{
        switch(ev.button){
            case 0:
                mouse.down = true;
                break;
            case 1:
                mouse.midclick();
                break;
            case 2:
                mouse.rightclick()
                break;
        }
    }
}
  
    
  