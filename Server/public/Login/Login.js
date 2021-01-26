$(document).ready(function(){
    if($("#newUser").html().includes("errore")){
        $("#newUser").addClass("alert").addClass("alert-danger");
        $("#newUser").html("errore nella creazione di un nuovo utente!");
        $("#newUser").show();
    }else if(!$("#newUser").html().includes("none")){
        $("#newUser").addClass("alert").addClass("alert-success");
        let user = $("#newUser").html();
        $("#newUser").html("nuovo utente "+ user + " creato con successo!")
        $("#newUser").show();
    }
});