var Combinatorics = require('js-combinatorics');

var cards = Combinatorics
    .combination([1, 2, 3, 4,],2)
    .toArray()
    ;

    console.log(cards)