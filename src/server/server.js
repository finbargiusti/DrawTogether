// HTTP
var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname+"/../client")).listen(8080, function(){});

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

        ws.DTData = {
            id: currentSocketID,
            currentLine: null
        };
        
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
    this.palette = ["rgba(0,0,0,1)"];
    this.currentLineID = 0;
    this.lines = [];
    
    this.sendMsgToMembers = function(msg, excludedSocket) {
        for (var sckt in sockets) {
            if (sockets[sckt].DTData.lobbyID === this.id && ((excludedSocket) ? sockets[sckt] !== excludedSocket : true)) {
                sockets[sckt].send(msg);
            }
        }
    }
    
    this.sendJoinInstruction = function(socket) {
        socket.send(JSON.stringify([0, this.id, this.instructions, this.width, this.height, this.bgColor, this.palette]));
    }
    
    this.tryLineCollapse = function() {
        if (this.lines.length) {
            console.log(this.lines);
            
            while (this.lines[0].completed === true) {
                this.sendMsgToMembers(JSON.stringify([0, [4, this.lines[0].id]]));
                this.lines.splice(0, 1);
                
                if (!this.lines.length) {
                    break;
                }
            }
        }
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

function Line(id) {
    this.id = id;
    this.completed = false;
}

function onPlayerDisconnect(socket) {
    try {
        Lobby.prototype.getLobbyByID(socket.DTData.lobbyID).sendMsgToMembers(JSON.stringify([2, [socket.DTData.id]]), socket);
    } catch(e) {}
}

function handleCommand(command, socket) {
    try {
        if (command[0] === 0) { // Create lobby
            var newLobbyID = 10000 + Math.floor(Math.random() * 90000);

            while (true) { // Checks if generated newLobbyID is duplicate
                if (Lobby.prototype.getLobbyByID(newLobbyID)) {
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
            var lobby = Lobby.prototype.getLobbyByID(command[1]);
            
            if (lobby) {
                socket.DTData.lobbyID = command[1];
                lobby.sendJoinInstruction(socket);
            } else {
                socket.send(JSON.stringify([1]));
            }
        } else if (command[0] === 10) { // Start line
            var lobby = Lobby.prototype.getLobbyByID(socket.DTData.lobbyID);
            
            // Send new line creation to everybody EXCEPT sender
            lobby.sendMsgToMembers(JSON.stringify([0, [0, lobby.currentLineID, command[1], command[2], command[3], command[4], command[5]]]), socket);
            // Send sender their line's ID
            socket.send(JSON.stringify([0, [1, lobby.currentLineID]]));
            
            var newLine = new Line(lobby.currentLineID);
            socket.DTData.currentLine = newLine;
            lobby.lines.push(newLine);
            
            lobby.currentLineID++;
        } else if (command[0] === 11) { // Extend line
            var lobby = Lobby.prototype.getLobbyByID(socket.DTData.lobbyID);
            
            lobby.sendMsgToMembers(JSON.stringify([0, [2, socket.DTData.currentLine.id, command[1], command[2]]]), socket);
        } else if (command[0] === 12) { // End line
            socket.DTData.currentLine.completed = true;
            
            var lobby = Lobby.prototype.getLobbyByID(socket.DTData.lobbyID);
            lobby.sendMsgToMembers(JSON.stringify([0, [3, socket.DTData.currentLine.id]]), socket);
            lobby.tryLineCollapse();
            
            socket.DTData.currentLine = null;
        } else if (command[0] === 9) { // Player update
            Lobby.prototype.getLobbyByID(socket.DTData.lobbyID).sendMsgToMembers(JSON.stringify([1, [socket.DTData.id, command[1], command[2], command[3], command[4], command[5]]]), socket);
        } else if (command[0] === 50) { // New color
            var lobby = Lobby.prototype.getLobbyByID(socket.DTData.lobbyID);
            
            lobby.palette.unshift(command[1]);
            if (lobby.palette.indexOf(command[1], 1) !== -1) lobby.palette.splice(lobby.palette.indexOf(command[1], 1), 1);
            if (lobby.palette.length > 20) lobby.palette = lobby.palette.slice(0, 20);
            
            lobby.sendMsgToMembers(JSON.stringify([3, lobby.palette]));
        }
    } catch (e) {
        console.error(e);
    }
}
