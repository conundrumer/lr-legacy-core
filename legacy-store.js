// SINGLETON BECAUSE ORIGINAL CODE USES GLOBALS EVERYWHERE
// until i refactor properly

/*eslint no-underscore-dangle: 0*/
/*eslint no-new-object: 0*/
/*eslint eqeqeq: 0*/

var _ = require('lodash');

const GRIDSIZE = 14;

var grid; // private global


function gridPos(x, y)
{
  var ggridPos = new Object();
  ggridPos.x = Math.floor(x / GRIDSIZE);
  ggridPos.y = Math.floor(y / GRIDSIZE);
  ggridPos.gx = x - GRIDSIZE * ggridPos.x;
  ggridPos.gy = y - GRIDSIZE * ggridPos.y;
  return (ggridPos);
} // End of the function


function register(line, x, y)
{
  var _loc1 = "x" + x;
  var _loc3 = "y" + y;
  var _loc4 = new Object();
  _loc4.storage = [];
  _loc4.storage2 = [];
  if (grid[_loc1] == undefined)
  {
    grid[_loc1] = [];
  } // end if
  if (grid[_loc1][_loc3] == undefined)
  {
    grid[_loc1][_loc3] = _loc4;
  } // end if
  line.grids.push([x, y]);
  if (line.type != 2)
  {
    grid[_loc1][_loc3].storage2[line.name] = line;
  } // end if
  grid[_loc1][_loc3].storage[line.name] = line;
} // End of the function


function registerInGrid (line)
{
  var _loc1 = gridPos(line.x1, line.y1);
  var _loc10 = gridPos(line.x2, line.y2);
  var _loc13 = line.dx > 0 ? (_loc10.x) : (_loc1.x);
  var _loc11 = line.dx > 0 ? (_loc1.x) : (_loc10.x);
  var _loc7 = line.dy > 0 ? (_loc10.y) : (_loc1.y);
  var _loc12 = line.dy > 0 ? (_loc1.y) : (_loc10.y);
  if (line.dx == 0 && line.dy == 0 || _loc1.x == _loc10.x && _loc1.y == _loc10.y)
  {
    register(line, _loc1.x, _loc1.y);
    return;
  }
  else
  {
    register(line, _loc1.x, _loc1.y);
  } // end else if
  var _loc4 = line.x1;
  var _loc3 = line.y1;
  var _loc8 = 1 / line.dx;
  var _loc9 = 1 / line.dy;
  while (true)
  {
    var difX;
    var _loc5;
    if (_loc1.x < 0)
    {
      difX = line.dx > 0 ? (GRIDSIZE + _loc1.gx) : (-GRIDSIZE - _loc1.gx);
    }
    else
    {
      difX = line.dx > 0 ? (GRIDSIZE - _loc1.gx) : (-(_loc1.gx + 1));
    } // end else if
    if (_loc1.y < 0)
    {
      _loc5 = line.dy > 0 ? (GRIDSIZE + _loc1.gy) : (-GRIDSIZE - _loc1.gy);
    }
    else
    {
      _loc5 = line.dy > 0 ? (GRIDSIZE - _loc1.gy) : (-(_loc1.gy + 1));
    } // end else if
    if (line.dx == 0)
    {
      _loc3 = _loc3 + _loc5;
    }
    else if (line.dy == 0)
    {
      _loc4 = _loc4 + difX;
    }
    else
    {
      var _loc6 = _loc3 + line.dy * difX * _loc8;
      if (Math.abs(_loc6 - _loc3) < Math.abs(_loc5))
      {
        _loc4 = _loc4 + difX;
        _loc3 = _loc6;
      }
      else if (Math.abs(_loc6 - _loc3) == Math.abs(_loc5))
      {
        _loc4 = _loc4 + difX;
        _loc3 = _loc3 + _loc5;
      }
      else
      {
        _loc4 = _loc4 + line.dx * _loc5 * _loc9;
        _loc3 = _loc3 + _loc5;
      } // end else if
    } // end else if
    _loc1 = gridPos(_loc4, _loc3);
    if (_loc1.x >= _loc11 && _loc1.x <= _loc13 && _loc1.y >= _loc12 && _loc1.y <= _loc7)
    {
      register(line, _loc1.x, _loc1.y);
      continue;
    } // end if
    return;
  } // end while
}


function satisfyBoundaries(point, handler)
{
  // for (var i = 0; i < riderAnchors.length; ++i)
  // {
  //   var point = riderAnchors[i];

  /*var grid = gridPos(point.x, point.y);*/
  var cell = gridPos(point.x, point.y);
  for (var j = -1; j < 2; ++j)
  {
    /*var xLoc = "x" + (grid.x + j);*/
    var xLoc = "x" + (cell.x + j);
    if (grid[xLoc] == undefined)
    {
      continue;
    } // end if
    for (var k = -1; k < 2; ++k)
    {
      /*var yLoc = "y" + (grid.y + k);*/
      var yLoc = "y" + (cell.y + k);
      if (grid[xLoc][yLoc] == undefined)
      {
        continue;
      } // end if
      // console.log('iterating through lines:', grid[xLoc][yLoc].storage2);
      var lines = [];
      for (var line in grid[xLoc][yLoc].storage2)
      {
        lines.unshift(grid[xLoc][yLoc].storage2[line]);
        // console.log('line', line);
        /*grid[xLoc][yLoc].storage2[line].colide(point);*/
        // handler(grid[xLoc][yLoc].storage2[line]);
      } // end of for...in
      lines.forEach(handler);
    } // end of for
  } // end of for

  // } // end of for
} // End of the function

function LegacyStore() {
  this.lines = [];
  grid = [];
}
LegacyStore.prototype = {

  get grid() {
    return grid;
  },

  addLine(line) {
    this.lines.push(line);
    registerInGrid(line);
  },

  selectCollidingLines(x, y, handler) {
    satisfyBoundaries({ x: x, y: y }, handler);
  }

};

module.exports = LegacyStore;
