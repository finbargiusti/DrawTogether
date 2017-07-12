let controls = document.getElementById("controls");
let createLobbyBtn = document.getElementById("createLobby");
let submitIDBtn = document.getElementById("submitId");
let lobbyIDInput = document.getElementById("lobbyId");
let canvas = document.getElementById("canvas");
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
        
        socket.send(JSON.stringify({
            type: "drawLine",
            from: lastPosition,
            to: thisPosition
        }));
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
let socket = new WebSocket("ws://192.168.1.105:1337/");

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
    if (data.type === "drawLine") {
        ctx.beginPath();
        ctx.moveTo(data.from.x, data.from.y);
        ctx.lineTo(data.to.x, data.to.y);
        ctx.strokeStyle = "black";
        ctx.stroke();
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
