function handleDrawingInstructions(arr) {
  for (let i = 0; i < arr.length; ++i) {
      let instruction = arr[i]
      if (instruction[0] === 10) { // Draw line
          ctx.beginPath();
          ctx.moveTo(instruction[1], instruction[2]);
          ctx.lineTo(instruction[3], instruction[4]);
          ctx.strokeStyle = instruction[5];
          ctx.lineWidth = instruction[6];
          ctx.lineCap = "round";
          ctx.stroke();
      } else if (instruction[0] === 11) { // Erase line
          ctx.beginPath();
          ctx.moveTo(instruction[1], instruction[2]);
          ctx.lineTo(instruction[3], instruction[4]);
          ctx.strokeStyle = bgColor;
          ctx.lineWidth = instruction[5] * 2;
          ctx.lineCap = "round";
          ctx.stroke();
      } else if (instruction[0] === 12) { // Brush line
          let dist = Math.hypot(instruction[1] - instruction[3],
                                instruction[2] - instruction[4]);
          ctx.beginPath();
          ctx.moveTo(instruction[1], instruction[2]);
          ctx.lineTo(instruction[3], instruction[4]);
          ctx.strokeStyle = instruction[5];
          ctx.lineWidth = Math.max(1, Math.pow(0.935, dist) * instruction[6]);
          ctx.lineCap = "round";
          ctx.stroke();
      }
  }
}

function updatePlayerCanvas() {
    playerCtx.clearRect(0, 0, playerCanvas.getAttribute("width"), playerCanvas.getAttribute("height"));

    for (let id in playerData) {
        renderPlayer(false, playerData[id][0], playerData[id][1], playerData[id][2], playerData[id][3], playerData[id][4]);
    }

    let type = 0;
    if (rubberRadio.checked) {
        type = 1;
    } else if (brushRadio.checked) {
        type = 2;
    }
    if (eyeDropperSelected) {
        type = 3;
    }

    if (eyeDropperSelected) {
      renderPlayer(true, lastPosition.x, lastPosition.y, currEyeDropperColor, type, brushSize);
    } else {
      renderPlayer(true, lastPosition.x, lastPosition.y, currColor, type, brushSize);
    }

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
