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
const debug = require('../debug').spawn('test');

const writeFileTransform = () => through2.obj((entry, e, cb) => {
  debug(() => entry.path);
  entry
    .pipe(fs.createWriteStream(path.join(outPath, entry.path)))
    .once('finish', cb);
});

describe(name, () => {
  beforeEach(() => del(path.join(__dirname, 'out', '*.kml')));

  describe('toKML', () => {
    it('unzip at least 1 kml file', done => {
      const inputStream = fs.createReadStream(
        path.join(__dirname, 'fixtures', 'bigKml.kmz')
      );

      toKML(inputStream)
        .pipe(writeFileTransform())
        .once('error', e => done(e))
        .once('finish', () => {
          glob(path.join(outPath, '*.kml'), (er, files) => {
            if (er) done(er);
            expect(files.length).to.be.ok;
            done();
          });
        });
    });
  });

  describe('toGeoJSON', () => {
    it('kmz to geo JSON', done => {
      const inputStream = fs.createReadStream(
        path.join(__dirname, 'fixtures', 'bigKml.kmz')
      );

      toGeoJSON(inputStream)
      .pipe(writeFileTransform())
        .once('error', e => done(e))
        .once('finish', () => {
          glob(path.join(outPath, '*.json'), (er, files) => {
            if (er) done(er);
            expect(files.length).to.be.ok;
            done();
          });
        });
    });
  });
});
