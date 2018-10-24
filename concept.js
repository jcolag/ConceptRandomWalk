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
  getWord(word, []).then(graph => {
    fs.writeFileSync(`${word}.json`, JSON.stringify(graph, null, 4));
    console.log(`New word written to ${word}.json...`);
    processWord(graph);
  });

async function getWord(word, prevBatch) {
  const urlSite = 'http://api.conceptnet.io';
  const urlPrefix = '/c/en/';
  const url = word.indexOf(urlPrefix) === 0
    ? `${urlSite}${word}`
    : `${urlSite}${urlPrefix}${word}`;
  let done = false;
  let result = await rest(url).then(r => {
    result = JSON.parse(r.entity);
    result.edges = result.edges.concat(prevBatch);
    if (result.hasOwnProperty('view') && result.view.hasOwnProperty('nextPage')) {
      result = getWord(result.view.nextPage, result.edges).then(r => {
        done = true;
        return r;
      });
    } else {
      done = true;
    }
    return result;
  });
  while (!done) {
    await sleep(50);
  }
  return result;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function processWord(wordObj) {
  console.log(wordObj.edges.length);
}


