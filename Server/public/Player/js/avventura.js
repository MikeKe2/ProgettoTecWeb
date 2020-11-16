var storia;
var scena_corr = -1;
var socket = io("https://localhost:8000");
var username;

function storiaCallback(data) {
    storia = data;
    console.log(storia);
    initialize();
}

function initialize() {
    $("#titolo").html(storia.nome);
    $("#btn").click(function () {
        checkResult(scena_corr == -1? "":document.getElementById("result").value);
    })
    $(".adventure").css({
        'background-image': 'url( "/backgrounds/' + storia.background + '")',
        'background-repeat': 'no-repeat',
        'background-size': '100% 100%'
    });
}

function checkResult(result, time) {
    storia.scene[scena_corr].risposte.forEach(risposta => {
        if(result == risposta.valore && risposta.maxTime != null && time <= risposta.maxTime){
            //TODO: add ppppppppppppppppppscore;
            nextScene();
            socket.emit("scene", username, (scena_corr));
        } else if (result == risposta.valore && risposta.maxTime == null){
            //TODO: add ppppppppppppppppppscore;
            nextScene();
            socket.emit("scene", username, (scena_corr));
        }
    });
}

function nextScene() {
    scena_corr++;
    track = $("#track");
    track.attr("src", "/music/" + storia.scene[scena_corr].tracciaAudio);
    player = $("#player");
    player[0].pause();
    player[0].load();
    console.log(player[0])
    player[0].oncanplaythrough = player[0].play();
    $("#testo").html(storia.scene[scena_corr].descrizione);
    console.log(storia.scene[scena_corr].widget);
    if (storia.scene[scena_corr].widget != null) {
        $("#widget-holder").show();
        $("#widget").load("/public/Player/widgets/" + storia.scene[scena_corr].widget);
    } else
        $("#widget-holder").hide();
    if (scena_corr == storia.scene.length - 1)
        $("#btn").hide();
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
    var COLORS = [
        "#e21400",
        "#91580f",
        "#f8a700",
        "#f78b00",
        "#58dc00",
        "#287b00",
        "#a8f07a",
        "#4ae8c4",
        "#3b88eb",
        "#3824aa",
        "#a700ff",
        "#d300e7",
    ];

    // Initialize variables
    var $window = $(window);
    var $usernameInput = $(".usernameInput"); // Input for username
    var $messages = $(".messages"); // Messages area
    var $inputMessage = $("#inputMessage"); // Input message input box

    var $loginPage = $(".login.page"); // The login page
    var $chatPage = $(".chat.page"); // The chatroom page
    var $adventurePage = $(".adventure.page"); // The adventure page

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
            $adventurePage.show();
            //$chatPage.show();
            $loginPage.off("click");
            //$currentInput = $inputMessage.focus();
            // Tell the server your username
            socket.emit("add user", username, (storia));
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
            socket.emit("new user message", (message));
        }
    };

    // Log a message
    const log = (message, options) => {
        var $el = $("<li>").addClass("log").text(message);
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

        var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
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
                socket.emit("typing");
            }
            lastTypingTime = new Date().getTime();

            setTimeout(() => {
                var typingTimer = new Date().getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit("stop typing");
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
        var pass1;
        socket.emit('password', ';)', (data) => {
            pass1 = data;
        });

        $("#loginModal").modal("show");
        $("#form-control").focus();

        //handle the form's "submit" event
        $("#loginForm").submit(function (event) {
            event.preventDefault(); //stop a full postback

            var password = $("#modalpass").val(); //get the entered value from the password box

            if (password == pass1) {
                alert("Access Granted!");

                window.location = "../Valutatore/index.html";
            } else alert("Password is incorrect.");
        });
    });

    $('#helpRequested').click(() => {
        socket.emit('help', (username));
    })

    $('#chatWithEvaluator').click(() => {
        $adventurePage.fadeOut(100);
        $chatPage.show(800);
        $adventurePage.prop("disabled", true);
        $chatPage.prop("disabled", false);

        for (var i = 0; i < ArrayofMessages.numberOfMessages; i++) {
            addChatMessage(ArrayofMessages.messages[i]);
        }
    });

    $('#exitChatPage').click(() => {
        $chatPage.fadeOut(100);
        $adventurePage.show(800);
        $chatPage.prop("disabled", true);
        $adventurePage.prop("disabled", false);

        $(".messages").html("");
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

    // Whenever the server emits 'login', log the login message
    socket.on("login", (data) => {
        connected = true;
        // Display the welcome message
        var message = "Benvenuto " + username;
        log(message, {
            prepend: true,
        });
        id = socket.id;
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on("new message", (data) => {
        ArrayofMessages.newMessage(data.username, data.id, username, data.message);
        if($chatPage.is(":visible")){
            addChatMessage(data);
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
            socket.emit("add user", username);
        }
        id = socket.id;
    });

    socket.on("reconnect_error", () => {
        log("attempt to reconnect has failed");
    });

    //init
    $.getJSON("/public/Player/js/test.json", function (data) {
        storiaCallback(data);
    });

});