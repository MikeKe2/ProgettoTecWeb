var mouse={
	x: 0,
	y: 0,
    down: false,
    init:function(){
		$('#canvas').click(mouse.clickhandler);
		$('#canvas').mousemove(mouse.mousemovehandler);
		$('#canvas').mousedown(mouse.mousedownhandler);
		$('#canvas').mouseup(mouse.mouseuphandler);
		$('#canvas').mouseout(mouse.mouseuphandler);
        $('#canvas').scroll(mouse.scrollhandler);
        $('#canvas').bind('mousewheel', function(e){
            if(e.originalEvent.wheelDelta /120 > 0) {
                zoomin();
            }
            else{
                zoomout();
            }
        });
	},
	mousedownhandler:(ev)=>{
        mouse.interprete(ev)
		mouse.downX = mouse.x;
		mouse.downY = mouse.y;
		ev.originalEvent.preventDefault();
		
	},
	mouseuphandler:(ev)=>{
		mouse.down = false;
		mouse.dragging = false;
	},
	midclick: function(){
        board.removefromboard(board.getScene(mouse.x,mouse.y));
    },
	rightclick: function(){
        bard.getScene(mouse.x, mouse.y).linkmenu();
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
            board.getScene().move(mouse.x-newx, mouse.y-newy);
        }

        x = newx;
        y = newy;
    },
	clickhandler:function(){
        board.getScene(mouse.x,mouse.y).open();
    },
    interprete: (ev)=>{
        switch(ev.button){
            case 0:
                mouse.down = true;
                break;
            case 0:
                mouse.midclick();
                break;
            case 0:
                mouse.rightclick()
                break;
        }
    }
}
  
    
  