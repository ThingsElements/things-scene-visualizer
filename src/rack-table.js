/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, ContainerAbstract, Layout, Model } from '@hatiolab/things-scene'
import Component3d from './component-3d'
import Group3D from './group3d'
import Rack from './rack'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'number',
      label: 'rows',
      name: 'rows',
      property: 'rows'
    },
    {
      type: 'number',
      label: 'columns',
      name: 'columns',
      property: 'columns'
    },
    {
      type: 'string',
      label: 'zone',
      name: 'zone',
      property: 'zone'
    },
    {
      type: 'number',
      label: 'shelves',
      name: 'shelves',
      property: 'shelves'
    },
    {
      type: 'number',
      label: 'depth',
      name: 'depth',
      property: 'depth'
    },
    {
      type: 'string',
      label: 'location-pattern',
      name: 'locPattern',
      placeholder: '{z}{s}-{u}-{sh}'
    },
    {
      type: 'number',
      label: 'section-digits',
      name: 'sectionDigits',
      placeholder: '1, 2, 3, ...'
    },
    {
      type: 'number',
      label: 'unit-digits',
      name: 'unitDigits',
      placeholder: '1, 2, 3, ...'
    },
    {
      type: 'string',
      label: 'shelf-locations',
      name: 'shelfLocations',
      placeholder: '1,2,3,... / ,,,04'
    },
    {
      type: 'number',
      label: 'stock-scale',
      name: 'stockScale',
      property: {
        step: 0.01,
        min: 0,
        max: 1
      }
    },
    {
      type: 'checkbox',
      label: 'hide-rack-frame',
      name: 'hideRackFrame'
    }
  ]
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

const TABLE_LAYOUT = Layout.get('table')

function buildNewCell(app) {
  return Model.compile(
    {
      type: 'rack-table-cell',
      strokeStyle: 'black',
      fillStyle: 'transparent',
      left: 0,
      top: 0,
      width: 1,
      height: 1,
      textWrap: true,
      isEmpty: false,
      border: buildBorderStyle(DEFAULT_STYLE, 'all')
    },
    app
  )
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
  if (!cell) return
  cell.set('border', Object.assign({}, cell.get('border') || {}, buildBorderStyle(style, where)))
}

function isLeftMost(total, columns, indices, i) {
  return i == 0 || !(i % columns) || indices.indexOf(i - 1) == -1
}

function isRightMost(total, columns, indices, i) {
  return i == total - 1 || i % columns == columns - 1 || indices.indexOf(i + 1) == -1
}

function isTopMost(total, columns, indices, i) {
  return i < columns || indices.indexOf(i - columns) == -1
}

function isBottomMost(total, columns, indices, i) {
  return i > total - columns - 1 || indices.indexOf(i + columns) == -1
}

function above(columns, i) {
  return i - columns
}

function below(columns, i) {
  return i + columns
}

function before(columns, i) {
  return !(i % columns) ? -1 : i - 1
}

function after(columns, i) {
  return !((i + 1) % columns) ? -1 : i + 1
}

function array(value, size) {
  var arr = []
  for (let i = 0; i < size; i++) arr.push(1)
  return arr
}

