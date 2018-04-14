let connectingToLobby = false;
let connected = false;
let communicator = {};
let socket = new WebSocket("ws://" + window.location.hostname + ":1337/");

communicator.sendChat = function (message) {
    let COMMAND_ID = 7;

    socket.send(formatter.toUByte(COMMAND_ID) + message)
};

communicator.sendPingRequest = function () {
    let COMMAND_ID = 255;

    socket.send(formatter.toUByte(COMMAND_ID));
};
let pingDisplay = document.getElementById("pingDisplay");
let pingClock;
let pingRequestSendTime;

function pinger()  { 
    communicator.sendPingRequest();
    pingRequestSendTime = window.performance.now();
}

socket.onopen = function () {
    connected = true;
    socket.onmessage = serverCommandHandler;
    pinger();
};

socket.onclose = function () {
    connected = false;
    clearTimeout(pingClock);
};

communicator.getLobbyJoinInfo = function (data) {

    console.log(data);

    let info = {
        lobbyID: formatter.fromUTribyte(data.slice(1, 4)),
        width: formatter.fromUShort(data.slice(4, 6)),
        height: formatter.fromUShort(data.slice(6, 8)),
        candraw: data.slice(0, 1)
    };

    if (info.candraw == "t") {
        amspectator = false;
    } else {
        amspectator = true;
        document.getElementById("utensils").style.display = "none";
    }

    let redrawInstructionsLength = formatter.fromUTribyte(data.slice(8, 11));
    let redrawInstructionsRaw = data.slice(11, 11 + redrawInstructionsLength);
    let redrawInstructions = [];

    while (redrawInstructionsRaw.length) {
        let redrawInstructionLength = formatter.fromUTribyte(redrawInstructionsRaw.slice(0, 3));
        let redrawInstructionRaw = redrawInstructionsRaw.slice(3, 3 + redrawInstructionLength);
        let redrawInstruction = [formatter.fromUByte(redrawInstructionRaw.slice(0, 1)), formatter.fromUByte(redrawInstructionRaw.slice(1, 2)), communicator.getRGBAStr(redrawInstructionRaw.slice(2, 6))];

        let points = [];
        for (let i = 0; i < (redrawInstructionLength - 6) / 4; i++) {
            points.push([formatter.fromSShort(redrawInstructionRaw.slice(6 + i * 4, 6 + i * 4 + 2)), formatter.fromSShort(redrawInstructionRaw.slice(8 + i * 4, 8 + i * 4 + 2))]);
        }
        redrawInstruction.unshift(points);
        redrawInstructions.push(redrawInstruction);

        redrawInstructionsRaw = redrawInstructionsRaw.slice(redrawInstructionLength + 3);
    }

    info.redrawInstructions = redrawInstructions;
    data = data.slice(8 + redrawInstructionsLength + 3);

    let paletteLength = formatter.fromUByte(data.slice(0, 1));
    let paletteRaw = data.slice(1, 1 + paletteLength * 4);
    let palette = [];

    for (let i = 0; i < paletteLength; i++) {
        palette.push(communicator.getRGBAStr(paletteRaw.slice(i * 4, i * 4 + 4)));
    }

    info.palette = palette;
    data = data.slice(1 + paletteLength * 4);

    info.bgColor = data;

    return info;
};
communicator.getPalette = function (data) {
    let palette = [];

    for (let i = 0; i < data.length / 4; i++) {
        palette.push(communicator.getRGBAStr(data.slice(i * 4, i * 4 + 4)));
    }

    return palette;
};

function serverCommandHandler(event) {
    let commandID = event.data.charCodeAt(0);
    let data = event.data.slice(1);

    if (commandID === 0) { // Join lobby
        let info = communicator.getLobbyJoinInfo(data);

        console.log(info);

        joinLobby(info.width, info.height, info.bgColor);
        lobbyID = info.lobbyID;

        let startTime = window.performance.now();
        processRedrawingInstructions(info.redrawInstructions);
        palette = info.palette;
        updatePalette();
        requestAnimationFrame(updatePlayerCanvas);
        console.log("Joined lobby in " + (window.performance.now() - startTime).toFixed(3) + "ms (" + event.data.length / 1000 + "kB).");

        idDisplayP.innerHTML = "Lobby ID: <span class='lobbyIDHighlight'><b style='user-select:text;'>" + lobbyID + "</b></span>";
        socket.onmessage = serverCommandHandler;
    } else if (commandID === 1) { // Incorrect lobby ID
        alert("That lobby does not exist!");
        connectingToLobby = false;
    } else if (commandID === 2) { // Player update
        handlePlayerUpdate(data);
    } else if (commandID === 3) { // Player disconnect
        delete playerData[formatter.fromUInt(data)];
    } else if (commandID === 4) { // Line instruction
        handleLineInstruction(data);
        updatePlayerCanvas();
    } else if (commandID === 5) { // Palette update
        palette = communicator.getPalette(data);
        updatePalette();
    } else if (commandID === 6) {
        // Lobby full
        alert("Lobby Full")
        connectingToLobby = false;
    } else if (commandID === 7) {
        addMessage(data);
    } else if (commandID === 255) { // Ping
        let roundTripTime = Math.ceil(window.performance.now() - pingRequestSendTime);

        pingDisplay.innerHTML = roundTripTime + "ms";
        pingClock = setTimeout(pinger, Math.max(500, 1000 - roundTripTime));
    }
}

communicator.getPlayerUpdateInfo = function (data) {
    return {
        playerID: formatter.fromUInt(data.slice(0, 4)),
        x: formatter.fromSShort(data.slice(4, 6)),
        y: formatter.fromSShort(data.slice(6, 8)),
        type: formatter.fromUByte(data.slice(8, 9)),
        size: formatter.fromUByte(data.slice(9, 10)),
        color: communicator.getRGBAStr(data.slice(10, 14))
    };
}

function handlePlayerUpdate(updateData) {
    let info = communicator.getPlayerUpdateInfo(updateData);

    playerData[info.playerID] = info;
    updatePlayerCanvas()
}

function joinLobby(width, height, backgroundColor) {
    bgColor = backgroundColor;

    controls.style.display = "none";
    writingUtensils.style.display = "inline-block";
    chatBox.style.display = "block";
    optionPanel.style.display = "none";

    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    playerCanvas.setAttribute("width", width);
    playerCanvas.setAttribute("height", height);
    canvasholder.style.height = height + "px";
    canvasholder.style.width = width + "px";

    ctx = canvas.getContext("2d");
    playerCtx = playerCanvas.getContext("2d");

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    currentUI = "draw";
}