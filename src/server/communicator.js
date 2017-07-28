var communicator = {
    incorrectIDCommandID: 1,
    getLobbyCreationInfo: function(data) {
        return {
            width: formatter.fromUShort(data.slice(0, 2)),
            height: formatter.fromUShort(data.slice(2, 4)),
            color: data.slice(4)
        };
    },
    generateJoinInstruction: function(lobby) {
        var COMMAND_ID = 0;
        
        var redrawingInstructions = "";
        for (var i = 0; i < lobby.instructions.length; i++) {
            var instruction = lobby.instructions[i];
            var string = formatter.toUByte(instruction.type) + formatter.toUByte(instruction.size) + this.generateRGBAData(instruction.color);
            
            for (var j = 0; j < instruction.points.length; j++) {
                string += formatter.toSShort(instruction.points[j][0]) + formatter.toSShort(instruction.points[j][1]);
            }
            
            redrawingInstructions += formatter.toUTribyte(string.length) + string;
        }
        
        var paletteData = "";
        for (var i = 0; i < lobby.palette.length; i++) {
            paletteData += this.generateRGBAData(lobby.palette[i]);
        }
        
        return formatter.toUByte(COMMAND_ID) + formatter.toUTribyte(lobby.id) + formatter.toUShort(lobby.width) + formatter.toUShort(lobby.height) + formatter.toUTribyte(redrawingInstructions.length) + redrawingInstructions + formatter.toUByte(paletteData.length / 4) + paletteData + lobby.bgColor;
    },
    generateRGBAData: function(rgba) {
        return formatter.toUByte(rgba.r) + formatter.toUByte(rgba.g) + formatter.toUByte(rgba.b) + formatter.toUByte(rgba.a);
    },
    generateRGBAFromBin: function(rgba) {
        return new Color(rgba.charCodeAt(0), rgba.charCodeAt(1), rgba.charCodeAt(2), rgba.charCodeAt(3));
    },
    generatePlayerUpdate: function(socket, data) {
        var COMMAND_ID = 2;
        
        return formatter.toUByte(COMMAND_ID) + formatter.toUInt(socket.appData.id) + data;
    },
    generatePlayerDisconnect: function(socket) {
        var COMMAND_ID = 3;
        
        return formatter.toUByte(COMMAND_ID) + formatter.toUInt(socket.appData.id);
    },
    getLineStartInfo: function(data) {
        return {
            x: formatter.fromSShort(data.slice(0, 2)),
            y: formatter.fromSShort(data.slice(2, 4)),
            type: formatter.fromUByte(data.slice(4, 5)),
            size: formatter.fromUByte(data.slice(5, 6)),
            color: this.generateRGBAFromBin(data.slice(6, 10))
        };
    },
    generateLineInstruction: function(rest) {
        var COMMAND_ID = 4;
        
        return formatter.toUByte(COMMAND_ID) + rest;
    },
    generateLineStart: function(lobby, data) {
        var LINE_COMMAND_ID = 0;
        
        return this.generateLineInstruction(formatter.toUByte(LINE_COMMAND_ID) + formatter.toUTribyte(lobby.currentLineID) + data);
    },
    generateLineIDUpdate: function(lobby) {
        var LINE_COMMAND_ID = 1;
        
        return this.generateLineInstruction(formatter.toUByte(LINE_COMMAND_ID) + formatter.toUTribyte(lobby.currentLineID));
    },
    getLineExtensionInfo: function(data) {
        return {
            x: formatter.fromSShort(data.slice(0, 2)),
            y: formatter.fromSShort(data.slice(2, 4))
        };
    },
    generateLineExtension: function(socket, data) {
        var LINE_COMMAND_ID = 2;
        
        return this.generateLineInstruction(formatter.toUByte(LINE_COMMAND_ID) + formatter.toUTribyte(socket.appData.currentLine.id) + data);
    },
    generateEndLine: function(socket) {
        var LINE_COMMAND_ID = 3;
        
        return this.generateLineInstruction(formatter.toUByte(LINE_COMMAND_ID) + formatter.toUTribyte(socket.appData.currentLine.id));
    },
    generateCombineLine: function(lineID) {
        var LINE_COMMAND_ID = 4;
        
        return this.generateLineInstruction(formatter.toUByte(LINE_COMMAND_ID) + formatter.toUTribyte(lineID));
    },
    generatePalette: function(palette) {
        var COMMAND_ID = 5;
        
        var paletteData = "";
        for (var i = 0; i < palette.length; i++) {
            paletteData += this.generateRGBAData(palette[i]);
        }
        
        return formatter.toUByte(COMMAND_ID) + paletteData;
    }
}