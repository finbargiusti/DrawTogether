function mouseXElement(element) {
    return (mouseX - element.getBoundingClientRect().left) ;
}
function mouseYElement(element) {
    return (mouseY - element.getBoundingClientRect().top) ;
}
Math.clamp = function(value, min, max) {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    } else {
      return value;
    }
};
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
function hsv2hsl(h, s, v)
{
  let hsl = [0,0,0];
      hsl[0] = h;
      hsl[2] = (2 - s) * v;
     hsl[1] = s * v;
      hsl[1] /= (hsl[2] <= 1) ? (hsl[2]) : 2 - (hsl[2]);
      hsl[2] /= 2;

      return hsl;
  }
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};


function percentify(x, d) {
    return (x * 100).toFixed(d) + "%";
}

var Color = function(startR, startG, startB, startA) {
    this.getRGB = function() {
        return "rgb(" + Math.floor(this._r) + "," + Math.floor(this._g) + "," + Math.floor(this._b) + ")";
    }

    this.getRGBA = function() {
        return "rgba(" + Math.floor(this._r) + "," + Math.floor(this._g) + "," + Math.floor(this._b) + "," + Number(this._a.toFixed(2)) + ")";
    }

    this.getHex = function() {
        return "#" + ("0" + Math.floor(this._r).toString(16)).slice(-2) + ("0" + Math.floor(this._g).toString(16)).slice(-2) + ("0" + Math.floor(this._b).toString(16)).slice(-2);
    }

    this.getHSV = function() {
        return "hsv(" + this.getHue().toFixed(1) + ", " + percentify(this.getHSVSaturation(), 1) + ", " + percentify(this.getValue(), 1) + ")";
    }

    this.getHSVA = function() {
        return "hsva(" + this.getHue().toFixed(1) + ", " + percentify(this.getHSVSaturation(), 1) + ", " + percentify(this.getValue(), 1) + ", " + this._a.toFixed(3) + ")";
    }

    this.getHSL = function() {
        return "hsl(" + this.getHue().toFixed(1) + ", " + percentify(this.getHSLSaturation(), 1) + ", " + percentify(this.getLightness(), 1) + ")";
    }

    this.getHSLA = function() {
        return "hsla(" + this.getHue().toFixed(1) + ", " + percentify(this.getHSLSaturation(), 1) + ", " + percentify(this.getLightness(), 1) + ", " + this._a.toFixed(3) + ")";
    }

    this.getRed = function() {
        return this._r;
    }

    this.getGreen = function() {
        return this._g;
    }

    this.getBlue = function() {
        return this._b;
    }

    this.getAlpha = function() {
        return this._a;
    }

    this.getHue = function() {
        var color = [this._r / 255, this._g / 255, this._b / 255];
        var min = color.min();
        var max = color.max();
        var delta = max - min;

        var hue;

        if (!delta) {
            hue = 0;
        } else if (max == color[0]) {
            hue = 60 * ((color[1] - color[2]) / (max - min) % 6);
        } else if (max == color[1]) {
            hue = 60 * (2 + (color[2] - color[0]) / (max - min));
        } else {
            hue = 60 * (4 + (color[0] - color[1]) / (max - min));
        }

        return (hue >= 0) ? hue : hue + 360;
    }

    this.getHSVSaturation = function() {
        var color = [this._r / 255, this._g / 255, this._b / 255];
        var min = color.min();
        var max = color.max();
        var delta = max - min;

        if (!max) {
            return 0;
        } else {
            return delta / max;
        }
    }

    this.getHSLSaturation = function() {
        var color = [this._r / 255, this._g / 255, this._b / 255];
        var min = color.min();
        var max = color.max();
        var delta = max - min;

        if (!delta) {
            return 0;
        } else {
            return delta / (1 - Math.abs(max + min - 1));
        }
    }

    this.getValue = function() {
        return [this._r / 255, this._g / 255, this._b / 255].max();
    }

    this.getLightness = function() {
        var color = [this._r / 255, this._g / 255, this._b / 255];

        return (color.max() + color.min()) / 2;
    }

    this.setRGB = function(r, g, b) {
        this.setRed(r);
        this.setGreen(g);
        this.setBlue(b);
    }

    this.setRGBA = function(r, g, b, a) {
        this.setRGB(r, g, b);
        this.setAlpha(a);
    }

    this.setRed = function(r) {
        this._r = this._fixRGB(r);
    }

    this.setGreen = function(g) {
        this._g = this._fixRGB(g);
    }

    this.setBlue = function(b) {
        this._b = this._fixRGB(b);
    }

    this.setAlpha = function(a) {
        if (a === undefined) {
            a = 1;
        }

        if (a < 0) {
            a = 0;
        } else if (a > 1) {
            a = 1;
        }

        this._a = a;
    }

    this._fixRGB = function(x) {
        if (x < 0) {
            return 0;
        } else if (x > 255) {
            return 255;
        } else {
            return x;
        }
    }

    this.setHex = function(code) {
        if (code.charAt(0) != "#") {
            code = "#" + code;
        }

        if (code.length == 4) {
            this.setRGB(parseInt(code.slice(1, 2), 16) * 17, parseInt(code.slice(2, 3), 16) * 17, parseInt(code.slice(3, 4), 16) * 17);
        } else if (code.length == 7) {
            this.setRGB(parseInt(code.slice(1, 3), 16), parseInt(code.slice(3, 5), 16), parseInt(code.slice(5, 7), 16));
        }
    }

    this.setHSV = function(h, s, v) {
        this._setCylindrical(true, h, s, v);
    }

    this.setHSVA = function(h, s, v, a) {
        this.setHSV(h, s, v);
        this.setAlpha(a);
    }

    this.setHSL = function(h, s, l) {
        this._setCylindrical(false, h, s, l);
    }

    this.setHSLA = function(h, s, l, a) {
        this.setHSL(h, s, l);
        this.setAlpha(a);
    }

    this.setHue = function(h) {
        this._setCylindrical(true, h, this.getHSVSaturation(), this.getValue());
    }

    this.setHSVSaturation = function(s) {
        this._setCylindrical(true, this.getHue(), s, this.getValue());
    }

    this.setHSLSaturation = function(s) {
        this._setCylindrical(false, this.getHue(), s, this.getLightness());
    }

    this.setValue = function(v) {
        this._setCylindrical(true, this.getHue(), this.getHSVSaturation(), v);
    }

    this.setLightness = function(l) {
        this._setCylindrical(false, this.getHue(), this.getHSLSaturation(), l);
    }

    this._setCylindrical = function(isHSV, h, x, y) {
        while (h < 0) {
            h += 360;
        }
        while (h >= 360) {
            h -= 360;
        }

        if (x < 0) {
            x = 0;
        } else if (x > 1) {
            x = 1;
        }

        if (y < 0) {
            y = 0;
        } else if (y > 1) {
            y = 1;
        }

        var a = (isHSV) ? y * x : (1 - Math.abs(2 * y - 1)) * x;
        var b = a * (1 - Math.abs(h / 60 % 2 - 1));
        var c = (isHSV) ? y - a : y - a / 2;

        var colors;

        if (h < 60) {
            colors = [a, b, 0];
        } else if (h < 120) {
            colors = [b, a, 0];
        } else if (h < 180) {
            colors = [0, a, b];
        } else if (h < 240) {
            colors = [0, b, a];
        } else if (h < 300) {
            colors = [b, 0, a];
        } else {
            colors = [a, 0, b];
        }

        this.setRGB((colors[0] + c) * 255, (colors[1] + c) * 255, (colors[2] + c) * 255);
    }

    this.setRGBA(startR, startG, startB, startA);
}