/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import RackTableCell from './rack-table-cell'
import RackTableLayout from './rack-table-layout'
import Rack from './rack'

var {
  Table,
  Component,
  Component3d,
  Container,
  Layout,
  Model
} = scene;

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'rows',
    name: 'rows',
    property: 'rows'
  }, {
    type: 'number',
    label: 'columns',
    name: 'columns',
    property: 'columns'
  }, {
    type: 'string',
    label: 'zone',
    name: 'zone',
    property: 'zone'
  }, {
    type: 'number',
    label: 'min-section',
    name: 'minSection'
  }, {
    type: 'number',
    label: 'min-unit',
    name: 'minUnit'
  }, {
    type: 'string',
    label: 'location-pattern',
    name: 'locPattern',
    property: {
      placeholder: '{z}{s}-{u}-{sh}'
    }
  }, {
    type: 'rack-increase-pattern',
    label: 'increase-pattern',
    name: 'increasePattern'
  }, {
    type: 'string',
    label: 'shelf-pattern',
    name: 'shelfPattern',
    property: {
      placeholder: '#, 00, 000'
    }
  }]
}

const SIDES = {
  all: ['top', 'left', 'bottom', 'right'],
  out: ['top', 'left', 'bottom', 'right'],
  left: ['left'],
  right: ['right'],
  top: ['top'],
  bottom: ['bottom'],
  leftright: ['left', 'right'],
  topbottom: ['top', 'bottom']
}

const CLEAR_STYLE = {
  strokeStyle: '',
  lineDash: 'solid',
  lineWidth: 0
}

const DEFAULT_STYLE = {
  strokeStyle: '#999',
  lineDash: 'solid',
  lineWidth: 1
}

const RACK_TABLE_LAYOUT = Layout.get('rack-table')

function hasAnyProperty(o, ...properties) {
  for (let p in properties) {
    if (o.hasOwnProperty(properties[p]))
      return true
  }
}

function buildNewCell(app) {
  return Model.compile({
    type: 'rack-table-cell',
    strokeStyle: 'blue',
    left: 0,
    top: 0,
    width: 1,
    height: 1,
    textWrap: true,
    border: buildBorderStyle(DEFAULT_STYLE, 'all')
  }, app)
}

function buildCopiedCell(copy, app) {
  var obj = JSON.parse(JSON.stringify(copy))
  delete obj.text
  return Model.compile(obj, app)
}

function buildBorderStyle(style, where) {
  return (SIDES[where] || []).reduce((border, side) => {
    border[side] = style
    return border
  }, {})
}

function setCellBorder(cell, style, where) {
  if (!cell)
    return
  cell.set('border', Object.assign({}, cell.get('border') || {}, buildBorderStyle(style, where)))
}

function isLeftMost(total, columns, indices, i) {
  return i == 0 || !(i % columns) || indices.indexOf(i - 1) == -1;
}

function isRightMost(total, columns, indices, i) {
  return i == total - 1 || (i % columns == columns - 1) || indices.indexOf(i + 1) == -1;
}

function isTopMost(total, columns, indices, i) {
  return i < columns || indices.indexOf(i - columns) == -1;
}

function isBottomMost(total, columns, indices, i) {
  return i > (total - columns - 1) || indices.indexOf(i + columns) == -1;
}

function above(columns, i) {
  return i - columns;
}

function below(columns, i) {
  return i + columns;
}

function before(columns, i) {
  return !(i % columns) ? -1 : i - 1;
}

function after(columns, i) {
  return !((i + 1) % columns) ? -1 : i + 1;
}

function array(value, size) {
  var arr = []
  for (let i = 0; i < size; i++)
    arr.push(1)
  return arr
}

var columnControlHandler = {
  ondragmove: function (point, index, component) {
    var { left, top, width, height } = component.textBounds
    var widths_sum = component.widths_sum

    var widths = component.widths.slice()

    /* 컨트롤의 원래 위치를 구한다. */
    var origin_pos_unit = widths.slice(0, index + 1).reduce((sum, width) => sum + width, 0)
    var origin_offset = left + origin_pos_unit / widths_sum * width

    /*
     * point의 좌표는 부모 레이어 기준의 x, y 값이다.
     * 따라서, 도형의 회전을 감안한 좌표로의 변환이 필요하다.
     * Transcoord시에는 point좌표가 부모까지 transcoord되어있는 상태이므로,
     * 컴포넌트자신에 대한 transcoord만 필요하다.(마지막 파라미터를 false로).
     */
    var transcoorded = component.transcoordP2S(point.x, point.y)
    var diff = transcoorded.x - origin_offset

    var diff_unit = diff / width * widths_sum

    var min_width_unit = (widths_sum / width) * 10 // 10픽셀정도를 최소로

    if (diff_unit < 0)
      diff_unit = - Math.min(widths[index] - min_width_unit, -diff_unit)
    else
      diff_unit = Math.min(widths[index + 1] - min_width_unit, diff_unit)

    widths[index] = Math.round((widths[index] + diff_unit) * 100) / 100
    widths[index + 1] = Math.round((widths[index + 1] - diff_unit) * 100) / 100

    component.set('widths', widths)
  }
}

var rowControlHandler = {
  ondragmove: function (point, index, component) {
    var { left, top, width, height } = component.textBounds
    var heights_sum = component.heights_sum

    var heights = component.heights.slice()

    /* 컨트롤의 원래 위치를 구한다. */
    index -= component.columns - 1
    var origin_pos_unit = heights.slice(0, index + 1).reduce((sum, height) => sum + height, 0)
    var origin_offset = top + origin_pos_unit / heights_sum * height

    /*
     * point의 좌표는 부모 레이어 기준의 x, y 값이다.
     * 따라서, 도형의 회전을 감안한 좌표로의 변환이 필요하다.
     * Transcoord시에는 point좌표가 부모까지 transcoord되어있는 상태이므로,
     * 컴포넌트자신에 대한 transcoord만 필요하다.(마지막 파라미터를 false로).
     */
    var transcoorded = component.transcoordP2S(point.x, point.y)
    var diff = transcoorded.y - origin_offset

    var diff_unit = diff / height * heights_sum

    var min_height_unit = (heights_sum / height) * 10 // 10픽셀정도를 최소로

    if (diff_unit < 0)
      diff_unit = - Math.min(heights[index] - min_height_unit, -diff_unit)
    else
      diff_unit = Math.min(heights[index + 1] - min_height_unit, diff_unit)

    heights[index] = Math.round((heights[index] + diff_unit) * 100) / 100
    heights[index + 1] = Math.round((heights[index + 1] - diff_unit) * 100) / 100

    component.set('heights', heights)
  }
}

export default class RackTable3d extends THREE.Group {

  constructor(model, canvasSize, threeContainer, sceneComponent) {

    super();

    this._model = model;
    this._threeContainer = threeContainer;
    this._sceneComponent = sceneComponent;

    this.createRacks(model, canvasSize);
    this.mergeObjects()
  }

