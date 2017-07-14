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
let ctx = canvas.getContext("2d");
let playerCtx = playerCanvas.getContext("2d");

let mouseX = 0, mouseY = 0, mousePressed = false;
let lastPosition = {
    x: 0,
    y: 0
};
let brushSize = 3;

sizeSlider.addEventListener("change", function() {
    brushSize = Number(sizeSlider.value);
});

let r = Math.round;

requestAnimationFrame(updatePlayerCanvas);
function updatePlayerCanvas() {
    playerCtx.clearRect(0, 0, 800, 550);

    for (let id in playerData) {
        renderPlayer(false, playerData[id][0], playerData[id][1], playerData[id][2], playerData[id][3], playerData[id][4]);
    }

    let type = 0;
    if (rubberRadio.checked) {
        type = 1;
    } else if (brushRadio.checked) {
        type = 2;
    }

    renderPlayer(true, lastPosition.x, lastPosition.y, colorTxtField.value, type, brushSize);

    requestAnimationFrame(updatePlayerCanvas);
}

function renderPlayer(isLocal, x, y, color, type, brushSize) {
    if (!isLocal) {
      playerCtx.globalAlpha = 0.5;
    } else  {
      playerCtx.globalAlpha = 1;
    }
    if (type === 0) {
        playerCtx.beginPath();
        playerCtx.arc(x, y, brushSize / 2 + 3, 0, Math.PI * 2);
        playerCtx.fillStyle = color;
        playerCtx.fill();
        playerCtx.strokeStyle = "ghostwhite";
        playerCtx.stroke();
    } else if (type === 1) {
        playerCtx.beginPath();
        playerCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        playerCtx.strokeStyle = "black";
        playerCtx.stroke();
    } else if (type === 2) {
        playerCtx.beginPath();
        playerCtx.ellipse(x, y, (brushSize / 2) + 3, ((brushSize / 2) + 3) / 2, -Math.PI / 4, 0, Math.PI * 2);
        playerCtx.fillStyle = color;
        playerCtx.fill();
        playerCtx.strokeStyle = "ghostwhite";
        playerCtx.stroke();
    }
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

function mouseXElement(element) {
    return (mouseX - element.getBoundingClientRect().left) ;
}

function mouseYElement(element) {
    return (mouseY - element.getBoundingClientRect().top) ;
}

document.addEventListener("mousedown", function() {
    mousePressed = true;
});
document.addEventListener("mouseup", function() {
    mousePressed = false;
});

createLobbyBtn.addEventListener("click", function() {
    if (connected && !connectingToLobby) {
        connectingToLobby = true;

        socket.send(JSON.stringify([0]));

        socket.onmessage = lobbyJoinHandler;
    }
});

submitIDBtn.addEventListener("click", function() {
    if (connected && !connectingToLobby) {
        connectingToLobby = true;

        socket.send(JSON.stringify([1, Number(lobbyIDInput.value)]));

        socket.onmessage = lobbyJoinHandler;
    }
});

colorTxtField.addEventListener("keydown", function() {
    setTimeout(function() {
        colorTxtField.style.borderColor = colorTxtField.value;
    }, 16);
});

let connected = false;
let lobbyID = null;
let connectingToLobby = false;
let socket = new WebSocket("ws://192.168.1.105:1337/");
let playerData = {};

socket.onopen = function() {
    connected = true;
};

socket.onclose = function() {
    connected = false;
};

function joinLobby() {
    controls.style.display = "none";
    writingUtensils.style.display = "block";
}

function serverCommandHandler(event) {
    let data = JSON.parse(event.data);

    if (data[0] === 1) {

        handleInstructions(data[1]);
    } else {
        handlePlayerUpdate(data[1]);
    }
}

function handleInstructions(arr) {
  for (let i = 0; i < arr.length; ++i) {
      let instruction = arr[i]
      if (instruction[0] === 10) { // Draw line
          ctx.beginPath();
          ctx.moveTo(instruction[1], instruction[2]);
          ctx.lineTo(instruction[3], instruction[4]);
          ctx.strokeStyle = instruction[5];
          ctx.lineWidth = instruction[6];
          ctx.lineCap = "round";
          ctx.stroke();
      } else if (instruction[0] === 11) { // Erase line
          ctx.beginPath();
          ctx.moveTo(instruction[1], instruction[2]);
          ctx.lineTo(instruction[3], instruction[4]);
          ctx.strokeStyle = "ghostwhite";
          ctx.lineWidth = instruction[5];
          ctx.lineCap = "round";
          ctx.stroke();
      } else if (instruction[0] === 12) { // Brush line
          let dist = Math.hypot(instruction[1] - instruction[3],
                                instruction[2] - instruction[4]);
          ctx.beginPath();
          ctx.moveTo(instruction[1], instruction[2]);
          ctx.lineTo(instruction[3], instruction[4]);
          ctx.strokeStyle = instruction[5];
          ctx.lineWidth = Math.max(1, Math.pow(0.935, dist) * instruction[6]);
          ctx.lineCap = "round";
          ctx.stroke();
      }
  }
}

function handlePlayerUpdate(update) {
    playerData[update[0]] = update.slice(1);
}

function lobbyJoinHandler(event) {
    let command = JSON.parse(event.data);

    if (command[0] === 0) { // Join lobby
        joinLobby();
        lobbyID = command[1];

        let startTime = window.performance.now();
        handleInstructions(command[2][1]);
        console.log("Joined lobby in " + (window.performance.now() - startTime).toFixed(3) + "ms (" + event.data.length / 1000 + "kB).");

        idDisplayP.innerHTML = "Lobby ID (share with friends): " + lobbyID;
        socket.onmessage = serverCommandHandler;
    } else if (command[0] === 0) { // Incorrect lobby ID
        alert("That lobby does not exist!");
    }

    connectingToLobby = false;
}
