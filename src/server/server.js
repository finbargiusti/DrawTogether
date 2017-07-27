// HTTP
var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname+"/../client")).listen(process.argv[2], function(){});

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

        ws.appData = {
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
            if (sockets[sckt].appData.lobbyID === this.id && ((excludedSocket) ? sockets[sckt] !== excludedSocket : true)) {
                sockets[sckt].send(msg);
            }
        }
    }
    
    this.sendJoinInstruction = function(socket) {
        socket.send(JSON.stringify([0, this.id, this.generateRedrawingInstructions(), this.width, this.height, this.bgColor, this.palette]));
    }
    
    this.generateRedrawingInstructions = function() {
        var instructions = [];
        
        for (var i = 0; i < this.instructions.length; i++) {
            var instruction = this.instructions[i];
            
            instructions.push([instruction.points, instruction.type, instruction.size, instruction.color]);
        }
        
        return instructions;
    }
    
    this.tryLineCollapse = function() {
        if (this.lines.length) {            
            while (this.lines[0].completed === true) {
                this.sendMsgToMembers(JSON.stringify([0, [4, this.lines[0].id]]));
                this.instructions.push(this.lines[0]);
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

function Line(id, startPoint, type, size, color) {
    this.id = id;
    this.completed = false;
    this.points = [startPoint];
    this.type = type;
    this.size = size;
    this.color = color;
}

function onPlayerDisconnect(socket) {
    try {
        Lobby.prototype.getLobbyByID(socket.appData.lobbyID).sendMsgToMembers(JSON.stringify([2, [socket.appData.id]]), socket);
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
            socket.appData.lobbyID = newLobbyID;
            newLobby.sendJoinInstruction(socket);
        } else if (command[0] === 1) { // Join lobby
            var lobby = Lobby.prototype.getLobbyByID(command[1]);
            
            if (lobby) {
                socket.appData.lobbyID = command[1];
                lobby.sendJoinInstruction(socket);
            } else {
                socket.send(JSON.stringify([1]));
            }
        } else if (command[0] === 10) { // Start line
            var lobby = Lobby.prototype.getLobbyByID(socket.appData.lobbyID);
            
            // Send new line creation to everybody EXCEPT sender
            lobby.sendMsgToMembers(JSON.stringify([0, [0, lobby.currentLineID, command[1], command[2], command[3], command[4], command[5]]]), socket);
            // Send sender their line's ID
            socket.send(JSON.stringify([0, [1, lobby.currentLineID]]));
            
            var newLine = new Line(lobby.currentLineID, [command[1], command[2]], command[3], command[4], command[5]);
            socket.appData.currentLine = newLine;
            lobby.lines.push(newLine);
            console.log(newLine);
            
            lobby.currentLineID++;
        } else if (command[0] === 11) { // Extend line
            socket.appData.currentLine.points.push([command[1], command[2]]);
            
            var lobby = Lobby.prototype.getLobbyByID(socket.appData.lobbyID);
            
            lobby.sendMsgToMembers(JSON.stringify([0, [2, socket.appData.currentLine.id, command[1], command[2]]]), socket);
        } else if (command[0] === 12) { // End line
            socket.appData.currentLine.completed = true;
            console.log(socket.appData.currentLine);
            
            var lobby = Lobby.prototype.getLobbyByID(socket.appData.lobbyID);
            lobby.sendMsgToMembers(JSON.stringify([0, [3, socket.appData.currentLine.id]]));
            lobby.tryLineCollapse();
            
            socket.appData.currentLine = null;
        } else if (command[0] === 9) { // Player update
            Lobby.prototype.getLobbyByID(socket.appData.lobbyID).sendMsgToMembers(JSON.stringify([1, [socket.appData.id, command[1], command[2], command[3], command[4], command[5]]]), socket);
        } else if (command[0] === 50) { // New color
            var lobby = Lobby.prototype.getLobbyByID(socket.appData.lobbyID);
            
            lobby.palette.unshift(command[1]);
            if (lobby.palette.indexOf(command[1], 1) !== -1) lobby.palette.splice(lobby.palette.indexOf(command[1], 1), 1);
            if (lobby.palette.length > 20) lobby.palette = lobby.palette.slice(0, 20);
            
            lobby.sendMsgToMembers(JSON.stringify([3, lobby.palette]));
        }
    } catch (e) {
        console.error(e);
    }
}
