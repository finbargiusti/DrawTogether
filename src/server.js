// http
var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(8080, function(){});

// Web socket

var ws = require("ws");
var server = new ws.Server({port: 1337});

var sockets = {};
var currentSocketID = 0;
var lobbies = [];

server.on("connection", function(ws) {
    try {
        sockets[currentSocketID] = ws;
        var thisID = currentSocketID;

        ws.DTData = {};
        ws.DTData.id = currentSocketID;

        ws.on("message", function(message) {
            var command = JSON.parse(message);

            handleCommand(command, ws);
        });

        ws.on("close", function() {
            onPlayerDisconnect(ws);
            delete sockets[thisID];
        });
        ++currentSocketID;
    } catch (e) {
        console.error(e);
    }
});

function Lobby(id, width, height, bgColor) {
    this.id = id;
    this.width = width;
    this.height = height;
    this.bgColor = bgColor;
    this.instructions = [];
}

function sendJoinLobbyInstruction(socket, lobby) {
    socket.send(JSON.stringify([0, lobby.id, lobby.instructions, lobby.width, lobby.height, lobby.bgColor]));
}

function onPlayerDisconnect(socket) {
    for (var sckt in sockets) {
        if (sockets[sckt].DTData.lobbyID === socket.DTData.lobbyID && sockets[sckt] !== socket) {
            sockets[sckt].send(JSON.stringify([2, [socket.DTData.id]]));
        }
    }
}

function handleCommand(command, socket) {
    try {
        if (command[0] === 0) { // Create lobby
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

            var newLobby = new Lobby(newLobbyID, command[1], command[2], command[3]);

            lobbies.push(newLobby);
            socket.DTData.lobbyID = newLobbyID;
            sendJoinLobbyInstruction(socket, newLobby);
        } else if (command[0] === 1) { // Join lobby
            for (var i = 0; i < lobbies.length; i++) {
                if (lobbies[i].id === command[1]) {
                    socket.DTData.lobbyID = command[1];
                    sendJoinLobbyInstruction(socket, lobbies[i]);

                    return;
                }
            }

            socket.send(JSON.stringify([1]));
        } else if (command[0] === 10 || command[0] === 11 || command[0] === 12) { // Draw line, Erase line, Brush line
            for (var i = 0; i < lobbies.length; ++i) {
                if (lobbies[i].id === socket.DTData.lobbyID) {
                    lobbies[i].instructions.push(command);
                    break;
                }
            }
            for (var sckt in sockets) {
                if (sockets[sckt].DTData.lobbyID === socket.DTData.lobbyID) {
                    sockets[sckt].send(JSON.stringify([0, [command]]));
                }
            }
        } else if (command[0] === 9) { // Player update
            for (var sckt in sockets) {
                if (sockets[sckt].DTData.lobbyID === socket.DTData.lobbyID && sockets[sckt] !== socket) {
                    sockets[sckt].send(JSON.stringify([1, [socket.DTData.id, command[1], command[2], command[3], command[4], command[5]]]));
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}