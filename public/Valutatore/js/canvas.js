function maxX(array){
    let max = array[0].x;
    for(let i = 1; i < array.length; i ++){
            max = Math.max(max,array[i].x);
    }
    return max
}
function minX(array){
    let min = array[0].x;
    for(let i = 1; i < array.length; i ++){
        min = Math.min(min,array[i].x);
    }
    return min
}
function maxY(array){
    let max = array[0].y;
    for(let i = 1; i < array.length; i ++){
        max = Math.max(max,array[i].y);
    }
    return max
}
function minY(array){
    let min = array[0].y;
    for(let i = 1; i < array.length; i ++){
        min = Math.min(min,array[i].y);
    }
    return min
}

let mappa = {
    canvas: $("#myCanvas")[0],
    ctx: null,
    canvasX: null,
    canvasY: null,
    scene: null,
    max_x: null,
    max_y: null,
    min_x: null,
    min_y: null,
    mouseX: null,
    mouseY: null,
    orientation: null,
    init: function(){
        $("#CanvasModal").show();
        mappa.scene = storia.scene;
        mappa.max_x = maxX(mappa.scene);
        mappa.max_y = maxY(mappa.scene);
        mappa.min_x = minX(mappa.scene);
        mappa.min_y = minY(mappa.scene);
        mappa.canvasX = mappa.canvas.width,
        mappa.canvasY = mappa.canvas.height;
        mappa.orientation = mappa.canvasX > mappa.canvasY;
        mappa.ctx = mappa.canvas.getContext('2d');
        for(let i = 0; i < mappa.scene.length; i++){
            if(mappa.orientation)
                mappa.addCircle(mappa.mapper(mappa.scene[i].x,'x'), mappa.mapper(mappa.scene[i].y,'y'));
            else
                mappa.addCircle(mappa.mapper(mappa.scene[i].y,'y'), mappa.mapper(mappa.scene[i].x,'x'));
            if(mappa.scene[i].risposte){
                for(let j = 0; j < mappa.scene[i].risposte.length; j++){
                    let risposta = mappa.scene[i].risposte[j];
                    for(let k = 0; k < risposta.to.length; k++){
                        if(risposta.to[k] > -1){
                            if(mappa.orientation)
                                mappa.addLine(mappa.mapper(mappa.scene[i].x,'x'), mappa.mapper(mappa.scene[i].y,'y'), mappa.mapper(mappa.scene[risposta.to[k]].x,'x'), mappa.mapper(mappa.scene[risposta.to[k]].y,'y'));
                            else
                                mappa.addLine(mappa.mapper(mappa.scene[i].y,'y'), mappa.mapper(mappa.scene[i].x,'x'), mappa.mapper(mappa.scene[risposta.to[k]].y,'y'), mappa.mapper(mappa.scene[risposta.to[k]].x,'x'));
                        }                                
                    }
                }
            }
        }

        mappa.canvas.addEventListener("click", function(e) { 
            let cRect = mappa.canvas.getBoundingClientRect();
            mappa.mouseX = Math.round(e.clientX - cRect.left);
            mappa.mouseY = Math.round(e.clientY - cRect.top);
            let i = mappa.GetScene();
            if(i != null){
                let n = 0;
                let giocatori = "" 
                for(let j = 0; j < ArrayofUsers.users.length; j++){
                    if(ArrayofUsers.users[j].userRoom == i){
                        n++;
                        giocatori +="\n "+ ArrayofUsers.users[j].userUsername;
                    }
                }
                alert("la scena " + mappa.scene[i].nome + " ha " + n + " giocatori, i cui nomi sono:"+giocatori);
            }
        });
    },

    addCircle: function(x, y){
        mappa.ctx.beginPath();
        mappa.ctx.arc(x, y, 5, 0, 2 * Math.PI);
        mappa.ctx.fillStyle = 'red';
        mappa.ctx.fill();
        mappa.ctx.stroke();
    },

    addLine: function(start_x, start_y, end_x, end_y){
        mappa.ctx.moveTo(start_x, start_y);
        mappa.ctx.lineTo(end_x, end_y);
        mappa.ctx.stroke();
    },

    map: function(n, start1, stop1, start2, stop2){
        return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
    },
    mapper: function(toMap, direction){
        if(mappa.orientation){
            if(direction == 'x'){
                return mappa.map(toMap, mappa.min_x - 10, mappa.max_x + 10, 0, mappa.canvasX);
            }else{
                return mappa.map(toMap, mappa.min_y - 10, mappa.max_y + 10, 0, mappa.canvasY);
            }
        }else{
            if(direction == 'x'){
                return mappa.map(toMap, mappa.min_x - 10, mappa.max_x + 10, 0, mappa.canvasY);
            }else{
                return mappa.map(toMap, mappa.min_y - 10, mappa.max_y + 10, 0, mappa.canvasX);
            }
        }
    },
    GetScene: function(){
        for(let i = 0; i < mappa.scene.length; i++){
            if(mappa.orientation){
                if( mappa.mapper(mappa.scene[i].x,'x') - 5 <= mappa.mouseX && mappa.mouseX <= mappa.mapper(mappa.scene[i].x,'x') + 5 && mappa.mapper(mappa.scene[i].y,'y') - 5 <= mappa.mouseY && mappa.mouseY  <= mappa.mapper(mappa.scene[i].y,'y') + 5)
                    return i;
            }else{
                if( mappa.mapper(mappa.scene[i].y,'y') - 5 <= mappa.mouseX && mappa.mouseX <= mappa.mapper(mappa.scene[i].y,'y') + 5 && mappa.mapper(mappa.scene[i].x,'x') - 5 <= mappa.mouseY && mappa.mouseY  <= mappa.mapper(mappa.scene[i].x,'x') + 5)
                    return i;
            }
        }
    }
}