  createRacks(model, canvasSize) {

    var {
      components = [],
      left,
      top,
      zone,
      locPattern,
      shelfPattern,
      increasePattern = '+u+s',
      columns,
      rows,
      minUnit = 1,
      minSection = 1
    } = model;


    var currCol = 0;
    var currRow = 0;
    var unit = currCol;
    var section = currRow;
    var unitOperator = 1;
    var sectionOperator = 1;

   var patternChecker = /([\+,\-])([u,s])([\+,\-])([u,s])/i;

    var matches = increasePattern.match(patternChecker);
    if (!matches || matches.length < 5) {
      console.warn("Rack Pattern Error", increasePattern);
      return false;
    }

    components.forEach(rackModel => {

      rackModel.depth = rackModel.depth || 20;
      rackModel.shelves = rackModel.shelves || 1;
      rackModel.left += left;
      rackModel.top += top;
      rackModel.zone = zone;
      rackModel.locPattern = locPattern;
      rackModel.shelfPattern = shelfPattern;

      if (matches[2] == 'u') {
        if (matches[1] == '+')
          unit = currCol + minUnit
        else
          unit = columns - currCol - 1 + minUnit
      } else {
        if (matches[1] == '+')
          section = currCol + minSection
        else
          section = columns - currCol - 1 + minSection
      }

      if (matches[4] == 'u') {
        if (matches[1] == '+')
          unit = currRow + minUnit
        else
          unit = rows - currRow - 1 + minUnit
      } else {
        if (matches[1] == '+')
          section = currRow + minSection
        else
          section = rows - currRow - 1 + minSection
      }

      rackModel.unit = unit.toString().padStart(2, 0);
      rackModel.section = section.toString().padStart(2, 0);


      var rack = new Rack(rackModel, canvasSize, this._threeContainer, this._sceneComponent);
      this.add(rack);

      currCol++;

      if (currCol >= columns) {
        currCol = 0;
        currRow++;
      }

    })

  }

  mergeObjects() {
    var frames = [];
    var boards = [];
    this.children.forEach(rack => {
      frames = frames.concat(rack.frames);
      boards = boards.concat(rack.boards);
    })

    var targetFrame
    frames.forEach(frameGroup => {
      frameGroup.children.forEach(f => {
        if (!targetFrame) {
          targetFrame = f;
          return;
        }

        targetFrame.geometry.merge(f.geometry);
      })
    })
    var targetBoard
    boards.forEach(b => {
      if (!targetBoard) {
        targetBoard = b;
        return;
      }

      targetBoard.geometry.merge(b.geometry);
    })
  }

  // convertTableLocInfoToRackLocInfo(isIncrement, isColumn, tableLoc, rackLoc) {
  //   var operator = isIncrement ? 1 : -1
  //   if (isColumn) {

  //   }


  // }

  raycast(raycaster, intersects) {

  }

  onchange(after, before) {
    if (after.hasOwnProperty("data")) {
      this.data = after.data;
    }
  }

}


export class RackTable extends Container {

  is3dish() {
    return true;
  }

  created() {
    var tobeSize = this.rows * this.columns
    var gap = this.size() - tobeSize

    if (gap == 0) {
      return
    } else if (gap > 0) {
      let removals = this._components.slice(gap);
      this.remove(removals);
    } else {
      let newbies = []

      for (let i = 0; i < -gap; i++)
        newbies.push(buildNewCell(this.app));

      this.add(newbies);
    }

    var widths = this.get('widths')
    var heights = this.get('heights')

    if (!widths || widths.length < this.columns)
      this.set('widths', this.widths)
    if (!heights || heights.length < this.rows)
      this.set('heights', this.heights)
  }

  // 컴포넌트를 임의로 추가 및 삭제할 수 있는 지를 지정하는 속성임.
  get focusible() {
    return false
  }

  get widths() {
    var widths = this.get('widths')

    if (!widths)
      return array(1, this.columns)

    if (widths.length < this.columns)
      return widths.concat(array(1, this.columns - widths.length))
    else if (widths.length > this.columns)
      return widths.slice(0, this.columns)

    return widths
  }

  get heights() {
    var heights = this.get('heights')

    if (!heights)
      return array(1, this.rows)

    if (heights.length < this.rows)
      return heights.concat(array(1, this.rows - heights.length))
    else if (heights.length > this.rows)
      return heights.slice(0, this.rows)

    return heights
  }

  buildCells(newrows, newcolumns, oldrows, oldcolumns) {

    if (newrows < oldrows) {
      let removals = this._components.slice(oldcolumns * newrows);

      // 지우려는 셀중에 병합된 셀을 찾는다.
      let mergedCells = [];
      removals.forEach((cell) => {
        if (cell.merged === true || cell.rowspan > 1 || cell.colspan > 1)
          mergedCells.push(cell);
      });

      // 병합된 셀 중에서 슈퍼셀을 찾는다.
      if (mergedCells.length > 0) {
        // 부모 셀을 저장
        let superCells = [];
        // 부모 셀의 인덱스를 저장
        let superCellIndexes = [];
        mergedCells.forEach((cell) => {
          let col, row, index;
          col = this.components.indexOf(cell) % oldcolumns;
          row = Math.floor(this.components.indexOf(cell) / oldcolumns);
          index = row * oldcolumns + col + 1;
          while (index) {
            --index;
            let component = this.components[index];
            // 슈퍼셀을 찾고 슈퍼셀의 위치에서 rowspan, colspan 거리만큼 이동하면서 cell이 있는지 검증해야함
            if (component.rowspan > 1 || component.colspan > 1) {
              let spColStart = this.components.indexOf(component) % oldcolumns;
              let spColEnd = this.components.indexOf(component) % oldcolumns + component.colspan;
              let spRowStart = Math.floor(this.components.indexOf(component) / oldcolumns);
              let spRowEnd = Math.floor(this.components.indexOf(component) / oldcolumns) + component.rowspan;
              // 슈퍼셀 영역 안에 자식 셀이 있으면 superCells에 부모셀을 추가
              if ((col >= spColStart && col < spColEnd) && (row >= spRowStart && row < spRowEnd)) {
                if (-1 == superCellIndexes.indexOf(index)) {
                  superCellIndexes.push(index);
                  superCells.push(component);
                }
              }
            }
          }
        });
        // 슈퍼셀에서 colspan 을 감소시킨다
        superCells.forEach((cell) => {
          // newcolumns < oldcolumns 케이스와 이 부분만 다름
          cell.rowspan -= (oldrows - newrows);
        });
      }

      this.remove(removals);
    }

    var minrows = Math.min(newrows, oldrows)

    if (newcolumns > oldcolumns) {
      for (let r = 0; r < minrows; r++) {
        for (let c = oldcolumns; c < newcolumns; c++) {
          this.insertComponentAt(buildNewCell(this.app), r * newcolumns + c);
        }
      }
    } else if (newcolumns < oldcolumns) {
      let removals = []

      for (let r = 0; r < minrows; r++) {
        for (let c = newcolumns; c < oldcolumns; c++) {
          removals.push(this.components[r * oldcolumns + c])
        }
      }
      // 지우려는 셀중에 병합된 셀을 찾는다.
      let mergedCells = [];
      removals.forEach((cell) => {
        if (cell.merged === true || cell.rowspan > 1 || cell.colspan > 1)
          mergedCells.push(cell);
      });

      // 병합된 셀 중에서 슈퍼셀을 찾는다.
      if (mergedCells.length > 0) {
        // 부모 셀을 저장
        let superCells = [];
        // 부모 셀의 인덱스를 저장
        let superCellIndexes = [];
        mergedCells.forEach((cell) => {
          let col, row, index;
          col = this.components.indexOf(cell) % oldcolumns;
          row = Math.floor(this.components.indexOf(cell) / oldcolumns);
          index = row * oldcolumns + col + 1;
          while (index) {
            --index;
            let component = this.components[index];
            // 슈퍼셀을 찾고 슈퍼셀의 위치에서 rowspan, colspan 거리만큼 이동하면서 cell이 있는지 검증해야함
            if (component.rowspan > 1 || component.colspan > 1) {
              let spColStart = this.components.indexOf(component) % oldcolumns;
              let spColEnd = this.components.indexOf(component) % oldcolumns + component.colspan;
              let spRowStart = Math.floor(this.components.indexOf(component) / oldcolumns);
              let spRowEnd = Math.floor(this.components.indexOf(component) / oldcolumns) + component.rowspan;
              // 슈퍼셀 영역 안에 자식 셀이 있으면 superCells에 부모셀을 추가
              if ((col >= spColStart && col < spColEnd) && (row >= spRowStart && row < spRowEnd)) {
                if (-1 == superCellIndexes.indexOf(index)) {
                  superCellIndexes.push(index);
                  superCells.push(component);
                }
              }
            }
          }
        });
        // 슈퍼셀에서 colspan 을 감소시킨다
        superCells.forEach((cell) => {
          cell.colspan -= (oldcolumns - newcolumns);
        });
      }

      this.remove(removals);
    }

    if (newrows > oldrows) {
      let newbies = []

      for (let r = oldrows; r < newrows; r++) {
        for (let i = 0; i < newcolumns; i++) {
          newbies.push(buildNewCell(this.app));
        }
      }
      this.add(newbies);
    }

    this.set({
      widths: this.widths,
      heights: this.heights
    });
  }

