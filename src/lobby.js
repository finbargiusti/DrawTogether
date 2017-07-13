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

document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (mousePressed) {
        let thisPosition = {
            x: mouseXElement(canvas),
            y: mouseYElement(canvas)
        };

        if (pencilRadio.checked) {
            socket.send(JSON.stringify({
                type: "drawLine",
                from: lastPosition,
                to: thisPosition,
                color: colorTxtField.value
            }));
        } else if (rubberRadio.checked) {
            socket.send(JSON.stringify({
                type: "eraseLine",
                from: lastPosition,
                to: thisPosition
            }));
        } else if (brushRadio.checked) {
            socket.send(JSON.stringify({
                type: "brushLine",
                from: lastPosition,
                to: thisPosition,
                color: colorTxtField.value
            }));
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

    /*socket.send(JSON.stringify({
        type: "drawDot",
        x: clickX,
        y: clickY
    }));*/
});
document.addEventListener("mouseup", function() {
    mousePressed = false;
});

createLobbyBtn.addEventListener("click", function() {
    if (connected && !connectingToLobby) {
        connectingToLobby = true;

        socket.send(JSON.stringify({
            type: "createLobby"
        }));

        socket.onmessage = lobbyJoinHandler;
    }
});

submitIDBtn.addEventListener("click", function() {
    if (connected && !connectingToLobby) {
        connectingToLobby = true;

        socket.send(JSON.stringify({
            type: "joinLobby",
            requestedID: Number(lobbyIDInput.value)
        }));

        socket.onmessage = lobbyJoinHandler;
    }
});

let connected = false;
let lobbyID = null;
let connectingToLobby = false;
let socket = new WebSocket("ws://192.168.1.106:1337/");

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
      if (instruction.type === "drawLine") {
          ctx.beginPath();
          ctx.moveTo(instruction.from.x, instruction.from.y);
          ctx.lineTo(instruction.to.x, instruction.to.y);
          ctx.strokeStyle = instruction.color;
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.stroke();
      } else if (instruction.type === "eraseLine") {
          ctx.beginPath();
          ctx.moveTo(instruction.from.x, instruction.from.y);
          ctx.lineTo(instruction.to.x, instruction.to.y);
          ctx.strokeStyle = "ghostwhite";
          ctx.lineWidth = 40;
          ctx.lineCap = "round";
          ctx.stroke();
      } else if (instruction.type === "brushLine") {
          let dist = Math.hypot(instruction.from.x - instruction.to.x,
                                instruction.from.y - instruction.to.y);
          ctx.beginPath();
          ctx.moveTo(instruction.from.x, instruction.from.y);
          ctx.lineTo(instruction.to.x, instruction.to.y);
          ctx.strokeStyle = instruction.color;
          ctx.lineWidth = Math.max(20 - dist, 1);
          ctx.lineCap = "round";
          ctx.stroke();
      }
  }
}

function lobbyJoinHandler(event) {
    console.log(event.data)
    let data = JSON.parse(event.data);

    if (data.type === "joinLobby") {
        joinLobby();
        lobbyID = data.lobbyID;
        handleInstructions(data.instructions);
        idDisplayP.innerHTML = "Lobby id (share with friends):"+lobbyID;
        socket.onmessage = serverCommandHandler;
    } else if (data.type === "incorrectID") {
        alert("That lobby does not exist!");
    }

    connectingToLobby = false;
}
