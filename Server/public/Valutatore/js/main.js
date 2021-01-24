function changeScene(input, output) {

  output.fadeOut(200);
  input.show(800);

  output.prop("disabled", true);
  input.prop("disabled", false);
}

function changeData(i, numRoom) {
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
    answer = answer.concat(`<li class = "list-group-item">Tempo Massimo: ${currentAnswer[4]}</li>`);
    answer = answer.concat(`<li class = "list-group-item">Punti: ${currentAnswer[3]}</li>`);
    answer = answer.concat(`<li class = "list-group-item">Conduce alla stanza n° ${currentAnswer[1]}</li>`);
    answer = answer.concat('</ul></li>');

    $('#SceneAnswers').append(answer);
  }

  //if the current user has some question to be evalued, we show the module for it
  if (ArrayofUsers.users[i].possibleAnswer != "NULL") {
    var buttons = '';
    for (y in ArrayofUsers.users[i].currentQuestion.risposte)
      buttons = buttons.concat(`<button type="button" id="${y}" class="btn btn-secondary">${ArrayofUsers.users[i].currentQuestion.risposte[y].valore}</button>`);

    $('.btn-group').append(buttons);
    $('#answerForm').show();
  }
}

$(function () {

  $.getJSON(urlStoria, function (data) {
    storia = data;
    socket.emit("add eval", storia.nome);
  });

  // When the client hits ENTER on their keyboard we treat it as an Enter for the chat
  $window.keydown((e) => {
    if (e.which === 13 && $chatPage.is(":visible") && $("#inputMessage").val()) {
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
  $("#userList").on("click", '.list-group-item', (e) => {
    e.preventDefault();
    changeScene($dataPage, $usersPage);

    currentTargetUser = e.currentTarget.id;
    $('#currentUser').html(currentTargetUser);

    let i = ArrayofUsers.findElement(currentTargetUser);
    if (i >= 0) {
      currentTargetId = ArrayofUsers.users[i].userId;
      changeData(i, ArrayofUsers.users[i].userRoom);
    }
  });

  //when asked to assing a score to a player, we send the value from the RangeValue 
  $('.btn-group').on("click", ".btn", (e) => {
    e.preventDefault();

    let i = ArrayofUsers.findElement(currentTargetUser);

    var element = document.getElementById(currentTargetUser);
    element.className = element.className.replace(/\blist-group-item-warning\b/g, "");

    if (ArrayofUsers.users[i].currentQuestion.nome == "Fine") {
      ArrayofUsers.users[i].userScore += ArrayofUsers.users[i].currentQuestion.risposte[e.currentTarget.id].points;
      $('#' + data.username).addClass('list-group-item-info');
      $(".progress-bar").css({
        'width': 100 + '%'
      });
    } else
      socket.emit('answerFromEvaluator', currentTargetId, e.currentTarget.id);

    ArrayofUsers.users[i].possibleAnswer = "NULL";
    ArrayofUsers.users[i].currentQuestion = "NULL";

    //we close the answer form
    $('.btn-group').html("");
    $("#answerForm").fadeOut();

  });

  // DATA PAGE ==> CHAT PAGE
  $("#chatButton").click((e) => {
    e.preventDefault();

    $('#currentChatUser').html(currentTargetUser);
    changeScene($chatPage, $dataPage);
    $("#inputMessage").focus();

    for (i in ArrayofMessages.messages)
      if (currentTargetUser == ArrayofMessages.messages[i].username || currentTargetUser == ArrayofMessages.messages[i].dstUsername)
        addChatMessage(ArrayofMessages.messages[i]);

    window.scrollTo(0, document.body.scrollHeight);
  });

  // LIST PAGE ==> DATA PAGE
  $("#FromDataToList").click((e) => {
    e.preventDefault();

    currentTargetId = 0;
    currentTargetUser = 0;
    changeScene($usersPage, $dataPage);
    $('#SceneAnswers').html("");
    $('.navbar-collapse').collapse('hide');
  });

  $("#FromChatToData").click((e) => {
    e.preventDefault();

    changeScene($dataPage, $chatPage);
    $(".messages").html("");
  })

  //If the evaluator click the helping button we control the message, if not null we send it to the current user
  $('#helpButton').click((e) => {
    e.preventDefault();

    var helpingComment = prompt("Please enter the helping hint", "");
    if (helpingComment != null) {
      socket.emit('helpIncoming', currentTargetId, (helpingComment));
      var element = document.getElementById(currentTargetUser);
      element.className = element.className.replace(/\blist-group-item-danger\b/g, "");
    }
  });

  //we export the ArrayOfUser in a .json file, checking wich browser the user is currently using
  $('#exportIron').click((e) => {
    e.preventDefault();

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
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      }
    } else
      alert("Nessun Giocatore");
  })
});