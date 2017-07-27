var BYTE_SIZE = 256;
var SHORT_SIZE = 65536;
var TRIBYTE_SIZE = 16777216;
var INT_SIZE = 4294967296;

var formatter = {
    binToNumArr: function(string) {
        var array = [];
        for (var i = 0; i < string.length; i++) {
            array.push(string.charCodeAt(i));
        }
        return array;
    },
    fromUByte: function(string) {
        return string.charCodeAt(0);
    },
    toUByte: function(number) {
        return String.fromCharCode(number);
    },
    fromUShort: function(string) {
        return string.charCodeAt(0) * BYTE_SIZE + string.charCodeAt(1);
    },
    toUShort: function(number) {
        return String.fromCharCode(Math.floor(number / BYTE_SIZE)) + String.fromCharCode(number % BYTE_SIZE);
    },
    fromUTribyte: function(string) {
        return string.charCodeAt(0) * SHORT_SIZE + string.charCodeAt(1) * BYTE_SIZE + string.charCodeAt(2);
    },
    toUTribyte: function(number) {
        return String.fromCharCode(Math.floor(number / (SHORT_SIZE))) + String.fromCharCode(Math.floor((number % (SHORT_SIZE)) / BYTE_SIZE)) + String.fromCharCode(number % BYTE_SIZE);
    },
    fromUInt: function(string) {
        return string.charCodeAt(0) * TRIBYTE_SIZE + string.charCodeAt(1) * SHORT_SIZE + string.charCodeAt(2) * BYTE_SIZE + string.charCodeAt(3);
    },
    toUInt: function(number) {
        return String.fromCharCode(Math.floor(number / (TRIBYTE_SIZE))) + String.fromCharCode(Math.floor((number % (TRIBYTE_SIZE)) / (SHORT_SIZE))) + String.fromCharCode(Math.floor(number % (SHORT_SIZE) / BYTE_SIZE)) + String.fromCharCode(number % BYTE_SIZE);
    },
    fromSByte: function(string) {
        return this.fromUByte(string) - BYTE_SIZE / 2;
    },
    toSByte: function(number) {
        return this.toUByte(number + BYTE_SIZE / 2);
    },
    fromSShort: function(string) {
        return this.fromUShort(string) - SHORT_SIZE / 2;
    },
    toSShort: function(number) {
        return this.toUShort(number + SHORT_SIZE / 2);
    },
    fromSTribyte: function(string) {
        return this.fromUTribyte(string) - TRIBYTE_SIZE / 2;
    },
    toSTribyte: function(number) {
        return this.toUTribyte(number + TRIBYTE_SIZE / 2);
    },
    fromSInt: function(string) {
        return this.fromUInt(string) - INT_SIZE / 2;
    },
    toSInt: function(number) {
        return this.toUInt(number + INT_SIZE / 2);
    }
}