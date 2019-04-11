/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, Container, Layout, Model } from '@hatiolab/things-scene'
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
      type: 'number',
      label: 'min-section',
      name: 'minSection'
    },
    {
      type: 'number',
      label: 'min-unit',
      name: 'minUnit'
    },
    {
      type: 'string',
      label: 'location-pattern',
      name: 'locPattern',
      property: {
        placeholder: '{z}{s}-{u}-{sh}'
      }
    },
    {
      type: 'string',
      label: 'shelf-pattern',
      name: 'shelfPattern',
      property: {
        placeholder: '#, 00, 000'
      }
    },
    {
      type: 'rack-increase-pattern',
      label: '',
      name: 'increasePattern'
    },
    {
      type: 'number',
      label: 'stock-scale',
      name: 'stockScale'
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

function hasAnyProperty(o, ...properties) {
  for (let p in properties) {
    if (o.hasOwnProperty(properties[p])) return true
  }
}

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
  ondragmove: function(point, index, component) {
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
  ondragmove: function(point, index, component) {
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

const LOCATION_HEADER_SIZE = 50
const LOCATION_HEADER_LINE_WIDTH = 1
const LOCATION_HEADER_STROKE_STYLE = '#ccc'
const LOCATION_HEADER_FILL_STYLE = 'rgba(230, 230, 230, 0.5)'
const LOCATION_HEADER_HIGHLIGHT_STROKE_STYLE = 'rgba(0, 0, 99, 0.9)'
const LOCATION_HEADER_HIGHLIGHT_FILL_STYLE = 'rgba(0, 0, 255, 0.5)'

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
      locPattern,
      shelfPattern,
      shelves = 1,
      depth = 1,
      increasePattern = '+u+s',
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
        shelfPattern,
        isEmpty: rack.isEmpty,
        hideRackFrame,
        stockScale
      }

      if (!rackModel.isEmpty) {
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

  raycast(raycaster, intersects) {}

  onchange(after, before) {
    if (after.hasOwnProperty('data')) {
      this.data = after.data
    }
  }
}

export class RackTable extends Container {
  is3dish() {
    return true
  }

  dispose() {
    super.dispose()
    delete this._focused_cell
  }

  _post_draw(context) {
    super._post_draw(context)

    if (!this.app.isEditMode) return

    if (this._focused) {
      this._draw_column_header(context)
      this._draw_row_header(context)
      this._draw_header_joint(context)
    }

    if (this._focused_cell) {
      this._draw_highlight(context)
    }
  }

  _draw_column_header(context) {
    var { left, top, width, height } = this.bounds

    var { minUnit = 1, minSection = 1, increasePattern = '+u+s', columns } = this.model

    context.beginPath()
    context.lineWidth = LOCATION_HEADER_LINE_WIDTH
    context.strokeStyle = LOCATION_HEADER_STROKE_STYLE
    context.fillStyle = LOCATION_HEADER_FILL_STYLE

    context.moveTo(left, top - LOCATION_HEADER_SIZE)
    context.rect(left, top - LOCATION_HEADER_SIZE, width, LOCATION_HEADER_SIZE)

    context.fill()

    var cells = this.getCellsByRow(0)

    var patternChecker = /([\+,\-])([u,s])([\+,\-])([u,s])/i

    var matches = increasePattern.match(patternChecker)
    if (!matches || matches.length < 5) {
      console.warn('Rack Pattern Error', increasePattern)
      return false
    }

    cells.forEach((cell, index) => {
      var width = cell.model.width
      var locationText = matches[2] == 'u' ? cell.get('unit') : cell.get('section')

      if (locationText) {
        this._draw_location_header_text(
          context,
          {
            left: left,
            top: top - LOCATION_HEADER_SIZE,
            width,
            height: LOCATION_HEADER_SIZE
          },
          locationText,
          this.model
        )
      }

      left = left + width
      context.moveTo(left, top - LOCATION_HEADER_SIZE)
      context.lineTo(left, top)
    })

    context.stroke()

    context.closePath()
  }

  _draw_row_header(context) {
    var { left, top, width, height } = this.bounds

    var { minUnit = 1, minSection = 1, increasePattern = '+u+s', rows } = this.model

    context.beginPath()
    context.lineWidth = LOCATION_HEADER_LINE_WIDTH
    context.strokeStyle = LOCATION_HEADER_STROKE_STYLE
    context.fillStyle = LOCATION_HEADER_FILL_STYLE

    context.moveTo(left - LOCATION_HEADER_SIZE, top)
    context.rect(left - LOCATION_HEADER_SIZE, top, LOCATION_HEADER_SIZE, height)

    context.fill()

    var cells = this.getCellsByColumn(0)

    var patternChecker = /([\+,\-])([u,s])([\+,\-])([u,s])/i

    var matches = increasePattern.match(patternChecker)
    if (!matches || matches.length < 5) {
      console.warn('Rack Pattern Error', increasePattern)
      return false
    }

    cells.forEach((cell, index) => {
      var height = cell.model.height
      var locationText = matches[4] == 'u' ? cell.get('unit') : cell.get('section')

      if (locationText) {
        this._draw_location_header_text(
          context,
          {
            left: left - LOCATION_HEADER_SIZE,
            top,
            width: LOCATION_HEADER_SIZE,
            height
          },
          locationText,
          this.model
        )
      }

      top = top + height
      context.moveTo(left - LOCATION_HEADER_SIZE, top)
      context.lineTo(left, top)
    })

    context.stroke()

    context.closePath()
  }

  _draw_header_joint(context) {
    var { left, top, width, height } = this.bounds

    var { minUnit = 1, minSection = 1, increasePattern = '+u+s', rows } = this.model

    context.beginPath()
    context.lineWidth = LOCATION_HEADER_LINE_WIDTH
    context.strokeStyle = LOCATION_HEADER_STROKE_STYLE
    context.fillStyle = LOCATION_HEADER_FILL_STYLE

    context.moveTo(left - LOCATION_HEADER_SIZE, top - LOCATION_HEADER_SIZE)
    context.rect(left - LOCATION_HEADER_SIZE, top - LOCATION_HEADER_SIZE, LOCATION_HEADER_SIZE, LOCATION_HEADER_SIZE)

    context.fill()
    context.closePath()

    context.beginPath()
    context.moveTo(left - LOCATION_HEADER_SIZE, top - LOCATION_HEADER_SIZE)
    context.lineTo(left, top)

    context.stroke()

    var cells = this.getCellsByColumn(0)

    var patternChecker = /([\+,\-])([u,s])([\+,\-])([u,s])/i

    var matches = increasePattern.match(patternChecker)
    if (!matches || matches.length < 5) {
      console.warn('Rack Pattern Error', increasePattern)
      return false
    }

    var colText, rowText
    if (matches[2] == 'u') {
      colText = 'U'
      rowText = 'S'
    } else {
      colText = 'S'
      rowText = 'U'
    }

    this._draw_location_header_text(
      context,
      {
        left: left - LOCATION_HEADER_SIZE * 0.5,
        top: top - LOCATION_HEADER_SIZE,
        width: LOCATION_HEADER_SIZE * 0.5,
        height: LOCATION_HEADER_SIZE * 0.5
      },
      colText,
      this.model
    )

    this._draw_location_header_text(
      context,
      {
        left: left - LOCATION_HEADER_SIZE,
        top: top - LOCATION_HEADER_SIZE * 0.5,
        width: LOCATION_HEADER_SIZE * 0.5,
        height: LOCATION_HEADER_SIZE * 0.5
      },
      rowText,
      this.model
    )

    context.closePath()
  }

  _draw_location_header_text(context, bounds, text, style) {
    var { alpha, fontColor = '#000', fontSize = 12, lineHeight = fontSize * 1.2 } = style

    // 1. context를 준비.
    context.save()
    context.beginPath()

    // 2. 텍스팅 바운드를 준비.
    var { left, top, width, height } = bounds

    // 3. context의 font를 설정
    context.font = Component.font(style)

    var baseY
    baseY = top + height / 2
    context.textBaseline = 'middle'

    var baseX

    baseX = left + width / 2
    context.textAlign = 'center'

    context.globalAlpha *= alpha
    context.fillStyle = fontColor

    context.fillText(text, baseX, baseY)

    context.restore()
  }

  _draw_highlight(context) {
    var { left, top, width, height } = this._focused_cell.bounds

    var cellBottom = top + height
    var cellRight = left + width

    var tableLeft = this.bounds.left
    var tableTop = this.bounds.top

    // draw guide lines
    context.beginPath()

    context.strokeStyle = LOCATION_HEADER_HIGHLIGHT_STROKE_STYLE
    context.rect(tableLeft - LOCATION_HEADER_SIZE, tableTop + top, cellRight + LOCATION_HEADER_SIZE, height)
    context.rect(tableLeft + left, tableTop - LOCATION_HEADER_SIZE, width, cellBottom + LOCATION_HEADER_SIZE)
    context.stroke()

    context.closePath()

    // draw header fill
    context.beginPath()

    context.fillStyle = LOCATION_HEADER_HIGHLIGHT_FILL_STYLE
    context.rect(tableLeft - LOCATION_HEADER_SIZE, tableTop + top, LOCATION_HEADER_SIZE, height)
    context.rect(tableLeft + left, tableTop - LOCATION_HEADER_SIZE, width, LOCATION_HEADER_SIZE)

    context.fill()

    context.closePath()
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

  added() {
    this.setCellLocations()
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

    this.setCellLocations()
  }

  setCellLocations() {
    var { minUnit = 1, minSection = 1, increasePattern = '+u+s' } = this.model

    var columns = this.get('columns')
    var rows = this.get('rows')

    var columnCellsList = []
    var rowCellsList = []

    for (var i = 0; i < columns; i++) {
      var cells = this.getCellsByColumn(i)
      cells.every(c => {
        c.model.unit = c.model.section = undefined
      })
      columnCellsList.push(cells)
    }

    for (var i = 0; i < rows; i++) {
      var cells = this.getCellsByRow(i)
      cells.every(c => {
        c.model.unit = c.model.section = undefined
      })
      rowCellsList.push(cells)
    }

    var patternChecker = /([\+,\-])([u,s])([\+,\-])([u,s])/i

    var matches = increasePattern.match(patternChecker)
    if (!matches || matches.length < 5) {
      console.warn('Rack Pattern Error', increasePattern)
      return false
    }

    var r = 0
    var rowIndex = 0
    for (var i = 0; i < rows; i++) {
      var colIndex = 0

      var currRowCells = rowCellsList[i]

      var emptyCells = currRowCells.filter(c => {
        return c.model.isEmpty
      })

      if (emptyCells.length === columns) continue

      if (matches[4] == 'u') {
        if (matches[3] == '+') r = rowIndex + minUnit
        else r = rows - rowIndex - 1 + minUnit
      } else {
        if (matches[3] == '+') r = rowIndex + minSection
        else r = rows - rowIndex - 1 + minSection
      }

      for (var y = 0; y < columns; y++) {
        var c = 0

        var currColCells = columnCellsList[y]

        var emptyCells = currColCells.filter(c => {
          return c.model.isEmpty
        })

        if (emptyCells.length === rows) continue

        if (matches[2] == 'u') {
          if (matches[1] == '+') c = colIndex + minUnit
          else c = columns - colIndex - 1 + minUnit
        } else {
          if (matches[1] == '+') c = colIndex + minSection
          else c = columns - colIndex - 1 + minSection
        }

        if (matches[2] == 'u') {
          currColCells[i].model.unit = `${String(c).padStart(2, 0)}`
          currColCells[i].model.section = `${String(r).padStart(2, 0)}`
        } else {
          currColCells[i].model.unit = `${String(r).padStart(2, 0)}`
          currColCells[i].model.section = `${String(c).padStart(2, 0)}`
        }

        colIndex++
      }

      rowIndex++
    }
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
    if (hasAnyProperty(after, 'rows', 'columns', 'increasePattern')) {
      this.buildCells(
        this.get('rows'),
        this.get('columns'),
        before.hasOwnProperty('rows') ? before.rows : this.get('rows'),
        before.hasOwnProperty('columns') ? before.columns : this.get('columns')
      )
    }

    this.invalidate()
  }

  get eventMap() {
    return {
      '(self)': {
        '(descendant)': {
          change: this.oncellchanged,
          mouseenter: this.oncellmouseentered,
          dragstart: this.oncelldragstarted
        }
      }
    }
  }

  oncellchanged(after, before) {
    this.setCellLocations()
    this.invalidate()
  }

  contains(x, y) {
    var contains = super.contains(x, y)
    if (contains) this._focused = true
    else {
      this._focused = false
      this._focused_cell = null
    }

    this.invalidate()

    return contains
  }

  // onmouseenter(e) {
  //   this._focused = true;
  //   this.invalidate();
  // }

  // onmouseleave(e) {
  //   this._focused = false;
  //   this.invalidate();
  // }

  oncelldragstarted(e, hint) {
    var cell = hint.origin

    // cell._focused = false;
    this._focused_cell = null
  }

  oncellmouseentered(e, hint) {
    var cell = hint.origin

    this._focused_cell = cell
  }

  oncellmouseleaved(e, hint) {
    this._focused_cell = null
  }
}

;['rows', 'columns', 'widths', 'heights', 'widths_sum', 'heights_sum', 'controls'].forEach(getter =>
  Component.memoize(RackTable.prototype, getter, false)
)

Component.register('rack-table', RackTable)
Component3d.register('rack-table', RackTable3d)
