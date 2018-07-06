const togeojson = require('togeojson');
const unzip = require('unzip2');
const xmldom = new (require('xmldom')).DOMParser();
const through2 = require('through2');

function toKML(stream) {
  return stream.pipe(unzip.Parse());
}

function toGeoJSON(stream) {
  return toKML(stream).pipe(
    through2.obj((kml, _, cb) => {
      try {
        const geoJson = togeojson.kml(xmldom.parseFromString(kml));
        cb(undefined, geoJson);
      } catch (e) {
        cb(e);
      }
    })
  );
}

module.exports = {
  toKML,
  toGeoJSON
};
