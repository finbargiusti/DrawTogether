let colorCanvas = document.getElementById("colorpickcanvas");
let colorCtx = colorCanvas.getContext("2d");
let sliderCanvas = document.getElementById("colorslidercanvas");
let sliderCtx = sliderCanvas.getContext("2d");
let colorSlider = document.getElementById("colorSlider");
let circleSelect = document.getElementById("selectcircle");
let paletteContainer = document.getElementById("recentColorContainer");
let draggingColor = false;
let usingNewColor = false;
let justPickedPalette = false;
let circleX = 0;
let circleY = colorCanvas.height;

for (let i = 0;i < sliderCanvas.width; ++i) {
    sliderCtx.beginPath();
    sliderCtx.rect(i, 0, 1, sliderCanvas.height);
    sliderCtx.fillStyle = "hsl(" + (i/sliderCanvas.width*360) + ", 100%, 50%)";
    sliderCtx.fill();
}
function updateCanvas() {
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
}

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
		updateColorPicker();
	}
});

colorSlider.addEventListener("mousedown", function() {
    justPickedPalette = false;
});

function updateColorPicker() {
    let color = new Color();
    color.setHSV(colorSlider.value, circleX/colorCanvas.width, 1 - circleY/colorCanvas.height);

    if (!justPickedPalette) {
        let newColor = color.getRGB();
        if (newColor !== currColor) usingNewColor = true;
        currColor = newColor;
    }

    circleSelect.style.backgroundColor = currColor;
    circleSelect.style.transform = "translate(calc(-50% + "+circleX+"px), calc(-50% + "+circleY+"px))"	;
}

let colorUpdateClock;
function colorUpdate()  {
    updateColorPicker();
    document.styleSheets[0].addRule('#colorSlider::-webkit-slider-thumb',"background-color: hsl(" + (colorSlider.value) + ", 100%, 50%);");
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
        });
		paletteContainer.appendChild(newPaletteEntry);
	}
}

function updateColorPickerFromRGB(rgb) {
    let rgbArr = rgb.slice(4).slice(0, -1).split(",");
    let hsv = rgbToHsv(rgbArr[0], rgbArr[1], rgbArr[2]);
    colorSlider.value = hsv[0] * 360;
    circleX = hsv[1] * colorCanvas.width;
    circleY = (1 - hsv[2]) * colorCanvas.height;
}