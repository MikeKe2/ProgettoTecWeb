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

var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 400; // ms


// Initialize variables
var $window = $(window);
var $usernameInput = $(".usernameInput"); // Input for username
var $messages = $(".messages"); // Messages area
var $inputMessage = $("#inputMessage"); // Input message input box
var $chatPage = $("#chat"); // The chatroom page


var socket = io.connect("https://site181993.tw.cs.unibo.it");

// Prompt for setting a username
var username;
var connected = false;
var typing = false;
var lastTypingTime;
var ArrayofMessages = new Messages();