let colorCanvas = document.getElementById("colorpickcanvas");
let colorCtx = colorCanvas.getContext("2d");
let sliderCanvas = document.getElementById("colorslidercanvas");
let sliderCtx = sliderCanvas.getContext("2d");
let colorSlider = document.getElementById("colorSlider");
let circleSelect = document.getElementById("selectcircle");
let paletteContainer = document.getElementById("recentColorContainer");
let alphaSlider = document.getElementById("alphaSliderRange");
let alphaSliderCanvas = document.getElementById("alphaslidercanvas");
let alphaSliderCtx = alphaSliderCanvas.getContext("2d");
let draggingColor = false;
let usingNewColor = false;
let justPickedPalette = false;
let circleX = 0;
let circleY = colorCanvas.height;
let justDisabledEyedropper = false;
let newHue = true;
let newRGB = true;
let oldHueValue = 0;

communicator.getRGBAStr = function(str) {
    return "rgba(" + str.charCodeAt(0) + "," + str.charCodeAt(1) + "," + str.charCodeAt(2) + "," + (str.charCodeAt(3) / 255) + ")";
};

closeColorPickButton.addEventListener("click", function() {
    clearInterval(colorUpdateClock);
    openColorPickButton.style.backgroundColor = currColor;
});
openColorPickButton.addEventListener("click", function() {
    colorUpdate(true);
    colorUpdateClock = setInterval(colorUpdate);
    colorPickContainer.style.display = "block";
});
colorCanvas.addEventListener("mousedown", function() {
	draggingColor = true;
	circleX = Math.min(colorCanvas.width, Math.max(0, mouseXElement(colorCanvas)));
	circleY = Math.min(colorCanvas.height, Math.max(0, mouseYElement(colorCanvas)));
	updateColorPicker();
});

window.addEventListener("mouseup", function() {
	draggingColor = false;
});
document.addEventListener("mousemove", function() {
	if (draggingColor) {
        justPickedPalette = false;
		circleX = Math.min(colorCanvas.width, Math.max(0, mouseXElement(colorCanvas)));
		circleY = Math.min(colorCanvas.height, Math.max(0, mouseYElement(colorCanvas)));
	}
});

colorSlider.addEventListener("mousedown", function() {
    justPickedPalette = false;
});

eyeDropSelect.addEventListener("click", function() {
    if (!justDisabledEyedropper) {
        eyeDropSelect.style.border = "3px solid #2ECC40";
        eyeDropSelect.style.textShadow = "0px 0px 10px white";
        eyeDropperSelected = true;
    }
});

for (let i = 0; i < sliderCanvas.width; ++i) {
    sliderCtx.beginPath();
    sliderCtx.rect(i, 0, 1, sliderCanvas.height);
    sliderCtx.fillStyle = "hsl(" + (i/sliderCanvas.width*360) + ", 100%, 50%)";
    sliderCtx.fill();
}
function updateCanvas() {
    if (newHue) {
        let imageData = colorCtx.getImageData(0, 0, colorCanvas.width, colorCanvas.height);
        let rgbval = hslToRgb(colorSlider.value/360, 1, 0.5);
        for (let y = 0; y < colorCanvas.height; ++y) {
            for (let x = 0; x < colorCanvas.width; ++x) {
                let index = x*4+y*colorCanvas.width*4;
                let darknessFactor = 1-(y/colorCanvas.height);
                let lightnessFactor = 1-(x/colorCanvas.width);
                imageData.data[index] = (rgbval[0]*(1-lightnessFactor) + 255*lightnessFactor) * darknessFactor;
                imageData.data[index+1] = (rgbval[1]*(1-lightnessFactor) + 255*lightnessFactor) * darknessFactor;
                imageData.data[index+2] = (rgbval[2]*(1-lightnessFactor) + 255*lightnessFactor) * darknessFactor;
                imageData.data[index+3] = 255;
            }
        }
        colorCtx.putImageData(imageData, 0, 0);
        newHue = false;
    } 
    
    if (newRGB) {
        alphaSliderCtx.globalAlpha = 1;
        for (let x = 0; x < Math.ceil((alphaSliderCanvas.width - 2) / 6) + 1; x++) {
            for (let y = 0; y <= 2; y++) {
                alphaSliderCtx.fillStyle = ((x + y) % 2) ? "#ededed" : "#cccccc";
                alphaSliderCtx.fillRect(x * 6 + 1, y * 6, 6, 6);
            }
        }
        for (let x = 0; x < alphaSliderCanvas.width; x++) {
            alphaSliderCtx.globalAlpha = 1 - x / alphaSliderCanvas.width;
            alphaSliderCtx.fillStyle = getRGBFromRGBA(currColor);
            alphaSliderCtx.fillRect(x, 0, 1, alphaSliderCanvas.height);
        }
        newRGB = false;
    }
}

