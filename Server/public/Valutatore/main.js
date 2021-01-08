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

    class Utente {
      constructor(userId, userUsername, userRoom, userTimer, userScore, currentQuestion, possibleAnswer) {
        this.userId = userId;
        this.userUsername = userUsername;
        this.userRoom = userRoom;
        this.userTimer = userTimer;
        this.userScore = userScore;
        this.currentQuestion = currentQuestion;
        this.possibleAnswer = possibleAnswer;
      }
    };

    class Utenti {
      constructor() {
        this.users = [];
      }

      newStoria(userId, userUsername, userRoom, userTimer, userScore, currentQuestion, possibleAnswer) {
        let m = new Utente(userId, userUsername, userRoom, userTimer, userScore, currentQuestion, possibleAnswer);
        this.users.push(m);
        return m;
      }

      findElement(userUsername) {
        for (var i = 0; i < this.users.length; i++)
          if (this.users[i].userUsername == userUsername)
            return i;
        return -1;
      }

      get numberOfUsers() {
        return this.users.length;
      }

    };

    //#region Toastr

    function Toast(type, msg) {
      this.type = type;
      this.msg = msg;
    }

    var toasts = [
      new Toast('success', 'è entrato in chat. Ci sono ora: '),
      new Toast('warning', 'ha lasciato la chat. Ci sono ora: '),
      new Toast('info', 'ha lasciato un messaggio nella sua chat.'),
      new Toast('error', 'Connessione al server terminata'),
      new Toast('info', 'Tentativo di riconnessione in corso....'),
      new Toast('success', 'Sei stato riconnesso'),
      new Toast('info', 'Collegamento avvenuto con successo!'),
      new Toast('info', "Ulteriore dispositivo collegato all'account: "),
      new Toast('error', "L'utente "),
      new Toast('info', ' attende valutazione per una risposta'),
    ];

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
        case 7:
          toastr[t.type](t.msg + data.username);
          break;
        case 8:
          toastr[t.type](t.msg + data.username + " richiede il suo aiuto");
          break;
        case 9:
          toastr[t.type](data.username + t.msg);
          break;
        default:
          toastr[t.type](t.msg);
          break;
      }
    }

    toastr.options.preventDuplicates = true;
    toastr.options.closeButton = true;
    toastr.options.progressBar = true;
    toastr.options.positionClass = 'toast-top-right';
    toastr.options.extendedTimeOut = 1000; //1000;
    toastr.options.timeOut = 2500;
    toastr.options.fadeOut = 150;
    toastr.options.fadeIn = 150;

    //#endregion

    // Initialize variables
    var $window = $(window);
    var $messages = $(".messages"); // Messages area
    var $inputMessage = $("#inputMessage"); // Input message input box

    var $usersPage = $(".users.page");
    var $chatPage = $(".chat.page");
    var $dataPage = $('.data.page');

    // Prompt for setting a username
    var username = "valutatore";
    var currentTargetUser = "";
    var currentTargetId = "";
    var typing = false;
    var lastTypingTime;
    var gruppo = 0;
    var ArrayofUsers = new Utenti();
    var ArrayofMessages = new Messages();
    var storia;

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms

    var socket = io("https://site181993.tw.cs.unibo.it");

    $.getJSON(urlStoria, function (data) {
      storia = data;
    });

    //#region Functions

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

      if (data.username == 'valutatore') {
        $(".message:last-child").addClass("evaluator");
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

    const changeScene = (input, output) => {
      output.fadeOut(200);
      input.show(800);
      output.prop("disabled", true);
      input.prop("disabled", false);
    };

    const changeData = (i, numRoom) => {
      //We clean the possible remains of another user
      $("#SceneName").html("");
      $("#SceneDescrizione").html("");
      $('#SceneAnswers').html("");
      $('.btn-group').html("");

      //We show the current info on the selected user, such as Room number, name and description
      $("#userStatus").html("Si trova nella stanza: " + numRoom);
      $("#SceneName").html(storia.scene[numRoom].nome);
      $("#SceneDescrizione").html(storia.scene[numRoom].descrizione);

      let k = numRoom;
      let statusProgressbar = (100 * (k++)) / storia.scene.length;
      $(".progress-bar").css({
        'width': statusProgressbar + '%'
      });

      //we show the possible answer to the current Room, and various data
      for (y in storia.scene[numRoom].risposte) {
        var currentAnswer = Object.values(storia.scene[numRoom].risposte[y]);
        var answer = '<li class = "list-group-item"><ul class = "list-group">';
        answer = answer.concat(`<li class = "list-group-item">Possibile Risposta: ${currentAnswer[0]}</li>`);
        answer = answer.concat(`<li class = "list-group-item">Tempo Massimo: ${currentAnswer[1]}</li>`);
        answer = answer.concat(`<li class = "list-group-item">Punti: ${currentAnswer[3]}</li>`);
        answer = answer.concat('</ul></li>')
        $('#SceneAnswers').append(answer);
      }

      //if the current user has some question to be evalued, we show the module for it
      if (ArrayofUsers.users[i].possibleAnswer != "NULL") {
        var buttons = '';
        for (y in ArrayofUsers.users[i].currentQuestion.risposte)
          buttons = buttons.concat(`<button type="button" id="${y}" class="btn btn-secondary">${ArrayofUsers.users[i].currentQuestion.risposte[y].valore}</button>`);

        $('.btn-group').append(buttons)
        $('#answerForm').show();
      }
    };

    //#endregion

    //#region Events

    // When the client hits ENTER on their keyboard we treat it as an Enter for the chat
    $window.keydown((event) => {
      if (event.which === 13) {
        sendMessage();
        socket.emit("stop typing");
        typing = false;
      }
    });

    // Click event

    $inputMessage.on("input", () => {
      updateTyping();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(() => {
      $inputMessage.focus();
    });

    // LIST PAGE ==> DATA PAGE
    $("#userList").on("click", '.list-group-item', function (event) {
      changeScene($dataPage, $usersPage);

      currentTargetUser = event.currentTarget.id;
      $('#currentUser').html(currentTargetUser);

      let i = ArrayofUsers.findElement(currentTargetUser);
      if (i >= 0) {
        currentTargetId = ArrayofUsers.users[i].userId;
        changeData(i, ArrayofUsers.users[i].userRoom);
      }
    });

    //when asked to assing a score to a player, we send the value from the RangeValue 
    $('.btn-group').on("click", ".btn", function (event) {
      let i = ArrayofUsers.findElement(currentTargetUser);

      var element = document.getElementById(currentTargetUser);
      element.className = element.className.replace(/\blist-group-item-warning\b/g, "");

      if (ArrayofUsers.users[i].currentQuestion.nome == "fine") {
        ArrayofUsers.users[i].userScore += ArrayofUsers.users[i].currentQuestion.risposte[event.currentTarget.id].points;
        $('#' + data.username).addClass('list-group-item-info');
      } else
        socket.emit('answerFromEvaluator', currentTargetId, event.currentTarget.id);

      ArrayofUsers.users[i].possibleAnswer = "NULL";
      ArrayofUsers.users[i].currentQuestion = "NULL";

      //we close the answer form
      $('.btn-group').html("");
      $("#answerForm").fadeOut();

    });

    // DATA PAGE ==> CHAT PAGE
    $("#chatButton").click(function (e) {
      e.preventDefault();
      changeScene($chatPage, $dataPage);

      for (i in ArrayofMessages.messages) {
        if (currentTargetUser == ArrayofMessages.messages[i].username || currentTargetUser == ArrayofMessages.messages[i].dstUsername)
          addChatMessage(ArrayofMessages.messages[i]);
      }
    });

    // LIST PAGE ==> DATA PAGE
    $("#listButton").click(function (e) {
      e.preventDefault();
      currentTargetId = 0;
      currentTargetUser = 0;
      if ($dataPage.is(":visible"))
        changeScene($usersPage, $dataPage);
      else if ($chatPage.is(":visible"))
        changeScene($usersPage, $chatPage);

      $(".messages").html("");
      $('#SceneAnswers').html("");
    });

    //If the evaluator click the helping button we control the message, if not null we send it to the current user
    $('#helpButton').click(function (e) {
      e.preventDefault();
      var helpingComment = prompt("Please enter the helping hint", "");
      if (helpingComment != null) {
        socket.emit('helpIncoming', currentTargetId, (helpingComment));
        var element = document.getElementById(currentTargetUser);
        element.className = element.className.replace(/\blist-group-item-danger\b/g, "");
      }
    });

    //we export the ArrayOfUser in a .json file, checking wich browser the user is currently using
    $('#exportIron').click(function (e) {
      e.preventDefault()
      if (ArrayofUsers.numberOfUsers > 0) {
        var data = JSON.stringify(ArrayofUsers);
        var file = new Blob([data], {
          type: "json"
        });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
          window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
          var a = document.createElement("a"),
            url = URL.createObjectURL(file);
          a.href = url;
          a.download = "data.json";
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 0);
        }
      } else {
        alert("Nessun Giocatore");
      }
    })

    //#endregion

    //#region  Socket events

    $(document).ready(function () {
      socket.emit("add eval", username);
    });

    socket.on('score', (data) => {
      let i = ArrayofUsers.findElement(data.username);
      ArrayofUsers.users[i].userScore += data.score;

      if (storia.scene[ArrayofUsers.users[i].userRoom].nome == "fine") {
        $('#' + data.username).html(`${data.username} ha finito la storia con: ${ArrayofUsers.users[i].userScore} punti`);
        $('#' + data.username).addClass('list-group-item-info');
      }
    })

    //when a user ask for help we identify that user by highlighting its div
    socket.on('help', (data) => {
      $('#' + data.username).addClass('list-group-item-danger');
      setTimeout(showToast(8, data), 2000);
    });

    //Whenever the server emits 'scene', log the change and change the information regarding that room
    socket.on("scene", (data) => {
      let i = ArrayofUsers.findElement(data.username);
      if (i >= 0) {
        ArrayofUsers.users[i].userRoom = data.room;
        if ($dataPage.is(":visible") && currentTargetUser == data.username)
          changeData(i, ArrayofUsers.users[i].userRoom);
      }
    });

    //the user need to have an answer evalued, so we show the form for assignin scores
    socket.on("answerToEvaluator", (data) => {

      let i = ArrayofUsers.findElement(data.username);
      ArrayofUsers.users[i].currentQuestion = storia.scene[ArrayofUsers.users[i].userRoom];
      ArrayofUsers.users[i].possibleAnswer = data.message;
      //ArrayofUsers.users[i].currentQuestion = "nome: " + storia.scene[ArrayofUsers.users[i].userRoom].nome + "\n e descrizione: " + storia.scene[ArrayofUsers.users[i].userRoom].descrizione;

      $('#' + data.username).addClass('list-group-item-warning');
      $('#soluzioneCorretta').html(`nome: ${ArrayofUsers.users[i].currentQuestion.nome}<br />descrizione: ${ArrayofUsers.users[i].currentQuestion.descrizione}`);
      if (ArrayofUsers.users[i].currentQuestion.widget != "sendImage.html")
        $('#soluzioneProposta').html(data.message);
      else
        $('#soluzioneProposta').html(`<img src=${data.message}>`);

      if (currentTargetUser == data.username && $dataPage.is(":visible"))
        $(".form-group").show();

      showToast(9, data);
    });

    // Whenever the server emits 'login', log the login message
    socket.on("login", (data) => {
      connected = true;
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on("new message", (data) => {
      ArrayofMessages.newMessage(data.username, data.id, "valutatore", data.message);
      if (currentTargetUser == data.username && $chatPage.is(":visible"))
        addChatMessage(data);
      else
        showToast(2, data);
    });
    // Whenever the server emits 'user joined', log it in the chat body
    socket.on("user joined", (data) => {
      if (ArrayofUsers.findElement(data.username) == -1) {
        var $newUser = $(`<li class="list-group-item" id="${data.username.replace(/[^a-zA-Z0-9]/g, "")}">${data.username}</li>`);
        $('#userList').append($newUser);
        showToast(0, data);
      } else
        showToast(7, data);

      ArrayofUsers.newStoria(data.id, data.username, 0, 0, 0, "NULL", "NULL");

      socket.emit("assignGroup", {
        id: data.id,
        groupN: gruppo,
      });

      if (storia.ngruppi != "0") {
        gruppo++;
        if (gruppo == parseInt(storia.ngruppi))
          gruppo = 0;
      }
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on("user left", (data) => {
      let i = 0;
      if ((i = ArrayofUsers.findElement(data.username)) >= 0) {
        showToast(1, data);

        $("#" + data.username.replace(/[^a-zA-Z0-9]/g, "")).remove();

        ArrayofUsers.users.splice(i, 1);
        removeChatTyping(data);

        if (currentTargetUser == data.username) {
          currentTargetId = 0;
          currentTargetUser = 0;

          if ($dataPage.is(":visible"))
            changeScene($usersPage, $dataPage);
          else if ($chatPage.is(":visible"))
            changeScene($usersPage, $chatPage);
        }
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