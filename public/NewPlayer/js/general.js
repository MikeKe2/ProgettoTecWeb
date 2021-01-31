function start() {
    return new Date();
};

function end(startTime) {
    let endTime = new Date();
    let timeDiff = endTime - startTime; //in ms
    // strip the ms
    timeDiff /= 1000;

    // get seconds 
    let seconds = Math.round(timeDiff);
    return seconds;
}

async function waitEvaluator() {
    $("#loading").show();
    await socket.once('answerFromEvaluator', (answer_number) => {
        $("#loading").hide();
        if (parseInt(answer_number.message) < 0) {
            avventura.Next(null);
            return;
        } else {
            let risposta = avventura.scene[avventura.nowOn].risposte[parseInt(answer_number.message)];
            avventura.Next(risposta);
        }
    });
};


$(() => {
    $('#nextBtn').blur(() => {
        $("#myPopup").removeClass("show")
        $('#nextBtn').attr("aria-label", "");
    });

    $("nav").hide();

    $(".usernameInput").focus();

    $('#login').click(() => {
        $(".usernameInput").focus();
    });

    $(".valutatore").click(() => {
        $("#loginModal").modal("show");

        //handle the form's "submit" event
        $("#loginForm").submit(() => {
            if ($("#valutatorePassword").val() == avventura.storia.password) {
                alert("Access Granted!");
            } else
                alert("Password is incorrect.");
        });
    });

    /*When the help button is clicked, it send a requesto to the evaluator*/
    $('#helpRequested').click(function (e) {
        e.preventDefault();
        socket.emit('help', avventura.storia.nome, username);
        $('#helpRequested').prop("disabled", true);
        $('#helpRequested').html($("#Question").html());
    });

    $("#MuteMusic").click((e) => {
        e.preventDefault();
        music.muted = !music.muted;
        if (music.muted) {
            /*music[0].pause();
            music[0].currentTime = 0;*/
            $("#MuteMusic").html($("#volumeMute").html());
        } else {
            /*music[0].load();
            music[0].oncanplaythrough = music[0].play();*/
            
            $("#MuteMusic").html($("#volumeUP").html());
        }
    });

    $('#loginModal').on('shown.bs.modal', () => {
        $("#modalpass").focus();
    });

    /*TODO: FIX THIS MESS*/
    $('#modalChat').on('shown.bs.modal', () => {
        $('#modalChat').animate({
            scrollTop: $('#modalChat .messages').height()
        }, 500);
    });

    //gestione chat

    $('#modalChat').on('shown.bs.modal', () => {
        $(".messages").html("");
        $("#inputMessage").val("");
        $('#chatEvaluator').removeClass('btn-info');
        $('#chatEvaluator').addClass('btn-outline-info');
        $inputMessage.focus();
        for (var i = 0; i < ArrayofMessages.numberOfMessages(); i++)
            addChatMessage(ArrayofMessages.messages[i]);
    });

    $("#button-addon2").click((e) => {
        e.preventDefault();
        if (username && $("#modalChat").is(":visible") && $inputMessage.val()) {
            sendMessage();
            socket.emit("stop typing");
            typing = false;
        }
    });

    //valutatore form

    $('input').on('keypress', function (event) {
        if ($("#login").is(":visible")) {
            var regex = new RegExp("^[a-zA-Z0-9]+$");
            var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
            if (!regex.test(key)) {
                event.preventDefault();
                return false;
            }
        }
    });

    $window.keydown((e) => {
        // When the client hits ENTER on their keyboard
        if (e.which === 13) {
            if (username && $("#modalChat").is(":visible") && $inputMessage.val()) {
                sendMessage();
                socket.emit("stop typing");
                typing = false;
            } else if (!username)
                setUsername();
        }
    });

    // Sets the client's username
    function setUsername() {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if (username) {
            $("#login").fadeOut();
            $("#login").off("click");
            $("#avventura").show();
            $("nav").show();
            socket.emit("add user", username, (avventura.storia.nome));
            sessionStorage.setItem('Username', username);
        }
    }

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
            socket.emit("new user message", avventura.storia.nome, message);
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
                socket.emit("typing", avventura.storia.nome);
            }
            lastTypingTime = new Date().getTime();

            setTimeout(() => {
                var typingTimer = new Date().getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit("stop typing", avventura.storia.nome);
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

    $inputMessage.on("input", () => {
        updateTyping();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(() => {
        $inputMessage.focus();
    });

    // Socket events

    socket.on('helpIncoming', (data) => {
        window.alert(`Il valutatore dice: ${data.message}`);
        $('#helpRequested').prop("disabled", false);
        $('#helpRequested').html("<i class='bi bi-question-square-fill'></i>");
    });

    socket.on('changeRoom', (data) => {
        avventura.Next(avventura.scene[avventura.nowOn].risposte[data.soluzione]);
        $("#loading").hide();
    });

    // Whenever the server emits 'login', log the login message
    socket.on("login", (data) => {
        connected = true;
        id = socket.id;
    });

    socket.on("assignGroup", (data) => {
        avventura.gruppo = data.groupN;
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on("new message", (data) => {
        ArrayofMessages.newMessage(data.username, data.id, username, data.message);
        //we just check if the page is visibile, because users have only one chat
        if ($('#modalChat').is(':visible')) {
            addChatMessage(data);
        } else {
            $("#chatEvaluator").removeClass('btn-outline-info');
            $('#chatEvaluator').addClass('btn-info');
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
            socket.emit("add user", username, (avventura.storia.nome));
            socket.emit("scene", username, avventura.storia.nome, (avventura.nowOn));
        }
        id = socket.id;
    });

    socket.on("reconnect_error", () => {
        log("attempt to reconnect has failed");
    });
});