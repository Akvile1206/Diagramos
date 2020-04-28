import {getAST} from "./parser.js";
import {generateBDD} from "./bdd.js";
import * as vis from "./vis-network.js";

var ast = null;
var bdd = null;

var nodes = null;
var edges = null;
var network = null;

var number = 0;

function enumerateNodes(bddNode, f, n) {
    if (typeof bddNode.key === "number") {
        f(n);
        return;
    }
    if (bddNode.data === "0" || bddNode.data === "1") {
        bddNode.key = n;
        f(n+1);
        return;
    }
    bddNode.key = n;
    enumerateNodes(bddNode.negative, function(i) {enumerateNodes(bddNode.positive, f, i)}, n+1);
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
  number = 0;
  enumerateNodes(bdd, function() {return;}, 0);
  generateNodes(bdd, 0);
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

var BDD_input = document.getElementById("BDDinput");
var btnGenerate = document.getElementById("generate");
btnGenerate.onclick = function() {
  if(BDD_input.value[BDD_input.value.length - 1] != '$') {
    BDD_input.value = BDD_input.value + "$"; 
  }
  nodes = null;
  ast = null;
  bdd = null;
  ast = getAST(BDD_input.value);
  bdd = generateBDD(ast);
  draw();
};

var input = "!P&&Q->R$";
ast = getAST(input);
bdd = generateBDD(ast);
draw();
BDD_input.value = input;