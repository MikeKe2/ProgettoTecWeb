function checkStory(){
    //ritornare true per confermare il salvataggio
    return confirm("Cliccando ok sovrascriverai i dati sul server, sei sicuro?") && checkTime() && checkAnswer() && checkPath();
}

//controlla almeno una risposta maxTime=0
function checkTime(){
    //controlla ogni scena, ogni risposta
    if(storia.scene.length>2){
        for(let i=2; i<storia.scene.length; i++){
            let scena = storia.scene[i];
            if(scena.x && scena.y){
                if(scena.risposte.length>0){
                    let right=false;
                    for(let j=0; j<scena.risposte.length; j++){
                        if(scena.risposte[j].maxTime=="0")
                            right=true;
                    }
                    //nessuna ha maxTime=0, segnalato, è possibile comunque salvare
                    if(!right && !confirm("La scena: \""+scena.nome+"\" deve avere almeno una risposta con tempo uguale a \"0\", vuoi continuare?")){return false;}
                }
                else
                    if(!confirm("La scena: \""+scena.nome+"\" non ha risposte, vuoi continuare?")){return false;}
            }
        }
    }
    
    return true;
}

//controlla non ci siano to = -1
function checkAnswer(){
    //controlla ogni scena, ogni risposta, ogni gruppo
    for(let i = 0; i < storia.scene.length; i++){
        if(storia.scene[i].risposte){
            let gruppi = storia.categoria == "singolo" ? 1: ngruppi;
            for(let j = 0; j < gruppi; j++){
                for(let k = 0; k < storia.scene[i].risposte[j].to.length; k++){
                    console.log(storia.scene[i].risposte[j].to[k]);
                    if(storia.scene[i].risposte[j].to[k] *1 == -1 && storia.scene[i].x && storia.scene[i].y)
                        if(!confirm("Attenzione, la scena " + storia.scene[i].nome + " nel gruppo " + (k+1) + " alla risposta " + j + " non è stata compilata, continuare?")){return false;}
                }
            }
        }
        if(i == 0)
            i++; //skippa la scena "fine"
    }
    return true;
}

//controlla percorso da inizio a fine
function checkPath(){
    let nodes = Array(storia.scene.length);
    let changes;
    for(let i=0; i<storia.ngruppi; i++){
        for(let j = 0; j < nodes.length; j++){
            nodes[j] = !(storia.scene[j].x && storia.scene[j].y);
        }
        nodes[1]=true;
        changes = 1;
        //finché vengono contrassegnati dei nodi
        while(changes > 0){
            changes=0;
            for(let j = 0; j < storia.scene.length; j++){
                let any = false;
                //imposta a true un nodo se collegato alla fine o ad una scena che porta alla fine
                if(!nodes[j] && storia.scene[j].risposte){
                    for(let k = 0; k < storia.scene[j].risposte.length; k++){
                        //controlla il valore che dovrebbe avere il nodo
                        any = any || nodes[storia.scene[j].risposte[k].to[i]*1];
                    }
                    //se any = nodo allora non è cambiato
                    if(any != nodes[j]){
                        nodes[j] = true;
                        changes++;
                    }
                }
            }
        }
        //se una scena è contrassegnata come false può raggiungere la fine
        if(!nodes.reduce((and, value)=> and&&value)){
            if(!confirm("Il gruppo numero "+(i+1)+" ha un percorso che non raggiunge la fine, vuoi continuare?")){return false;}
        };
    }

    return true;
}