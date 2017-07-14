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
    ws.DTData.id = currentSocketID;

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

        lobbies.push(new Lobby(newLobbyID));
        socket.DTData.lobbyID = newLobbyID;
        socket.send(JSON.stringify([0, newLobbyID, [1, []]]));
    } else if (command[0] === 1) { // Join lobby
        for (var i = 0; i < lobbies.length; i++) {
            if (lobbies[i].id === command[1]) {
                socket.DTData.lobbyID = command[1];
                socket.send(JSON.stringify([0, lobbies[i].id, [1, lobbies[i].instructions]]));

                return;
            }
        }
        
        socket.send(JSON.stringify([1]));
    } else if (command[0] === 10 || command[0] === 11 || command[0] === 12) { // Draw line, Erase line, Brush line
        for (var i = 0; i < lobbies.length; ++i) {
            if (lobbies[i].id === socket.DTData.lobbyID) {
                lobbies[i].instructions.push(command)
                break;
            }
        }
        for (var sckt in sockets) {
            if (sockets[sckt].DTData.lobbyID === socket.DTData.lobbyID) {
                sockets[sckt].send(JSON.stringify([1, [command]]));
            }
        }
    } else if (command[0] === 9) { // Player update
        for (var sckt in sockets) {
            if (sockets[sckt].DTData.lobbyID === socket.DTData.lobbyID && sockets[sckt] !== socket) {
                sockets[sckt].send(JSON.stringify([0, [socket.DTData.id, command[1], command[2], command[3], command[4], command[5]]]));
            }
        }
    }
}