  get layout() {
    return RACK_TABLE_LAYOUT;
  }

  get rows() {
    return this.get('rows')
  }

  setCellsStyle(cells, style, where) {
    var components = this.components;
    var total = components.length;
    var columns = this.get('columns');

    // 병합된 셀도 포함시킨다.
    var _cells = []
    cells.forEach(c => {
      _cells.push(c);
      if (c.colspan || c.rowspan) {
        let col = this.getRowColumn(c).column;
        let row = this.getRowColumn(c).row;
        for (let i = row; i < row + c.rowspan; i++)
          for (let j = col; j < col + c.colspan; j++)
            if (i != row || j != col)
              _cells.push(this.components[i * this.columns + j]);
      }
    })
    var indices = _cells.map(cell => components.indexOf(cell));
    indices.forEach(i => {
      var cell = components[i];

      switch (where) {
        case 'all':
          setCellBorder(cell, style, where);

          if (isLeftMost(total, columns, indices, i))
            setCellBorder(components[before(columns, i)], style, 'right')
          if (isRightMost(total, columns, indices, i))
            setCellBorder(components[after(columns, i)], style, 'left')
          if (isTopMost(total, columns, indices, i))
            setCellBorder(components[above(columns, i)], style, 'bottom')
          if (isBottomMost(total, columns, indices, i))
            setCellBorder(components[below(columns, i)], style, 'top')
          break;
        case 'in':
          if (!isLeftMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'left')
          }
          if (!isRightMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'right')
          }
          if (!isTopMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'top')
          }
          if (!isBottomMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'bottom')
          }
          break;
        case 'out':
          if (isLeftMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'left')
            setCellBorder(components[before(columns, i)], style, 'right')
          }
          if (isRightMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'right')
            setCellBorder(components[after(columns, i)], style, 'left')
          }
          if (isTopMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'top')
            setCellBorder(components[above(columns, i)], style, 'bottom')
          }
          if (isBottomMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'bottom')
            setCellBorder(components[below(columns, i)], style, 'top')
          }
          break;
        case 'left':
          if (isLeftMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'left')
            setCellBorder(components[before(columns, i)], style, 'right')
          }
          break;
        case 'right':
          if (isRightMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'right')
            setCellBorder(components[after(columns, i)], style, 'left')
          }
          break;
        case 'center':
          if (!isLeftMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'left')
          }
          if (!isRightMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'right')
          }
          break;
        case 'middle':
          if (!isTopMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'top')
          }
          if (!isBottomMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'bottom')
          }
          break;
        case 'top':
          if (isTopMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'top')
            setCellBorder(components[above(columns, i)], style, 'bottom')
          }
          break;
        case 'bottom':
          if (isBottomMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'bottom')
            setCellBorder(components[below(columns, i)], style, 'top')
          }
          break;
        case 'clear':
          setCellBorder(cell, CLEAR_STYLE, 'all')

          if (isLeftMost(total, columns, indices, i))
            setCellBorder(components[before(columns, i)], CLEAR_STYLE, 'right')
          if (isRightMost(total, columns, indices, i))
            setCellBorder(components[after(columns, i)], CLEAR_STYLE, 'left')
          if (isTopMost(total, columns, indices, i))
            setCellBorder(components[above(columns, i)], CLEAR_STYLE, 'bottom')
          if (isBottomMost(total, columns, indices, i))
            setCellBorder(components[below(columns, i)], CLEAR_STYLE, 'top')
      }
    })
  }

  setCellsData() {
    var data = this.get('data')

    if (!data)
      return

    data = this.toObjectArrayValue(data) || []

    var cells = this.components;
    var columns = this.get('columns');

    cells.forEach(cell => {
      var dataKey = cell.model.dataKey
      var dataIndex = cell.model.dataIndex
      if (dataKey && dataIndex >= 0) {
        var currentData = data[dataIndex] || {}
        cell.set('text', currentData[dataKey] || "")
      }
    })
  }

  getRowColumn(cell) {
    var idx = this.components.indexOf(cell)
    var length = this.components.length

    return {
      column: idx % this.columns,
      row: Math.floor(idx / this.columns)
    }
  }

  getCellsByRow(row) {
    return this.components.slice(row * this.columns, (row + 1) * this.columns)
  }

  getCellsByColumn(column) {
    var cells = []
    for (var i = 0; i < this.rows; i++)
      cells.push(this.components[this.columns * i + column])

    return cells
  }

  // 한 개의 행을 매개변수로 받아서 첫 번째 셀부터 우측으로 이동하면서 병합된 셀이 있는지 검사한다.
  findMergedCellByX(row) {
    let mergedCells = [];
    let cell;
    for (let i = 0; i < this.columns; i++) {
      cell = this.components[row * this.columns + i];
      if (cell.merged === true || cell.rowspan > 1 || cell.colspan > 1)
        mergedCells.push(cell);
    }
    return mergedCells;
  }

  // 한 개의 열을 매개변수로 받아서 첫 번째 셀부터 아래로 이동하면서 병합된 셀이 있는지 검사한다.
  findMergedCellByY(column) {
    let mergedCells = [];
    let cell;
    for (let i = 0; i < this.rows; i++) {
      cell = this.components[i * this.columns + column];
      if (cell.merged === true || cell.rowspan > 1 || cell.colspan > 1)
        mergedCells.push(cell);
    }
    return mergedCells;
  }

  mergeCells(cells) {
    // 선택한 셀이 들어있는 행
    let mergeableRows = [];
    cells.forEach((cell) => {
      let row = this.getRowColumn(cell).row;
      if (-1 == mergeableRows.indexOf(row))
        mergeableRows.push(row);
    });

    // 선택한 셀의 행이 연속적인 숫자가 아니라면 병합하지 않는다.
    if (mergeableRows.length - 1 !== (mergeableRows[mergeableRows.length - 1] - mergeableRows[0]))
      return false;

    // 선택한 셀이 들어있는 열
    let mergeableColumns = [];
    cells.forEach((cell) => {
      let column = this.getRowColumn(cell).column;
      if (-1 == mergeableColumns.indexOf(column))
        mergeableColumns.push(column);
    });

    // 선택한 셀의 열이 연속적인 숫자가 아니라면 병합하지 않는다.
    if (mergeableColumns.length - 1 !== (mergeableColumns[mergeableColumns.length - 1] - mergeableColumns[0]))
      return false;

    // 병합할 행의 수
    let numberOfRows = mergeableRows.length;

    // 병합할 열의 수
    let numberOfColumns = mergeableColumns.length;

    // 선택된 셀의 수
    let numberOfCells = cells.length;

    // 병합될 조건 검사
    // 행과 열의 곱이 셀의 수가 아니거나 셀의 수가 2보다 작은 경우는 병합하지 않는다.
    if (numberOfCells !== numberOfRows * numberOfColumns || numberOfCells < 2)
      return false;

    // 선택한 셀들을 index 값이 낮은 것부터 순서대로 재정렬
    cells.sort((a, b) => {
      return ((this.getRowColumn(a).row * this.columns) + this.getRowColumn(a).column) - ((this.getRowColumn(b).row * this.columns) + this.getRowColumn(b).column);
    });

    // 셀을 병합함
    let firstCell = cells[0];
    firstCell.set({
      colspan: numberOfColumns,
      rowspan: numberOfRows
    });

    // 첫 번째 셀을 제외한 나머지 셀을 true로 지정
    for (let i = 1; i < numberOfCells; i++)
      cells[i].merged = true;

    // 병합 후에는 첫 번째 셀을 선택하도록 함
    this.root.selected = [firstCell];
  }

  splitCells(cells) {
    // 선택한 병합된 셀의 정보를 가져온다.
    let firstCellRowColumn = this.getRowColumn(cells[0]);
    let firstCell = cells[0];
    let firstCellIndex = this.components.indexOf(cells[0]);
    let length = this.components.length;
    let lastCell = this.components[length - 1];
    let lastCellRowColumn = this.getRowColumn(lastCell);
    let startIndex = length / (lastCellRowColumn.row + 1);

    // 병합된 셀들을 구해서 merged를 false로 설정한다.
    // 자식 셀이 갖고 있는 부모 셀의 위치를 초기화 한다.
    for (let j = 0; j < firstCell.rowspan; j++) {
      let index;
      let nextCell;
      for (let i = firstCellIndex; i < firstCellIndex + firstCell.colspan; i++) {
        index = startIndex * j + i;
        nextCell = this.components[index];
        nextCell.merged = false;
      }
    }

    // 첫 번째 셀의 rowspan, colspan = 1로 지정한다.
    firstCell.colspan = 1;
    firstCell.rowspan = 1;
  }

  deleteRows(cells) {
    // 만약 선택한 셀이 병합된 셀이라면 삭제하지 않는다.
    if (cells[0].merged == true)
      return false;
    // 먼저 cells 위치의 행을 구한다.
    let rows = [];
    cells.forEach((cell) => {
      let row = this.getRowColumn(cell).row;
      if (-1 == rows.indexOf(row))
        rows.push(row);
    });
    rows.sort((a, b) => {
      return a - b;
    });
    rows.reverse();
    var heights = this.heights.slice();
    rows.forEach((row) => {
      // rows에서 가로 방향으로 이동하면서 병합된 셀을 찾는다.
      let mergedCells = this.findMergedCellByX(row);
      // mergedCells.length가 0이면 일반적으로 행을 지운다.
      if (mergedCells.length === 0) {
        this.remove(this.getCellsByRow(row));
      }
      // mergedCells.length가 0이 아니면 병합된 셀을 고려하여 행을 지워야 한다.
      //
      else {
        // 삭제할 행에서 병합된 셀을 삭제할 때 해당 셀을 임시로 저장
        let temp = [];
        // 부모 셀을 저장
        let superCells = [];
        // 부모 셀의 인덱스 값을 저장
        let superCellIndexes = [];
        mergedCells.forEach((cell) => {
          let col, row, index;
          col = this.getRowColumn(cell).column;
          row = this.getRowColumn(cell).row;
          index = row * this.columns + col + 1;
          while (index) {
            --index;
            let component = this.components[index];
            // 슈퍼셀을 찾고 슈퍼셀의 위치에서 rowspan, colspan 거리만큼 이동하면서 cell이 있는지 검증해야함
            if (component.rowspan > 1 || component.colspan > 1) {
              let spColStart = this.getRowColumn(component).column;
              let spColEnd = this.getRowColumn(component).column + component.colspan;
              let spRowStart = this.getRowColumn(component).row;
              let spRowEnd = this.getRowColumn(component).row + component.rowspan;
              // 슈퍼셀 영역 안에 자식 셀이 있으면 superCells에 부모셀을 추가
              if ((col >= spColStart && col < spColEnd) && (row >= spRowStart && row < spRowEnd)) {
                if (-1 == superCellIndexes.indexOf(index)) {
                  superCellIndexes.push(index);
                  superCells.push(component);
                }
              }
            }
          }
        });
        superCellIndexes.forEach((index) => {
          let superCellRow = Math.floor(index / this.columns);
          // 지우려는 행이 슈퍼셀을 포함한 경우이면서 슈퍼셀이 마지막 행의 셀이 아닌 경우
          // 그리고 슈퍼셀의 rowspan이 1보다 큰 경우
          if (row === superCellRow && superCellRow !== this.rows - 1 && this.components[index].rowspan > 1) {
            this.components[index + this.columns].rowspan = this.components[index].rowspan - 1;
            this.components[index + this.columns].colspan = this.components[index].colspan;
            this.components[index + this.columns].merged = false;
            this.components[index + this.columns].set('text', this.components[index].get('text'));
          } else {
            this.components[index].rowspan -= 1;
          }
        });
        this.remove(this.getCellsByRow(row));
      }
    });
    heights.splice(rows, 1);
    this.model.rows -= rows.length; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.
    this.set('heights', heights);
  }

  deleteColumns(cells) {
    // 만약 선택한 셀이 병합된 셀이라면 삭제하지 않는다.
    if (cells[0].merged == true)
      return false;
    // 먼저 cells 위치의 열을 구한다.
    let columns = [];
    cells.forEach((cell) => {
      let column = this.getRowColumn(cell).column;
      if (-1 == columns.indexOf(column))
        columns.push(column);
    });
    columns.sort((a, b) => {
      return a - b;
    });
    columns.reverse();

    columns.forEach((column) => {
      var widths = this.widths.slice();
      // columns에서 세로 방향으로 이동하면서 병합된 셀을 찾는다.
      let mergedCells = this.findMergedCellByY(column);
      // mergedCells.length가 0이면 일반적으로 열을 지운다.
      if (mergedCells.length === 0) {
        this.remove(this.getCellsByColumn(column));
      }
      // mergedCells.length가 0이 아니면 병합된 셀을 고려하여 열을 지워야 한다.
      else {
        // 삭제할 열에서 병합된 셀을 삭제할 때 해당 셀을 임시로 저장
        let temp = [];
        // 부모 셀을 저장
        let superCells = [];
        // 부모 셀의 인덱스를 저장
        let superCellIndexes = [];
        mergedCells.forEach((cell) => {
          let col, row, index;
          col = this.getRowColumn(cell).column;
          row = this.getRowColumn(cell).row;
          index = row * this.columns + col + 1;
          while (index) {
            --index;
            let component = this.components[index];
            // 슈퍼셀을 찾고 슈퍼셀의 위치에서 rowspan, colspan 거리만큼 이동하면서 cell이 있는지 검증해야함
            if (component.rowspan > 1 || component.colspan > 1) {
              let spColStart = this.getRowColumn(component).column;
              let spColEnd = this.getRowColumn(component).column + component.colspan;
              let spRowStart = this.getRowColumn(component).row;
              let spRowEnd = this.getRowColumn(component).row + component.rowspan;
              // 슈퍼셀 영역 안에 자식 셀이 있으면 superCells에 부모셀을 추가
              if ((col >= spColStart && col < spColEnd) && (row >= spRowStart && row < spRowEnd)) {
                if (-1 == superCellIndexes.indexOf(index)) {
                  superCellIndexes.push(index);
                  superCells.push(component);
                }
              }
            }
          }
        });
        superCellIndexes.forEach((index) => {
          let superCellColumn = index % this.columns;
          // 지우려는 열이 슈퍼셀을 포함한 경우이면서 슈퍼셀이 마지막 열의 셀이 아닌 경우
          // 그리고 슈퍼셀의 colspan이 1보다 큰 경우
          if (column === superCellColumn && superCellColumn !== this.columns - 1 && this.components[index].colspan > 1) {
            this.components[index + 1].rowspan = this.components[index].rowspan;
            this.components[index + 1].colspan = this.components[index].colspan - 1;
            this.components[index + 1].merged = false;
            this.components[index + 1].set('text', this.components[index].get('text'));
          } else {
            this.components[index].colspan -= 1;
          }
        });
        this.remove(this.getCellsByColumn(column));
      }
      widths.splice(column, 1);
      this.model.columns -= 1; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.
      this.set('widths', widths);
    });
  }

  insertCellsAbove(cells) {
    // 먼저 cells 위치의 행을 구한다.
    let rows = [];
    cells.forEach((cell) => {
      let row = this.getRowColumn(cell).row;
      if (-1 == rows.indexOf(row))
        rows.push(row);
    });
    rows.sort((a, b) => {
      return a - b;
    });
    rows.reverse();
    // 행 2개 이상은 추가 안함. 임시로 막아놓음
    if (rows.length >= 2)
      return false;
    let insertionRowPosition = rows[0];
    let newbieRowHeights = [];
    let newbieCells = [];
    rows.forEach((row) => {
      // rows에서 가로 방향으로 이동하면서 병합된 셀을 찾는다.
      let mergedCells = this.findMergedCellByX(row);
      // mergedCells.length가 0이면 일반적으로 행을 위에 추가한다.
      if (mergedCells.length === 0) {
        for (let i = 0; i < this.columns; i++)
          newbieCells.push(buildCopiedCell(this.components[row * this.columns + i].model, this.app));
        newbieRowHeights.push(this.heights[row]);

        newbieCells.reverse().forEach((cell) => {
          this.insertComponentAt(cell, insertionRowPosition * this.columns);
        });

        let heights = this.heights.slice();
        heights.splice(insertionRowPosition, 0, ...newbieRowHeights);
        this.set('heights', heights);

        this.model.rows += rows.length;

        this.clearCache();
      }
      // mergedCells.length가 0이 아니면 병합된 셀을 고려하여 행을 추가해야 한다.
      else {
        // 선택한 행이 2개 이상 있고 그 중에 병합된 셀이 적어도 한 개라도 있으면
        // 병합된 셀이 포함된 행의 추가는 무시한다. 임시방편으로 막아놈
        if (rows.length > 1)
          return false;
        // 추가할 행에서 병합된 셀을 추가할 때 해당 셀을 임시로 저장
        let temp = [];
        // 부모 셀을 저장
        let superCells = [];
        // 부모 셀의 인덱스 값을 저장
        let superCellIndexes = [];
        mergedCells.forEach((cell) => {
          let col, row, index;
          col = this.getRowColumn(cell).column;
          row = this.getRowColumn(cell).row;
          index = row * this.columns + col + 1;
          while (index) {
            --index;
            let component = this.components[index];
            // 슈퍼셀을 찾고 슈퍼셀의 위치에서 rowspan, colspan 거리만큼 이동하면서 cell이 있는지 검증해야함
            if (component.rowspan > 1 || component.colspan > 1) {
              let spColStart = this.getRowColumn(component).column;
              let spColEnd = this.getRowColumn(component).column + component.colspan;
              let spRowStart = this.getRowColumn(component).row;
              let spRowEnd = this.getRowColumn(component).row + component.rowspan;
              // 슈퍼셀 영역 안에 자식 셀이 있으면 superCells에 부모셀을 추가
              if ((col >= spColStart && col < spColEnd) && (row >= spRowStart && row < spRowEnd)) {
                if (-1 == superCellIndexes.indexOf(index)) {
                  superCellIndexes.push(index);
                  superCells.push(component);
                }
              }
            }
          }
        });
        superCellIndexes.forEach((index) => {
          // 추가하려는 셀은 일반 셀인데 그 위치에 다른 병합된 셀이 있는 문제로 임시로 막아 놓음. 수정해야함
          if (superCellIndexes.length >= 2)
            return false;
          let superCellRow = Math.floor(index / this.columns);
          let superCellObj = {
            rowspan: this.components[index].rowspan,
            colspan: this.components[index].colspan,
            text: this.components[index].get('text'),
            merged: this.components[index].merged
          }
          // 추가하려는 행이 슈퍼셀을 포함한 경우
          if (superCellRow === row) {
            for (let i = 0; i < this.columns; i++)
              newbieCells.push(buildNewCell(this.app));
            newbieRowHeights.push(this.heights[row]);

            newbieCells.reverse().forEach((cell) => {
              this.insertComponentAt(cell, insertionRowPosition * this.columns);
            });
            this.components[index + this.columns].rowspan = superCellObj.rowspan;
            this.components[index + this.columns].colspan = superCellObj.colspan;
            this.components[index + this.columns].set('text', superCellObj.text);
            this.components[index + this.columns].merged = superCellObj.merged;
          }
          else {
            for (let i = 0; i < this.columns; i++)
              newbieCells.push(buildCopiedCell(this.components[row * this.columns + i].model, this.app));
            newbieRowHeights.push(this.heights[row]);

            newbieCells.reverse().forEach((cell) => {
              this.insertComponentAt(cell, insertionRowPosition * this.columns);
            });
            this.components[index].rowspan += 1;
          }
          let heights = this.heights.slice();
          heights.splice(insertionRowPosition, 0, ...newbieRowHeights);
          this.set('heights', heights);

          this.model.rows += rows.length;

          this.clearCache();
        });
      }
    });
  }

  insertCellsBelow(cells) {
    // 먼저 cells 위치의 행을 구한다.
    let rows = [];
    cells.forEach((cell) => {
      let row = this.getRowColumn(cell).row;
      if (-1 == rows.indexOf(row))
        rows.push(row);
    });
    rows.sort((a, b) => {
      return a - b;
    });
    rows.reverse();
    // 행 2개 이상은 추가 안함. 임시로 막아놓음
    if (rows.length >= 2)
      return false;
    let insertionRowPosition = rows[rows.length - 1] + 1;
    let newbieRowHeights = [];
    let newbieCells = [];
    rows.forEach((row) => {
      // rows에서 가로 방향으로 이동하면서 병합된 셀을 찾는다.
      let mergedCells = this.findMergedCellByX(row);
      // mergedCells.length가 0이면 일반적으로 행을 아래에 추가한다.
      if (mergedCells.length === 0) {
        for (let i = 0; i < this.columns; i++)
          newbieCells.push(buildCopiedCell(this.components[row * this.columns + i].model, this.app));
        newbieRowHeights.push(this.heights[row]);

        newbieCells.reverse().forEach((cell) => {
          this.insertComponentAt(cell, insertionRowPosition * this.columns);
        });

        let heights = this.heights.slice();
        heights.splice(insertionRowPosition, 0, ...newbieRowHeights);
        this.set('heights', heights);

        this.model.rows += 1;

        this.clearCache();
      }
      // mergedCells.length가 0이 아니면 병합된 셀을 고려하여 행을 추가해야 한다.
      else {
        // 추가할 행에서 병합된 셀을 추가할 때 해당 셀을 임시로 저장
        let temp = [];
        // 부모 셀을 저장
        let superCells = [];
        // 부모 셀의 인덱스 값을 저장
        let superCellIndexes = [];
        mergedCells.forEach((cell) => {
          let col, row, index;
          col = this.getRowColumn(cell).column;
          row = this.getRowColumn(cell).row;
          index = row * this.columns + col + 1;
          while (index) {
            --index;
            let component = this.components[index];
            // 슈퍼셀을 찾고 슈퍼셀의 위치에서 rowspan, colspan 거리만큼 이동하면서 cell이 있는지 검증해야함
            if (component.rowspan > 1 || component.colspan > 1) {
              let spColStart = this.getRowColumn(component).column;
              let spColEnd = this.getRowColumn(component).column + component.colspan;
              let spRowStart = this.getRowColumn(component).row;
              let spRowEnd = this.getRowColumn(component).row + component.rowspan;
              // 슈퍼셀 영역 안에 자식 셀이 있으면 superCells에 부모셀을 추가
              if ((col >= spColStart && col < spColEnd) && (row >= spRowStart && row < spRowEnd)) {
                if (-1 == superCellIndexes.indexOf(index)) {
                  superCellIndexes.push(index);
                  superCells.push(component);
                }
              }
            }
          }
        });
        superCellIndexes.forEach((index) => {
          // 추가하려는 셀은 일반 셀인데 그 위치에 다른 병합된 셀이 있는 문제로 임시로 막아 놓음. 수정해야함
          if (superCellIndexes.length >= 2)
            return false;
          let superCellRow = Math.floor(index / this.columns);
          let superCellObj = {
            rowspan: this.components[index].rowspan,
            colspan: this.components[index].colspan,
            text: this.components[index].get('text'),
            merged: this.components[index].merged
          }
          // 추가하려는 행이 병합된 셀중 마지막 행인 경우
          if ((superCellRow + superCellObj.rowspan - 1) === row) {
            for (let i = 0; i < this.columns; i++)
              newbieCells.push(buildNewCell(this.app));
            newbieRowHeights.push(this.heights[row]);

            newbieCells.reverse().forEach((cell) => {
              this.insertComponentAt(cell, insertionRowPosition * this.columns);
            });
          }
          else if (superCellRow === row) {
            for (let i = 0; i < this.columns; i++)
              newbieCells.push(buildCopiedCell(this.components[row * this.columns + i].model, this.app));
            newbieRowHeights.push(this.heights[row]);

            newbieCells.reverse().forEach((cell) => {
              this.insertComponentAt(cell, insertionRowPosition * this.columns);
            });
            this.components[index].rowspan += 1;
            // 슈퍼셀이 복사됐으므로 그 해당 셀을 병합된 셀로 설정한다.
            this.components[index + this.columns].rowspan = 1;
            this.components[index + this.columns].colspan = 1;
            this.components[index + this.columns].merged = true;
            this.components[index + this.columns].set('text', '');
          }
          else {
            for (let i = 0; i < this.columns; i++)
              newbieCells.push(buildCopiedCell(this.components[row * this.columns + i].model, this.app));
            newbieRowHeights.push(this.heights[row]);

            newbieCells.reverse().forEach((cell) => {
              this.insertComponentAt(cell, insertionRowPosition * this.columns);
            });
            this.components[index].rowspan += 1;
          }
          let heights = this.heights.slice();
          heights.splice(insertionRowPosition, 0, ...newbieRowHeights);
          this.set('heights', heights);

          this.model.rows += 1;

          this.clearCache();
        });
      }
    });
  }

  insertCellsLeft(cells) {
    // 먼저 cells 위치의 열을 구한다.
    let columns = [];
    cells.forEach((cell) => {
      let column = this.getRowColumn(cell).column;
      if (-1 == columns.indexOf(column))
        columns.push(column);
    });
    columns.sort((a, b) => {
      return a - b;
    });
    columns.reverse();
    // 열 2개 이상은 추가 안함. 임시로 막아놓음
    if (columns.length >= 2)
      return false;
    let insertionColumnPosition = columns[0];
    let newbieColumnWidths = [];
    let newbieCells = [];
    columns.forEach((column) => {
      // columns에서 세로 방향으로 이동하면서 병합된 셀을 찾는다.
      let mergedCells = this.findMergedCellByY(column);
      // mergedCells.length가 0이면 일반적으로 열을 왼쪽에 추가한다.
      if (mergedCells.length === 0) {
        for (let i = 0; i < this.rows; i++)
          newbieCells.push(buildCopiedCell(this.components[column + this.columns * i].model, this.app));
        newbieColumnWidths.push(this.widths[column]);

        let increasedColumns = this.columns;
        let index = this.rows;
        newbieCells.reverse().forEach((cell) => {
          if (index == 0) {
            index = this.rows;
            increasedColumns++;
          }

          index--;
          this.insertComponentAt(cell, insertionColumnPosition + (index * increasedColumns));
        });

        let widths = this.widths.slice();
        this.model.columns += columns.length; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.

        widths.splice(insertionColumnPosition, 0, ...newbieColumnWidths);

        this.set('widths', widths);
      }
      // mergedCells.length가 0이 아니면 병합된 셀을 고려하여 열을 추가해야 한다.
      else {
        // 부모 셀을 저장
        let superCells = [];
        // 부모 셀의 인덱스 값을 저장
        let superCellIndexes = [];
        mergedCells.forEach((cell) => {
          let col, row, index;
          col = this.getRowColumn(cell).column;
          row = this.getRowColumn(cell).row;
          index = row * this.columns + col + 1;
          while (index) {
            --index;
            let component = this.components[index];
            // 슈퍼셀을 찾고 슈퍼셀의 위치에서 rowspan, colspan 거리만큼 이동하면서 cell이 있는지 검증해야함
            if (component.rowspan > 1 || component.colspan > 1) {
              let spColStart = this.getRowColumn(component).column;
              let spColEnd = this.getRowColumn(component).column + component.colspan;
              let spRowStart = this.getRowColumn(component).row;
              let spRowEnd = this.getRowColumn(component).row + component.rowspan;
              // 슈퍼셀 영역 안에 자식 셀이 있으면 superCells에 부모셀을 추가
              if ((col >= spColStart && col < spColEnd) && (row >= spRowStart && row < spRowEnd)) {
                if (-1 == superCellIndexes.indexOf(index)) {
                  superCellIndexes.push(index);
                  superCells.push(component);
                }
              }
            }
          }
        });
        superCellIndexes.forEach((index) => {
          // 추가하려는 셀은 일반 셀인데 그 위치에 다른 병합된 셀이 있는 문제로 임시로 막아 놓음. 수정해야함
          if (superCellIndexes.length >= 2)
            return false;
          let superCellColumn = index % this.columns;
          let superCellObj = {
            rowspan: this.components[index].rowspan,
            colspan: this.components[index].colspan,
            text: this.components[index].get('text'),
            merged: this.components[index].merged
          }
          // 추가하려는 열이 슈퍼셀을 포함한 경우
          if (superCellColumn === column) {
            for (let i = 0; i < this.rows; i++)
              newbieCells.push(buildNewCell(this.app));
            newbieColumnWidths.push(this.widths[column]);

            let increasedColumns = this.columns;
            let rowIndex = this.rows;
            newbieCells.reverse().forEach((cell) => {
              if (rowIndex == 0) {
                rowIndex = this.rows;
                increasedColumns++;
              }

              rowIndex--;
              this.insertComponentAt(cell, insertionColumnPosition + (rowIndex * increasedColumns));
            });
          }
          else {
            this.components[index].colspan += 1;
            for (let i = 0; i < this.rows; i++)
              newbieCells.push(buildCopiedCell(this.components[column + this.columns * i].model, this.app));
            newbieColumnWidths.push(this.widths[column]);

            let increasedColumns = this.columns;
            let rowIndex = this.rows;
            newbieCells.reverse().forEach((cell) => {
              if (rowIndex == 0) {
                rowIndex = this.rows;
                increasedColumns++;
              }

              rowIndex--;
              this.insertComponentAt(cell, insertionColumnPosition + (rowIndex * increasedColumns));
            });
          }
          let widths = this.widths.slice();
          this.model.columns += columns.length; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.

          widths.splice(insertionColumnPosition, 0, ...newbieColumnWidths);

          this.set('widths', widths);
        });
      }
    });
  }

  insertCellsRight(cells) {
    // 먼저 cells 위치의 열을 구한다.
    let columns = [];
    cells.forEach((cell) => {
      let column = this.getRowColumn(cell).column;
      if (-1 == columns.indexOf(column))
        columns.push(column);
    });
    columns.sort((a, b) => {
      return a - b;
    });
    columns.reverse();
    // 열 2개 이상은 추가 안함. 임시로 막아놓음
    if (columns.length >= 2)
      return false;
    let insertionColumnPosition = columns[columns.length - 1] + 1;
    let newbieColumnWidths = [];
    let newbieCells = [];
    columns.forEach((column) => {
      // columns에서 세로 방향으로 이동하면서 병합된 셀을 찾는다.
      let mergedCells = this.findMergedCellByY(column);
      // mergedCells.length가 0이면 일반적으로 열을 오른쪽에 추가한다.
      if (mergedCells.length === 0) {
        for (let i = 0; i < this.rows; i++)
          newbieCells.push(buildCopiedCell(this.components[column + this.columns * i].model, this.app));
        newbieColumnWidths.push(this.widths[column]);

        let increasedColumns = this.columns;
        let index = this.rows;
        newbieCells.reverse().forEach((cell) => {
          if (index == 0) {
            index = this.rows;
            increasedColumns++;
          }

          index--;
          this.insertComponentAt(cell, insertionColumnPosition + (index * increasedColumns));
        });

        let widths = this.widths.slice();
        this.model.columns += columns.length; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.

        widths.splice(insertionColumnPosition, 0, ...newbieColumnWidths);

        this.set('widths', widths);
      }
      // mergedCells.length가 0이 아니면 병합된 셀을 고려하여 열을 추가해야 한다.
      else {
        // 부모 셀을 저장
        let superCells = [];
        // 부모 셀의 인덱스 값을 저장
        let superCellIndexes = [];
        mergedCells.forEach((cell) => {
          let col, row, index;
          col = this.getRowColumn(cell).column;
          row = this.getRowColumn(cell).row;
          index = row * this.columns + col + 1;
          while (index) {
            --index;
            let component = this.components[index];
            // 슈퍼셀을 찾고 슈퍼셀의 위치에서 rowspan, colspan 거리만큼 이동하면서 cell이 있는지 검증해야함
            if (component.rowspan > 1 || component.colspan > 1) {
              let spColStart = this.getRowColumn(component).column;
              let spColEnd = this.getRowColumn(component).column + component.colspan;
              let spRowStart = this.getRowColumn(component).row;
              let spRowEnd = this.getRowColumn(component).row + component.rowspan;
              // 슈퍼셀 영역 안에 자식 셀이 있으면 superCells에 부모셀을 추가
              if ((col >= spColStart && col < spColEnd) && (row >= spRowStart && row < spRowEnd)) {
                if (-1 == superCellIndexes.indexOf(index)) {
                  superCellIndexes.push(index);
                  superCells.push(component);
                }
              }
            }
          }
        });
        superCellIndexes.forEach((index) => {
          // 추가하려는 셀은 일반 셀인데 그 위치에 다른 병합된 셀이 있는 문제로 임시로 막아 놓음. 수정해야함
          if (superCellIndexes.length >= 2)
            return false;
          let superCellRow = Math.floor(index / this.columns);
          let superCellColumn = index % this.columns;
          let superCellObj = {
            rowspan: this.components[index].rowspan,
            colspan: this.components[index].colspan,
            text: this.components[index].get('text'),
            merged: this.components[index].merged
          }
          // 추가하려는 열이 병합된 셀중 마지막 열인 경우
          if ((superCellColumn + superCellObj.colspan - 1) === column) {
            for (let i = 0; i < this.rows; i++)
              newbieCells.push(buildNewCell(this.app));
            newbieColumnWidths.push(this.widths[column]);

            let increasedColumns = this.columns;
            let rowIndex = this.rows;
            newbieCells.reverse().forEach((cell) => {
              if (rowIndex == 0) {
                rowIndex = this.rows;
                increasedColumns++;
              }

              rowIndex--;
              this.insertComponentAt(cell, insertionColumnPosition + (rowIndex * increasedColumns));
            });
          }
          else if (superCellColumn === column) {
            this.components[index].colspan += 1;
            for (let i = 0; i < this.rows; i++)
              newbieCells.push(buildCopiedCell(this.components[column + this.columns * i].model, this.app));
            newbieColumnWidths.push(this.widths[column]);

            let increasedColumns = this.columns;
            let rowIndex = this.rows;
            newbieCells.reverse().forEach((cell) => {
              if (rowIndex == 0) {
                rowIndex = this.rows;
                increasedColumns++;
              }

              rowIndex--;
              this.insertComponentAt(cell, insertionColumnPosition + (rowIndex * increasedColumns));
            });
            // 슈퍼셀이 복사됐으므로 그 해당 셀을 병합된 셀로 설정한다.
            this.components[index + superCellRow + 1].rowspan = 1;
            this.components[index + superCellRow + 1].colspan = 1;
            this.components[index + superCellRow + 1].merged = true;
            this.components[index + superCellRow + 1].set('text', '');
          }
          else {
            this.components[index].colspan += 1;
            for (let i = 0; i < this.rows; i++)
              newbieCells.push(buildCopiedCell(this.components[column + this.columns * i].model, this.app));
            newbieColumnWidths.push(this.widths[column]);

            let increasedColumns = this.columns;
            let rowIndex = this.rows;
            newbieCells.reverse().forEach((cell) => {
              if (rowIndex == 0) {
                rowIndex = this.rows;
                increasedColumns++;
              }

              rowIndex--;
              this.insertComponentAt(cell, insertionColumnPosition + (rowIndex * increasedColumns));
            });
          }
          let widths = this.widths.slice();
          this.model.columns += columns.length; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.

          widths.splice(insertionColumnPosition, 0, ...newbieColumnWidths);

          this.set('widths', widths);
        });
      }
    });
  }

  distributeHorizontal(cells) {
    var columns = []

    cells.forEach((cell) => {
      let rowcolumn = this.getRowColumn(cell)

      if (-1 == columns.indexOf(rowcolumn.column))
        columns.push(rowcolumn.column)
    })

    var sum = columns.reduce((sum, column) => {
      return sum + this.widths[column]
    }, 0)

    var newval = Math.round((sum / columns.length) * 100) / 100
    var widths = this.widths.slice()
    columns.forEach((column) => {
      widths[column] = newval
    })

    this.set('widths', widths)
  }

  distributeVertical(cells) {
    var rows = []

    cells.forEach((cell) => {
      let rowcolumn = this.getRowColumn(cell)

      if (-1 == rows.indexOf(rowcolumn.row))
        rows.push(rowcolumn.row)
    })

    var sum = rows.reduce((sum, row) => {
      return sum + this.heights[row]
    }, 0)

    var newval = Math.round((sum / rows.length) * 100) / 100
    var heights = this.heights.slice()
    rows.forEach((row) => {
      heights[row] = newval
    })

    this.set('heights', heights)
  }

  toObjectArrayValue(array) {
    if (!array || array.length === 0)
      return null

    if (!array[0].hasOwnProperty('__field1')) {
      return array
    }

    let indexKeyMap = {}
    let value = []

    for (let key in array[0]) {
      indexKeyMap[key] = array[0][key]
    }

    for (var i = 1; i < array.length; i++) {
      let object = {}
      let thisObject = array[i]
      for (let key in indexKeyMap) {
        let k = indexKeyMap[key];
        let v = thisObject[key];
        object[k] = v
      }

      value.push(object)
    }

    return value
  }

  get columns() {
    return this.get('columns')
  }

  get lefts() {
    return this.components.filter((c, i) => {
      return !(i % this.columns)
    });
  }

  get centers() {
    return this.components.filter((c, i) => {
      return (i % this.columns) && ((i + 1) % this.columns)
    });
  }

  get rights() {
    return this.components.filter((c, i) => {
      return !((i + 1) % this.columns)
    });
  }

  get tops() {
    return this.components.slice(0, this.columns)
  }

  get middles() {
    return this.components.slice(this.columns, this.columns * (this.rows - 1))
  }

  get bottoms() {
    return this.components.slice(this.columns * (this.rows - 1))
  }

  get all() {
    return this.components
  }

  get widths_sum() {
    var widths = this.widths;
    return widths ? widths.filter((width, i) => i < this.columns).reduce((sum, width) => sum + width, 0) : this.columns
  }

  get heights_sum() {
    var heights = this.heights;
    return heights ? heights.filter((height, i) => i < this.rows).reduce((sum, height) => sum + height, 0) : this.rows
  }

  get nature() {
    return NATURE
  }

  get controls() {
    var widths = this.widths;
    var heights = this.heights;
    var inside = this.textBounds;

    var width_unit = inside.width / this.widths_sum;
    var height_unit = inside.height / this.heights_sum;

    var x = inside.left;
    var y = inside.top;

    var controls = [];

    widths.slice(0, this.columns - 1).forEach(width => {
      x += width * width_unit
      controls.push({
        x: x,
        y: inside.top,
        handler: columnControlHandler
      })
    })

    heights.slice(0, this.rows - 1).forEach(height => {
      y += height * height_unit
      controls.push({
        x: inside.left,
        y: y,
        handler: rowControlHandler
      })
    })

    return controls
  }

  onchange(after, before) {
    if (hasAnyProperty(after, "rows", "columns")) {
      this.buildCells(
        this.get('rows'),
        this.get('columns'),
        before.hasOwnProperty('rows') ? before.rows : this.get('rows'),
        before.hasOwnProperty('columns') ? before.columns : this.get('columns')
      )
    }

    if (before.data || after.data) {
      this.setCellsData()
    }
  }

  get eventMap() {
    return {
      '(self)': {
        '(descendant)': {
          change: this.oncellchanged
        }
      }
    }
  }

  oncellchanged(after, before) {
    if (hasAnyProperty(after, "dataKey", "dataIndex")) {
      this.setCellsData()
    }
  }
}

["rows", "columns", "widths", "heights", "widths_sum", "heights_sum", "controls"].forEach(getter => Component.memoize(RackTable.prototype, getter, false));

Component.register('rack-table', RackTable);
Component3d.register('rack-table', RackTable3d);
