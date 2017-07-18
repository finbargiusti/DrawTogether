let connectingToLobby = false;
let connected = false;
let socket = new WebSocket("ws://192.168.1.105:1337/");

socket.onopen = function() {
    connected = true;
};

socket.onclose = function() {
    connected = false;
};

function serverCommandHandler(event) {
    let data = JSON.parse(event.data);

    if (data[0] === 1) {
        handleDrawingInstructions(data[1]);
    } else {
        handlePlayerUpdate(data[1]);
    }
}

function handlePlayerUpdate(update) {
    playerData[update[0]] = update.slice(1);
}

function createLobbyRequest() {
    if (connected && !connectingToLobby) {
        connectingToLobby = true;

        socket.send(JSON.stringify([0, Number(prompt("Width:")), Number(prompt("Height:"))]));

        socket.onmessage = lobbyJoinHandler;
    }
}

function joinLobbyRequest(ID) {
    if (connected && !connectingToLobby) {
        connectingToLobby = true;

        socket.send(JSON.stringify([1, ID]));

        socket.onmessage = lobbyJoinHandler;
    }
}

function joinLobby() {
    controls.style.display = "none";
    writingUtensils.style.display = "block";
}

function lobbyJoinHandler(event) {
    let command = JSON.parse(event.data);

    if (command[0] === 0) { // Join lobby
        joinLobby();
        lobbyID = command[1];

        let startTime = window.performance.now();
        handleDrawingInstructions(command[2][1]);
        console.log("Joined lobby in " + (window.performance.now() - startTime).toFixed(3) + "ms (" + event.data.length / 1000 + "kB).");

        idDisplayP.innerHTML = "Lobby ID (share with friends): " + lobbyID;
        socket.onmessage = serverCommandHandler;
    } else if (command[0] === 0) { // Incorrect lobby ID
        alert("That lobby does not exist!");
    }

    connectingToLobby = false;
}