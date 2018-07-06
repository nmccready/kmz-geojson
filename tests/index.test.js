const { expect } = require('chai');
const path = require('path');
const fstream = require('fstream');
const fs = require('fs');
const del = require('del');
const through2 = require('through2');
const glob = require('glob');
const { toGeoJSON, toKML } = require('..');
const { name } = require('../package.json');

const outPath = path.join(__dirname, 'out');

describe(name, () => {
  beforeEach(() => del(path.join(__dirname, 'out', '*.kml')));

  it('unzip at least 1 kml file', done => {
    const inputStream = fs.createReadStream(
      path.join(__dirname, 'fixtures', 'bigKml.kmz')
    );

    toKML(inputStream)
      .pipe(fstream.Writer(outPath))
      .once('error', e => done(e))
      .once('close', () => {
        glob(path.join(outPath, '*.kml'), (er, files) => {
          if (er) done(er);
          expect(files.length).to.be.ok;
          done();
        });
      });
  });
});
