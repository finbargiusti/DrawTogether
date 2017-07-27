function getLineTypeId(type) {
    switch (type) {
        case "pencil": return 0; break;
        case "rubber": return 1; break;
        case "brush": return 2; break;
    }
}

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
            var string = formatter.toUByte(getLineTypeId(instruction.type)) + formatter.toUByte(instruction.size) + this.generateRGBAData(instruction.color);
            
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
    }
}