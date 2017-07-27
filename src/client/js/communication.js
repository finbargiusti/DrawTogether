let connectingToLobby = false;
let connected = false;
let communicator = {};
let socket = new WebSocket("ws://192.168.1.102:1337/");

socket.onopen = function() {
    connected = true;
};

socket.onclose = function() {
    connected = false;
};

function serverCommandHandler(event) {
    let data = JSON.parse(event.data);

    if (data[0] === 0) { // Line instruction
        handleLineInstruction(data[1]);
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

communicator.getLobbyJoinInfo = function(data) {
    let info = {
        lobbyID: formatter.fromUTribyte(data.slice(0, 3)),
        width: formatter.fromUShort(data.slice(3, 5)),
        height: formatter.fromUShort(data.slice(5, 7))
    };
    
    let redrawInstructionsLength = formatter.fromUTribyte(data.slice(7, 10));
    let redrawInstructionsRaw = data.slice(10, 10 + redrawInstructionsLength);
    let redrawInstructions = [];
    
    while (redrawInstructionsRaw.length) {
        let redrawInstructionLength = formatter.fromUTribyte(redrawInstructionsRaw.slice(0, 3));
        let redrawInstructionRaw = redrawInstructionsRaw.slice(3, 3 + redrawInstructionLength);
        let redrawInstruction = [formatter.fromUByte(redrawInstructionRaw.slice(0, 1)), formatter.fromUByte(redrawInstructionRaw.slice(1, 2)), communicator.getRGBAStr(redrawInstructionRaw.slice(2, 6))];
        
        let points = [];
        for (let i = 0; i < (redrawInstructionLength - 6) / 4; i++) {
            points.push([formatter.fromSShort(redrawInstructionRaw.slice(6 + i * 4, 6 + i * 4 + 2)), formatter.fromSShort(redrawInstructionRaw.slice(8 + i * 4, 8 + i * 4 + 2))]);
        }
        redrawInstruction.push(points);
        redrawInstructions.push(redrawInstruction);
        
        redrawInstructionsRaw = redrawInstructionsRaw.slice(redrawInstructionLength + 3);
    }
    
    info.redrawInstructions = redrawInstructions;
    data = data.slice(7 + redrawInstructionsLength + 3);
    
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
}
function lobbyJoinHandler(event) {
    console.log(event.data, formatter.binToNumArr(event.data));
    
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

        idDisplayP.innerHTML = "Lobby ID: <span class='lobbyIDHighlight'><b>" + lobbyID + "</b></span>";
        socket.onmessage = serverCommandHandler;
    } else if (commandID === 1) { // Incorrect lobby ID
        alert("That lobby does not exist!");
    }

    connectingToLobby = false;
}
