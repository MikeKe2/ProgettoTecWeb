var storia;
var scena_corr = 0;
var socket = io("https://site181993.tw.cs.unibo.it");
var username;
var gruppo = 0;
var punteggio = 0;

var startTime, endTime;

function start_time() {
    startTime = new Date();
};

function end_time() {
    endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    var millis = Math.round(timeDiff);
    return millis / 1000;
}

function storiaCallback(data) {
    storia = data;
    initialize();
}

function initialize() {
    $("#titolo").html(storia.nome);
    $("#btn").click(function () {
        checkResult(scena_corr == 0 || storia.scene[scena_corr].widget == "" || storia.scene[scena_corr].widget == "image.html" ? null : document.getElementById("result").value);
    })
    $(".adventure").css({
        'background-image': 'url( "/users/' + storia.autore + '/images/' + storia.background + '")',
        'background-repeat': 'no-repeat',
        'background-size': '100% 100%'
    });
    $(".chat.page").css({
        'background-image': 'url( "/users/' + storia.autore + '/images/' + storia.background + '")',
        'background-repeat': 'no-repeat',
        'background-size': '100% 100%'
    });
    nextScene(scena_corr);
    setInterval(1000, function () {
        currTime = new Date();
        if (scena_corr != 0 && startTime != undefined && Math.round((currTime - startTime) / 1000) % 60 == 0)
            socket.emit("timer", username, storia.nome, (Math.round((currTime - startTime) / 1000)));
    })
}

function checkResult(result) {
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
                    nextScene(scena);
                } else if (result == risposta.valore && parseInt(risposta.maxTime) == 0 && pointsAdded == 0) {
                    pointsAdded = parseInt(risposta.points);
                    punteggio += pointsAdded;
                    scena = parseInt(risposta.to[gruppo]);
                    correct = true;
                    nextScene(scena);
                }
            });
            if (!correct)
                alert("Risposta errata!");
        } else {
            socket.emit("answerToEvaluator", username, storia.nome, (result));
            waitEvaluator();
        }
    } else {
        scena = parseInt(storia.scene[scena_corr].risposte[0].to[gruppo]);
        nextScene(scena);
    }
}
var coin = 0;

function fetchData() {
    // Here should be your api call, I`m using setTimeout here just for async example
    return promise1 = new Promise(resolve => setTimeout(function () {
        socket.on('answerFromEvaluator', (data) => {
            $("#loading").toggleClass("visibility");
            punteggio += parseInt(storia.scene[scena_corr].risposte[parseInt(data.message, 10)].points, 10);
            nextScene(storia.scene[scena_corr].risposte[parseInt(data.message, 10)].to[gruppo]);
        })
    }, 2000));
}

async function waitEvaluator(_callback) {
    $("#loading").toggleClass("visibility");
    await fetchData();
    /*
        const promise1 = new Promise((resolve, reject) => {
            setTimeout(function() {socket.on('answerFromEvaluator', (data) => {
                coin += parseInt(data.message, 10);
            })}, 200000);
        });
        
        let results = await promise1;
        
        alert(results);
        /*promise1.then((value) => {
            console.log(value);
            $("#loading").toggleClass("loading");
        });*/
};


function nextScene(scena) {
    start_time();
    scena_corr = scena;
    socket.emit("scene", username, storia.nome, (scena_corr));
    if (storia.scene[scena_corr].tracciaAudio != undefined && storia.scene[scena_corr].tracciaAudio != "") {
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
        $("#testo").html(`
BENVENUTO NELLA STORIA ${storia.nome}.<br>
Quest'avventura è pensata per ${storia.categoria.replace('_', " ")}.<br>
Il target di età è di ${storia.target} anni.<br>
` + acc + `
<br>
Divertitevi!!!
`);
    } else if (storia.scene[scena_corr].nome == "Fine") {
        //mostra punteggio e mandalo al server
        socket.emit('score', username, storia.nome, (punteggio));
        $("#text-holder").show();
        $("#btn").hide();
        $("#testo").html(`
COMPLIMENTI! <br>
Hai completato l'avventura totalizzando ben ${punteggio} punti! 
`);
    }

    if (storia.scene[scena_corr].widget != undefined && storia.scene[scena_corr].widget != "") {
        $("#widget-holder").show();
        $("#widget").load("/users/" + storia.autore + "/widgets/" + storia.scene[scena_corr].widget);
    } else {
        $("#widget-holder").hide();
    }
}

