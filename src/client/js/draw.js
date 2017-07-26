let currentLines = {};

function addLine(id, startPoint, type, size, color) {
    currentLines[id] = new Line(id, startPoint, type, size, color);
}

function Line(id, startPoint, type, size, color) {
    this.id = id;
    this.points = [startPoint];
    this.type = type;
    this.size = size;
    this.color = color;
    this.RGB = getRGBFromRGBA(color);
    this.alpha = getAlphaFromRGBA(color);
    
    this.updateZIndexFromID = function(id) {
        this.canvas.style.zIndex = 2 + id;
    }
    
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("width", canvas.width);
    this.canvas.setAttribute("height", canvas.height);
    this.canvas.style.background = "rgba(255, 0, 0, 0.05)";
    this.canvas.style.opacity = this.alpha;
    (typeof id === "number") ? this.updateZIndexFromID(id) : this.canvas.style.zIndex = 900000;
    canvasholder.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext("2d");
    
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
            context.lineWidth = Math.max(1, Math.pow(0.935, dist) * this.size);
        }
    }
    
    this.combine = function() {
        stopwatch.start("combine");
                        
        let points = [];
        let tangents = [];
        
        tangents.push([0, 0]);
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
                
                let tangent = [Math.cos(pheta) * dist, Math.sin(pheta) * dist];
            
                tangents.push(tangent);
            }
            
        }
        tangents.push([0, 0]);
        
        let calcedPoints = [];
        
        for (let t = 0; t < 1; t += 0.001) {
            calcedPoints.push(hermite(t, points, tangents));
        }
        
        ctx.beginPath();
        ctx.moveTo(calcedPoints[0][0], calcedPoints[0][1]);
        for (let i = 1; i < calcedPoints.length; i++) {
            ctx.lineTo(calcedPoints[i][0], calcedPoints[i][1]);
        }
        this.setLineStyle(ctx, this.color);
        ctx.stroke();
        
        stopwatch.end("combine");
        
        canvasholder.removeChild(this.canvas);
        delete currentLines[this.id];
    }
}