var $window = $(window);
var $messages = $(".messages"); // Messages area
var $inputMessage = $("#inputMessage"); // Input message input box

var $usersPage = $(".users");
var $dataPage = $('.data');

var ArrayofUsers = new Utenti();
var ArrayofMessages = new Messages();

var currentTargetUser = "";
var currentTargetId = "";
var typing = false;
var socket = io("https://site181993.tw.cs.unibo.it");
var gruppo = 0;
var lastTypingTime;
var storia;
var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 400; // ms


function changeScene(input, output) {

  output.fadeOut(200);
  input.show(500);

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
    answer = answer.concat(`<li class = "list-group-item">Possibile Risposta: ${currentAnswer[0]}</li><li class = "list-group-item">Tempo Massimo: ${currentAnswer[4]}</li><li class = "list-group-item">Punti: ${currentAnswer[3]}</li><li class = "list-group-item">Conduce alla stanza n° ${currentAnswer[1]}</li></ul></li>`);

    $('#SceneAnswers').append(answer);
  }

  //if the current user has some question to be evalued, we show the module for it
  if (ArrayofUsers.users[i].possibleAnswer) {
    var buttons = '';
    for (y in ArrayofUsers.users[i].currentQuestion.risposte)
      buttons = buttons.concat(`<button type="button" id="${y}" class="btn btn-secondary">${ArrayofUsers.users[i].currentQuestion.risposte[y].valore}</button>`);

    $('.btn-group').append(buttons);
    $('#answerForm').show();
  }
}

$(function () {

  if (sessionStorage.getItem('Users')) {
    let usersStored = JSON.parse(sessionStorage.getItem('Users'));

    for (let user in usersStored['users']) {
      $('#userList').append(`<li class="list-group-item" id="${usersStored['users'][user].userUsername.replace(/[^a-zA-Z0-9]/g, "")}">${usersStored['users'][user].userUsername}</li>`);
      ArrayofUsers.newStoria(usersStored['users'][user].userId, usersStored['users'][user].userUsername, usersStored['users'][user].userRoom, 0, usersStored['users'][user].userScore, "NULL", "NULL");
    }
  }

  /*Otteniamo la storia e segniamo al server che ora c'è un Valutatore*/
  $.getJSON(urlStoria, function (data) {
    storia = data;
    socket.emit("add eval", storia.nome);
  });

  /*Chat Section*/

  $('#modalChat').on('shown.bs.modal', () => {
    $(".messages").html("");
    $("#inputMessage").val("");

    $("#modalChatTitle").text(currentTargetUser);

    $("#inputMessage").focus();

    for (i in ArrayofMessages.messages)
      if (currentTargetUser == ArrayofMessages.messages[i].username || currentTargetUser == ArrayofMessages.messages[i].dstUsername)
        addChatMessage(ArrayofMessages.messages[i]);
  });


  $("#button-addon2").click((e) => {

    e.preventDefault();

    if ($("#modalChat").is(":visible") && $inputMessage.val()) {
      sendMessage();
      socket.emit("stop typing");
      typing = false;
    }

  });

  // When the client hits ENTER on their keyboard we treat it as an Enter for the chat
  $window.keydown((e) => {

    if (e.which === 13 && $("#modalChat").is(":visible") && $("#inputMessage").val()) {
      sendMessage();
      socket.emit("stop typing");
      typing = false;
    }

  });

  // da LIST PAGE a DATA PAGE
  $("#userList").on("click", '.list-group-item', (e) => {
    e.preventDefault();

    changeScene($dataPage, $usersPage);

    currentTargetUser = e.currentTarget.id;

    let i = ArrayofUsers.findElement(currentTargetUser);

    $(".navbar-brand").text(currentTargetUser);
    $("#exportFile").hide();
    $("#userStatus").show();
    $("#dataToList").show();
    $("#helpButton").show();
    $("#chatButton").show();

    if (i >= 0) {
      currentTargetId = ArrayofUsers.users[i].userId;
      changeData(i, ArrayofUsers.users[i].userRoom);
    }
  });

  //Risposta da valutatore
  $('.btn-group').on("click", ".btn", (e) => {
    e.preventDefault();

    let i = ArrayofUsers.findElement(currentTargetUser);

    $("#" + currentTargetUser).removeClass("list-group-item-warning");

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

  // da user a list
    $("#dataToList").click((e) => {
    e.preventDefault();

    currentTargetId = 0;
    currentTargetUser = 0;

    $(".navbar-brand").text("Valutatore");
    $("#exportFile").show();
    $("#userStatus").hide();
    $("#dataToList").hide();
    $("#helpButton").hide();
    $("#chatButton").hide();

    changeScene($usersPage, $dataPage);

    $('#SceneAnswers').html("");
    $('.navbar-collapse').collapse('hide');
  });

  //Manda un messaggio d'aiuto al giocatore in crisi
  $('#helpButton').click((e) => {
    e.preventDefault();

    let helpingComment = prompt("Inserisci il suggerimento", "");

    if (helpingComment != null) {
      socket.emit('helpIncoming', currentTargetId, (helpingComment));
      $("#" + currentTargetUser).removeClass("list-group-item-danger");
    }

  });

  //we export the ArrayOfUser in a .json file, checking wich browser the user is currently using
  $('#exportFile').click((e) => {
    e.preventDefault();
    if (confirm('Vuoi scaricare un file .json contentente la storia e i giocatori?')) {
      let obj = {};
      obj["storia"] = storia;
      obj["giocatori"] = ArrayofUsers;

      let data = JSON.stringify(obj);

      let file = new Blob([data], {
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
    }
  })
});