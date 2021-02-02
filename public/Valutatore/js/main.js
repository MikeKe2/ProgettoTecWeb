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
var socket = io.connect("https://site181993.tw.cs.unibo.it");
var gruppo = 0;
var lastTypingTime;
var storia;
var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 400; // ms


function distances(gruppo) {
  let nodes = Array(storia.scene.length).fill(0);
  let changes;
  nodes[1] = 1;
  do {
    changes = 0;

    for (let j = 0; j < storia.scene.length; j++) {
      if (!(!storia.scene[j].risposte || storia.scene[j].risposte.length == 0)) {

        let min = storia.scene.length + 1;

        for (let k = 0; k < storia.scene[j].risposte.length; k++) {
          let num = nodes[storia.scene[j].risposte[k].to[gruppo] * 1];
          min = num != 0 && num < min ? num : min;
        }
        if (min != 0)
          min++;
        if (min != nodes[j]) {
          nodes[j] = min;
          changes++;
        }
      }
    }
  } while (changes > 0)
  return nodes.map(i => i - 1);
}

function changeScene(input, output) {

  output.fadeOut(200);
  input.show(500);

  output.prop("disabled", true);
  input.prop("disabled", false);
}

function changeData(i, numRoom) {

  //We clean the possible remains of another user
  $("#evaluatedAnswer").hide();
  $('#sceneAnswers').html("");
  $('.btn-group').html("");

  //We show the current info on the selected user, such as Room number, name and description
  $("#userStatus").html("Si trova nella stanza: " + numRoom + " - " + storia.scene[numRoom].nome);
  storia.scene[numRoom].nome ? $("#SceneName").html(storia.scene[numRoom].nome) : $("#SceneName").html("non inserito");
  storia.scene[numRoom].descrizione ? $("#SceneDescrizione").html(storia.scene[numRoom].descrizione) : $("#SceneDescrizione").html("non inserito");
  if (storia.scene[numRoom] == "image.html")
    insertImage(numRoom);

  let distance = distances(ArrayofUsers.users[i].userGroup);
  let k = distance[numRoom];
  let statusProgressbar = 100 - ((100 * (k)) / Math.max(...distance));
  $(".progress-bar").css({
    'width': statusProgressbar + '%'
  });

  let totalAnswer = ``;
  //we show the possible answer to the current Room, and various data
  if (numRoom > 0) {
    for (y in storia.scene[numRoom].risposte) {
      let currentAnswer = Object.values(storia.scene[numRoom].risposte[y]);
      let proxSceneIndex = currentAnswer[1][ArrayofUsers.users[i].userGroup];
      let answer = $("#answers").html()
        .replaceAll("$y", y)
        .replaceAll("$CA0", currentAnswer[0])
        .replace("$CA1", proxSceneIndex + " - " + storia.scene[proxSceneIndex].nome)
        .replace("$CA3", currentAnswer[3])
        .replace("$CA4", parseInt(currentAnswer[2]) == 0 ? "Illimitato" : currentAnswer[2] + " Secondi");
      totalAnswer += answer;
    }
  }

  $('#sceneAnswers').html(totalAnswer);
  $('.btn-group').html("");

  //if the current user has some question to be evalued, we show the module for it
  if (ArrayofUsers.users[i].possibleAnswer != null) {
    $('#evaluatedAnswer').show();
    populatePossibleRisp(ArrayofUsers, i);
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
      if (ArrayofUsers.findElement(usersStored['users'][user].userId) == -1) {
        $('#userList').append(`<li class="list-group-item" id="${usersStored['users'][user].userId}">${usersStored['users'][user].userUsername}</li>`);
        ArrayofUsers.newStoria(usersStored['users'][user].userId, usersStored['users'][user].userUsername, usersStored['users'][user].userRoom, usersStored['users'][user].userTimer, usersStored['users'][user].userScore, usersStored['users'][user].userGroup, usersStored['users'][user].currentQuestion, usersStored['users'][user].possibleAnswer);
      }
    }
  }

  /*Otteniamo la storia e segniamo al server che ora c'è un Valutatore*/
  $.getJSON(urlStoria, (data) => {
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

    currentTargetId = e.currentTarget.id;
    let i = ArrayofUsers.findElement(currentTargetId);
    currentTargetUser = ArrayofUsers.users[i].userUsername;

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

    let i = ArrayofUsers.findElement(currentTargetId);

    $("#" + currentTargetId).removeClass("list-group-item-warning");

    if (ArrayofUsers.users[i].currentQuestion.nome == "Fine") {
      ArrayofUsers.users[i].userScore += ArrayofUsers.users[i].currentQuestion.risposte[e.currentTarget.id].points;
      $('#' + currentTargetId).addClass('list-group-item-info');
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

    let i = ArrayofUsers.findElement(currentTargetId);
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
      $("#" + currentTargetId).removeClass("list-group-item-danger");
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
  $(".CanvasModalClose").click(function () {
    $("#CanvasModal").modal("hide");;
  })
});

function populatePossibleRisp(ArrayofUsers, i) {
  $('.btn-group').html("");
  $("#domandaNome").val(ArrayofUsers.users[i].currentQuestion.nome);
  $("#domandaDesc").val(ArrayofUsers.users[i].currentQuestion.descrizione);

  let sol;
  if (storia.scene[ArrayofUsers.users[i].userRoom].widget == "sendImage.html" || storia.scene[ArrayofUsers.users[i].userRoom].widget == "canvas.html")
    sol = $('#imgRisposta').html().replace("$IMG", ArrayofUsers.users[i].possibleAnswer);
  else
    sol = $("#textRisposta").html().replace("$VAL", ArrayofUsers.users[i].possibleAnswer ? ArrayofUsers.users[i].possibleAnswer : "il giocatore non ha scritto nulla");

  $('#soluzioneProposta').html(sol)
  let buttons = '';
  buttons = buttons.concat($("#btnRisps").html().replace("$ID", "-1").replace("$VAL", "nessuna di queste"));
  for (y in ArrayofUsers.users[i].currentQuestion.risposte)
    buttons = buttons.concat($("#btnRisps").html().replace("$ID", y).replace("$VAL", ArrayofUsers.users[i].currentQuestion.risposte[y].valore));
  $('.btn-group').append(buttons);
}