let controls = document.getElementById("controls");
let createLobbyBtn = document.getElementById("createLobby");
let submitIDBtn = document.getElementById("submitId");
let lobbyIDInput = document.getElementById("lobbyId");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

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
            requestedID: Number(lobbyIDInput.value);
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
    
function lobbyJoinHandler(event) {
    let data = JSON.parse(event.data);
    
    if (data.type === "joinLobby") {
        joinLobby();
        lobbyID = data.lobbyID;
    } else if (data.type === "incorrectID") {
        alert("That lobby does not exist!");
    }
    
    connectingToLobby = false;
}