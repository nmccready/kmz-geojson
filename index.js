const togeojson = require('togeojson');
const unzip = require('unzip-stream');
const Entry = require('unzip-stream/lib/entry');
const xmldom = new (require('xmldom')).DOMParser();
const through2 = require('through2');
const { collect } = require('fstream');

const jsonDebug = require('./debug').spawn('toGeoJSON');

function toKML(stream) {
  return stream.pipe(unzip.Parse());
}

function toGeoJSON(stream) {
  let entry;
  let featuresStr;
  let firstTransform = true;

  const transRoot = (_entry, _, cb) => {
    entry = new Entry();

    const path = _entry.path.replace('.kml', '.json');
    entry.path = path;

    _entry.pipe(through2.obj(transformEntry, flush));
    cb(undefined, entry);
  };

  const transformEntry = (kml, _, cb) => {
    
    if(featuresStr) { // lazy write for commas
      entry.write(`${featuresStr},\n`);
    }

    const dbg = jsonDebug.spawn('entry');
    dbg(() => 'transform');
    try {
      const geoJson = togeojson.kml(xmldom.parseFromString(String(kml)));
      featuresStr = JSON.stringify(geoJson.features);
      featuresStr = featuresStr.replace(/^\[/, '').slice(0, -1);
      dbg(() => `geojson: ${featuresStr}`);
      if (firstTransform) {
        firstTransform = false;
        entry.write('{"type":"FeatureCollection","features": [')
      }
      
      cb();
    } catch (e) {
      cb(e);
    }
  };

  function flush(cb) {
    entry.write(`${featuresStr}]}`);
    entry.end();
    entry = undefined;
    jsonDebug(() => 'flushed');
    cb();
  }

  return toKML(stream).pipe(through2.obj(transRoot));
}

module.exports = {
  toKML,
  toGeoJSON
};