$(function () {

    class Message {
        constructor(srcUsername, srcId, dstUsername, data) {
            this.username = srcUsername;
            this.srcId = srcId;
            this.dstUsername = dstUsername;
            this.message = data;
        }
    };

    class Messages {
        constructor() {
            this.messages = [];
        }
        // create a new player and save it in the collection
        newMessage(srcUsername, srcId, dstUsername, data) {
            let m = new Message(srcUsername, srcId, dstUsername, data);
            this.messages.push(m);
            return m;
        }
        get allMessages() {
            return this.messages;
        }
        // this could include summary stats like average score, etc. For simplicy, just the count for now
        get numberOfMessages() {
            return this.messages.length;
        }
    };

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $(".usernameInput"); // Input for username
    var $messages = $(".messages"); // Messages area
    var $inputMessage = $("#inputMessage"); // Input message input box

    var $loginPage = $(".login.page"); // The login page
    var $chatPage = $(".chat.page"); // The chatroom page
    var $adventurePage = $(".adventure.page"); // The adventure page
    //var $groupPage = $('.group.page'); // The group selection page

    // Prompt for setting a username
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();
    var ArrayofMessages = new Messages();

    // Sets the client's username
    const setUsername = () => {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if (username) {
            $loginPage.fadeOut();
            $loginPage.off("click");
            $adventurePage.show();
            socket.emit("add user", username, (storia.nome));
        }
    };

    // Sends a chat message
    const sendMessage = () => {
        var message = $inputMessage.val();
        ArrayofMessages.newMessage(username, "0", 'valutatore', message);
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val("");
            addChatMessage({
                username: username,
                message: message,
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit("new user message", storia.nome, message);
        }
    };

    // Log a message
    const log = (message, options) => {
        var $el = $("<li>").addClass("log").text(message);
        $el.attr("aria-label", message);
        addMessageElement($el, options);
    };

    // Adds the visual chat message to the message list
    const addChatMessage = (data, options) => {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        if (data.username != 'valutatore')
            var $messageBodyDiv = $('<div class="messageBody player">').text(data.message);
        else
            var $messageBodyDiv = $('<div class="messageBody eval">').text(data.message);
        var typingClass = data.typing ? "typing" : "";
        var $messageDiv = $('<li class="message"/>')
            .data("username", data.username)
            .addClass(typingClass)
            .append($messageBodyDiv);

        addMessageElement($messageDiv, options);

        if (data.username != 'valutatore') {
            $('.message:last-child').addClass('player');
        };
    };

    // Adds the visual chat typing message
    const addChatTyping = (data) => {
        data.typing = true;
        data.message = "is typing";
        addChatMessage(data);
    };

    // Removes the visual chat typing message
    const removeChatTyping = (data) => {
        getTypingMessages(data).fadeOut(function () {
            $(this).remove();
        });
    };

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    const addMessageElement = (el, options) => {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === "undefined") {
            options.fade = true;
        }
        if (typeof options.prepend === "undefined") {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    };

    // Prevents input from having injected markup
    const cleanInput = (input) => {
        return $("<div/>").text(input).html();
    };

    // Updates the typing event
    const updateTyping = () => {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit("typing", storia.nome);
            }
            lastTypingTime = new Date().getTime();

            setTimeout(() => {
                var typingTimer = new Date().getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit("stop typing", storia.nome);
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    };

    // Gets the 'X is typing' messages of a user
    const getTypingMessages = (data) => {
        return $(".typing.message").filter(function (i) {
            return $(this).data("username") === data.username;
        });
    };
    // Keyboard events

    $window.keydown((event) => {
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                socket.emit("stop typing");
                typing = false;
            } else {
                setUsername();
            }
        }
    });

    $inputMessage.on("input", () => {
        updateTyping();
    });

    // Click events

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

    $('#chatWithEvaluator').click(function (e) {
        e.preventDefault();
        var element = document.getElementById("chatWithEvaluator");
        element.className = element.className.replace(/\bbtn-outline-warning\b/g, "");
        $('#chatWithEvaluator').addClass('btn-outline-info');

        $adventurePage.fadeOut(100);
        $chatPage.show(300);
        $adventurePage.prop("disabled", true);
        $chatPage.prop("disabled", false);
        $(".navbar-collapse").collapse('hide');

        for (var i = 0; i < ArrayofMessages.numberOfMessages; i++) {
            addChatMessage(ArrayofMessages.messages[i]);
        }
    });

    $('#exitChatPage').click((e) => {
        e.preventDefault();
        $chatPage.fadeOut(100);
        $adventurePage.show(1);
        $chatPage.prop("disabled", true);
        $adventurePage.prop("disabled", false);
    
        $(".messages").html("");
    })

    $("#MuteMusic").click((e) => {
        e.preventDefault();
        if (!player[0].paused) {
            player[0].pause();
            player[0].currentTime = 0;
            $("#MuteMusic").text("RESTART MUSIC");
        } else {
            player[0].load();
            player[0].oncanplaythrough = player[0].play();
            $("#MuteMusic").text("MUTE MUSIC");
        }

    })


    // Focus input when clicking anywhere on login page
    $loginPage.click(() => {
        $currentInput.focus();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(() => {
        $inputMessage.focus();
    });

    // Socket events

    socket.on('helpIncoming', (data) => {
        window.alert(`Il valutatore dice: ${data.message}`);
        $('#helpRequested').prop("disabled", false);
    });

    // Whenever the server emits 'login', log the login message
    socket.on("login", (data) => {
        connected = true;
        id = socket.id;
    });

    socket.on("assignGroup", (data) => {
        gruppo = data.groupN;
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on("new message", (data) => {
        ArrayofMessages.newMessage(data.username, data.id, username, data.message);
        //we just check if the page is visibile, because users have only one chat
        if ($chatPage.is(":visible")) {
            addChatMessage(data);
        } else {
            var element = document.getElementById("chatWithEvaluator");
            element.className = element.className.replace(/\bbtn-outline-info\b/g, "");
            $('#chatWithEvaluator').addClass('btn-outline-warning');
        }
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on("typing", (data) => {
        addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on("stop typing", (data) => {
        removeChatTyping(data);
    });

    socket.on("disconnect", () => {
        log("you have been disconnected");
    });

    socket.on("reconnect", () => {
        log("you have been reconnected");
        if (username) {
            socket.emit("add user", username, (storia.nome));
            socket.emit("scene", username, storia.nome, (scena_corr));
        }
        id = socket.id;
    });

    socket.on("reconnect_error", () => {
        log("attempt to reconnect has failed");
    });

    $.getJSON(urlStoria, function (data) {
        storiaCallback(data);
    });

});