var columnControlHandler = {
  ondragmove: function (point, index, component) {
    var { left, top, width, height } = component.textBounds
    var widths_sum = component.widths_sum

    var widths = component.widths.slice()

    /* 컨트롤의 원래 위치를 구한다. */
    var origin_pos_unit = widths.slice(0, index + 1).reduce((sum, width) => sum + width, 0)
    var origin_offset = left + (origin_pos_unit / widths_sum) * width

    /*
     * point의 좌표는 부모 레이어 기준의 x, y 값이다.
     * 따라서, 도형의 회전을 감안한 좌표로의 변환이 필요하다.
     * Transcoord시에는 point좌표가 부모까지 transcoord되어있는 상태이므로,
     * 컴포넌트자신에 대한 transcoord만 필요하다.(마지막 파라미터를 false로).
     */
    var transcoorded = component.transcoordP2S(point.x, point.y)
    var diff = transcoorded.x - origin_offset

    var diff_unit = (diff / width) * widths_sum

    var min_width_unit = (widths_sum / width) * 5 // 5픽셀정도를 최소로

    if (diff_unit < 0) diff_unit = -Math.min(widths[index] - min_width_unit, -diff_unit)
    else diff_unit = Math.min(widths[index + 1] - min_width_unit, diff_unit)

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
    var origin_offset = top + (origin_pos_unit / heights_sum) * height

    /*
     * point의 좌표는 부모 레이어 기준의 x, y 값이다.
     * 따라서, 도형의 회전을 감안한 좌표로의 변환이 필요하다.
     * Transcoord시에는 point좌표가 부모까지 transcoord되어있는 상태이므로,
     * 컴포넌트자신에 대한 transcoord만 필요하다.(마지막 파라미터를 false로).
     */
    var transcoorded = component.transcoordP2S(point.x, point.y)
    var diff = transcoorded.y - origin_offset

    var diff_unit = (diff / height) * heights_sum

    var min_height_unit = (heights_sum / height) * 5 // 5픽셀정도를 최소로

    if (diff_unit < 0) diff_unit = -Math.min(heights[index] - min_height_unit, -diff_unit)
    else diff_unit = Math.min(heights[index + 1] - min_height_unit, diff_unit)

    heights[index] = Math.round((heights[index] + diff_unit) * 100) / 100
    heights[index + 1] = Math.round((heights[index + 1] - diff_unit) * 100) / 100

    component.set('heights', heights)
  }
}

export default class RackTable3d extends Group3D {
  constructor(model, canvasSize, visualizer, sceneComponent) {
    super(model)

    this._visualizer = visualizer
    this._sceneComponent = sceneComponent

    this.createRacks(canvasSize)
    // this.mergeObjects()
  }

  dispose() {
    super.dispose()

    delete this._visualizer
  }

  createRacks(canvasSize) {
    var {
      components = [],
      left,
      top,
      width,
      height,
      rotation = 0,
      zone,
      locPattern = '{z}{s}-{u}{sh}',
      shelfPattern,
      shelfLocations,
      shelves = 1,
      depth = 1,
      columns,
      rows,
      minUnit = 1,
      minSection = 1,
      stockScale = 0.7,
      hideRackFrame
    } = this.model

    let cx = left + width / 2 - canvasSize.width / 2
    let cy = top + height / 2 - canvasSize.height / 2
    let cz = 0

    this.position.set(cx, cz, cy)
    this.rotation.y = -rotation

    if (shelfPattern) {
      var shelfLocIds = []
      for (var i = 0; i < shelves; i++) {
        var locId = this.makeShelfString(shelfPattern, i + 1, shelves)
        shelfLocIds.push(locId)
      }

      shelfLocations = shelfLocIds.join(',')
    }

    delete this.model.shelfPattern

    components.forEach(rack => {
      var rackModel = {
        left: rack.left,
        top: rack.top,
        width: rack.width,
        height: rack.height,
        depth,
        shelves,
        unit: rack.unit,
        section: rack.section,
        zone,
        locPattern,
        shelfLocations: rack.shelfLocations || shelfLocations,
        binLocations: rack.binLocations,
        isEmpty: rack.isEmpty,
        hideRackFrame,
        stockScale
      }

      var rackLocationIds = (rack.shelfLocations || '').split(/\s*,\s*/).filter(l => !!l)
      if (!rackModel.isEmpty || rackLocationIds?.length == shelves) {
        var rack = new Rack(rackModel, this.model, this._visualizer)
        this.add(rack)
      }
    })
  }

  mergeObjects() {
    var frames = []
    var boards = []
    this.children.forEach(rack => {
      frames = frames.concat(rack.frames)
      boards = boards.concat(rack.boards)
    })

    var targetFrame
    frames.forEach(frameGroup => {
      frameGroup.children.forEach(f => {
        if (!targetFrame) {
          targetFrame = f
          return
        }

        targetFrame.geometry.merge(f.geometry)
      })
    })
    var targetBoard
    boards.forEach(b => {
      if (!targetBoard) {
        targetBoard = b
        return
      }

      targetBoard.geometry.merge(b.geometry)
    })
  }

