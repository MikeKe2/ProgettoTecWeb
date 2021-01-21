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
        $('#soluzioneProposta').html(`<img style="width:20vw" src=${data.message}>`);

    if (currentTargetUser == data.username && $dataPage.is(":visible")) {
        var buttons = '';
        for (y in ArrayofUsers.users[i].currentQuestion.risposte)
            buttons = buttons.concat(`<button type="button" id="${y}" class="btn btn-secondary">${ArrayofUsers.users[i].currentQuestion.risposte[y].valore}</button>`);
        $('.btn-group').append(buttons)
        $('#answerForm').show();
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
    }

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
    if ("valutatore") {
        socket.emit("add eval", "valutatore");
    }
});

socket.on("reconnect_error", () => {
    showToast(4);
});