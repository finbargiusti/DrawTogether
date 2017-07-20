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

colorPickContainerstyle.display = "none";



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

    if (connected && lobbyID) {
        let type = 0;

        if (rubberRadio.checked) {
            type = 1;
        } else if (brushRadio.checked) {
            type = 2;
        }
        if (eyeDropperSelected) {
            type = 3;
        }

        socket.send(JSON.stringify([9, r(thisPosition.x), r(thisPosition.y), (eyeDropperSelected)?currEyeDropperColor:currColor, type, brushSize]));
    }


    if (mousePressed && !eyeDropperSelected && colorPickContainer.style.display === "none" && currentUI == "draw") {
        if (pencilRadio.checked) { // Draw line
            socket.send(JSON.stringify([10, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), currColor, brushSize]));
        } else if (rubberRadio.checked) { // Erase line
            socket.send(JSON.stringify([11, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), brushSize]));
        } else if (brushRadio.checked) { // Brush line
            socket.send(JSON.stringify([12, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), currColor, brushSize]));
        }

        if (usingNewColor && (pencilRadio.checked || brushRadio.checked)) {
            socket.send(JSON.stringify([50, currColor]));
            usingNewColor = false;
        }
    }

    if (eyeDropperSelected) {
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let currentIndex = (Math.clamp(thisPosition.x, 0, canvas.width)*4)+Math.clamp(thisPosition.y, 0, canvas.height)*canvas.width*4;
        currEyeDropperColor = "rgb("+imageData.data[currentIndex] +","+ imageData.data[currentIndex+1] + "," + imageData.data[currentIndex+2] + ")"
    }

    lastPosition.x = mouseXElement(canvas), lastPosition.y = mouseYElement(canvas);
});
sizeSlider.addEventListener("change", function() {
    brushSize = Number(sizeSlider.value);
});
document.addEventListener("mousedown", function() {
    if (eyeDropperSelected) {
        if (currEyeDropperColor !== currColor) usingNewColor = true;

        let rawRgb = currEyeDropperColor.slice(4).slice(0, -1);
        let rgbArr = rawRgb.split(",");
        let hsv = rgbToHsv(rgbArr[0], rgbArr[1], rgbArr[2]);
        colorSlider.value = hsv[0] * 360;
        circleX = hsv[1] * colorCanvas.width;
        circleY = (1 - hsv[2]) * colorCanvas.height;

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
createLobbyBtn.addEventListener("click", function() {
    optionPanel.style.display = "block";
    optionPanel.getElementsByClassName("popup")[0].style.left = "50%";
    optionPanel.getElementsByClassName("popup")[0].style.top = "50%";
    validationClock = setInterval(validateCreateLobby, 0);
});
createLobbyConfirm.addEventListener("click", function() {
    if (validateCreateLobby()) {
        createLobbyRequest(parseInt(createLobbyWidth.value), parseInt(createLobbyHeight.value), createLobbyBgColor.value);
    }
});
submitIDBtn.addEventListener("click", function() {
    joinLobbyRequest(Number(lobbyIDInput.value));
});
createLobbyBgColor.addEventListener("keydown", function() {
    setTimeout(function() {
        createLobbyBgColor.style.borderColor = createLobbyBgColor.value;
    }, 16);
});
let popupCloseButtons = document.getElementsByClassName("fa fa-window-close fa-lg");
for (let i = 0; i < popupCloseButtons.length; i++) {
    popupCloseButtons[i].addEventListener("click", function() {
        popupCloseButtons[i].parentNode.parentNode.style.display = "none";
    })
}
createLobbyClose.addEventListener("click", function() {
    clearInterval(validationClock);
});
closeColorPickButton.addEventListener("click", function() {
    clearInterval(colorUpdateClock);
    openColorPickButton.style.backgroundColor = currColor;
});
openColorPickButton.addEventListener("click", function() {
    colorUpdateClock = setInterval(colorUpdate);
    colorPickContainer.style.display = "block";
});

function validateCreateLobby() {
    if (Number(createLobbyWidth.value) >= 256 && Number(createLobbyHeight.value) >= 256 && Number(createLobbyWidth.value) <= 16384 && Number(createLobbyHeight.value) <= 16384) {
        createLobbyConfirm.disabled = false;
        createLobbyWidth.style.background = "white";
        createLobbyHeight.style.background = "white";
        createLobbyConfirm.style.opacity = 1;
        return true;
    } else {
        createLobbyConfirm.disabled = true;
        createLobbyWidth.style.background = "red";
        createLobbyHeight.style.background = "red";
        createLobbyConfirm.style.opacity = 0.333;
        return false;
    }
}
