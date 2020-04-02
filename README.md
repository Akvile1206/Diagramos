# Diagramos
#### *[djagramos] f pl* - diagrams, charts

This minimalistic app can be used to prove simple first order logic formulas.

## How to use this app?
1. Clone this repository.
2. You can launch the app by starting a http server in the directory that you cloned the repository in. A simple node http server works just fine. Alternatively, you can just open `index.html` file in your browser (Microsoft Edge works fine, Google Chrome seems to encouter some problems loading javascript). 
3. Enter a logical expression into the text field and hit the button. Lexing and parsing errors will be indicated in the console.
4. Use the generated BDD to prove the formula. If the diagram is just a node with label "1" - the formula is valid (a theorem); if it is just a "0" node, then the formula is invalid; if there are "paths" to both 0 and 1, then the formula is satisfiable. 

Conventions used: 
* The ordering of predicates is alphabetical.
* Dashed line means negative, solid - positive.

## How to enter a logical expression?
Here is the list of operations supported by Diagramos (in the order of precedence):
* ***negation*** as a prefix operator `!`
* ***conjunction*** as an infix operator `&&`. Associates to the right.
* ***disjunction*** as an infix operator `||`. Associates to the right.
* ***implication*** and ***bi-implication*** as infix operators `->` and `<->` respectively. Both associate to the right.

Parenthesese `(` `)` around an expression are also supported.
