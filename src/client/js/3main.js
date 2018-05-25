let controls = document.getElementById("controls");
let createLobbyBtn = document.getElementById("createLobby");
let writingUtensils = document.getElementById("writingUtensils");
let submitIDBtn = document.getElementById("submitId");
let lobbyIDInput = document.getElementById("lobbyId");
let canvas = document.getElementById("mainCanvas");
let playerCanvas = document.getElementById("playerCanvas");
let idDisplayP = document.getElementById("idDisplay");
let pencilRadio = document.getElementById("pencil");
let rubberRadio = document.getElementById("rubber");
let brushRadio = document.getElementById("brush");
let penRadio = document.getElementById("pen");
let sizeSlider = document.getElementById("sizeSlider");
let optionPanel = document.getElementById("options");
let createLobbyConfirm = document.getElementById("createLobbyConfirm");
let createLobbyWidth = document.getElementById("createLobbyWidth");
let createLobbyHeight = document.getElementById("createLobbyHeight");
let createLobbyBgColor = document.getElementById("createLobbyBgColor");
let createLobbyClose = document.getElementById("createLobbyClose");
let createLobbyPlayers = document.getElementById("createLobbyPlayers");
let createLobbySpecBool = document.getElementById("spectatorsBool");
let canvasholder = document.getElementById("canvases");
let colorPickContainer = document.getElementById("colorpick");
let openColorPickButton = document.getElementById("openColorPickMenu");
let closeColorPickButton = document.getElementById("colorpickclose");
let eyeDropSelect = document.getElementById("eyeDrop");

let validationClock;
let ctx = null;
let playerCtx = null;
let bgColor = null;
let mouseX = 0,
    mouseY = 0,
    isDrawing = false;
let lastPosition = {
    x: 0,
    y: 0
};
let currColor = "rgba(0,0,0,1)";
let brushSize = Number(sizeSlider.value);
let r = Math.round;
let lobbyID = null;
let playerData = {};
let eyeDropperSelected = false;
let currentUI = "menu";
let currEyeDropperColor = null;
let palette = [];
let amspectator;
let chatBox = document.getElementById("chatSection")




colorPickContainer.style.display = "none";

communicator.sendCursorUpdate = function (x, y, type, size, color) {
    var COMMAND_ID = 2;

    if (!color) color = "rbga(0,0,0,1)"; // Incase something goes wrong somewhere
    var message = formatter.toSShort(x) + formatter.toSShort(y) + formatter.toUByte(type) + formatter.toUByte(size) + communicator.getBinRGBA(color);

    socket.send(formatter.toUByte(COMMAND_ID) + message);
};
communicator.sendLineUpdate = function (x, y) {
    var COMMAND_ID = 4;

    var message = formatter.toSShort(x) + formatter.toSShort(y);

    socket.send(formatter.toUByte(COMMAND_ID) + message);
};
communicator.sendColorUpdate = function (color) {
    var COMMAND_ID = 6;

    socket.send(formatter.toUByte(COMMAND_ID) + communicator.getBinRGBA(color));
};

let addMessage = function (message) {
    document.getElementById("messages").innerHTML += "<p>" + message + "</p>";
}

if (!amspectator) {
    document.addEventListener("mousemove", function (event) {
        mouseX = event.clientX;
        mouseY = event.clientY;

        let thisPosition = {
            x: r(mouseXElement(canvas)),
            y: r(mouseYElement(canvas))
        };

        if (isDrawing && !eyeDropperSelected && currentUI == "draw") {
            if (currentLines["localLine"] && !currentLines["localLine"].locallyBlocked) {
                currentLines["localLine"].extendLine(thisPosition);
            }
            communicator.sendLineUpdate(thisPosition.x, thisPosition.y);

            if (usingNewColor && (pencilRadio.checked || brushRadio.checked)) { // Send new color for palette update
                communicator.sendColorUpdate(currColor);
                usingNewColor = false;
            }
        }

        if (eyeDropperSelected) { // Update eyedropper's color based on pixel below it
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let currentIndex = (Math.clamp(thisPosition.x, 0, canvas.width) * 4) + Math.clamp(thisPosition.y, 0, canvas.height) * canvas.width * 4;
            currEyeDropperColor = "rgba(" + imageData.data[currentIndex] + "," + imageData.data[currentIndex + 1] + "," + imageData.data[currentIndex + 2] + ",1)";
            console.log(currEyeDropperColor);
        }

        if (connected && lobbyID) { // Send cursor information
            communicator.sendCursorUpdate(thisPosition.x, thisPosition.y, getCursorType(), brushSize, (eyeDropperSelected) ? currEyeDropperColor : currColor);
        }

        lastPosition = {
            x: mouseXElement(canvas),
            y: mouseYElement(canvas)
        };
    });
    document.addEventListener("mousedown", function () {
        if (eyeDropperSelected) {
            if (lastPosition.x >= 0 && lastPosition.x <= canvas.width && lastPosition.y >= 0 && lastPosition.y <= canvas.height) {
                if (currEyeDropperColor !== currColor) usingNewColor = true;
                updateColorPickerFromRGB(currEyeDropperColor);
                currColor = currEyeDropperColor;
            }

            eyeDropperSelected = false;
            justDisabledEyedropper = true;
            eyeDropSelect.style.border = "3px solid gray";
            eyeDropSelect.style.textShadow = "none";
            openColorPickButton.style.backgroundColor = currColor;
        }
    });
    communicator.sendLineCreation = function (x, y, type, size, color) {
        let COMMAND_ID = 3;

        let message = formatter.toSShort(x) + formatter.toSShort(y) + formatter.toUByte(type) + formatter.toUByte(size) + communicator.getBinRGBA(color);

        socket.send(formatter.toUByte(COMMAND_ID) + message);
    };
    canvas.addEventListener("mousedown", function () {
        isDrawing = true;

        if (!currentLines["localLine"] && !eyeDropperSelected && currentUI == "draw") { // If there's no localline
            addLine("localLine", lastPosition, getCursorType(), brushSize, currColor);
            communicator.sendLineCreation(lastPosition.x, lastPosition.y, getCursorType(), brushSize, currColor);
        }
    });
    communicator.sendLineEnd = function () {
        var COMMAND_ID = 5;

        socket.send(formatter.toUByte(COMMAND_ID));
    };
    document.addEventListener("mouseup", function () {
        isDrawing = false;
        if (currentLines["localLine"] && !currentLines["localLine"].locallyBlocked) {
            currentLines["localLine"].locallyBlocked = true;
            currentLines["localLine"].evolve();
            communicator.sendLineEnd();
        }

        setTimeout(function () {
            justDisabledEyedropper = false;
        });
    });

}
// Makes popups be closable
let popupCloseButtons = document.getElementsByClassName("fa fa-window-close fa-lg");
for (let i = 0; i < popupCloseButtons.length; i++) {
    popupCloseButtons[i].addEventListener("click", function () {
        popupCloseButtons[i].parentNode.parentNode.style.display = "none";
    });
}
createLobbyClose.addEventListener("click", function () {
    clearInterval(validationClock);
});


// Tick system

let tickrate = 60;

setInterval(function(){
    for (let i  = 0; i < commandlist.length; i++) {
        serverCommandHandler(commandlist[i])
    }
    commandlist = []
    console.log()
}, 1000 / tickrate);