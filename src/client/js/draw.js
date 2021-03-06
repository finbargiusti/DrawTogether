let currentLines = {};

communicator.getLineStartInfo = function (data) {
    return {
        lineID: formatter.fromUTribyte(data.slice(0, 3)),
        x: formatter.fromSShort(data.slice(3, 5)),
        y: formatter.fromSShort(data.slice(5, 7)),
        type: formatter.fromUByte(data.slice(7, 8)),
        size: formatter.fromUByte(data.slice(8, 9)),
        color: communicator.getRGBAStr(data.slice(9, 13))
    };
};
communicator.getLineExtensionInfo = function (data) {
    return {
        lineID: formatter.fromUTribyte(data.slice(0, 3)),
        x: formatter.fromSShort(data.slice(3, 5)),
        y: formatter.fromSShort(data.slice(5, 7))
    };
};

function handleLineInstruction(instruction) {
    var lineCommandID = instruction.charCodeAt(0);
    var data = instruction.slice(1);

    if (lineCommandID === 0) { // New line
        var info = communicator.getLineStartInfo(data);

        addLine(info.lineID, {
            x: info.x,
            y: info.y
        }, info.type, info.size, info.color);
    } else if (lineCommandID === 1) { // Get own line ID from server
        var ownLineID = formatter.fromUTribyte(data);

        if (currentLines["localLine"]) {
            currentLines["localLine"].updateID(ownLineID);
            currentLines[ownLineID] = currentLines["localLine"];
        }
    } else if (lineCommandID === 2) { // Extend line
        var info = communicator.getLineExtensionInfo(data);
        currentLines[info.lineID].extendLine({
            x: info.x,
            y: info.y
        });
    } else if (lineCommandID === 3) {
        var lineID = formatter.fromUTribyte(data);

        if (currentLines["localLine"] &&
            currentLines["localLine"] === currentLines[lineID]) {
            delete currentLines["localLine"];
        } else {
            currentLines[lineID].evolve();
        }
    } else if (lineCommandID === 4) { // Combine line
        var lineID = formatter.fromUTribyte(data);

        currentLines[lineID].combine();
    }
    updatePlayerCanvas();
}

function processRedrawingInstructions(instructions) {
    for (let i = 0; i < instructions.length; i++)  {
        let instruction = instructions[i];

        let points = [];
        for (let j = 0; j < instruction[0].length; j++) {
            points.push({
                x: instruction[0][j][0],
                y: instruction[0][j][1]
            });
        }
        let line = new Line(null, points, instruction[1], instruction[2], instruction[3]);

        line.drawFinalLine(ctx);
    }
}

function addLine(id, startPoint, type, size, color) {
        if (amspectator) {
            if (id == "localLine") {
                return
            }
        }

        let newLine = new Line(id, [startPoint], type, size, color);
        newLine.createCanvas();

        currentLines[id] = newLine;
}

