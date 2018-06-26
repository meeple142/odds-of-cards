var Combinatorics = require('js-combinatorics'),
    dsv = require('d3-dsv'),
    fs = require('fs');

function sum(c1, c2) {
    return c1.value + c2.value;
}

function toCard(c1) {
    return c1.value + c1.color[0];
}

var cards = Combinatorics
    .cartesianProduct([1, 2, 3, 4, 5, 6], ["red", "blue"])
    .toArray()
    .map(d => ({
        value: d[0],
        color: d[1]
    }));



var pairs = Combinatorics.combination(cards, 2).toArray();

/*
sum >= 10
sum <= 4
sum = 7
both red
both even
both the same number
*/


var tests = [
    {
        name: 'sum <= 10',
        f: (c1, c2) => sum(c1, c2) >= 10
    },
    {
        name: 'sum <= 4',
        f: (c1, c2) => sum(c1, c2) <= 4
    },
    {
        name: 'sum <= 9',
        f: (c1, c2) => sum(c1, c2) >= 9
    },
    {
        name: 'sum <= 3',
        f: (c1, c2) => sum(c1, c2) <= 3
    },
    {
        name: 'sum = 7',
        f: (c1, c2) => sum(c1, c2) === 7
    },
    {
        name: 'both red',
        f: (c1, c2) => c1.color === 'red' && c2.color === "red"
    },
    {
        name: 'both even',
        f: (c1, c2) => c1.value % 2 === 0 && c2.value % 2 === 0
    },
    {
        name: 'same value',
        f: (c1, c2) => c1.value === c2.value
    },
    {
        name: 'not same color',
        f: (c1, c2) => c1.color !== c2.color
    },
    {
        name: 'same color',
        f: (c1, c2) => c1.color === c2.color
    },
    {
        name: 'both odd or both even',
        f: (c1, c2) => {
            var c1IsEven = c1.value % 2 === 0,
             c2IsEven = c2.value % 2 === 0;

            return (c1IsEven && c2IsEven) || (!c1IsEven && !c2IsEven);
        }
    },
    {
        name: 'not same number',
        f: (c1, c2) =>  c1.value !== c2.value
    },
    {
        name: '6 <= sum <= 8',
        f: (c1, c2) =>  {
            var sumV = sum(c1, c2);
            return sumV >= 6 && sumV <= 8;
        }
    },
    {
        name: 'one odd and one even',
        f: (c1, c2) =>  (c1.value % 2 === 0) !== (c2.value % 2 === 0)
    },
    {
        name: 'both blue and both odd',
        f: (c1, c2) =>  c1.value % 2 === 1 && c2.value % 2 === 1 && c1.color === "blue" && c2.color === "blue"
    },
    {
        name: 'blue odd and red even',
        f: (c1, c2) => {
            var v1 = (c1.value % 2 === 1 && c1.color === "blue") && (c2.value % 2 === 0 && c2.color === "red"), 
            v2 = (c2.value % 2 === 1 && c2.color === "blue") && (c1.value % 2 === 0 && c1.color === "red") 
            return v1 || v2;
        }
    },
    {
        name: 'sum > 8 and only even',
        f: (c1, c2) =>  c1.value % 2 === 0 && c2.value % 2 === 0 && sum(c1,c2) > 8
    },
]
/* 
not same color
same color
both odd or both even
not same number
6-8
1 odd, 1 even
 */

// run all the tests
var pairsWithTests = pairs.map(pair => {
    var out = {
        c1: toCard(pair[0]),
        c2: toCard(pair[1])
    };
    //loop all the tests, add key and set val to 1 or 0 based on test
    return tests.reduce((out, test) => {
        out[test.name] = test.f(pair[0], pair[1]) ? 1 : 0;
        return out;
    }, out);
})
var csvOut = dsv.csvFormat(pairsWithTests);
//console.log(csvOut);
//fs.writeFileSync(`csvOut-${Date.now()}.csv`, csvOut, 'utf8');

//rollup the sums
//make the lists
var rollUp = tests.reduce((acc,test)=>{
    acc[test.name] = 0;
    return acc;
},{})
//sum them up
rollUp = pairsWithTests.reduce((rollUp,pair)=>{
    var key;

    for(key in rollUp){
        rollUp[key] += pair[key];
    }

    return rollUp;
},rollUp)

function makeReport(rollUp){
//how big is the first column
    var rollUpCopy = Object.assign({},rollUp);
    var headers = ['Goal','Number of pairs that work'];
    var keys = Object.keys(rollUpCopy),
    widthCol1 = Math.max(headers[0].length ,...keys.map(key=>key.length)) + 2,
    //turn into 2d array and sort
    arr = keys.reduce((arr, key)=>{
        arr.push([key, rollUpCopy[key]]);
        return arr;
    },[])
    .sort((a,b)=>{
        return a[1] - b[1];
    });
    
    //add headers
    arr.unshift(headers)
    
    textOut = arr.reduce((textOut, stat)=>{
        textOut += stat[0].padEnd(widthCol1) + stat[1] + '\n';
        return textOut;
    },'');;

    return textOut;
}
var report = makeReport(rollUp);
console.log();
console.log(report);
fs.writeFileSync(`report.txt`, report, 'utf8');