  makeShelfString(pattern, shelf, length) {
    /**
     *  pattern #: 숫자
     *  pattern 0: 고정 자리수
     *  pattern -: 역순
     */

    if (!pattern || !shelf || !length) return

    var isReverse = /^\-/.test(pattern)
    pattern = pattern.replace(/#+/, '#')

    var fixedLength = (pattern.match(/0/g) || []).length || 0
    var shelfString = String(isReverse ? length - shelf + 1 : shelf)

    if (shelfString.length > fixedLength && fixedLength > 0) {
      shelfString = shelfString
        .split('')
        .shift(shelfString.length - fixedLength)
        .join('')
    } else {
      var prefix = ''
      for (var i = 0; i < fixedLength - shelfString.length; i++) {
        prefix += '0'
      }
      shelfString = prefix + shelfString
    }

    return shelfString
  }

  setOpacity() {}

  raycast(raycaster, intersects) {}

  onchange(after, before) {
    if (after.hasOwnProperty('data')) {
      this.data = after.data
    }
  }
}

export class RackTable extends ContainerAbstract {
  is3dish() {
    return true
  }

  dispose() {
    super.dispose()
    delete this._focused_cell
  }

  created() {
    var tobeSize = this.rows * this.columns
    var gap = this.size() - tobeSize

    if (gap == 0) {
      return
    } else if (gap > 0) {
      let removals = this._components.slice(gap)
      this.remove(removals)
    } else {
      let newbies = []

      for (let i = 0; i < -gap; i++) newbies.push(buildNewCell(this.app))

      this.add(newbies)
    }

    var widths = this.get('widths')
    var heights = this.get('heights')

    if (!widths || widths.length < this.columns) this.set('widths', this.widths)
    if (!heights || heights.length < this.rows) this.set('heights', this.heights)
  }

  // 컴포넌트를 임의로 추가 및 삭제할 수 있는 지를 지정하는 속성임.
  get focusible() {
    return false
  }

  get widths() {
    var widths = this.get('widths')

    if (!widths) return array(1, this.columns)

    if (widths.length < this.columns) return widths.concat(array(1, this.columns - widths.length))
    else if (widths.length > this.columns) return widths.slice(0, this.columns)

    return widths
  }

  get heights() {
    var heights = this.get('heights')

    if (!heights) return array(1, this.rows)

    if (heights.length < this.rows) return heights.concat(array(1, this.rows - heights.length))
    else if (heights.length > this.rows) return heights.slice(0, this.rows)

    return heights
  }

  buildCells(newrows, newcolumns, oldrows, oldcolumns) {
    if (newrows < oldrows) {
      let removals = this._components.slice(oldcolumns * newrows)
      this.remove(removals)
    }

    var minrows = Math.min(newrows, oldrows)

    if (newcolumns > oldcolumns) {
      for (let r = 0; r < minrows; r++) {
        for (let c = oldcolumns; c < newcolumns; c++) {
          this.insertComponentAt(buildNewCell(this.app), r * newcolumns + c)
        }
      }
    } else if (newcolumns < oldcolumns) {
      let removals = []

      for (let r = 0; r < minrows; r++) {
        for (let c = newcolumns; c < oldcolumns; c++) {
          removals.push(this.components[r * oldcolumns + c])
        }
      }
      this.remove(removals)
    }

    if (newrows > oldrows) {
      let newbies = []

      for (let r = oldrows; r < newrows; r++) {
        for (let i = 0; i < newcolumns; i++) {
          newbies.push(buildNewCell(this.app))
        }
      }
      this.add(newbies)
    }

    this.set({
      widths: this.widths,
      heights: this.heights
    })
  }

  get layout() {
    return TABLE_LAYOUT
  }

  get rows() {
    return this.get('rows')
  }

