let currentLines = {};

function handleLineInstruction(instruction) {
    if (instruction[0] === 0) { // New line
        addLine(instruction[1], {x: instruction[2], y: instruction[3]}, instruction[4], instruction[5], instruction[6]);
    } else if (instruction[0] === 1) { // Get own line ID
        if (currentLines["localLine"]) {
            currentLines["localLine"].updateID(instruction[1]);
            currentLines[instruction[1]] = currentLines["localLine"];
        }
    } else if (instruction[0] === 2) { // Extend line        
        currentLines[instruction[1]].extendLine({x: instruction[2], y: instruction[3]});
    } else if (instruction[0] === 3) { // End line
        console.log("'End line' command received");
        if (currentLines["localLine"] && currentLines["localLine"] === currentLines[instruction[1]]) {
            delete currentLines["localLine"];
        } else {
            currentLines[instruction[1]].evolve();
        }
    }
    else if (instruction[0] === 4) { // Combine line
        currentLines[instruction[1]].combine();
        
        console.log(currentLines);
    }
}

function processRedrawingInstructions(instructions) {
    for (let i = 0; i < instructions.length; i++) {
        let instruction = instructions[i];
        
        let points = [];
        for (let j = 0; j < instruction[0].length; j++) {
            points.push({x: instruction[0][j][0], y: instruction[0][j][1]});
        }
        let line = new Line(null, points, instruction[1], instruction[2], instruction[3]);
        console.log(line)
        
        line.drawFinalLine(ctx);
    }
}

function addLine(id, startPoint, type, size, color) {
    let newLine = new Line(id, [startPoint], type, size, color);
    newLine.createCanavs();
    
    currentLines[id] = newLine;
    
}

function Line(id, points, type, size, color) {
    this.id = id;
    this.points = points;
    this.type = type;
    this.size = size; this.color = color;
    this.RGB = getRGBFromRGBA(color);
    this.alpha = getAlphaFromRGBA(color);
    this.locallyBlocked = false;
    
    this.createCanavs = function() {
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", canvas.width);
        this.canvas.setAttribute("height", canvas.height);
        this.canvas.style.boxShadow = "0px 0px 25px rgba(238, 130, 238, 0.6)";
        if (this.type !== "rubber") this.canvas.style.opacity = this.alpha;
        (typeof id === "number") ? this.setZIndexFromID(id) : this.canvas.style.zIndex = 900000;
        canvasholder.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");
    }
    
    this.setZIndexFromID = function(id) {
        this.canvas.style.zIndex = 2 + id;
    }
    
    this.updateID = function(id) {
        this.id = id;
        this.setZIndexFromID(id);
    }
    
    this.extendLine = function(newPoint) {
        this.points.push(newPoint);        
        this.drawLastSegment();
    }
    
    this.drawLastSegment = function() {        
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[this.points.length - 2].x, this.points[this.points.length - 2].y);
        this.ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
        this.setLineStyle(this.ctx, this.RGB);
        this.ctx.stroke();
    }
    
    this.setLineStyle = function(context, color) {
        context.lineCap = "round";
        context.lineJoin = "round";
        
        if (this.type === "pencil") {
            context.strokeStyle = color;
            context.lineWidth = this.size;
        } else if (this.type === "rubber") {
            context.strokeStyle = bgColor;
            context.lineWidth = this.size * 2;
        } else if (this.type === "brush") {
            let dist = Math.hypot(this.points[this.points.length - 2].x - this.points[this.points.length - 1].x, this.points[this.points.length - 2].y - this.points[this.points.length - 1].y);
            context.strokeStyle = color;
            context.lineWidth = Math.max(1, Math.pow(0.935, dist) * this.size*0.8);
        }
    }
    
    this.evolve = function() {
        stopwatch.start("Evolve");
        
        if (this.type !== "rubber") {
            this.canvas.style.opacity = 1;
            
            stopwatch.start("Clear rect");
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            stopwatch.end("Clear rect");
            
            this.drawFinalLine(this.ctx);
        }
        
        stopwatch.end("Evolve");
    }
    
    this.drawFinalLine = function(context) {
        stopwatch.start("Point and tangent creation");

        let calcedPoints = [];
        if (this.type === "rubber") { // Special treatment, as rubber shouldn't receive the hermite line modelling
            for (let i = 0; i < this.points.length; i++) {
                calcedPoints.push([this.points[i].x, this.points[i].y]);
            }
        } else {
            let points = [];
            let tangents = [[0, 0]];

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
            stopwatch.end("Point and tangent creation");

            let lineLength = 0;

            stopwatch.start("Length calc");
            for (let i = 0; i < (this.points.length-1); ++i) {
                lineLength += Math.hypot(this.points[i + 1].x - this.points[i].x, this.points[i + 1].y - this.points[i].y);
            }
            stopwatch.end("Length calc");

            let intervalCount = lineLength / 5;
            let intervalSize = 1 /intervalCount;
            console.log("Interval count: " + intervalCount);

            stopwatch.start("Curve calc");
            for (let t = 0; t < 1; t += intervalSize) {
                calcedPoints.push(hermite(t, points, tangents));
            }
            stopwatch.end("Curve calc");
        }

        this.setLineStyle(context, this.color);

        if (this.type === "brush") { 
            for (let i = 0; i < calcedPoints.length-1; i++) {
                context.beginPath();
                context.moveTo(calcedPoints[i+1][0], calcedPoints[i+1][1]);
                context.lineTo(calcedPoints[i][0], calcedPoints[i][1]);
                context.lineWidth = (Math.max(1, Math.pow(0.935, 5*Math.hypot(calcedPoints[i][0] - calcedPoints[i+1][0], calcedPoints[i][1] - calcedPoints[i+1][1])) * this.size));
                context.stroke();
            }
        } else if (this.type === "pencil" || this.type === "rubber") {
            context.beginPath();
            context.moveTo(calcedPoints[0][0], calcedPoints[0][1]);
            for (let i = 1; i < calcedPoints.length; i++) {
                context.lineTo(calcedPoints[i][0], calcedPoints[i][1]);
            }
            context.stroke();
        }
    }
    
    this.combine = function() {
        stopwatch.start("Combine");
        ctx.drawImage(this.canvas, 0, 0);
        stopwatch.end("Combine");
        
        canvasholder.removeChild(this.canvas);
        
        if (currentLines["localLine"] && currentLines["localLine"].id === this.id) {
            console.log("Double delete LEL");
            delete currentLines["localLine"];
        }
        delete currentLines[this.id];
    }
}