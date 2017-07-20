let colorCanvas = document.getElementById("colorpickcanvas");
let colorCtx = colorCanvas.getContext("2d");
let sliderCanvas = document.getElementById("colorslidercanvas");
let sliderCtx = sliderCanvas.getContext("2d");
let colorSlider = document.getElementById("colorSlider");
let circleSelect = document.getElementById("selectcircle");
let paletteContainer = document.getElementById("recentColorContainer");
let draggingColor = false;
let usingNewColor = false;
let circleX;
let circleY;
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
	updateCircleSelect();
});

window.addEventListener("mouseup", function() {
	draggingColor = false;
});

document.addEventListener("mousemove", function() {
	if (draggingColor) {
		circleX = Math.min(colorCanvas.width, Math.max(0, mouseXElement(colorCanvas)));
		circleY = Math.min(colorCanvas.height, Math.max(0, mouseYElement(colorCanvas)));
		updateCircleSelect();
	}
})

function updateCircleSelect() {
    let rgb = hslToRgb(colorSlider.value / 360, circleX/(colorCanvas.width-1), (0.5+(1-circleX/(colorCanvas.width-1))*0.5) * (1-circleY/(colorCanvas.height-1)));


		let newColor = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    if (newColor !== currColor) usingNewColor = true;
    currColor = newColor;
		circleSelect.style.backgroundColor = currColor;
		circleSelect.style.transform = "translate(calc(-50% + "+circleX+"px), calc(-50% + "+circleY+"px))"	;
}

let colorUpdateClock;
function colorUpdate()  {
	updateCircleSelect();
  document.styleSheets[0].addRule('#colorSlider::-webkit-slider-thumb',"background-color: hsl(" + (colorSlider.value) + ", 100%, 50%);");
	updateCanvas();
}
function updatePalette() {
	recentColorContainer.innerHTML = "";
	for (let i = 0; i < palette.length; i += (533 / 533)) {
		let newPaletteEntry = document.createElement("div");
		newPaletteEntry.className = "recentColor";
		newPaletteEntry.style.backgroundColor = palette[i];
        newPaletteEntry.addEventListener("click", function() {
            currColor = palette[i];

            let rawRgb = palette[i].slice(4).slice(0, -1);
            let rgbArr = rawRgb.split(",");

            console.log(rgbArr)

            let hsv = rgbToHsv(rgbArr[0], rgbArr[1], rgbArr[2]);

            console.log(hsv)

            colorSlider.value = hsv[0] * 360;
            circleX = hsv[1] * colorCanvas.width;
            circleY = (1 - hsv[2]) * colorCanvas.height;
        });
		paletteContainer.appendChild(newPaletteEntry);
	}
}


function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}
