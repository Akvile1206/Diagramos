
//LL(1) parsing table for logical expressions

var table = {
    "S" : {
        "!" : ["E", "$"],
        "(" : ["E", "$"],
        "id" : ["E", "$"]
    },
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

function getNextToken() {
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
    return "~"+identifier;
}

function isValid(char) {
    return (char <= 'Z' && char >= 'A') || (char <= 'z' && char >= 'a') || (char <= '9' && char >= '0')
}

function Node(data) {
    this.data = data;
    this.children = [];
}

function Tree(data) {
    var node = new Node(data);
    this._root = node;
}

var parse_tree = new Tree("S");

var tree_stack = [];
tree_stack.push(parse_tree);

function parse() {
    var a = getNextToken();
    var identifier = "";
    if (a[0] === "~") {
        identifier = a;
        a = "id";
    }
    var X = tree_stack[0]._root.data;
    while(X !== "$") {
        if (X === a) {
            var toReduce = tree_stack.pop();
            if (a === "id") {
                toReduce._root.data = identifier;
            }
            a = getNextToken();
            if (a[0] === "~") {
                identifier = a;
                a = "id";
            }
        } else if (a in table[X]) {
            var toReduce = tree_stack.pop();
            var alpha = table[X][a];
            if ( alpha !== "e") {
                var children = [];
                for(var i = alpha.length - 1; i >= 0; i--) {
                    var tree = new Tree(alpha[i]);
                    tree_stack.push(tree);
                    children.push(tree);
                }
                toReduce._root.children = children;
            } 
        } else {
            throw "Parse Error";
        }
        X = tree_stack[tree_stack.length - 1]._root.data;
    }
    return parse_tree;
}

parse();
