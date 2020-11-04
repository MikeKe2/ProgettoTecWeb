$(
  function () {

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

    function Toast(type, msg) {
      this.type = type;
      this.msg = msg;
    }

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

    var toasts = [
      new Toast('success', 'è entrato in chat. Ci sono ora: '),
      new Toast('warning', 'ha lasciato la chat. Ci sono ora: '),
      new Toast('info', 'ha lasciato un messaggio nella sua chat.'),
      new Toast('error', 'Connessione al server terminata'),
      new Toast('info', 'Tentativo di riconessione in corso....'),
      new Toast('success', 'Sei stato riconnesso'),
      new Toast('info', 'Collegamento avvenuto con successo!')
    ];

    // Initialize variables
    var $window = $(window);
    var $messages = $(".messages"); // Messages area
    var $inputMessage = $(".inputMessage"); // Input message input box

    var $usersPage = $(".users.page");
    var $chatPage = $(".chat.page");

    // Prompt for setting a username
    var username = "valutatore";
    var currentTargetUser = "";
    var currentTargetId = "";
    var typing = false;
    var lastTypingTime;
    var participants = [];
    var ArrayofMessages = new Messages();

    var socket = io("http://localhost:8000");

    //#region Toastr

    toastr.options.positionClass = 'toast-top-right';
    toastr.options.extendedTimeOut = 0; //1000;
    toastr.options.timeOut = 4000;
    toastr.options.fadeOut = 250;
    toastr.options.fadeIn = 250;


    function showToast(i, data) {
      var t = toasts[i];

      switch (i) {
        case 0:
          toastr[t.type](data.username + " " + t.msg + data.numUsers + " partecipanti");
          break;
        case 1:
          toastr[t.type](data.username + " " + t.msg + data.numUsers + " partecipanti");
          break;
        case 2:
          toastr[t.type](data.username + " " + t.msg);
          break;
        case 3:
          toastr[t.type](t.msg);
          break;
        case 4:
          toastr[t.type](t.msg);
          break;
        case 5:
          toastr[t.type](t.msg);
          break;
        default:
          toastr[t.type](t.msg);
          break;
      }
    }

    //#endregion

    //#region Functions

    //Greets the Evaluator with the numbers of partecipants
    const addParticipantsMessage = (data) => {
      var message = "";
      if (data.numUsers <= 0) {
        message += "there aren't any participants";
      } else if (data.numUsers === 1) {
        message += "there's 1 participant";
      } else {
        message += "there are " + data.numUsers + " participants";
      }
      log(message);
    };

    // Sends a chat message
    const sendMessage = () => {
      var message = $inputMessage.val();
      ArrayofMessages.newMessage("valutatore", "0", currentTargetUser, message);
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
        socket.emit("new eval message", currentTargetId, (message));
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

      var $usernameDiv = $('<span class="username"/>')
        .text(data.username)
        .css("color", getUsernameColor(data.username));
      var $messageBodyDiv = $('<span class="messageBody">').text(data.message);

      var typingClass = data.typing ? "typing" : "";
      var $messageDiv = $('<li class="message"/>')
        .data("username", data.username)
        .addClass(typingClass)
        .append($usernameDiv, $messageBodyDiv);

      addMessageElement($messageDiv, options);

      if (data.username == username) {
        $("#" + currentTargetUser + ".message:last-child").addClass("evaluator");
      }
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

    // Gets the color of a username through our hash function
    const getUsernameColor = (username) => {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      // Calculate color
      var index = Math.abs(hash % COLORS.length);
      return COLORS[index];
    };

    //#endregion

    //#region Events

    // Keyboard events

    $window.keydown((event) => {
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
        sendMessage();
        socket.emit("stop typing");
        typing = false;
      }
    });

    // Click event

    // Focus input when clicking on the message input's border
    $inputMessage.click(() => {
      $inputMessage.focus();
    });

    $(".users").on("click", 'div.user', function (event) {
      currentTargetUser = event.currentTarget.id;
      currentTargetId = document.getElementById(currentTargetUser).getAttribute('value');
      $usersPage.fadeOut(200);
      $chatPage.show(800);
      $chatPage.prop("disabled", false);
      $usersPage.prop("disabled", true);
      for (var i = 0; i < ArrayofMessages.numberOfMessages; i++) {
        if (currentTargetUser == ArrayofMessages.messages[i].username || currentTargetUser == ArrayofMessages.messages[i].dstUsername)
          addChatMessage(ArrayofMessages.messages[i]);
      }
    });

    $("#UsrPgBtn").click(() => {
      currentTargetUser = 0;
      $chatPage.fadeOut(100);
      $usersPage.show(800);
      $chatPage.prop("disabled", true);
      $usersPage.prop("disabled", false);
      $(".messages").html("");
    });

    //#endregion

    //#region  Socket events

    $(document).ready(function () {
      socket.emit("add eval", username);
    });

    // Whenever the server emits 'login', log the login message
    socket.on("login", (data) => {
      connected = true;
      showToast(6);
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on("new message", (data) => {
      ArrayofMessages.newMessage(data.username, data.id, "valutatore", data.message);
      if (currentTargetUser == data.username)
        addChatMessage(data);
      else
        showToast(2, data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on("user joined", (data) => {
      if (!participants.includes(data.username)) {
        participants.push(data.username);
        var $navbar = $('<div id="' + data.username + '" value="' + data.id + '" class="user"> <nav class="navbar-light bg-light"> <a class="navbar-brand" href="#"> <img src="" width="30" height="30" alt="" loading="lazy">  </a> Player: ' + data.username + '</span> </nav></div>');
        $usersPage.append($navbar);
      }
      showToast(0, data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on("user left", (data) => {
      if (participants.includes(data.username)) {
        showToast(1, data);
        participants.pop(data.username);
        $("#" + data.username).remove();
        removeChatTyping(data);
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
      showToast(3);
    });

    socket.on("reconnect", () => {
      showToast(5);
      if (username) {
        socket.emit("add eval", username);
      }
    });

    socket.on("reconnect_error", () => {
      showToast(4);
    });
  });

//#endregion