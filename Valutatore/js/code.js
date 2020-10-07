function Player(params) {
    
}

function Valutatore() {
    /* Sarebbe meglio fare un richiesta POST al server ma per il momento userò questa*/
    var psw = prompt("Inserisci password");
    if(psw = "abc") {
        alert("Salve valutatore!");
        location.replace("./valutatore.html");
    }else{
        alert("password errata!");
    }
}