
var _ = require('lodash');

var { Grid, GridV62, GridV61, getCellHash } = require('./grid');

const GRID_SIZE = 14;

class LineStore {
  constructor() {
    // if performance problems, will make this array sorted
    this.lines = [];
  }

  addLine(line) {
    this.lines.push(line);
  }

  removeLine(line) {
    this.lines = _.without(this.lines, line);
  }

  // returns an array of lines in this bounding box or radius
  getLines(x1, y1, x2, y2) {
    if (y2 === undefined) {
      let r = x2;
      return this.getLinesInRadius(x1, y1, r);
    }
    return this.getLinesInBox(x1, y1, x2, y2);
  }

  getLinesInRadius(x, y, r) {
    return _.filter(this.lines, line => line.inRadius(x, y, r));
  }

  getLinesInBox(x1, y1, x2, y2) {
    return _.filter(this.lines, line => line.inBox(x1, y1, x2, y2));
  }

  // the ordering of the lines affects the physics
  getSolidLinesAt(x, y, debug = false) {
    return _.filter(this.lines, line => line.isSolid);
  }

}

class GridStore extends LineStore {
  constructor() {
    super();

    // for solid lines
    this.solidGrid = new GridV62(GRID_SIZE, true);

    // for all lines
    // darn there was a clever data structure for this stuff what was it
    // i think it was 2d sorted arrays?
    // i'll do it later
    this.grid = new Grid(GRID_SIZE * 4, false);

    // for some reason, querying the grid is time consuming, so caching improves performance
    this.resetSolidLinesCache();
  }

  addLine(line) {
    super.addLine(line);

    this.grid.addLine(line);

    if (line.isSolid) {
      this.solidGrid.addLine(line);
      this.resetSolidLinesCache();
    }
  }

  removeLine(line) {
    super.removeLine(line);

    this.grid.removeLine(line);

    if (line.isSolid) {
      this.solidGrid.removeLine(line);
      this.resetSolidLinesCache();
    }
  }

  getSolidLinesAt(x, y, debug = false) {
    let cellPos = this.solidGrid.getCellPos(x, y);

    let key = getCellHash(cellPos.x, cellPos.y);
    let lines = this.solidLinesCache[key];
    if (lines) {
      return lines;
    }
    lines = [];

    let addLine = line => lines.push(line);

    // normally i would avoid for loops but lots of iterations here
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let lines = this.solidGrid.getLinesFromCell(i + cellPos.x, j + cellPos.y);
        for (let k = 0; k < lines.length; k++) {
          addLine(lines[k]);
        }
      }
    }

    this.solidLinesCache[key] = lines;

    return lines;
  }

  getLines(cPos) {
    return this.solidGrid.getLinesFromCell(cPos);
  }

  resetSolidLinesCache() {
    this.solidLinesCache = Object.create(null);
  }

  getLinesInRadius(x, y, r) {
    return this.grid.getLinesInRadius(x, y, r);
  }

  getLinesInBox(x1, y1, x2, y2) {
    return this.grid.getLinesInBox(x1, y1, x2, y2);
  }

}

class OldGridStore extends GridStore {
  constructor() {
    super();

    this.solidGrid = new GridV61(GRID_SIZE, true);
  }

}

module.exports = {
  GRID_SIZE: GRID_SIZE,
  LineStore: LineStore,
  GridStore: GridStore,
  OldGridStore: OldGridStore
};