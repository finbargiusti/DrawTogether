sizeSlider.addEventListener("change", function() {
    brushSize = Number(sizeSlider.value);
});

dl.addEventListener("click", dlCanvas);
function dlCanvas() {
    var dt = canvas.toDataURL('image/png');
    this.download = "DrawTogether@" + lobbyID;
    this.href = dt;
};

function getCursorType() {
    let type = 0;
    if (rubberRadio.checked) {
        type = 1;
    } else if (brushRadio.checked) {
        type = 2;
    } else if (penRadio.checked) {
        type = 4;
    }
    if (eyeDropperSelected) {
        type = 3;
    }
    return type;
}

function updatePlayerCanvas() {
    playerCtx.clearRect(0, 0, playerCanvas.getAttribute("width"), playerCanvas.getAttribute("height"));

    for (let id in playerData) {
        renderPlayer(false, playerData[id].x, playerData[id].y, playerData[id].type, playerData[id].size, playerData[id].color);
    }
    renderPlayer(true, lastPosition.x, lastPosition.y, getCursorType(), brushSize, eyeDropperSelected ? currEyeDropperColor : currColor);

    requestAnimationFrame(updatePlayerCanvas);
}

function renderPlayer(isLocal, x, y, type, brushSize, color) {
    if (!isLocal) {
      playerCtx.globalAlpha = 0.5;
    } else  {
      playerCtx.globalAlpha = 1;
    }
    if (type === 0) {
        playerCtx.beginPath();
        playerCtx.arc(x, y, brushSize / 2 + 3, 0, Math.PI * 2);
        playerCtx.fillStyle = color;
        playerCtx.fill();
        playerCtx.lineWidth = 1;
        playerCtx.strokeStyle = "ghostwhite";
        playerCtx.stroke();
    } else if (type === 1) {
        playerCtx.beginPath();
        playerCtx.arc(x, y, brushSize, 0, Math.PI * 2);
        playerCtx.lineWidth = 1;
        playerCtx.strokeStyle = "black";
        playerCtx.stroke();
    } else if (type === 2) {
        playerCtx.beginPath();
        playerCtx.ellipse(x, y, (brushSize / 2) + 3, ((brushSize / 2) + 3) / 2, -Math.PI / 4, 0, Math.PI * 2);
        playerCtx.fillStyle = color;
        playerCtx.fill();
        playerCtx.lineWidth = 1;
        playerCtx.strokeStyle = "ghostwhite";
        playerCtx.stroke();
    } else if (type === 3) {
        playerCtx.beginPath();
        playerCtx.moveTo(x - 8, y);
        playerCtx.lineTo(x + 8, y);
        playerCtx.strokeStyle = "black";
        playerCtx.lineWidth = 1;
        playerCtx.stroke();

        playerCtx.beginPath();
        playerCtx.moveTo(x, y - 8);
        playerCtx.lineTo(x, y + 8);
        playerCtx.stroke();

        playerCtx.beginPath();
        playerCtx.arc(x, y, 12, 0, Math.PI * 2);
        playerCtx.lineWidth = 8;
        playerCtx.stroke();
        playerCtx.strokeStyle = color;
        playerCtx.lineWidth = 6;
        playerCtx.stroke();
    } else if (type === 4) {
        playerCtx.beginPath();
        playerCtx.moveTo(x, y - brushSize/2);
        playerCtx.lineTo(x + brushSize/2, y - brushSize/2);
        playerCtx.lineTo(x, y + brushSize/2);
        playerCtx.lineTo(x-brushSize/2, y+ brushSize/2);
        playerCtx.closePath();
        playerCtx.fillStyle = color;
        playerCtx.fill()
    }
}
