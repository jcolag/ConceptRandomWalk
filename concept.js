const rest = require('rest');
const fs = require('fs');

var word = 'example';
var graph;
if (process.argv.length > 2) {
  word = process.argv[process.argv.length - 1];
}

if (fs.existsSync(`${word}.json`)) {
  console.log(`Already have "${word}"...`);
  graph = JSON.parse(fs.readFileSync(`${word}.json`))
  processWord(graph);
  return;
}

rest(`http://api.conceptnet.io/c/en/${word}`)
  .then(r => {
    const relations = {};
    graph = JSON.parse(r.entity);
    fs.writeFileSync(`${word}.json`, JSON.stringify(graph, null, 4));
    console.log(`New word written to ${word}.json...`);
    processWord(graph);
  });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function processWord(wordObj) {
  console.log(wordObj.edges.length);
}


