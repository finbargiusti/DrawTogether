// HTTP
var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname+"/client")).listen(8080, function(){});

// WebSocket

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
    this.palette = ["rgb(0,0,0)"];
    
    this.sendMsgToMembers = function(msg, excludedSocket) {
        for (var sckt in sockets) {
            if (sockets[sckt].DTData.lobbyID === this.id && ((excludedSocket) ? sockets[sckt] !== excludedSocket : true)) {
                socket[sckt].send(msg);
            }
        }
    }
    
    this.sendJoinInstruction = function(socket) {
        socket.send(JSON.stringify([0, this.id, this.instructions, this.width, this.height, this.bgColor, this.palette]));
    }
}
Lobby.prototype.getLobbyByID = function(ID) {
    for (var i = 0; i < lobbies.length; i++) {
        if (lobbies[i].id === ID) {
            return lobbies[i];
        }
    }
    return null;
}

function onPlayerDisconnect(socket) {
    Lobby.getLobbyByID(socket.DTData.lobbyID).sendMsgToMembers(JSON.stringify([2, [socket.DTData.id]]), socket);
}

function handleCommand(command, socket) {
    try {
        if (command[0] === 0) { // Create lobby
            var newLobbyID = 10000 + Math.floor(Math.random() * 90000);

            while (true) { // Checks if generated newLobbyID is duplicate
                if (Lobby.getLobbyByID(newLobbyID)) {
                    newLobbyID = 10000 + Math.floor(Math.random() * 90000);
                } else {
                    break;
                }
            }

            var newLobby = new Lobby(newLobbyID, command[1], command[2], command[3]);
            lobbies.push(newLobby);
            socket.DTData.lobbyID = newLobbyID;
            newLobby.sendJoinInstruction(socket);
        } else if (command[0] === 1) { // Join lobby
            var lobby = Lobby.getLobbyByID(command[1]);
            
            if (lobby) {
                socket.DTData.lobbyID = command[1];
                lobby.sendJoinInstruction(socket);
            } else {
                socket.send(JSON.stringify([1]));
            }
        } else if (command[0] === 10 || command[0] === 11 || command[0] === 12) { // Draw line, Erase line, Brush line
            var lobby = Lobby.getLobbyByID(socket.DTData.lobbyID);
            
            lobby.instructions.push(command);
            lobby.sendMsgToMembers(JSON.stringify([0, [command]]));
        } else if (command[0] === 9) { // Player update
            Lobby.getLobbyByID(socket.DTData.lobbyID).sendMsgToMembers(JSON.stringify([1, [socket.DTData.id, command[1], command[2], command[3], command[4], command[5]]]), socket);
        } else if (command[0] === 50) { // New color
            var lobby = Lobby.getLobbyByID(socket.DTData.lobbyID);
            
            lobby.palette.unshift(command[1]);
            if (lobby.palette.indexOf(command[1]) !== -1) lobby.palette.splice(lobby.palette.indexOf(command[1]), 1);
            if (lobby.palette.length > 20) lobby.palette = lobby.palette.slice(0, 20);
            
            lobby.sendMsgToMembers(JSON.stringify([3, lobby.palette]));
        }
    } catch (e) {
        console.error(e);
    }
}
