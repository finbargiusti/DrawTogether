// http
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});

// Web socket

var ws = require("ws");
var server = new ws.Server({port: 1337});

var sockets = {};
var currentSocketID = 0;
var lobbies = [];

server.on("connection", function(ws) {
    console.log("New web socket connection established! Dankity.");

    sockets[currentSocketID] = ws;
    var thisID = currentSocketID;
    ws.DTData = {};

    ws.on("message", function(message) {
        console.log(message)
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
}

function handleCommand(command, socket) {
    if (command.type === "createLobby") {
        var newLobbyID = 10000 + Math.floor(Math.random() * 90000);

        while (true) { // Checks if generated newLobbyID is duplicate
            for (var i = 0; i < lobbies.length; i++) {
                if (lobbies[i].id === newLobbyID) {
                    newLobbyID = 10000 + Math.floor(Math.random() * 90000);
                    break;
                }
            }
            break;
        }

        lobbies.push(new Lobby(newLobbyID));
        socket.DTData.lobbyID = newLobbyID;
        socket.send(JSON.stringify({
            type: "joinLobby",
            lobbyID: newLobbyID
        }));
    } else if (command.type === "joinLobby") {
        for (var i = 0; i < lobbies.length; i++) {
            if (lobbies[i].id === command.requestedID) {
                socket.DTData.lobbyID = command.requestedID;
                socket.send(JSON.stringify({
                    type: "joinLobby",
                    lobbyID: lobbies[i].id
                }));
                return;
            }
        }
        socket.send(JSON.stringify({
            type: "incorrectID"
        }));
    } else if (command.type === "drawDot") {
        for (var sckt in sockets) {
            if (sockets[sckt].DTData.lobbyID === socket.DTData.lobbyID) {
                console.log(sockets[sckt].DTData.lobbyID);
                sockets[sckt].send(JSON.stringify({
                    type: "drawDot",
                    x: command.x,
                    y: command.y
                }));
            }
        }
    }
}
