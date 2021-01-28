/*Toast Pop-up*/

function Toast(type, msg) {
    this.type = type;
    this.msg = msg;
}

var toasts = [
    new Toast('success', 'è entrato in chat.'),
    new Toast('warning', 'ha lasciato la chat.'),
    new Toast('info', 'ha lasciato un messaggio nella sua chat.'),
    new Toast('error', 'Connessione al server terminata.'),
    new Toast('info', 'Tentativo di riconnessione in corso....'),
    new Toast('success', 'Sei stato riconnesso!'),
    new Toast('info', 'Collegamento avvenuto con successo.'),
    new Toast('info', "Ulteriore dispositivo collegato all'account: "),
    new Toast('error', "L'utente "),
    new Toast('info', ' attende valutazione per una risposta'),
];

function showToast(i, data) {
    var t = toasts[i];

    switch (i) {
        case 0:
            toastr[t.type](`${data.username} ${t.msg}`);
            break;
        case 1:
            toastr[t.type](`${data.username} ${t.msg}`);
            break;
        case 2:
            toastr[t.type](`${data.username} ${t.msg}`);
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
        case 6:
            toastr[t.type](t.msg);
            break;
        case 7:
            toastr[t.type](t.msg + data.username);
            break;
        case 8:
            toastr[t.type](`${t.msg + data.username} richiede il suo aiuto`);
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
toastr.options.positionClass = 'toast-top-left';
toastr.options.timeOut = 2500;
toastr.options.fadeOut = 150;
toastr.options.fadeIn = 150;

/*Messages*/

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
    allMessages() {
        return this.messages;
    }
    // this could include summary stats like average score, etc. For simplicy, just the count for now
    numberOfMessages() {
        return this.messages.length;
    }
};

/*Users*/

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

    numberOfUsers() {
        return this.users.length;
    }

};