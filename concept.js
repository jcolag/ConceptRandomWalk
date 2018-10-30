const rest = require('rest');
const fs = require('fs');

var word = 'example';
var graph;
if (process.argv.length > 2) {
  word = process.argv[process.argv.length - 1];
}

if (fs.existsSync(`${word}.json`)) {
  graph = JSON.parse(fs.readFileSync(`${word}.json`))
  processWord(graph);
} else {
  getWord(word, []).then(graph => {
    fs.writeFileSync(`${word}.json`, JSON.stringify(graph, null, 4));
    processWord(graph);
  });
}

async function getWord(word, prevBatch) {
  const urlSite = 'http://api.conceptnet.io';
  const urlPrefix = '/c/en/';
  const url = word.indexOf(urlPrefix) === 0
    ? `${urlSite}${word}`
    : `${urlSite}${urlPrefix}${word}`;
  let done = false;
  let result = await rest(url).then(r => {
    let result = JSON.parse(r.entity);
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
  const relations = {};
  const edges = wordObj.edges;
  
  // Organize the edges by concept
  for (var i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const rel = edge.rel;
    if (!relations.hasOwnProperty(rel.label)) {
      relations[rel.label] = [];
    }
    relations[rel.label].push(edge.end);
  }

  const use = randomLabel(relations, 'UsedFor');
  const rec = randomLabel(relations, 'ReceivesAction');
  const prop = randomLabel(relations, 'HasProperty');
  const part = randomLabel(relations, 'HasA');
  var prep = 'to';
  if (use.text.indexOf('ing') > -1) {
    prep = 'for';
  }

  console.log(`Use a ${word} ${prep} ${use.text}; it's ${rec.text} and may be ${prop.text}! Oh, and watch out for the ${part.text}...'`);
}

function randomLabel(list, name) {
  try {
    const which = Math.floor(Math.random() * list[name].length);
    return {
      text: list[name][which].label,
    };
  } catch(e) {
    console.log(`${name} doesn't have any items...`);
  }
  return {
    text: '<nothing>',
  };
}