function updateColorPicker() {
    let color = new Color();
    color.setHSV(colorSlider.value, circleX/colorCanvas.width, 1 - circleY/colorCanvas.height);

    if (!justPickedPalette) {
        color.setAlpha(1 - alphaSlider.value / 100);
        let newColor = color.getRGBA();
        
        if (newColor !== currColor) {
            usingNewColor = true;
            circleSelect.style.backgroundColor = getRGBFromRGBA(currColor);
            document.styleSheets[0].addRule('#alphaSlider input::-webkit-slider-thumb', "background: -webkit-linear-gradient(top, "+currColor+" 0%, "+currColor+" 24%,rgba(0,0,0,0) 25%,rgba(0,0,0,0) 75%,"+currColor+" 76%,"+currColor+" 100%);");
        }
        
        if (getRGBFromRGBA(newColor) !== getRGBFromRGBA(currColor)) {
            newRGB = true;
        }
        
        currColor = newColor;
    }

    circleSelect.style.transform = "translate(calc(-50% + "+circleX+"px), calc(-50% + "+circleY+"px))";
}

let colorUpdateClock;
function colorUpdate(forceRerender) { // Updates all the stuff
    if (colorSlider.value != oldHueValue || newHue) {
        newHue = true;
        document.styleSheets[0].addRule('#colorSlider::-webkit-slider-thumb', "background-color: hsl(" + (colorSlider.value) + ", 100%, 50%);");
    }
    oldHueValue = colorSlider.value;
    
    if (forceRerender || newRGB) {
        newRGB = true;
        document.styleSheets[0].addRule('#alphaSlider input::-webkit-slider-thumb', "background: -webkit-linear-gradient(top, "+currColor+" 0%, "+currColor+" 24%,rgba(0,0,0,0) 25%,rgba(0,0,0,0) 75%,"+currColor+" 76%,"+currColor+" 100%);");
        circleSelect.style.backgroundColor = getRGBFromRGBA(currColor);
    }
    
    updateColorPicker();
	updateCanvas();
}
function updatePalette() {
	recentColorContainer.innerHTML = "";
	for (let i = 0; i < palette.length; i++) {
		let newPaletteEntry = document.createElement("div");
		newPaletteEntry.className = "recentColor";
		newPaletteEntry.style.backgroundColor = palette[i];
        newPaletteEntry.addEventListener("click", function() {
            currColor = palette[i];
            updateColorPickerFromRGB(palette[i]);
            usingNewColor = true;
            justPickedPalette = true;
            newHue = newRGB = true; // Hehe nice syntax
        });
		paletteContainer.appendChild(newPaletteEntry);
	}
}

function updateColorPickerFromRGB(rgb) {
    let rgbaArr = rgb.slice(5).slice(0, -1).split(",");
    let hsv = rgbToHsv(rgbaArr[0], rgbaArr[1], rgbaArr[2]);
    colorSlider.value = hsv[0] * 360;
    circleX = hsv[1] * colorCanvas.width;
    circleY = (1 - hsv[2]) * colorCanvas.height;
    alphaSlider.value = (1 - rgbaArr[3]) * 100;
}

function getRGBFromRGBA(rgba) {
    let rgbaArr = rgba.slice(5).slice(0, -1).split(",");
    return "rgb(" + rgbaArr[0] + "," + rgbaArr[1] + "," + rgbaArr[2] + ")";
}

function getAlphaFromRGBA(rgba) {
    let rgbaArr = rgba.slice(5).slice(0, -1).split(",");
    return rgbaArr[3];
}
