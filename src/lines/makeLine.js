'use strict';

var { SOLID_LINE, ACC_LINE, SCENERY_LINE } = require('./LineTypes');
var SolidLine = require('./SolidLine');
var AccLine = require('./AccLine');
var SceneryLine = require('./SceneryLine');

function makeLine(l) {
    let LineType;

  switch (l.type) {
    case SOLID_LINE:
      LineType = SolidLine;
      break;
    case ACC_LINE:
      LineType = AccLine;
      break;
    case SCENERY_LINE:
      LineType = SceneryLine;
      break;
    default:
      throw new Error('Unknown line type: ' + l.type);
  }

  let line = new LineType(l.id, l.x1, l.y1, l.x2, l.y2, l.flipped, l.extended);
  if (l.type !== SCENERY_LINE) {
    line.leftLine = l.leftLine || null;
    line.rightLine = l.rightLine || null;
  }

  return line;
}

module.exports = makeLine;
