var ws = require("ws");
var server = new ws.Server({port: 1337});

server.on("connection", function(ws) {
    console.log("dankity");
});
