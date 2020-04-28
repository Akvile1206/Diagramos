function BDDNode(key, data, negative, positive) {
    this.key = key;
    this.data = data;
    this.negative = negative;
    this.positive = positive;
}

var tree_map = new Map();

var one = new BDDNode("1", "1", null, null);
tree_map.set("1", one);
var zero = new BDDNode("0", "0", null, null);
tree_map.set("0", zero);

function createTree(key, data, negative, positive) {
    if(negative.key == positive.key) {
        return positive;
    }
    var gotten = tree_map.get(key);
    if (typeof gotten === 'undefined') {
        var new_tree = new BDDNode(key, data, negative, positive);
        tree_map.set(key, new_tree);
        return new_tree;
    }
    return gotten;
}

function AST_to_BDD(ast) {
    if (ast._root.data[0] === '~') {
        var identifier = ast._root.data.slice(1, ast._root.data.length);
        var key = "0"+identifier+"1";
        var tree = createTree(key, identifier, zero, one);
        tree_map.set(key, tree);
        return tree;
    }

    switch (ast._root.data) {
        case "$":
            return AST_to_BDD(ast._root.children[0]);
        case "!":
            var child_BDD = AST_to_BDD(ast._root.children[0]);
            return apply_negation(child_BDD);
        case "&&":
            var left_BDD = AST_to_BDD(ast._root.children[0]);
            var right_BDD = AST_to_BDD(ast._root.children[1]);
            return apply_and(left_BDD, right_BDD);
        case "||":
            var left_BDD = AST_to_BDD(ast._root.children[0]);
            var right_BDD = AST_to_BDD(ast._root.children[1]);
            return apply_or(left_BDD, right_BDD);
        case "->":
            var left_BDD = AST_to_BDD(ast._root.children[0]);
            var right_BDD = AST_to_BDD(ast._root.children[1]);
            return apply_implies(left_BDD, right_BDD);
        case "<->":
            var left_BDD = AST_to_BDD(ast._root.children[0]);
            var right_BDD = AST_to_BDD(ast._root.children[1]);
            return apply_bi(left_BDD, right_BDD);
        default:
            console.log("AST root does not match any operators");
    }
}

function apply_bi(left, right) {
    if (left.data === "1") {
        return right;
    } else if (left.data === "0") {
        return apply_negation(right);
    } else if (right.data === "1") {
        return left;
    } else if (right.data === "0") {
        return apply_negation(left);
    }
    var cmp = left.data.localeCompare(right.data);
    switch (cmp) {
        case -1:
            var neg = apply_bi(left.negative, right);
            var pos = apply_bi(left.positive, right);
            var new_key = neg.key + left.data + pos.key;
            return createTree(new_key, left.data, neg, pos);
        case 0:
            var neg = apply_bi(left.negative, right.negative);
            var pos = apply_bi(left.positive, right.positive);
            var new_key = neg.key + left.data + pos.key;
            return createTree(new_key, left.data, neg, pos);
        case 1:
            var neg = apply_bi(left, right.negative);
            var pos = apply_bi(left, right.positive);
            var new_key = neg.key + right.data + pos.key;
            return createTree(new_key, right.data, neg, pos);
    }
}

function apply_implies(left, right) {
    if (left.data === "0" || right.data === "1") {
        return one;
    } else if (left.data === "1" && right.data === "0") {
        return zero;
    } else if (left.data === "1") {
        return right;
    } else if (right.data === "0") {
        return apply_negation(left);
    }
    var cmp = left.data.localeCompare(right.data);
    switch (cmp) {
        case -1:
            var neg = apply_implies(left.negative, right);
            var pos = apply_implies(left.positive, right);
            var new_key = neg.key + left.data + pos.key;
            return createTree(new_key, left.data, neg, pos);
        case 0:
            var neg = apply_implies(left.negative, right.negative);
            var pos = apply_implies(left.positive, right.positive);
            var new_key = neg.key + left.data + pos.key;
            return createTree(new_key, left.data, neg, pos);
        case 1:
            var neg = apply_implies(left, right.negative);
            var pos = apply_implies(left, right.positive);
            var new_key = neg.key + right.data + pos.key;
            return createTree(new_key, right.data, neg, pos);
    }
}

function apply_or(left, right) {
    if (left.data === "1" || right.data === "1") {
        return one;
    } else if (left.data === "0") {
        return right;
    } else if (right.data === "0") {
        return left;
    }
    var cmp = left.data.localeCompare(right.data);
    switch (cmp) {
        case -1:
            var neg = apply_or(left.negative, right);
            var pos = apply_or(left.positive, right);
            var new_key = neg.key + left.data + pos.key;
            return createTree(new_key, left.data, neg, pos);
        case 0:
            var neg = apply_or(left.negative, right.negative);
            var pos = apply_or(left.positive, right.positive);
            var new_key = neg.key + left.data + pos.key;
            return createTree(new_key, left.data, neg, pos);
        case 1:
            var neg = apply_or(left, right.negative);
            var pos = apply_or(left, right.positive);
            var new_key = neg.key + right.data + pos.key;
            return createTree(new_key, right.data, neg, pos);
    }
}

function apply_and(left, right) {
    if (left.data === "0" || right.data === "0") {
        return zero;
    } else if (left.data === "1") {
        return right;
    } else if (right.data === "1") {
        return left;
    }
    var cmp = left.data.localeCompare(right.data);
    switch (cmp) {
        case -1:
            var neg = apply_and(left.negative, right);
            var pos = apply_and(left.positive, right);
            var new_key = neg.key + left.data + pos.key;
            return createTree(new_key, left.data, neg, pos);
        case 0:
            var neg = apply_and(left.negative, right.negative);
            var pos = apply_and(left.positive, right.positive);
            var new_key = neg.key + left.data + pos.key;
            return createTree(new_key, left.data, neg, pos);
        case 1:
            var neg = apply_and(left, right.negative);
            var pos = apply_and(left, right.positive);
            var new_key = neg.key + right.data + pos.key;
            return createTree(new_key, right.data, neg, pos);
    }
}

function apply_negation(bdd) {
    if (bdd.data === "0") {
        return one;
    } else if (bdd.data === "1") {
        return zero;
    }
    var neg = apply_negation(bdd.negative);
    var pos = apply_negation(bdd.positive);
    var new_key = neg.key + bdd.data + pos.key;
    return createTree(new_key, bdd.data, neg, pos);
}

function generateBDD(ast) {
    tree_map = new Map();
    one = new BDDNode("1", "1", null, null);
    tree_map.set("1", one);
    zero = new BDDNode("0", "0", null, null);
    tree_map.set("0", zero);
    var bdd = AST_to_BDD(ast);
    return bdd;
}
export {generateBDD};