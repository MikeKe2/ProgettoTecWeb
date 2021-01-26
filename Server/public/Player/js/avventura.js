var storia;
var scena_corr = 0;
var socket = io("https://site181993.tw.cs.unibo.it");
var username;
var gruppo = 0;
var punteggio = 0;

var startTime, endTime;

function storiaCallback(data) {
    storia = data;
    initialize();
}

function initialize() {
    $("#titolo").html(storia.nome);

    if (storia.css != undefined && storia.css != "")
        $("#mycss").load("/users/" + storia.autore + "/css/" + storia.css);

    $("#btn").click(function () {

        if (storia.scene[scena_corr].widget == "canvas.html")
            $("#result").attr('value', document.getElementById('sketchpad').toDataURL());

        checkResult(scena_corr == 0 || storia.scene[scena_corr].widget == "" || storia.scene[scena_corr].widget == "image.html" ? null : document.getElementById("result").value);
    })

    $(".adventure, .chat.page").css({
        'background-image': 'url( "/users/' + storia.autore + '/images/' + storia.background + '")',
        'background-repeat': 'no-repeat',
        'background-position': 'center'
    });

    if (sessionStorage.getItem("Scene")) {
        scena_corr = sessionStorage.getItem("Scene");
        if (sessionStorage.getItem("Points"))
            punteggio = sessionStorage.getItem("Points");
    }

    nextScene(scena_corr);

    setInterval(1000, function () {
        currTime = new Date();
        if (scena_corr != 0 && startTime != undefined && Math.round((currTime - startTime) / 1000) % 60 == 0)
            socket.emit("timer", username, storia.nome, (Math.round((currTime - startTime) / 1000)));
    })
}

function checkResult(result) {
    $("#alert").hide();

    if (result != null) {

        time = end_time();
        pointsAdded = 0;
        correct = false;

        if (storia.scene[scena_corr].valutatore == "false") {
            storia.scene[scena_corr].risposte.forEach(risposta => {

                if (result == risposta.valore && parseInt(risposta.maxTime) != 0 && time <= parseInt(risposta.maxTime) && pointsAdded == 0) {
                    pointsAdded = parseInt(risposta.points);
                    punteggio += pointsAdded;
                    scena = parseInt(risposta.to[gruppo]);
                    correct = true;
                    sessionStorage.setItem("Scene", scena);
                    sessionStorage.setItem("Points", punteggio);
                    nextScene(scena);
                } else if (result == risposta.valore && parseInt(risposta.maxTime) == 0 && pointsAdded == 0) {
                    pointsAdded = parseInt(risposta.points);
                    punteggio += pointsAdded;
                    scena = parseInt(risposta.to[gruppo]);
                    correct = true;
                    sessionStorage.setItem("Scene", scena);
                    sessionStorage.setItem("Points", punteggio);
                    nextScene(scena);

                }
            });
            if (!correct)
                $("#alert").show();

        } else {
            socket.emit("answerToEvaluator", username, storia.nome, (result));
            waitEvaluator();
        }
    } else {
        scena = parseInt(storia.scene[scena_corr].risposte[0].to[gruppo]);
        nextScene(scena);
    }

}