function Line(id, points, type, size, color) {
    this.id = id;
    this.points = points;
    this.type = type;
    this.size = size;
    this.color = color;
    this.RGB = getRGBFromRGBA(color);
    this.alpha = getAlphaFromRGBA(color);
    this.locallyBlocked = false;

    this.createCanvas = function () {
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", canvas.width);
        this.canvas.setAttribute("height", canvas.height);
        this.canvas.style.boxShadow = "0px 0px 25px rgba(238, 130, 238, 0.6)";
        if (this.type !== 1) this.canvas.style.opacity = this.alpha;
        (typeof id === "number") ? this.setZIndexFromID(id): this.canvas.style.zIndex = 900000;
        canvasholder.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");
    }

    this.setZIndexFromID = function (id) {
        this.canvas.style.zIndex = 2 + id;
    }

    this.updateID = function (id) {
        this.id = id;
        this.setZIndexFromID(id);
    }

    this.extendLine = function (newPoint) {
        this.points.push(newPoint);
        this.drawLastSegment();
    }

    this.drawLastSegment = function () {
        if (this.type === 4) {
            let width = this.size;
            const p1 = this.points[this.points.length - 1];
            const p2 = this.points[this.points.length - 2];
            this.ctx.beginPath();
            let diff = p1.x - p2.x;
            if (Math.abs(diff) == 0) {
                this.ctx.moveTo(p1.x - 1, p1.y - width / 2);
                this.ctx.lineTo(p1.x - 1, p1.y + width / 2);
                this.ctx.lineTo(p2.x + 1, p2.y + width / 2);
                this.ctx.lineTo(p2.x + 1, p2.y - width / 2);
            } else {
                this.ctx.moveTo(p1.x, p1.y - width / 2);
                this.ctx.lineTo(p1.x, p1.y + width / 2);
                this.ctx.lineTo(p2.x, p2.y + width / 2);
                this.ctx.lineTo(p2.x, p2.y - width / 2);
            }
            this.ctx.fillStyle = this.RGB;
            this.ctx.closePath()
            this.ctx.fill();
        } else {
            this.ctx.beginPath();
            this.ctx.moveTo(this.points[this.points.length - 2].x, this.points[this.points.length - 2].y);
            this.ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
            this.setLineStyle(this.ctx, this.RGB);
            this.ctx.stroke();
        }
    }

    this.setLineStyle = function (context, color) {
        context.lineCap = "round";
        context.lineJoin = "round";

        if (this.type === 0) { // pencil
            context.strokeStyle = color;
            context.lineWidth = this.size;
        } else if (this.type === 1) { // rubber
            context.strokeStyle = bgColor;
            context.lineWidth = this.size * 2;
        } else if (this.type === 2) { // brush
            if (this.points.length >= 2) {
                let dist = Math.hypot(this.points[this.points.length - 2].x - this.points[this.points.length - 1].x, this.points[this.points.length - 2].y - this.points[this.points.length - 1].y);
                context.strokeStyle = color;
                context.lineWidth = Math.max(1, Math.pow(0.935, dist) * this.size);
            }
        } else if (this.type === 4) { // pen
            context.strokeStyle = color;
        }
    }

    this.evolve = function () {
        if (this.type !== 1) {
            this.canvas.style.opacity = 1;

            this.ctx.clearRect(0, 0, canvas.width, canvas.height);

            this.drawFinalLine(this.ctx);
        }
    }

    this.drawFinalLine = function (context)  {
        let calcedPoints = [];
        if (this.type === 1 || this.type === 4) { // Special treatment, as rubber shouldn't receive the hermite line modelling
            for (let i = 0; i < this.points.length; i++)  {
                calcedPoints.push([this.points[i].x, this.points[i].y]);
            }
        } else {
            let points = [];
            let tangents = [
                [0, 0]
            ];

            for (let i = 0; i < this.points.length; i++) {
                points.push([this.points[i].x, this.points[i].y]);

                if (i < this.points.length - 1 && i > 0) {
                    let alpha = Math.atan2(this.points[i].y - this.points[i - 1].y, this.points[i].x - this.points[i - 1].x);
                    let beta = Math.atan2(this.points[i + 1].y - this.points[i].y, this.points[i + 1].x - this.points[i].x);
                    let difference = getNormalizedAngleDelta(alpha, beta);
                    let pheta = alpha - difference / 2;

                    let a = Math.hypot(this.points[i + 1].x - this.points[i].x, this.points[i + 1].y - this.points[i].y);
                    let b = Math.hypot(this.points[i].x - this.points[i - 1].x, this.points[i].y - this.points[i - 1].y);
                    let dist = (a + b) / 2;


                    tangents.push([Math.cos(pheta) * dist, Math.sin(pheta) * dist]);
                }
            }
            tangents.push([0, 0]);

            let lineLength = 0;
            var distances = [];

            for (let i = 0; i < this.points.length - 1; i++) {
                let dist = Math.hypot(this.points[i + 1].x - this.points[i].x, this.points[i + 1].y - this.points[i].y);

                lineLength += dist;
                if (this.type === 2) distances.push(dist);
            }

            let intervalCount = lineLength / 5;
            let intervalSize = 1 / intervalCount;

            for (let t = 0; t <= 1; t += intervalSize) {
                calcedPoints.push(hermite(t, points, tangents));
            }
        }

        this.setLineStyle(context, this.color);

        if (this.type === 2) {
            for (let i = 0; i < calcedPoints.length - 1; i++) {
                context.beginPath();
                context.moveTo(calcedPoints[i + 1][0], calcedPoints[i + 1][1]);
                context.lineTo(calcedPoints[i][0], calcedPoints[i][1]);

                let percentage = i / (calcedPoints.length - 2);
                let respectivePoint = percentage * (this.points.length - 1);
                let currentDist;
                if (respectivePoint < 0.5) {
                    currentDist = distances[0];
                } else if (respectivePoint > (this.points.length - 1) - 0.5) {
                    currentDist = distances[distances.length - 1];
                } else {
                    let midpoint = respectivePoint - 0.5;
                    let lower = Math.floor(midpoint);
                    currentDist = distances[lower] * (1 - (midpoint - lower)) + distances[Math.ceil(midpoint)] * (midpoint - lower); // Linear interpolation
                }


                context.lineWidth = Math.max(1, Math.pow(0.935, currentDist) * this.size);
                context.stroke();
            }
        } else if (this.type === 4) {
            let width = this.size;
            for (let i = 0; i < calcedPoints.length - 1; i++) {
                let p1 = calcedPoints[i];
                let p2 = calcedPoints[i + 1];
                context.beginPath();
                let diff = Math.round(p1[0]) - Math.round(p2[0]);
                if (Math.abs(diff) == 0) {
                    context.moveTo(p1[0] - 1, p1[1] - width / 2);
                    context.lineTo(p1[0] - 1, p1[1] + width / 2);
                    context.lineTo(p2[0] + 1, p2[1] + width / 2);
                    context.lineTo(p2[0] + 1, p2[1] - width / 2);
                } else {
                    context.moveTo(p1[0], p1[1] - width / 2);
                    context.lineTo(p1[0], p1[1] + width / 2);
                    context.lineTo(p2[0], p2[1] + width / 2);
                    context.lineTo(p2[0], p2[1] - width / 2);
                }
                context.closePath();
                context.fill();
            }

        } else if (this.type === 0 || this.type === 1) {
            context.beginPath();
            context.moveTo(calcedPoints[0][0], calcedPoints[0][1]);
            for (let i = 1; i < calcedPoints.length; i++) {
                context.lineTo(calcedPoints[i][0], calcedPoints[i][1]);
            }
            context.stroke();
        } else if (this.type === 3) {
            context.beginPath();
            lineDiff = this.size;
            context.moveTo(calcedPoints[0][0] - lineDiff, calcedPoints[0][1] - lineDiff)
            for (let i = 1; i < calcedPoints.length; i + 2) {
                context.lineTo(calcedPoints[i][0] + lineDiff, calcedPoints[i][1] + lineDiff);
                context.lineTo(calcedPoints[i][0] - lineDiff, calcedPoints[i][1] - lineDiff);
            }
            context.stroke();
        }
    }

    this.combine = function () {
        ctx.drawImage(this.canvas, 0, 0);

        canvasholder.removeChild(this.canvas);

        if (currentLines["localLine"] && currentLines["localLine"].id === this.id) {
            console.log("Double delete LEL");
            delete currentLines["localLine"];
        }
        delete currentLines[this.id];
    }
}