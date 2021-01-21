function sendMessage() {
    var message = $inputMessage.val();
  
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
