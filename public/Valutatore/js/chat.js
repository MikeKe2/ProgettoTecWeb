function sendMessage() {
  let message = $inputMessage.val();

  ArrayofMessages.newMessage("valutatore", "0", currentTargetUser, message);

  // Prevent markup from being injected into the message
  message = cleanInput(message);

  // if there is a non-empty message and a socket connection
  if (message && connected) {
    $inputMessage.val("");
    addChatMessage({
      username: "valutatore",
      message: message,
    });
    // tell server to execute 'new message' and send along one parameter
    socket.emit("new eval message", currentTargetId, (message));
  }
}

// Adds the visual chat message to the message list
function addChatMessage(data, options) {
  // Don't fade the message in if there is an 'X was typing'
  var $typingMessages = getTypingMessages(data);
  options = options || {};
  if ($typingMessages.length !== 0) {
    options.fade = false;
    $typingMessages.remove();
  }

  if (data.username == 'valutatore')
    var $messageBodyDiv = $('<div class="messageBody eval">').text(data.message);

  else
    var $messageBodyDiv = $('<div class="messageBody player">').text(data.message);
  var typingClass = data.typing ? "typing" : "";
  var $messageDiv = $('<li class="message"/>')
    .data("username", data.username)
    .addClass(typingClass)
    .append($messageBodyDiv);

  addMessageElement($messageDiv, options);

  if (data.username == 'valutatore') {
    $(".message:last-child").addClass("evaluator");
  }
  window.scrollTo(0, document.body.scrollHeight);
}

// Adds the visual chat typing message
const addChatTyping = (data) => {
  data.typing = true;
  data.message = "is typing";
  addChatMessage(data);
};

// Removes the visual chat typing message
function removeChatTyping(data) {
  getTypingMessages(data).fadeOut(function () {
    $(this).remove();
  });
}

// Adds a message element to the messages and scrolls to the bottom
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


socket.on('score', (data) => {
  let i = ArrayofUsers.findElement(data.username);
  ArrayofUsers.users[i].userScore += data.score;

  if (storia.scene[ArrayofUsers.users[i].userRoom].nome == "Fine") {
    $('#' + data.username).html(`${data.username} ha finito la storia con: ${ArrayofUsers.users[i].userScore} punti`);
    $('#' + data.username).addClass('list-group-item-info');
    $(".progress-bar").css({
      'width': 100 + '%'
    });
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
    sessionStorage.setItem('Users', JSON.stringify(ArrayofUsers));
  }
});

//the user need to have an answer evalued, so we show the form for assignin scores
socket.on("answerToEvaluator", (data) => {
  let i = ArrayofUsers.findElement(data.username);

  ArrayofUsers.users[i].currentQuestion = storia.scene[ArrayofUsers.users[i].userRoom];
  ArrayofUsers.users[i].possibleAnswer = data.message;

  sessionStorage.setItem('Users', JSON.stringify(ArrayofUsers));

  $('#' + data.username).addClass('list-group-item-warning');

  if (currentTargetUser == data.username && $dataPage.is(":visible")) {
    $('.btn-group').html("");

    $("#domandaNome").val(ArrayofUsers.users[i].currentQuestion.nome);
    $("#domandaDesc").val(ArrayofUsers.users[i].currentQuestion.descrizione);

    if (storia.scene[ArrayofUsers.users[i].userRoom].widget == "sendImage.html" || storia.scene[ArrayofUsers.users[i].userRoom].widget == "canvas.html")
      $('#soluzioneProposta').html(`<img style="width:100%" id=soluzioneProposta src=${ArrayofUsers.users[i].possibleAnswer}>`);
    else
      ArrayofUsers.users[i].possibleAnswer ? $("#soluzioneProposta").html(`<input type="text" class="form-control" id=soluzioneProposta value=${ArrayofUsers.users[i].possibleAnswer} readonly></input>`) : $("#soluzioneProposta").html(`<input type="text" class="form-control" id=soluzioneProposta value="il giocatore non ha scritto nulla" readonly></input>`);
  
    let buttons = '';
    buttons = buttons.concat(`<button type="button" id="${-1}" class="btn btn-secondary">Nessuna di queste</button>`);
    for (y in ArrayofUsers.users[i].currentQuestion.risposte)
      buttons = buttons.concat(`<button type="button" id="${y}" class="btn btn-secondary">${ArrayofUsers.users[i].currentQuestion.risposte[y].valore}</button>`);

    $('.btn-group').append(buttons);

    $('#evaluatedAnswer').show();
  }
  showToast(9, data);
});

// Whenever the server emits 'login', log the login message
socket.on("login", () => {
  connected = true;
});

// Whenever the server emits 'new message', update the chat body
socket.on("new message", (data) => {
  ArrayofMessages.newMessage(data.username, data.id, "valutatore", data.message);
  if ($('#modalChat').is(':visible'))
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
    
    socket.emit("assignGroup", {
      id: data.id,
      groupN: gruppo,
    });

    ArrayofUsers.newStoria(data.id, data.username, 0, 0, 0, gruppo, null, null);
    sessionStorage.setItem('Users', JSON.stringify(ArrayofUsers));
    
    if (parseInt(storia.ngruppi) > 1) {
      gruppo++;
      if (gruppo >= parseInt(storia.ngruppi))
        gruppo = 0;
    }
  }
});

// Whenever the server emits 'user left', log it in the chat body
socket.on("user left", (data) => {
  let i;
  if ((i = ArrayofUsers.findElement(data.username)) >= 0) {
    showToast(1, data);

    $("#" + data.username.replace(/[^a-zA-Z0-9]/g, "")).remove();

    ArrayofUsers.users.splice(i, 1);
    removeChatTyping(data);

    if (ArrayofUsers.numberOfUsers() > 0)
      sessionStorage.setItem('Users', JSON.stringify(ArrayofUsers));
    else
      sessionStorage.removeItem('Users');

    if (currentTargetUser == data.username) {
      currentTargetId = 0;
      currentTargetUser = 0;

      if ($dataPage.is(":visible")) {
        changeScene($usersPage, $dataPage);
        $(".navbar-brand").text("Valutatore");
        $("#exportFile").show();
        $("#userStatus").hide();
        $("#dataToList").hide();
        $("#helpButton").hide();
        $("#chatButton").hide();
        if ($('#modalChat').is(":visible"))
          $('#modalChat').modal('toggle');
      }
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
  if ("valutatore") {
    socket.emit("add eval", "valutatore");
  }
});

socket.on("reconnect_error", () => {
  showToast(4);
});