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
var $adventurePage = $(".adventure.page"); // The adventure page
//var $groupPage = $('.group.page'); // The group selection page

// Prompt for setting a username
var connected = false;
var typing = false;
var lastTypingTime;
var $currentInput = $usernameInput.focus();
var ArrayofMessages = new Messages();

$(function () {

    $('#chatWithEvaluator').click((e) => {
            e.preventDefault();
            var element = document.getElementById("chatWithEvaluator");
            element.className = element.className.replace(/\bbtn-outline-warning\b/g, "");
            $('#chatWithEvaluator').addClass('btn-outline-info');

            $adventurePage.fadeOut(100);
            $chatPage.show(300);
            $adventurePage.prop("disabled", true);
            $chatPage.prop("disabled", false);
            $(".navbar-collapse").collapse('hide');
            $inputMessage.focus();

            for (var i = 0; i < ArrayofMessages.numberOfMessages; i++) {
                addChatMessage(ArrayofMessages.messages[i]);
            }
        });

    // Sets the client's username
    const setUsername = () => {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if (username) {
            $loginPage.fadeOut();
            $loginPage.off("click");
            $adventurePage.show();
            socket.emit("add user", username, (storia.nome));
            sessionStorage.setItem('Username', username);
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
            if (username && $('#modalChat').is(':visible') && $inputMessage.val()) {
                sendMessage();
                socket.emit("stop typing");
                typing = false;
            } else if (!username) {
                setUsername();
            }
        }
    });

    $inputMessage.on("input", () => {
        updateTyping();
    });

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
        if ($('#modalChat').is(':visible'))
            addChatMessage(data);
        else {
            $("chatWithEvaluator").removeClass("btn-outline-info");
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

});