function nextScene(scena) {

    start_time();
    scena_corr = scena;
    socket.emit("scene", username, storia.nome, (scena_corr));
    if (storia.accessibile != "true" && storia.scene[scena_corr].tracciaAudio != undefined && storia.scene[scena_corr].tracciaAudio != "") {
        track = $("#track");
        track.attr("src", `/users/${storia.autore}/audios/${storia.scene[scena_corr].tracciaAudio}`);
        player = $("#player");
        player[0].pause();
        player[0].load();
        player[0].oncanplaythrough = player[0].play();
    }

    if (storia.scene[scena_corr].descrizione != undefined && storia.scene[scena_corr].descrizione != "") {
        $("#text-holder").show();
        testo = $("#testo");
        testo.html(storia.scene[scena_corr].descrizione);
        testo.attr("aria-label", storia.scene[scena_corr].descrizione);
    } else if (storia.scene[scena_corr].nome == "Inizio") {
        $("#text-holder").show();
        var acc = "";
        if (storia.scene[scena_corr].accessibile == "true")
            acc = "Questa storia è accessibile.";
        $("#testo").html(`BENVENUTO NELLA STORIA ${storia.nome}.<br>Quest'avventura è pensata per ${storia.categoria.replace('_', " ")}.<br>Il target di età è di ${storia.target} anni.<br>` + acc + `<br>Divertitevi!!!`);
    } else if (storia.scene[scena_corr].nome == "Fine") {

        //mostra punteggio e mandalo al server
        socket.emit('score', username, storia.nome, (punteggio));

        $("#text-holder").show();
        $("#btn").hide();
        $("#testo").html(` COMPLIMENTI! <br> Hai completato l'avventura totalizzando ben ${punteggio} punti! `);

        sessionStorage.clear();
    }

    if (storia.scene[scena_corr].widget != undefined && storia.scene[scena_corr].widget != "") {
        $("#widget-holder").show();
        $("#widget").load("/users/" + storia.autore + "/widgets/" + storia.scene[scena_corr].widget);
    } else {
        $("#widget-holder").hide();
    }
}

async function waitEvaluator(_callback) {
    $("#loading").show();
    await socket.on('answerFromEvaluator', (data) => {
        $("#loading").hide();
        punteggio += parseInt(storia.scene[scena_corr].risposte[parseInt(data.message, 10)].points, 10);
        sessionStorage.setItem("Scene", storia.scene[scena_corr].risposte[parseInt(data.message, 10)].to[gruppo]);
        sessionStorage.setItem("Points", punteggio);
        nextScene(storia.scene[scena_corr].risposte[parseInt(data.message, 10)].to[gruppo]);
    });
};

function start_time() {
    startTime = new Date();
};

function end_time() {
    endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    var millis = Math.round(timeDiff);
    return millis / 1000;
}

// Click events

$(function () {

    $.getJSON(urlStoria, function (data) {
            storiaCallback(data);
        })
        .fail(() => {
            alert("Mi dispiace ma la storia che hai richiesto non è stata trovata, ora verrai reindirizzato alla pagina con tutte le storie disponibili");
            window.location.href = "https://site181993.tw.cs.unibo.it/avventure";
        })
        .done(() => {
            if (sessionStorage.getItem('Username') && sessionStorage.getItem('Scene')) {
                $loginPage.fadeOut();
                $loginPage.off("click");
                $adventurePage.show();
                username = sessionStorage.getItem('Username');
                socket.emit("add user", username, (storia.nome));
            }
        });


    $(".valutatore").click(() => {
        $("#loginModal").modal("show");
        $("#form-control").focus();

        //handle the form's "submit" event
        $("#loginForm").submit(function (event) {
            event.preventDefault(); //stop a full postback

            let password = $("#modalpass").val(); //get the entered value from the password box

            if (password == storia.password) {
                alert("Access Granted!");
                //location.replace("https://site181993.tw.cs.unibo.it/valutatore");
                window.location.pathname += "/Valutatore";
            } else alert("Password is incorrect.");
        });
    });

    $('#helpRequested').click(function (e) {
        e.preventDefault();
        socket.emit('help', storia.nome, username);
        $('#helpRequested').prop("disabled", true);
    })

    $('#exitChatPage').click((e) => {
        e.preventDefault();
        $chatPage.fadeOut(100);
        $adventurePage.show(1);
        $chatPage.prop("disabled", true);
        $adventurePage.prop("disabled", false);
        $("#btn").focus();
        $(".messages").html("");
    })

    $("#MuteMusic").click((e) => {
        e.preventDefault();
        try {
            if (!player[0].paused) {
                player[0].pause();
                player[0].currentTime = 0;
                $("#MuteMusic").text("RESTART MUSIC");
            } else {
                player[0].load();
                player[0].oncanplaythrough = player[0].play();
                $("#MuteMusic").text("MUTE MUSIC");
            }
        } catch (error) {
            const element = document.querySelector('.animatebutton');
            element.classList.add('animated', 'shake');
            /*setTimeout(function () {
                element.classList.remove('shake');
            }, 1000);*/
        }

    })

});