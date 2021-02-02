mobileCheck = function() { //controlla se il dispositivo è mobile
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function maxX(array){ //la x maggiore tra tutte quelle dell'array
    let max = array[0].x;
    for(let i = 1; i < array.length; i ++){
            max = Math.max(max,array[i].x);
    }
    return max
}


function minX(array){ //la x minore tra tutte quelle dell'array
    let min = array[0].x;
    for(let i = 1; i < array.length; i ++){
        min = Math.min(min,array[i].x);
    }
    return min
}
function maxY(array){ //la y maggiore tra tutte quelle dell'array
    let max = array[0].y;
    for(let i = 1; i < array.length; i ++){
        max = Math.max(max,array[i].y);
    }
    return max
}
function minY(array){ //la y minore tra tutte quelle dell'array
    let min = array[0].y;
    for(let i = 1; i < array.length; i ++){
        min = Math.min(min,array[i].y);
    }
    return min
}

let mappa = { //gestisce la canvas e ne fa la mappa
    canvas: $("#myCanvas")[0],
    ctx: null,
    canvasX: null, //dimensione sulla x 
    canvasY: null, //dimensione sulla y
    scene: null, //tutte le scene 
    max_x: null, //x massima 
    max_y: null, //y massima
    min_x: null, //x minima
    min_y: null, //y minima
    mouseX: null, //click del mouse x
    mouseY: null, //click del mouse y
    node_size:10, //grandezza delle scene
    orientation: null, //come è orientata la canvas
    init: function(){ //inizializzazione della canvas / mappa
        mappa.scene = storia.scene; //all'inizio setto tutte le variabili
        mappa.max_x = maxX(mappa.scene);
        mappa.max_y = maxY(mappa.scene);
        mappa.min_x = minX(mappa.scene);
        mappa.min_y = minY(mappa.scene);
        $("#MappaData").html("Clicchi su una scena per sapere chi è lì");
        $("#CanvasModal").modal("show");
        mappa.canvas.width = window.innerWidth / 2;
        mappa.canvas.height =  window.innerHeight / 2;
        
        mappa.canvasX = mappa.canvas.width,
        mappa.canvasY = mappa.canvas.height;
        mappa.orientation = mappa.canvasX > mappa.canvasY;
        mappa.ctx = mappa.canvas.getContext('2d');
        for(let i = 0; i < mappa.scene.length; i++){ //disegno sulla mappa tutte le frecce 
            if(mappa.scene[i].risposte){
                for(let j = 0; j < mappa.scene[i].risposte.length; j++){
                    let risposta = mappa.scene[i].risposte[j];
                    for(let k = 0; k < risposta.to.length; k++){
                        if(risposta.to[k] > -1){
                            if(mappa.orientation) //controllo se la mappa è verticale o orizzontale e disegno di conseguenza
                            mappa.addLine(mappa.mapper(mappa.scene[i].x,'x'), mappa.mapper(mappa.scene[i].y,'y'), mappa.mapper(mappa.scene[risposta.to[k]].x,'x'), mappa.mapper(mappa.scene[risposta.to[k]].y,'y'));
                            else
                            mappa.addLine(mappa.mapper(mappa.scene[i].y,'y'), mappa.mapper(mappa.scene[i].x,'x'), mappa.mapper(mappa.scene[risposta.to[k]].y,'y'), mappa.mapper(mappa.scene[risposta.to[k]].x,'x'));
                        }                                
                    }
                }
            }
        }

        for(let i = 0; i < mappa.scene.length; i++){ //disegno sulla mappa tutte le scene (dopo le frecce così sono sopra)
            if(mappa.orientation) //controllo se la mappa è verticale o orizzontale e disegno di conseguenza
                mappa.addCircle(mappa.mapper(mappa.scene[i].x,'x'), mappa.mapper(mappa.scene[i].y,'y'));
            else
                mappa.addCircle(mappa.mapper(mappa.scene[i].y,'y'), mappa.mapper(mappa.scene[i].x,'x'));
        }
        
        mappa.canvas.addEventListener("click", function(e) { //aggiungo al click sulla mappa il salvataggio del mouse e la compilazione del paragrafo con i dati corretti
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
                        giocatori +=", "+ ArrayofUsers.users[j].userUsername;
                    }
                }
                $("#MappaData").html("La scena " + mappa.scene[i].nome + " ha " + n + " giocatori, i cui nomi sono:"+giocatori.replace(",",""));
            }else{
                $("#MappaData").html("Clicchi su una scena per sapere chi è lì");
            }
        });
    },

    addCircle: function(x, y){ //aggiunge un cerchio
        mappa.ctx.beginPath();
        mappa.ctx.arc(x, y, this.node_size, 0, 2 * Math.PI);
        mappa.ctx.fillStyle = '#35c6d4';
        mappa.ctx.fill();
        mappa.ctx.stroke();
    },

    addLine: function(start_x, start_y, end_x, end_y){ //aggiunge una linea
        mappa.ctx.moveTo(start_x, start_y);
        mappa.ctx.lineTo(end_x, end_y);
        mappa.ctx.stroke();
    },

    map: function(n, start1, stop1, start2, stop2){ //mappa il valore n tra i valori start2 e stop2 invece che tra start1 e stop1
        return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
    },
    mapper: function(toMap, direction){ //semplificazione della funzione map che compila automaticamente i campi e controlla anche l'orientamento della mappa
        if(mappa.orientation){
            if(direction == 'x'){
                return mappa.map(toMap, mappa.min_x - this.node_size * 2, mappa.max_x + this.node_size * 2, 0, mappa.canvasX);
            }else{
                return mappa.map(toMap, mappa.min_y - this.node_size * 2, mappa.max_y + this.node_size * 2, 0, mappa.canvasY);
            }
        }else{
            if(direction == 'x'){
                return mappa.map(toMap, mappa.min_x - this.node_size * 2, mappa.max_x + this.node_size * 2, 0, mappa.canvasY);
            }else{
                return mappa.map(toMap, mappa.min_y - this.node_size * 2, mappa.max_y + this.node_size * 2, 0, mappa.canvasX);
            }
        }
    },
    GetScene: function(){ //restituisce l'indice della scena cliccata sulla canvas (se ce ce è una)
        for(let i = 0; i < mappa.scene.length; i++){
            if(mappa.orientation){
                if( mappa.mapper(mappa.scene[i].x,'x') - this.node_size <= mappa.mouseX && mappa.mouseX <= mappa.mapper(mappa.scene[i].x,'x') + this.node_size && mappa.mapper(mappa.scene[i].y,'y') - this.node_size <= mappa.mouseY && mappa.mouseY  <= mappa.mapper(mappa.scene[i].y,'y') + this.node_size)
                    return i;
            }else{
                if( mappa.mapper(mappa.scene[i].y,'y') - this.node_size <= mappa.mouseX && mappa.mouseX <= mappa.mapper(mappa.scene[i].y,'y') + this.node_size && mappa.mapper(mappa.scene[i].x,'x') - this.node_size <= mappa.mouseY && mappa.mouseY  <= mappa.mapper(mappa.scene[i].x,'x') + this.node_size)
                    return i;
            }
        }
    }
}