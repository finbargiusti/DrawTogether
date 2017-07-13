// http
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080, function(){
});

// Web socket

var ws = require("ws");
var server = new ws.Server({port: 1337});

var sockets = {};
var currentSocketID = 0;
var lobbies = [];

server.on("connection", function(ws) {

    sockets[currentSocketID] = ws;
    var thisID = currentSocketID;
    ws.DTData = {};

    ws.on("message", function(message) {
        var command = JSON.parse(message);
        handleCommand(command, ws);
    });

    ws.on("close", function() {
        delete sockets[thisID];
    });
    ++currentSocketID;
});

function Lobby(id) {
    this.id = id;
    this.instructions = [];
}

function handleCommand(command, socket) {
    if (command.type === "createLobby") {
        var newLobbyID = 10000 + Math.floor(Math.random() * 90000);

        while (true) { // Checks if generated newLobbyID is duplicate
            var foundDuplicate = false;

            for (var i = 0; i < lobbies.length; i++) {
                if (lobbies[i].id === newLobbyID) {
                    newLobbyID = 10000 + Math.floor(Math.random() * 90000);
                    foundDuplicate = true;
                    break;
                }
            }

            if (!foundDuplicate) break;
        }

        lobbies.push(new Lobby(newLobbyID));
        socket.DTData.lobbyID = newLobbyID;
        socket.send(JSON.stringify({
            type: "joinLobby",
            lobbyID: newLobbyID,
            instructions: []
        }));
    } else if (command.type === "joinLobby") {
        for (var i = 0; i < lobbies.length; i++) {
            if (lobbies[i].id === command.requestedID) {
                socket.DTData.lobbyID = command.requestedID;
                socket.send(JSON.stringify({
                    type: "joinLobby",
                    lobbyID: lobbies[i].id,
                    instructions: lobbies[i].instructions
                }));

                return;
            }
        }
        socket.send(JSON.stringify({
            type: "incorrectID"
        }));
    } else if (command.type === "drawLine" || command.type === "eraseLine" || command.type === "brushLine") {
        for (var i = 0; i < lobbies.length; ++i) {
            if (lobbies[i].id === socket.DTData.lobbyID) {
                lobbies[i].instructions.push(command)
                console.log("lobby "+lobbies[i].id+" has a size of "+JSON.stringify(lobbies[i].instructions).length+"B")
                break;
            }
        }
        for (var sckt in sockets) {
            if (sockets[sckt].DTData.lobbyID === socket.DTData.lobbyID) {
                sockets[sckt].send(JSON.stringify([command]));
            }
        }
    }
}
