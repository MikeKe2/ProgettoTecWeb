function changeColour(data) {
    ctx.beginPath();
    ctx.strokeStyle = data;
    ctx.lineWidth = 4;
}

var canvas = document.getElementById('sketchpad');
var ctx;

// If the browser supports the canvas tag, get the 2d drawing context for this canvas
if (canvas.getContext) {
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 4;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

var drawing = false;
var mousePos = {
    x: 0,
    y: 0
};
var lastPos = mousePos;

// Check that we have a valid context to draw on/with before adding event handlers
if (ctx) {

    canvas.addEventListener("mousedown", function (e) {
        drawing = true;

        lastPos = getMousePos(canvas, e);
    }, false);

    canvas.addEventListener("mouseup", function (e) {
        drawing = false;
    }, false);

    canvas.addEventListener("mousemove", function (e) {
        mousePos = getMousePos(canvas, e);
    }, false);

    canvas.addEventListener("touchstart", function (e) {
        mousePos = getTouchPos(canvas, e);

        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });

        canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchend", function (e) {
        var mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchmove", function (e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);
}

function getMousePos(canvasDom, mouseEvent) {

    var rect = canvasDom.getBoundingClientRect();

    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
}

function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

// Get a regular interval for drawing to the screen
window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimaitonFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
// Draw to the canvas
function renderCanvas() {
    if (drawing) {
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        lastPos = mousePos;
    }
}

// Allow for animation
(function drawLoop() {
    requestAnimFrame(drawLoop);
    renderCanvas();
})();

function clearCanvas(canvas, ctx) {
    canvas.width = canvas.width;
}