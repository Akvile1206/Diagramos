
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

var input = "A->(B->C)$";//"!P&&Q->R$";
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
        throw "Lexing Error: index "+index + " in string "+input;
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
            } else {
                toReduce._root.children.push(new Tree("e"));
            }
        } else {
            throw "Parse Error";
        }
        X = tree_stack[tree_stack.length - 1]._root.data;
    }
    return parse_tree;
}

parse();
console.log(parse_tree);

function generateAST(tree, optional_left) {
    if (tree._root.data[0] === '~') {
        return new Tree(tree._root.data);
    }
    switch (tree._root.data) {
        case "S":
          var E_AST = generateAST(tree._root.children[1]);
          var $_AST = new Tree("$");
          $_AST._root.children.push(E_AST);
          return $_AST;
        case "E":
            var T_AST = generateAST(tree._root.children[1]);
            return generateAST(tree._root.children[0], T_AST);
        case "E'":
            if (tree._root.children[0]._root.data === "e") {
                return optional_left;
            }
            var Eprime_AST = new Tree(tree._root.children[2]._root.data); 
            var T_AST = generateAST(tree._root.children[1]);
            Eprime_AST._root.children = [optional_left, T_AST];
            return generateAST(tree._root.children[0], Eprime_AST);
        case "T":
            var F_AST = generateAST(tree._root.children[1]);
            return generateAST(tree._root.children[0], F_AST);
        case "T'":
            if (tree._root.children[0]._root.data === "e") {
                return optional_left;
            }
            var Tprime_AST = new Tree("||"); 
            var F_AST = generateAST(tree._root.children[1]);
            Tprime_AST._root.children = [optional_left, F_AST];
            return generateAST(tree._root.children[0], Tprime_AST);
        case "F":
            var N_AST = generateAST(tree._root.children[1]);
            return generateAST(tree._root.children[0], N_AST);
        case "F'":
            if (tree._root.children[0]._root.data === "e") {
                return optional_left;
            }
            var Fprime_AST = new Tree("&&"); 
            var N_AST = generateAST(tree._root.children[1]);
            Fprime_AST._root.children = [optional_left, N_AST];
            return generateAST(tree._root.children[0], Fprime_AST);
        case "N":
            if (tree._root.children.length === 1) {
                return generateAST(tree._root.children[0]);
            }
            var N_AST = new Tree("!");
            N_AST._root.children[0] = generateAST(tree._root.children[0]);
            return N_AST;
        case "P":
            if (tree._root.children.length === 1) {
                return generateAST(tree._root.children[0]);
            }
            return generateAST(tree._root.children[1]);
        default:
          throw "AST error";
      }
}

var AST = generateAST(parse_tree);
console.log(AST);
