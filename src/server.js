// http
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});



// Web socket

var ws = require("ws");
var server = new ws.Server({port: 1337});

server.on("connection", function(ws) {
    console.log("dankity");
});
