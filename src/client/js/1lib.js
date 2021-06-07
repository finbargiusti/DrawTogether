function mouseXElement(element) {
    return (mouseX - element.getBoundingClientRect().left);
}

function mouseYElement(element) {
    return (mouseY - element.getBoundingClientRect().top);
}
function touchXElement(element) {
    return (mouseX - element.getBoundingClientRect().left - window.scrollX);
}

function touchYElement(element) {
    return (mouseY - element.getBoundingClientRect().top - window.scrollY);
}
Math.clamp = function (value, min, max) {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
};

function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsv(r, g, b) {
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [h, s, v];
}

function hsv2hsl(h, s, v) {
    let hsl = [0, 0, 0];
    hsl[0] = h;
    hsl[2] = (2 - s) * v;
    hsl[1] = s * v;
    hsl[1] /= (hsl[2] <= 1) ? (hsl[2]) : 2 - (hsl[2]);
    hsl[2] /= 2;

    return hsl;
}
Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};


function percentify(x, d) {
    return (x * 100).toFixed(d) + "%";
}

var Color = function (startR, startG, startB, startA) {
    this.getRGB = function () {
        return "rgb(" + Math.floor(this._r) + "," + Math.floor(this._g) + "," + Math.floor(this._b) + ")";
    }

    this.getRGBA = function () {
        return "rgba(" + Math.floor(this._r) + "," + Math.floor(this._g) + "," + Math.floor(this._b) + "," + Number(this._a.toFixed(2)) + ")";
    }

    this.getHex = function () {
        return "#" + ("0" + Math.floor(this._r).toString(16)).slice(-2) + ("0" + Math.floor(this._g).toString(16)).slice(-2) + ("0" + Math.floor(this._b).toString(16)).slice(-2);
    }

    this.getHSV = function () {
        return "hsv(" + this.getHue().toFixed(1) + ", " + percentify(this.getHSVSaturation(), 1) + ", " + percentify(this.getValue(), 1) + ")";
    }

    this.getHSVA = function () {
        return "hsva(" + this.getHue().toFixed(1) + ", " + percentify(this.getHSVSaturation(), 1) + ", " + percentify(this.getValue(), 1) + ", " + this._a.toFixed(3) + ")";
    }

    this.getHSL = function () {
        return "hsl(" + this.getHue().toFixed(1) + ", " + percentify(this.getHSLSaturation(), 1) + ", " + percentify(this.getLightness(), 1) + ")";
    }

    this.getHSLA = function () {
        return "hsla(" + this.getHue().toFixed(1) + ", " + percentify(this.getHSLSaturation(), 1) + ", " + percentify(this.getLightness(), 1) + ", " + this._a.toFixed(3) + ")";
    }

    this.getRed = function () {
        return this._r;
    }

    this.getGreen = function () {
        return this._g;
    }

    this.getBlue = function () {
        return this._b;
    }

    this.getAlpha = function () {
        return this._a;
    }

    this.getHue = function () {
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

    this.getHSVSaturation = function () {
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

    this.getHSLSaturation = function () {
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

    this.getValue = function () {
        return [this._r / 255, this._g / 255, this._b / 255].max();
    }

    this.getLightness = function () {
        var color = [this._r / 255, this._g / 255, this._b / 255];

        return (color.max() + color.min()) / 2;
    }

    this.setRGB = function (r, g, b) {
        this.setRed(r);
        this.setGreen(g);
        this.setBlue(b);
    }

    this.setRGBA = function (r, g, b, a) {
        this.setRGB(r, g, b);
        this.setAlpha(a);
    }

    this.setRed = function (r) {
        this._r = this._fixRGB(r);
    }

    this.setGreen = function (g) {
        this._g = this._fixRGB(g);
    }

    this.setBlue = function (b) {
        this._b = this._fixRGB(b);
    }

    this.setAlpha = function (a) {
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

    this._fixRGB = function (x) {
        if (x < 0) {
            return 0;
        } else if (x > 255) {
            return 255;
        } else {
            return x;
        }
    }

    this.setHex = function (code) {
        if (code.charAt(0) != "#") {
            code = "#" + code;
        }

        if (code.length == 4) {
            this.setRGB(parseInt(code.slice(1, 2), 16) * 17, parseInt(code.slice(2, 3), 16) * 17, parseInt(code.slice(3, 4), 16) * 17);
        } else if (code.length == 7) {
            this.setRGB(parseInt(code.slice(1, 3), 16), parseInt(code.slice(3, 5), 16), parseInt(code.slice(5, 7), 16));
        }
    }

    this.setHSV = function (h, s, v) {
        this._setCylindrical(true, h, s, v);
    }

    this.setHSVA = function (h, s, v, a) {
        this.setHSV(h, s, v);
        this.setAlpha(a);
    }

    this.setHSL = function (h, s, l) {
        this._setCylindrical(false, h, s, l);
    }

    this.setHSLA = function (h, s, l, a) {
        this.setHSL(h, s, l);
        this.setAlpha(a);
    }

    this.setHue = function (h) {
        this._setCylindrical(true, h, this.getHSVSaturation(), this.getValue());
    }

    this.setHSVSaturation = function (s) {
        this._setCylindrical(true, this.getHue(), s, this.getValue());
    }

    this.setHSLSaturation = function (s) {
        this._setCylindrical(false, this.getHue(), s, this.getLightness());
    }

    this.setValue = function (v) {
        this._setCylindrical(true, this.getHue(), this.getHSVSaturation(), v);
    }

    this.setLightness = function (l) {
        this._setCylindrical(false, this.getHue(), this.getHSLSaturation(), l);
    }

    this._setCylindrical = function (isHSV, h, x, y) {
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

function hermite(t, points, tangents, knots, derivative, result) {

    var n = points.length; // number or points / tangents / knots
    var d = points[0].length; // vector dimensionality
    var v = result || new Array(d); // destination vector

    if (knots) {
        // find knot interval for t
        for (var i = 0; i < n - 1; i++) {
            if (t >= knots[i] && t <= knots[i + 1]) {
                break;
            }
        }

        if (i === n - 1) throw new Error('out of bounds');

        var i0 = i;
        var i1 = i + 1;
        var k0 = knots[i0];
        var k1 = knots[i1];
        var scale = k1 - k0;

        t = (t - k0) / scale;

    } else {

        var t = t * (n - 1); // rescale t to [0, n-1]
        var i0 = t | 0; // truncate
        var i1 = i0 + 1;

        if (i0 > n - 1) throw new Error('out of bounds');
        if (i0 === n - 1) i1 = i0;

        var scale = i1 - i0;

        t = (t - i0) / scale;
    }

    if (derivative) {
        var t2 = t * t;
        var h00 = 6 * t2 - 6 * t;
        var h10 = 3 * t2 - 4 * t + 1;
        var h01 = -6 * t2 + 6 * t;
        var h11 = 3 * t2 - 2 * t;
    } else {
        var t2 = t * t;
        var it = 1 - t;
        var it2 = it * it;
        var tt = 2 * t;
        var h00 = (1 + tt) * it2;
        var h10 = t * it2;
        var h01 = t2 * (3 - tt);
        var h11 = t2 * (t - 1);
    }

    for (var i = 0; i < d; i++) {
        v[i] = h00 * points[i0][i] +
            h10 * tangents[i0][i] * scale +
            h01 * points[i1][i] +
            h11 * tangents[i1][i] * scale;
    }

    return v;
}

let stopwatchEventStartTimes = {};
let stopwatch = {
    start: function (name) {
        stopwatchEventStartTimes[name] = window.performance.now();
    },
    end: function (name) {
        console.log("Timer '" + name + "' took " + (window.performance.now() - stopwatchEventStartTimes[name]).toFixed(3) + "ms.");
        delete stopwatchEventStartTimes[name];
    }
}

function getNormalizedAngleDelta(alpha, beta) {
    let difference = alpha - beta;
    if (beta - alpha < -Math.PI) {
        difference -= Math.PI * 2;
    } else if (difference < -Math.PI) {
        difference += Math.PI * 2;
    }
    return difference;
}

function AudioObject(url, onLoad) {
    var self = this;

    this.audio = document.createElement("audio");
    this.audio.src = url;

    this.loadClock = function (onLoad) {
        this.loadInterval = setInterval(function () {
            if (self.audio.readyState == 4) {
                onLoad();
                clearInterval(self.loadInterval);
            }
        });
    }

    if (onLoad) {
        this.loadClock(onLoad);
    }

    this.getSrc = function () {
        return this.audio.src;
    }

    this.setSrc = function () {
        return this;
    }

    this.getCurrentTime = function () {
        return this.audio.currentTime;
    }

    this.setCurrentTime = function (secs, onSet) {
        var currentTime = this.getCurrentTime();
        this.audio.currentTime = secs;
        if (onSet) {
            if (currentTime != secs) {
                this.currentTimeSetInterval = setInterval(function () {
                    if (self.getCurrentTime() != currentTime) {
                        onSet();
                        clearInterval(self.currentTimeSetInterval);
                    }
                });
            } else {
                onSet();
            }
        }
        return this;
    }

    this.getDuration = function () {
        return this.audio.duration;
    }

    this.getMuteState = function () {
        return this.audio.muted;
    }

    this.mute = function () {
        this.audio.muted = true;
        return this;
    }

    this.unmute = function () {
        this.audio.muted = false;
        return this;
    }

    this.getPlaybackRate = function () {
        return this.audio.playbackRate;
    }

    this.setPlaybackRate = function (rate) {
        this.audio.playbackRate = rate;
        return this;
    }

    this.getVolume = function () {
        return this.audio.volume;
    }

    this.setVolume = function (volume) {
        this.audio.volume = volume;
        return this;
    }

    this.getLoopState = function () {
        return this.audio.loop;
    }

    this.loop = function () {
        this.audio.loop = true;
        return this;
    }

    this.noLoop = function () {
        this.audio.loop = false;
        return this;
    }

    this.play = function (onPlay) {
        var timeAtCall = this.audio.currentTime;
        this.audio.play();
        if (onPlay) {
            this.playInterval = setInterval(function () {
                if (self.audio.currentTime != timeAtCall) {
                    onPlay();
                    clearInterval(self.playInterval);
                }
            });
        }
        return true;
    }

    this.pause = function (onPause) {
        this.audio.pause();
        if (onPause) {
            onPause();
        }
        return true;
    }

    this.stop = function (onStop) {
        this.pause();
        this.setCurrentTime(0);
        if (onStop) {
            onStop();
        }
        return true;
    }

    this.restart = function (onRestart) {
        this.stop();
        this.play(onRestart);
        return true;
    }

    this.playFrom = function (secs, onPlay) {
        this.setCurrentTime(secs, function () {
            self.play(onPlay);
        });
        return this.audio.currentTime;
    }

    this.goTo = function (secs, onArrival) {
        var arrivalTime = this.audio.currentTime = secs;
        if (onArrival && !this.audio.paused) {
            this.goToInterval = setInterval(function () {
                if (self.audio.currentTime != arrivalTime) {
                    onArrival();
                    clearInterval(self.goToInterval);
                }
            });
        }
        return this.audio.currentTime;
    }
}