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

var $window = $(window);
var $messages = $(".messages"); // Messages area
var $inputMessage = $("#inputMessage"); // Input message input box

var $usersPage = $(".users.page");
var $chatPage = $(".chat.page");
var $dataPage = $('.data.page');

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
