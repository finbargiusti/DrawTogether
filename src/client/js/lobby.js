sizeSlider.addEventListener("change", function() {
    brushSize = Number(sizeSlider.value);
});

function handleLineInstruction(instruction) {
    if (instruction[0] === 0) { // New line
        console.log(instruction[1]);
        
        
        addLine(instruction[1], {x: instruction[2], y: instruction[3]}, instruction[4], instruction[5], instruction[6]);
        
        console.log(currentLines)
    } else if (instruction[0] === 1) { // Get own line ID
        if (currentLines["localLine"]) currentLines["localLine"].updateZIndexFromID(instruction[1]);
    } else if (instruction[0] === 2) { // Extend line        
        currentLines[instruction[1]].extendLine({x: instruction[2], y: instruction[3]});
    } else if (instruction[0] === 3) { // End line
        currentLines[instruction[1]].combine();
    }
}

function getCursorType() {
    let type = 0;
    if (rubberRadio.checked) {
        type = 1;
    } else if (brushRadio.checked) {
        type = 2;
    }
    if (eyeDropperSelected) {
        type = 3;
    }
    return type;
}

function updatePlayerCanvas() {
    playerCtx.clearRect(0, 0, playerCanvas.getAttribute("width"), playerCanvas.getAttribute("height"));

    for (let id in playerData) {
        renderPlayer(false, playerData[id][0], playerData[id][1], playerData[id][2], playerData[id][3], playerData[id][4]);
    }
    renderPlayer(true, lastPosition.x, lastPosition.y, eyeDropperSelected ? currEyeDropperColor : currColor, getCursorType(), brushSize);

    requestAnimationFrame(updatePlayerCanvas);
}

function renderPlayer(isLocal, x, y, color, type, brushSize) {
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
    }
}
