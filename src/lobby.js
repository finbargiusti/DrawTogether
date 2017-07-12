let createLobbyBtn = document.getElementById("createLobby");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

createLobbyBtn.addEventListener("click", function() {
    canvas.style.display = "block";
    createLobbyBtn.style.display = "none";
});

ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(200, 400);
ctx.stroke();

let socket = new WebSocket("ws://192.168.1.106:1337/");