  setCellsStyle(cells, style, where) {
    var components = this.components
    var total = components.length
    var columns = this.get('columns')

    // 병합된 셀도 포함시킨다.
    var _cells = []
    cells.forEach(c => {
      _cells.push(c)
      if (c.colspan || c.rowspan) {
        let col = this.getRowColumn(c).column
        let row = this.getRowColumn(c).row
        for (let i = row; i < row + c.rowspan; i++)
          for (let j = col; j < col + c.colspan; j++)
            if (i != row || j != col) _cells.push(this.components[i * this.columns + j])
      }
    })
    var indices = _cells.map(cell => components.indexOf(cell))
    indices.forEach(i => {
      var cell = components[i]

      switch (where) {
        case 'all':
          setCellBorder(cell, style, where)

          if (isLeftMost(total, columns, indices, i)) setCellBorder(components[before(columns, i)], style, 'right')
          if (isRightMost(total, columns, indices, i)) setCellBorder(components[after(columns, i)], style, 'left')
          if (isTopMost(total, columns, indices, i)) setCellBorder(components[above(columns, i)], style, 'bottom')
          if (isBottomMost(total, columns, indices, i)) setCellBorder(components[below(columns, i)], style, 'top')
          break
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
          break
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
          break
        case 'left':
          if (isLeftMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'left')
            setCellBorder(components[before(columns, i)], style, 'right')
          }
          break
        case 'right':
          if (isRightMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'right')
            setCellBorder(components[after(columns, i)], style, 'left')
          }
          break
        case 'center':
          if (!isLeftMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'left')
          }
          if (!isRightMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'right')
          }
          break
        case 'middle':
          if (!isTopMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'top')
          }
          if (!isBottomMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'bottom')
          }
          break
        case 'top':
          if (isTopMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'top')
            setCellBorder(components[above(columns, i)], style, 'bottom')
          }
          break
        case 'bottom':
          if (isBottomMost(total, columns, indices, i)) {
            setCellBorder(cell, style, 'bottom')
            setCellBorder(components[below(columns, i)], style, 'top')
          }
          break
        case 'clear':
          setCellBorder(cell, CLEAR_STYLE, 'all')

          if (isLeftMost(total, columns, indices, i))
            setCellBorder(components[before(columns, i)], CLEAR_STYLE, 'right')
          if (isRightMost(total, columns, indices, i)) setCellBorder(components[after(columns, i)], CLEAR_STYLE, 'left')
          if (isTopMost(total, columns, indices, i)) setCellBorder(components[above(columns, i)], CLEAR_STYLE, 'bottom')
          if (isBottomMost(total, columns, indices, i)) setCellBorder(components[below(columns, i)], CLEAR_STYLE, 'top')
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
    for (var i = 0; i < this.rows; i++) cells.push(this.components[this.columns * i + column])

    return cells
  }

  deleteRows(cells) {
    // 먼저 cells 위치의 행을 구한다.
    let rows = []
    cells.forEach(cell => {
      let row = this.getRowColumn(cell).row
      if (-1 == rows.indexOf(row)) rows.push(row)
    })
    rows.sort((a, b) => {
      return a - b
    })
    rows.reverse()
    var heights = this.heights.slice()
    rows.forEach(row => {
      this.remove(this.getCellsByRow(row))
    })
    heights.splice(rows, 1)
    this.model.rows -= rows.length // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.
    this.set('heights', heights)
  }

  deleteColumns(cells) {
    // 먼저 cells 위치의 열을 구한다.
    let columns = []
    cells.forEach(cell => {
      let column = this.getRowColumn(cell).column
      if (-1 == columns.indexOf(column)) columns.push(column)
    })
    columns.sort((a, b) => {
      return a - b
    })
    columns.reverse()

    columns.forEach(column => {
      var widths = this.widths.slice()
      this.remove(this.getCellsByColumn(column))
      widths.splice(column, 1)
      this.model.columns -= 1 // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.
      this.set('widths', widths)
    })
  }

  insertCellsAbove(cells) {
    // 먼저 cells 위치의 행을 구한다.
    let rows = []
    cells.forEach(cell => {
      let row = this.getRowColumn(cell).row
      if (-1 == rows.indexOf(row)) rows.push(row)
    })
    rows.sort((a, b) => {
      return a - b
    })
    rows.reverse()
    // 행 2개 이상은 추가 안함. 임시로 막아놓음
    if (rows.length >= 2) return false
    let insertionRowPosition = rows[0]
    let newbieRowHeights = []
    let newbieCells = []
    rows.forEach(row => {
      for (let i = 0; i < this.columns; i++)
        newbieCells.push(buildCopiedCell(this.components[row * this.columns + i].model, this.app))

      newbieRowHeights.push(this.heights[row])

      newbieCells.reverse().forEach(cell => {
        this.insertComponentAt(cell, insertionRowPosition * this.columns)
      })

      let heights = this.heights.slice()
      heights.splice(insertionRowPosition, 0, ...newbieRowHeights)
      this.set('heights', heights)

      this.model.rows += rows.length

      this.clearCache()
    })
  }

  insertCellsBelow(cells) {
    // 먼저 cells 위치의 행을 구한다.
    let rows = []
    cells.forEach(cell => {
      let row = this.getRowColumn(cell).row
      if (-1 == rows.indexOf(row)) rows.push(row)
    })
    rows.sort((a, b) => {
      return a - b
    })
    rows.reverse()
    // 행 2개 이상은 추가 안함. 임시로 막아놓음
    if (rows.length >= 2) return false
    let insertionRowPosition = rows[rows.length - 1] + 1
    let newbieRowHeights = []
    let newbieCells = []
    rows.forEach(row => {
      for (let i = 0; i < this.columns; i++)
        newbieCells.push(buildCopiedCell(this.components[row * this.columns + i].model, this.app))
      newbieRowHeights.push(this.heights[row])

      newbieCells.reverse().forEach(cell => {
        this.insertComponentAt(cell, insertionRowPosition * this.columns)
      })

      let heights = this.heights.slice()
      heights.splice(insertionRowPosition, 0, ...newbieRowHeights)
      this.set('heights', heights)

      this.model.rows += 1

      this.clearCache()
    })
  }

  insertCellsLeft(cells) {
    // 먼저 cells 위치의 열을 구한다.
    let columns = []
    cells.forEach(cell => {
      let column = this.getRowColumn(cell).column
      if (-1 == columns.indexOf(column)) columns.push(column)
    })
    columns.sort((a, b) => {
      return a - b
    })
    columns.reverse()
    // 열 2개 이상은 추가 안함. 임시로 막아놓음
    if (columns.length >= 2) return false
    let insertionColumnPosition = columns[0]
    let newbieColumnWidths = []
    let newbieCells = []
    columns.forEach(column => {
      for (let i = 0; i < this.rows; i++)
        newbieCells.push(buildCopiedCell(this.components[column + this.columns * i].model, this.app))
      newbieColumnWidths.push(this.widths[column])

      let increasedColumns = this.columns
      let index = this.rows
      newbieCells.reverse().forEach(cell => {
        if (index == 0) {
          index = this.rows
          increasedColumns++
        }

        index--
        this.insertComponentAt(cell, insertionColumnPosition + index * increasedColumns)
      })

      let widths = this.widths.slice()
      this.model.columns += columns.length // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.

      widths.splice(insertionColumnPosition, 0, ...newbieColumnWidths)

      this.set('widths', widths)
    })
  }

  insertCellsRight(cells) {
    // 먼저 cells 위치의 열을 구한다.
    let columns = []
    cells.forEach(cell => {
      let column = this.getRowColumn(cell).column
      if (-1 == columns.indexOf(column)) columns.push(column)
    })
    columns.sort((a, b) => {
      return a - b
    })
    columns.reverse()
    // 열 2개 이상은 추가 안함. 임시로 막아놓음
    if (columns.length >= 2) return false
    let insertionColumnPosition = columns[columns.length - 1] + 1
    let newbieColumnWidths = []
    let newbieCells = []
    columns.forEach(column => {
      for (let i = 0; i < this.rows; i++)
        newbieCells.push(buildCopiedCell(this.components[column + this.columns * i].model, this.app))
      newbieColumnWidths.push(this.widths[column])

      let increasedColumns = this.columns
      let index = this.rows
      newbieCells.reverse().forEach(cell => {
        if (index == 0) {
          index = this.rows
          increasedColumns++
        }

        index--
        this.insertComponentAt(cell, insertionColumnPosition + index * increasedColumns)
      })

      let widths = this.widths.slice()
      this.model.columns += columns.length // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.

      widths.splice(insertionColumnPosition, 0, ...newbieColumnWidths)

      this.set('widths', widths)
    })
  }

  distributeHorizontal(cells) {
    var columns = []

    cells.forEach(cell => {
      let rowcolumn = this.getRowColumn(cell)

      if (-1 == columns.indexOf(rowcolumn.column)) columns.push(rowcolumn.column)
    })

    var sum = columns.reduce((sum, column) => {
      return sum + this.widths[column]
    }, 0)

    var newval = Math.round((sum / columns.length) * 100) / 100
    var widths = this.widths.slice()
    columns.forEach(column => {
      widths[column] = newval
    })

    this.set('widths', widths)
  }

  distributeVertical(cells) {
    var rows = []

    cells.forEach(cell => {
      let rowcolumn = this.getRowColumn(cell)

      if (-1 == rows.indexOf(rowcolumn.row)) rows.push(rowcolumn.row)
    })

    var sum = rows.reduce((sum, row) => {
      return sum + this.heights[row]
    }, 0)

    var newval = Math.round((sum / rows.length) * 100) / 100
    var heights = this.heights.slice()
    rows.forEach(row => {
      heights[row] = newval
    })

    this.set('heights', heights)
  }

  /**
   * visualizer location setting functions
   */
  increaseLocation(type, skipNumbering, startSection, startUnit) {
    /**
     * step 1
     *
     * selected collect rack-cell
     */
    var selectedCells = this.root.selected

    /**
     * step 2
     *
     * classify cells by row
     */
    var classified = this.classifyByRow(selectedCells)

    /**
     * step 3
     *
     * find aisle
     */
    var aisleRowIndices = this.getAisleRowIndices(classified)

    /**
     * step 4
     *
     * classify cells by section
     */
    var sections = this.classifyCellsBySection(classified, aisleRowIndices)

    /**
     * step 5
     *
     * rearrange by aisle
     */
    var rearranged = this.rearrangeByAisle(type, sections, aisleRowIndices)

    /**
     * step 6
     *
     * if skip numbering, remove empty cells
     */
    if (skipNumbering) rearranged = this.removeEmptyCells(rearranged)

    /**
     * step 7
     *
     * merge rows
     */
    var merged = this.mergeRows(rearranged)

    /**
     * step 8
     *
     * set location
     */
    this.setLocations(merged, startSection, startUnit)
  }

  classifyByRow(cells) {
    var classified = []
    cells.forEach(c => {
      var index = c.index
      var { row, column } = index

      if (!classified[row]) classified[row] = []

      classified[row][column] = c
    })

    return classified
  }

  findAisle(rows) {
    if (!rows) return []

    return rows.filter(r => {
      return r[0] && r[0].isAisle
    })
  }

  getAisleRowIndices(rows) {
    var aisles = this.findAisle(rows)
    var aisleRowIndices = []
    aisles.forEach(aisle => {
      aisleRowIndices.push(rows.indexOf(aisle))
    })

    return aisleRowIndices
  }

  classifyCellsBySection(rows, aisleRowIndices) {
    var sections = []
    var wasAisle = false
    var section
    rows.forEach((row, i) => {
      var isAisle = aisleRowIndices.indexOf(i) > -1
      if (!(wasAisle || isAisle)) {
        section = []
        sections.push(section)
      }

      wasAisle = isAisle

      section.push(row)
    })

    return sections
  }

  rearrangeByAisle(type, sections) {
    var rearranged = []
    switch (type.toLowerCase()) {
      case 'cw':
        var reverse = false
        sections.forEach((rows, i) => {
          var section = []
          rearranged.push(section)
          rows.forEach((r, i) => {
            if (reverse) r.reverse()

            if (i % 2 === 0) {
              section.push(r)
              reverse = !reverse
            }
          })
        })
        break
      case 'ccw':
        var reverse = true
        sections.forEach((rows, i) => {
          var section = []
          rearranged.push(section)
          rows.forEach((r, i) => {
            if (reverse) r.reverse()

            if (i % 2 === 0) {
              section.push(r)
              reverse = !reverse
            }
          })
        })
        break
      case 'zigzag':
        sections.forEach((rows, i) => {
          var section = []

          rows.forEach((r, i) => {
            if (i % 2 === 0) {
              section.push(r)
            }
          })

          var sectionLength = section.length
          var tempRow = []
          var tempSection = []

          section.forEach((row, rowIdx) => {
            row.forEach((cell, idx) => {
              tempRow[rowIdx + idx * section.length] = cell
            })
          })

          var chunkSize = tempRow.length / sectionLength
          for (var idx = 0; idx < sectionLength; idx++) {
            tempSection.push(tempRow.slice(idx * chunkSize, (idx + 1) * chunkSize))
          }

          rearranged.push(tempSection)
        })
        break
      case 'zigzag-reverse':
        sections.forEach((rows, i) => {
          var section = []

          rows.forEach((r, i) => {
            if (i % 2 === 0) {
              r.reverse()
              section.push(r)
            }
          })

          var sectionLength = section.length
          var tempRow = []
          var tempSection = []

          section.forEach((row, rowIdx) => {
            row.forEach((cell, idx) => {
              tempRow[rowIdx + idx * section.length] = cell
            })
          })

          var chunkSize = tempRow.length / sectionLength
          for (var idx = 0; idx < sectionLength; idx++) {
            tempSection.push(tempRow.slice(idx * chunkSize, (idx + 1) * chunkSize))
          }

          rearranged.push(tempSection)
        })
        break
    }

    return rearranged
  }

  removeEmptyCells(sections) {
    var newSections = []
    sections.forEach(rows => {
      var newRows = []
      newSections.push(newRows)
      rows.forEach(row => {
        var newRow = []
        newRows.push(newRow)
        row.forEach((c, i) => {
          if (!c.isEmpty) newRow.push(c)
        })
      })
    })

    return newSections
  }

  mergeRows(sections) {
    var merged = []
    sections.forEach(section => {
      var newSection = []
      section.forEach(rows => {
        var mergedRow = []
        rows.forEach(row => {
          mergedRow = mergedRow.concat(row)
        })
        newSection = newSection.concat(mergedRow)
      })
      merged.push(newSection)
    })
    return merged
  }

  setLocations(sections, startSection, startUnit) {
    var { sectionDigits = 2, unitDigits = 2 } = this.model

    var sectionNumber = Number(startSection) || 1

    sections.forEach(section => {
      var unitNumber = Number(startUnit) || 1
      section.forEach(c => {
        if (!c.isEmpty) {
          c.set('section', String(sectionNumber).padStart(sectionDigits, 0))
          c.set('unit', String(unitNumber).padStart(unitDigits, 0))
        } else {
          c.set('section', null)
          c.set('unit', null)
        }
        unitNumber++
      })
      sectionNumber++
    })
  }

  get columns() {
    return this.get('columns')
  }

  get lefts() {
    return this.components.filter((c, i) => {
      return !(i % this.columns)
    })
  }

  get centers() {
    return this.components.filter((c, i) => {
      return i % this.columns && (i + 1) % this.columns
    })
  }

  get rights() {
    return this.components.filter((c, i) => {
      return !((i + 1) % this.columns)
    })
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
    var widths = this.widths
    return widths ? widths.filter((width, i) => i < this.columns).reduce((sum, width) => sum + width, 0) : this.columns
  }

  get heights_sum() {
    var heights = this.heights
    return heights ? heights.filter((height, i) => i < this.rows).reduce((sum, height) => sum + height, 0) : this.rows
  }

  get nature() {
    return NATURE
  }

  get controls() {
    var widths = this.widths
    var heights = this.heights
    var inside = this.textBounds

    var width_unit = inside.width / this.widths_sum
    var height_unit = inside.height / this.heights_sum

    var x = inside.left
    var y = inside.top

    var controls = []

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
    if ('rows' in after || 'columns' in after) {
      this.buildCells(
        this.get('rows'),
        this.get('columns'),
        before.hasOwnProperty('rows') ? before.rows : this.get('rows'),
        before.hasOwnProperty('columns') ? before.columns : this.get('columns')
      )
    }

    if ('shelfLocations' in after) {
      delete this.model.shelfPattern
    }

    this.invalidate()
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
    this.invalidate()
  }
}

;['rows', 'columns', 'widths', 'heights', 'widths_sum', 'heights_sum', 'controls'].forEach(getter =>
  Component.memoize(RackTable.prototype, getter, false)
)

Component.register('rack-table', RackTable)
Component3d.register('rack-table', RackTable3d)
