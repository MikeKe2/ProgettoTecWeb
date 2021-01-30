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
//var socket = io.connect("https://site181993.tw.cs.unibo.it");
var socket = io.connect("http://localhost:8000");
var gruppo = 0;
var lastTypingTime;
var storia;
var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 400; // ms
var found = false,
  indx = 0;

function findRoom(i, numRoom, userGruppo) {
  if (storia.scene[numRoom].nome == "Fine") {
    found = true;
    return indx = i;
  } else {
    if (i <= storia.scene.length && !found) {
      i++;
      for (risposta in storia.scene[numRoom].risposte) {
        findRoom(i, storia.scene[numRoom].risposte[parseInt(risposta)].to[userGruppo], userGruppo);
        if (found)
          break;
      }
    }
  }
  return indx;
}


function changeScene(input, output) {

  output.fadeOut(200);
  input.show(500);

  output.prop("disabled", true);
  input.prop("disabled", false);
}

function changeData(i, numRoom) {

  //We clean the possible remains of another user
  $("evaluatedAnswer").hide();
  $('#sceneAnswers').html("");
  $('.btn-group').html("");

  //We show the current info on the selected user, such as Room number, name and description
  $("#userStatus").html("Si trova nella stanza: " + numRoom);
  storia.scene[numRoom].nome ? $("#SceneName").html(storia.scene[numRoom].nome) : $("#SceneName").html("non inserito");
  storia.scene[numRoom].descrizione ? $("#SceneDescrizione").html(storia.scene[numRoom].descrizione) : $("#SceneDescrizione").html("non inserito");
  if (storia.scene[numRoom] == "image.html")
    insertImage(numRoom);

  let k = findRoom(0, numRoom, ArrayofUsers.users[i].userGroup); //numRoom;
  found = false;
  let statusProgressbar = (100 * (numRoom)) / k;
  $(".progress-bar").css({
    'width': statusProgressbar + '%'
  });

  let totalAnswer = ``;
  //we show the possible answer to the current Room, and various data
  for (y in storia.scene[numRoom].risposte) {
    let currentAnswer = Object.values(storia.scene[numRoom].risposte[y]);
    let answer = `
    <div class="accordion-item">
      <h2 class="accordion-header" id="flush-heading${y}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
          data-bs-target="#flush-collapse${y}">
          Possibile Risposta : ${currentAnswer[0]}
        </button>
      </h2>
      <div id="flush-collapse${y}" class="accordion-collapse collapse" aria-labelledby="flush-heading${currentAnswer[0]}"
        data-bs-parent="#sceneAnswers">
        <div class="accordion-body">
        <p>Tempo Massimo: ${currentAnswer[4]}</p>
        <p>Punti: ${currentAnswer[3]}</p>
        <p>Conduce alla stanza n°  <input type="button" class="btn btn-outline-secondary changeRoom" value="${currentAnswer[1]}" id="${y}"></input></p>
        </div>
      </div>
    </div>`
    totalAnswer += answer
  }
  $('#sceneAnswers').html(totalAnswer);

  //if the current user has some question to be evalued, we show the module for it
  if (ArrayofUsers.users[i].possibleAnswer != undefined) {
    $("#evaluatedAnswer").show();

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
  }
};

async function insertImage(numRoom) {
  await $.ajax({
    url: '/media/' + storia.creatore + '/widgets/' + storia.scene[numRoom].widget,
    success: (data) => {
      var image = data.replace("$SRC", '/media/' + storia.creatore + '/images/' + storia.scene[numRoom].img).replaceAll("$DESC", storia.scene[numRoom].imgdescription);
      $("#immagine").html(image);
    },
    error: (err) => {
      console.log(err);
    }
  });
};

$(function () {

  if (sessionStorage.getItem('Users')) {
    let usersStored = JSON.parse(sessionStorage.getItem('Users'));

    for (let user in usersStored['users']) {
      $('#userList').append(`<li class="list-group-item" id="${usersStored['users'][user].userUsername.replace(/[^a-zA-Z0-9]/g, "")}">${usersStored['users'][user].userUsername}</li>`);
      ArrayofUsers.newStoria(usersStored['users'][user].userId, usersStored['users'][user].userUsername, usersStored['users'][user].userRoom, usersStored['users'][user].userTimer, usersStored['users'][user].userScore, usersStored['users'][user].userGroup, usersStored['users'][user].currentQuestion, usersStored['users'][user].possibleAnswer);
      if (usersStored['users'][user].possibleAnswer != undefined)
        $('#' + usersStored['users'][user].userUsername).addClass('list-group-item-warning');
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
      socket.emit("answerFromEvaluator", currentTargetId, e.currentTarget.id);
    
    ArrayofUsers.users[i].possibleAnswer = null;
    ArrayofUsers.users[i].currentQuestion = null;
    //we close the answer form
    $("#evaluatedAnswer").hide();
  });

  $('#sceneAnswers').on("click", ".btn", (e) => {
    e.preventDefault();

    let i = ArrayofUsers.findElement(currentTargetUser);
    socket.emit("changeRoom", currentTargetId, e.currentTarget.id);

    if (ArrayofUsers.users[i].possibleAnswer != undefined)
      ArrayofUsers.users[i].possibleAnswer = ArrayofUsers.users[i].currentQuestion = null;
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

    $('#sceneAnswers').html("");
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