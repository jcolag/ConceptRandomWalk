const rest = require('rest');
const fs = require('fs');

var word = 'example';
if (process.argv.length > 2) {
  word = process.argv[process.argv.length - 1];
}
rest(`http://api.conceptnet.io/c/en/${word}`)
  .then(r => {
    const relations = {};
    const result = JSON.parse(r.entity);
    fs.writeFileSync(`${word}.json`, JSON.stringify(result, null, 4));
    console.log(`Written to ${word}.json`);
  });

