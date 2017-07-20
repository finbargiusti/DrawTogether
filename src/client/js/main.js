let controls = document.getElementById("controls");
let createLobbyBtn = document.getElementById("createLobby");
let writingUtensils = document.getElementById("writingUtensils");
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
let createLobbyClose = document.getElementById("createLobbyClose");
let canvasholder = document.getElementById("canvases");
let colorPickContainer = document.getElementById("colorpick");
let openColorPickButton = document.getElementById("openColorPickMenu");
let closeColorPickButton = document.getElementById("colorpickclose");
let eyeDropSelect = document.getElementById("eyeDrop");

let validationClock;
let ctx = null;
let playerCtx = null;
let bgColor = null;
let mouseX = 0, mouseY = 0, mousePressed = false;
let lastPosition = {x: 0, y: 0};
let currColor = "rgb(0,0,0)";
let brushSize = Number(sizeSlider.value);
let r = Math.round;
let lobbyID = null;
let playerData = {};
let eyeDropperSelected = false;
let currentUI = "menu";
let currEyeDropperColor = null;
let palette = [];

colorPickContainer.style.display = "none";

eyeDropSelect.addEventListener("click", function() {
    eyeDropSelect.style.border = "3px solid #2ECC40";
    eyeDropSelect.style.textShadow = "0px 0px 10px white";
    eyeDropperSelected = true;
});

document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    let thisPosition = {
        x: r(mouseXElement(canvas)),
        y: r(mouseYElement(canvas))
    };

    if (connected && lobbyID) { // Send cursor information
        socket.send(JSON.stringify([9, r(thisPosition.x), r(thisPosition.y), (eyeDropperSelected)?currEyeDropperColor:currColor, getCursorType(), brushSize]));
    }

    if (mousePressed && !eyeDropperSelected && colorPickContainer.style.display === "none" && currentUI == "draw") {
        if (pencilRadio.checked) { // Draw line
            socket.send(JSON.stringify([10, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), currColor, brushSize]));
        } else if (rubberRadio.checked) { // Erase line
            socket.send(JSON.stringify([11, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), brushSize]));
        } else if (brushRadio.checked) { // Brush line
            socket.send(JSON.stringify([12, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), currColor, brushSize]));
        }

        if (usingNewColor && (pencilRadio.checked || brushRadio.checked)) { // Send new color for palette update
            socket.send(JSON.stringify([50, currColor]));
            usingNewColor = false;
        }
    }

    if (eyeDropperSelected) { // Update eyedropper's color based on pixel below it
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let currentIndex = (Math.clamp(thisPosition.x, 0, canvas.width)*4)+Math.clamp(thisPosition.y, 0, canvas.height)*canvas.width*4;
        currEyeDropperColor = "rgb("+imageData.data[currentIndex] +","+ imageData.data[currentIndex+1] + "," + imageData.data[currentIndex+2] + ")"
    }

    lastPosition.x = mouseXElement(canvas), lastPosition.y = mouseYElement(canvas);
});
document.addEventListener("mousedown", function() {
    if (eyeDropperSelected) {
        if (currEyeDropperColor !== currColor) usingNewColor = true;
        updateColorPickerFromRGB(currEyeDropperColor);
        currColor = currEyeDropperColor;
        eyeDropperSelected = false;
        eyeDropSelect.style.border = "3px solid gray";
        eyeDropSelect.style.textShadow = "none";
        openColorPickButton.style.backgroundColor = currColor;
    }
    
    mousePressed = true;
});
document.addEventListener("mouseup", function() {
    mousePressed = false;
});
// Makes popups be closable
let popupCloseButtons = document.getElementsByClassName("fa fa-window-close fa-lg");
for (let i = 0; i < popupCloseButtons.length; i++) {
    popupCloseButtons[i].addEventListener("click", function() {
        popupCloseButtons[i].parentNode.parentNode.style.display = "none";
    })
}
createLobbyClose.addEventListener("click", function() {
    clearInterval(validationClock);
});
