
//LL(1) parsing table for logical expressions

var table = {
    "E" : {
        "!" : ["T", "E'"],
        "(" : ["T", "E'"],
        "id" : ["T", "E'"]
    },
    "E'" : {
        "$" : "e",
        ")" : "e",
        "->" : ["->","T", "E'"],
        "<->" : ["<->","T", "E'"]
    },
    "T" : {
        "!" : ["F", "T'"],
        "(" : ["F", "T'"],
        "id" : ["F", "T'"]
    },
    "T'" : {
        "$" : "e",
        ")" : "e",
        "->" : "e",
        "<->" : "e",
        "||" : ["||", "F", "T'"]
    },
    "F" : {
        "!" : ["N","F'"],
        "(" : ["N","F'"],
        "id" : ["N","F'"]
    },
    "F'" : {
        "$" : "e",
        ")" : "e",
        "->" : "e",
        "<->" : "e",
        "||" : "e",
        "&&" : ["&&", "N", "F'"]
    },
    "N" : {
        "!" : ["!","N"],
        "(" : ["P"],
        "id" : ["P"]
    },
    "P" : {
        "(" : ["(","E",")"],
        "id" : ["id"]
    }
  };

  
console.log(table);

var input = "(!P&&Q)->R$";
var index = 0;

function getNextLexeme() {
    if (input[index] === '$') {
        index++;
        return "$";
    } else if (input[index] === '!') {
        index++;
        return "!";
    } else if (input[index] === '(') {
        index++;
        return "(";
    } else if (input[index] === ')') {
        index++;
        return ")";
    } else if (input[index] === '&' && input[index + 1] === '&') {
        index += 2;
        return "&&";
    } else if (input[index] === '|' && input[index + 1] === '|') {
        index += 2;
        return "||";
    } else if (input[index] === '-' && input[index + 1] === '>') {
        index += 2;
        return "->";
    } else if (input[index] === '<' && input[index + 1] === '-' && input[index + 2] === '>') {
        index += 3;
        return "<->";
    } 
    var identifier = "";
    var character = input[index];
    while(isValid(character)){
        identifier += character;
        index++;
        character = input[index];
    }
    if(identifier === "") {
        throw "Lexing Error";
    }
    return identifier;
}

function isValid(char) {
    return (char <= 'Z' && char >= 'A') || (char <= 'z' && char >= 'a') || (char <= '9' && char >= '0')
}