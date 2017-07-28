var fs = require('fs');

eval(fs.readFileSync(__dirname + "/../universal/formatter.js").toString());
eval(fs.readFileSync(__dirname + "/communicator.js").toString());

// HTTP
var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname + "/../")).listen(process.argv[2], function(){});

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
            console.log(formatter.binToNumArr(message));

            handleCommand(message, ws);
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
    this.palette = [new Color(0, 0, 0, 255)];
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
        socket.send(communicator.generateJoinInstruction(this));
    }
    
    this.tryLineCollapse = function() {
        if (this.lines.length) {            
            while (this.lines[0].completed === true) {
                this.sendMsgToMembers(communicator.generateCombineLine(this.lines[0].id));
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

function Color(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
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
        Lobby.prototype.getLobbyByID(socket.appData.lobbyID).sendMsgToMembers(communicator.createPlayerDisconnect(socket), socket);
    } catch(e) {}
}

function handleCommand(command, socket) {
    try {
        var commandID = command.charCodeAt(0);
        var data = command.slice(1);
        
        if (commandID === 0) { // Create lobby
            var newLobbyID = 10000 + Math.floor(Math.random() * 90000);

            while (true) { // Checks if generated newLobbyID is duplicate
                if (Lobby.prototype.getLobbyByID(newLobbyID)) {
                    newLobbyID = 10000 + Math.floor(Math.random() * 90000);
                } else {
                    break;
                }
            }
            
            var info = communicator.getLobbyCreationInfo(data);

            var newLobby = new Lobby(newLobbyID, info.width, info.height, info.color);
            lobbies.push(newLobby);
            socket.appData.lobbyID = newLobbyID;
            newLobby.sendJoinInstruction(socket);
        } else if (commandID === 1) { // Join lobby
            var requestedID = formatter.fromUTribyte(data.slice(0, 3));
            var lobby = Lobby.prototype.getLobbyByID(requestedID);
            
            if (lobby) {
                socket.appData.lobbyID = requestedID;
                lobby.sendJoinInstruction(socket);
            } else {
                socket.send(formatter.toUByte(communicator.incorrectIDCommandID));
            }
        } else if (commandID === 2) { // Player update
            Lobby.prototype.getLobbyByID(socket.appData.lobbyID).sendMsgToMembers(communicator.generatePlayerUpdate(socket, data), socket);
        } else if (commandID === 3) { // Start line
            var lobby = Lobby.prototype.getLobbyByID(socket.appData.lobbyID);
            var info = communicator.getLineStartInfo(data);
            
            console.log(info);
            
            // Send new line creation to everybody EXCEPT sender
            lobby.sendMsgToMembers(communicator.generateLineStart(lobby, data), socket);
            // Send sender their line's ID
            socket.send(communicator.generateLineIDUpdate(lobby));
            
            var newLine = new Line(lobby.currentLineID, [info.x, info.y], info.type, info.size, info.color);
            socket.appData.currentLine = newLine;
            lobby.lines.push(newLine);
            console.log(newLine);
            
            lobby.currentLineID++;
        } else if (commandID === 4) { // Extend line
            let info = communicator.getLineExtensionInfo(data);
            
            socket.appData.currentLine.points.push([info.x, info.y]);
            
            var lobby = Lobby.prototype.getLobbyByID(socket.appData.lobbyID);
            
            lobby.sendMsgToMembers(communicator.generateLineExtension(socket, data), socket);
        } else if (commandID === 5) { // End line
            socket.appData.currentLine.completed = true;
            console.log(socket.appData.currentLine);
            
            var lobby = Lobby.prototype.getLobbyByID(socket.appData.lobbyID);
            lobby.sendMsgToMembers(communicator.generateEndLine(socket));
            lobby.tryLineCollapse();
            
            socket.appData.currentLine = null;
        } else if (commandID === 6) { // New color
            var lobby = Lobby.prototype.getLobbyByID(socket.appData.lobbyID);
            var newColor = communicator.generateRGBAFromBin(data);
            var newColorString = JSON.stringify(newColor);
            
            lobby.palette.unshift(newColor);
            for (var i = 1; i < lobby.palette.length; i++) { // Remove duplicate color
                if (JSON.stringify(lobby.palette[i]) === newColorString) {
                    lobby.palette.splice(i, 1);
                    break;
                }
            }
            if (lobby.palette.length > 20) lobby.palette = lobby.palette.slice(0, 20); // Cap size at 20 colors
            
            lobby.sendMsgToMembers(communicator.generatePalette(lobby.palette));
        }
    } catch (e) {
        console.error(e);
    }
}