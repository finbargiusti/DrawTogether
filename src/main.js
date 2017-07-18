let controls = document.getElementById("controls");
let createLobbyBtn = document.getElementById("createLobby");
let writingUtensils = document.getElementById("writingUtensils");
let colorTxtField = document.getElementById("colorPick");
let submitIDBtn = document.getElementById("submitId");
let lobbyIDInput = document.getElementById("lobbyId");
let canvas = document.getElementById("canvas");
let playerCanvas = document.getElementById("playerCanvas");
let idDisplayP = document.getElementById("idDisplay");
let pencilRadio = document.getElementById("pencil");
let rubberRadio = document.getElementById("rubber");
let brushRadio = document.getElementById("brush");
let sizeSlider = document.getElementById("sizeSlider");
let optionPanel = document.getElementById("options");
let createLobbyConfirm = document.getElementById("createLobbyConfirm");
let createLobbyWidth = document.getElementById("createLobbyWidth");
let createLobbyHeight = document.getElementById("createLobbyHeight");
let createLobbyBgColor = document.getElementById("createLobbyBgColor");
let canvasholder = document.getElementById("canvases");
let ctx = null;
let playerCtx = null;
let bgColor = null;
let mouseX = 0, mouseY = 0, mousePressed = false;
let lastPosition = {
    x: 0,
    y: 0
};
let brushSize = Number(sizeSlider.value);
let r = Math.round;
let lobbyID = null;
let playerData = {};

function mouseXElement(element) {
    return (mouseX - element.getBoundingClientRect().left) ;
}
function mouseYElement(element) {
    return (mouseY - element.getBoundingClientRect().top) ;
}

document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    let thisPosition = {
        x: mouseXElement(canvas),
        y: mouseYElement(canvas)
    };

    if (connected && lobbyID) {
        let type = 0;

        if (rubberRadio.checked) {
            type = 1;
        } else if (brushRadio.checked) {
            type = 2;
        }

        socket.send(JSON.stringify([9, r(thisPosition.x), r(thisPosition.y), colorTxtField.value, type, brushSize]));
    }


    if (mousePressed) {
        if (pencilRadio.checked) { // Draw line
            socket.send(JSON.stringify([10, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), colorTxtField.value, brushSize]));
        } else if (rubberRadio.checked) { // Erase line
            socket.send(JSON.stringify([11, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), brushSize]));
        } else if (brushRadio.checked) { // Brush line
            socket.send(JSON.stringify([12, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), colorTxtField.value, brushSize]));
        }
    }

    lastPosition.x = mouseXElement(canvas), lastPosition.y = mouseYElement(canvas);
});
sizeSlider.addEventListener("change", function() {
    brushSize = Number(sizeSlider.value);
});
document.addEventListener("mousedown", function() {
    mousePressed = true;
});
document.addEventListener("mouseup", function() {
    mousePressed = false;
});
createLobbyBtn.addEventListener("click", function() {
    optionPanel.style.display = "block";
});
createLobbyConfirm.addEventListener("click", function() {
    createLobbyRequest(Number(createLobbyWidth.value), Number(createLobbyHeight.value), createLobbyBgColor.value);
});
submitIDBtn.addEventListener("click", function() {
    joinLobbyRequest(Number(lobbyIDInput.value));
});
colorTxtField.addEventListener("keydown", function() {
    setTimeout(function() {
        colorTxtField.style.borderColor = colorTxtField.value;
    }, 16);
});
