let controls = document.getElementById("controls");
let createLobbyBtn = document.getElementById("createLobby");
let submitIDBtn = document.getElementById("submitId");
let lobbyIDInput = document.getElementById("lobbyId");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let mouseX = 0, mouseY = 0;

document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

function mouseXElement(element) {
    return (mouseX - element.getBoundingClientRect().left) ;
}

function mouseYElement(element) {
    return (mouseY - element.getBoundingClientRect().top) ;
}

canvas.addEventListener("mousedown", function() {
    let clickX = mouseXElement(canvas), clickY = mouseYElement(canvas);

    socket.send(JSON.stringify({
        type: "drawDot",
        x: clickX,
        y: clickY
    }));
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
    canvas.style.display = "block";
}

function serverCommandHandler(event) {
    let data = JSON.parse(event.data);

    console.log(event.data)
    if (data.type === "drawDot") {
        ctx.beginPath();
        ctx.arc(data.x, data.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
    }
}

function lobbyJoinHandler(event) {
    console.log(event.data)
    let data = JSON.parse(event.data);

    if (data.type === "joinLobby") {
        joinLobby();
        lobbyID = data.lobbyID;
        socket.onmessage = serverCommandHandler;
    } else if (data.type === "incorrectID") {
        alert("That lobby does not exist!");
    }

    connectingToLobby = false;
}
