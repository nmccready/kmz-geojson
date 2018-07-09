const commander = require('commander');
const path = require('path');
const through2 = require('through2');
const fs = require('fs');

const { version } = require('./package.json');
const { toGeoJSON, toKML, writeFileTransform } = require('.');

let somePathToWriteTo, fileToRead;

const debug = require('./debug').spawn('cli');

commander
  .version(version)
  .usage('cat ./tests/fixtures/bigKml.kmz | kmz-to-geo some-dir')
  .usage('./tests/fixtures/bigKml.kmz some-dir')
  .arguments('<writePath|readPath> [writePath]')
  .action(function(readPath, writePath) {
    debug(() => ({ readPath, writePath }));
    if (!writePath) {
      writePath = readPath;
    } else {
      fileToRead = path.join(__dirname, readPath);
    }
    somePathToWriteTo = path.join(__dirname, writePath);

    debug(() => ({ somePathToWriteTo }));
  })
  .option('-u, --unzip', 'unzip only')
  .parse(process.argv);

let processStream;
let inStream = fileToRead ? fs.createReadStream(fileToRead) : process.stdin;

if (commander.unzip) {
  stream = toKML(inStream);
} else {
  stream = toGeoJSON(inStream);
}

stream.pipe(writeFileTransform(somePathToWriteTo));
