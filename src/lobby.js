let controls = document.getElementById("controls");
let createLobbyBtn = document.getElementById("createLobby");
let writingUtensils = document.getElementById("writingUtensils");
let colorTxtField = document.getElementById("colorPick");
let submitIDBtn = document.getElementById("submitId");
let lobbyIDInput = document.getElementById("lobbyId");
let canvas = document.getElementById("canvas");
let idDisplayP = document.getElementById("idDisplay");
let pencilRadio = document.getElementById("pencil");
let rubberRadio = document.getElementById("rubber");
let brushRadio = document.getElementById("brush");
let ctx = canvas.getContext("2d");

let mouseX = 0, mouseY = 0, mousePressed = false;
let lastPosition = {
    x: 0,
    y: 0
};

let r = Math.round;

document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (mousePressed) {
        let thisPosition = {
            x: mouseXElement(canvas),
            y: mouseYElement(canvas)
        };

        if (pencilRadio.checked) { // Draw line
            socket.send(JSON.stringify([10, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), colorTxtField.value]));
        } else if (rubberRadio.checked) { // Erase line
            socket.send(JSON.stringify([11, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y)]));
        } else if (brushRadio.checked) { // Brush line
            socket.send(JSON.stringify([12, r(lastPosition.x), r(lastPosition.y), r(thisPosition.x), r(thisPosition.y), colorTxtField.value]));
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
    handleInstructions(data);
}

function handleInstructions(arr) {
  for (let i = 0; i < arr.length; ++i) {
      let instruction = arr[i]
      if (instruction[0] === 10) { // Draw line
          ctx.beginPath();
          ctx.moveTo(instruction[1], instruction[2]);
          ctx.lineTo(instruction[3], instruction[4]);
          ctx.strokeStyle = instruction[5];
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.stroke();
      } else if (instruction[0] === 11) { // Erase line
          ctx.beginPath();
          ctx.moveTo(instruction[1], instruction[2]);
          ctx.lineTo(instruction[3], instruction[4]);
          ctx.strokeStyle = "ghostwhite";
          ctx.lineWidth = 40;
          ctx.lineCap = "round";
          ctx.stroke();
      } else if (instruction[0] === 12) { // Brush line
          let dist = Math.hypot(instruction[1] - instruction[3],
                                instruction[2] - instruction[4]);
          ctx.beginPath();
          ctx.moveTo(instruction[1], instruction[2]);
          ctx.lineTo(instruction[3], instruction[4]);
          ctx.strokeStyle = instruction[5];
          ctx.lineWidth = Math.max(1, Math.pow(0.935, dist) * 15);
          ctx.lineCap = "round";
          ctx.stroke();
      }
  }
}

function lobbyJoinHandler(event) {
    let command = JSON.parse(event.data);

    if (command[0] === 0) { // Join lobby
        joinLobby();
        lobbyID = command[1];
        
        let startTime = window.performance.now();
        handleInstructions(command[2]);
        console.log("Joined lobby in " + (window.performance.now() - startTime).toFixed(3) + "ms (" + event.data.length / 1000 + "kB).");
        
        idDisplayP.innerHTML = "Lobby ID (share with friends): " + lobbyID;
        socket.onmessage = serverCommandHandler;
    } else if (command[0] === 0) { // Incorrect lobby ID
        alert("That lobby does not exist!");
    }

    connectingToLobby = false;
}