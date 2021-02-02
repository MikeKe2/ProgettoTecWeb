function checkStory() {
    //ritornare true per confermare il salvataggio
    return confirm("Cliccando ok sovrascriverai i dati sul server, sei sicuro?") && checkTime() && checkAnswer() && checkPath();
}

//controlla almeno una risposta maxTime=0
function checkTime() {
    //controlla ogni scena, ogni risposta
    if (storia.scene.length > 2) {
        for (let i = 2; i < storia.scene.length; i++) {
            let scena = storia.scene[i];
            if (scena.x && scena.y) {
                if (scena.risposte.length > 0) {
                    let right = false;
                    for (let j = 0; j < scena.risposte.length; j++) {
                        if (scena.risposte[j].maxTime == "0")
                            right = true;
                    }
                    //nessuna ha maxTime=0, segnalato, è possibile comunque salvare
                    if (!right && !confirm("La scena: \"" + scena.nome + "\" deve avere almeno una risposta con tempo uguale a \"0\", vuoi continuare?")) {
                        return false;
                    }
                } else
                if (!confirm("La scena: \"" + scena.nome + "\" non ha risposte, vuoi continuare?")) {
                    return false;
                }
            }
        }
    }
    return true;
}

//controlla non ci siano to = -1
function checkAnswer() {
    //controlla ogni scena, ogni risposta, ogni gruppo
    let nodi = Array(parseInt(storia.ngruppi));
    for (let index = 0; index < storia.ngruppi; index++) {
        nodi[index] = Array(storia.scene.length).fill(true);
        pathFromStart(nodi[index], 0, index);
    };
    let gruppi = storia.categoria == "Singolo" ? 1: parseInt(storia.ngruppi);
    for(let i = 0; i < storia.scene.length; i++){
        for(let j = 0; j < storia.scene[i].risposte.length; j++){
            for(let k = 0; k < gruppi; k++){
                if(!nodi[k][i] && storia.scene[i].risposte[j].to[k] *1 == -1 && storia.scene[i].x && storia.scene[i].y)
                    if(!confirm("Attenzione, la scena " + storia.scene[i].nome + " nel gruppo " + (k+1) + " alla risposta " + (j+1) + " non è stata compilata, continuare?")){return false;}
            }
        }
        if (i == 0)
            i++; //skippa la scena "fine"
    }
    return true;
}

//controlla percorso dalla fine all'inizio
function checkPath() {
    let changes;
    let gruppi = storia.categoria == "Singolo" ? 1: parseInt(storia.ngruppi);
    for(let i=0; i < gruppi; i++){
        let nodes = Array(storia.scene.length).fill(true);

        pathFromStart(nodes, 0, i);
        nodes[1] = true;

        console.log("GRUPPO " + i)
        for (let mimmo = 0; mimmo < nodes.length; mimmo++) {
            if (nodes[mimmo])
                console.log(storia.scene[mimmo].nome);
        }
        //finché vengono contrassegnati dei nodi
        do {
            changes = 0;
            for (let j = 0; j < storia.scene.length; j++) {
                let any = false;
                //imposta a true un nodo se collegato alla fine o ad una scena che porta alla fine
                if (!nodes[j] && storia.scene[j].risposte) {
                    for (let k = 0; k < storia.scene[j].risposte.length; k++) {
                        //controlla il valore che dovrebbe avere il nodo
                        any = any || nodes[storia.scene[j].risposte[k].to[i] * 1];
                    }
                    //se any = nodo allora non è cambiato
                    if (any != nodes[j]) {
                        nodes[j] = any;
                        changes++;
                    }
                }
            }
        }
        while (changes > 0)
        //se una scena è contrassegnata come false non può raggiungere la fine
        if (!nodes.reduce((and, value) => and && value)) {
            if (!confirm("Il gruppo numero " + (i + 1) + " ha un percorso che non raggiunge la fine, vuoi continuare?")) {
                return false;
            }
        };
    }

    return true;
}

function pathFromStart(lista, indice, gruppo) {
    lista[indice] = false;

    if (!storia.scene[indice].risposte || !storia.scene[indice].risposte.length)
        return;

    for (let i = 0; i < storia.scene[indice].risposte.length; i++) {
        if (lista[storia.scene[indice].risposte[i].to[gruppo]]) {
            pathFromStart(lista, storia.scene[indice].risposte[i].to[gruppo], gruppo)
        }
    }
}