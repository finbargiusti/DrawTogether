let connectingToLobby = false;
let connected = false;
let socket = new WebSocket("ws://localhost:1337/");


socket.onopen = function() {
    connected = true;
};

socket.onclose = function() {
    connected = false;
};

function serverCommandHandler(event) {
    let data = JSON.parse(event.data);

    if (data[0] === 0) { // Draw instruction
        handleDrawingInstructions(data[1]);
    } else if (data[0] === 1) { // Player update
        handlePlayerUpdate(data[1]);
    } else if (data[0] === 2) { // Player disconnect
        delete playerData[data[1][0]];
    } else if (data[0] === 3) { // Palette updatejk
        palette = data[1];
        updatePalette();
    }
}

function handlePlayerUpdate(update) {
    playerData[update[0]] = update.slice(1);
}

function joinLobby(width, height, backgroundColor) {
    console.log(width, height, backgroundColor)
    bgColor = backgroundColor;

    controls.style.display = "none";
    writingUtensils.style.display = "inline-block";
    optionPanel.style.display = "none";

    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    playerCanvas.setAttribute("width", width);
    playerCanvas.setAttribute("height", height);
    canvasholder.style.height = height+"px";
    canvasholder.style.width = width+"px";

    ctx = canvas.getContext("2d");
    playerCtx = playerCanvas.getContext("2d");

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    currentUI = "draw";
}

function lobbyJoinHandler(event) {
    let command = JSON.parse(event.data);

    if (command[0] === 0) { // Join lobby
        joinLobby(command[3], command[4], command[5]);
        lobbyID = command[1];

        let startTime = window.performance.now();
        handleDrawingInstructions(command[2]);
        palette = command[6];
        updatePalette();
        requestAnimationFrame(updatePlayerCanvas);
        console.log("Joined lobby in " + (window.performance.now() - startTime).toFixed(3) + "ms (" + event.data.length / 1000 + "kB).");

        idDisplayP.innerHTML = "Lobby ID (share with friends): " + lobbyID;
        socket.onmessage = serverCommandHandler;
    } else if (command[0] === 0) { // Incorrect lobby ID
        alert("That lobby does not exist!");
    }

    connectingToLobby = false;
}
