import {getAST} from "./parser.js";
import {AST_to_BDD} from "./bdd.js";

var ast = null;
var bdd = null;

var nodes = null;
var edges = null;
var network = null;

function enumerateNodes(bddNode, number) {
    if (typeof bddNode.key === "number") {
        return bddNode.key;
    } 
    if (bddNode.data === "0" || bddNode.data === "1") {
        bddNode.key = number;
        return number;
    }

    var n = enumerateNodes(bddNode.negative, number);
    var max = n > number ? n : number;
    var m = enumerateNodes(bddNode.positive, max + 1);
    var max = m > max ? m : max;
    bddNode.key = max + 1;
    return max + 1;
}

function generateNodes(bddNode, level) {
    var check = nodes[bddNode.key];
    if (typeof check === 'undefined') {
        nodes[bddNode.key] = { id: bddNode.key, label: bddNode.data};
        nodes[bddNode.key]["level"] = level;
        if (bddNode.data !== "0" && bddNode.data !== "1") {
            generateNodes(bddNode.negative, level + 1);
            edges.push({ from: bddNode.key, to: bddNode.negative.key, dashes: true});
            generateNodes(bddNode.positive, level + 1);
            edges.push({ from: bddNode.key, to: bddNode.positive.key});
        }
    } else {
        if (level > nodes[bddNode.key]["level"]) {
            nodes[bddNode.key]["level"] = level;
        }
    }
}

function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

function draw() {
    
  destroy();
  nodes = [];
  edges = [];
  var connectionCount = [];

  ast = getAST("!P&&Q->R$");
  bdd = AST_to_BDD(ast);
  enumerateNodes(bdd, 0);
  generateNodes(bdd, 0);

  // create a network
  var container = document.getElementById("mynetwork");
  var data = {
    nodes: nodes,
    edges: edges
  };

  var options = {
    layout: {
      hierarchical: {
        direction: "UD"
      }
    },
    physics: false
  };
  network = new vis.Network(container, data, options);
}

draw();

/*var directionInput = document.getElementById("direction");
var btnUD = document.getElementById("btn-UD");
btnUD.onclick = function() {
  directionInput.value = "UD";
  draw();
};
var btnDU = document.getElementById("btn-DU");
btnDU.onclick = function() {
  directionInput.value = "DU";
  draw();
};
var btnLR = document.getElementById("btn-LR");
btnLR.onclick = function() {
  directionInput.value = "LR";
  draw();
};
var btnRL = document.getElementById("btn-RL");
btnRL.onclick = function() {
  directionInput.value = "RL";
  draw();
};

window.addEventListener("load", () => {
  draw();
});*/
