/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, RectPath } from '@hatiolab/things-scene'

const EMPTY_BORDER = {}

function isBottomMost(idx, rows, columns) {
  return idx >= (rows - 1) * columns
}

function isRightMost(idx, rows, columns) {
  return (idx + 1) % columns == 0
}

function hasAnyProperty(o, ...properties) {
  for (let p in properties) {
    if (o.hasOwnProperty(properties[p])) return true
  }
}

const EMPTY_CELL_STROKE_STYLE = '#ccc'
const EMPTY_CELL_LINE_WIDTH = 1
const EMPTY_CELL_FILL_STYLE = '#efefef'

/**
 * 1. 스타일을 상속 받아야 함. (cascade-style)
 * 2. 스타일을 동적처리할 수 있음. (로직처리)
 * 3. 데이타를 받을 수 있음.
 */
export default class RackTableCell extends RectPath(Component) {
  get hasTextProperty() {
    return false
  }

  get nature() {
    return {
      mutable: false,
      resizable: true,
      rotatable: true,
      properties: [
        {
          type: 'string',
          label: 'section',
          name: 'section'
        },
        {
          type: 'string',
          label: 'unit',
          name: 'unit'
        },
        {
          type: 'string',
          label: 'shelf-locations',
          name: 'shelfLocations',
          placeholder: '1,2,3,... / ,,,04'
        },
        {
          type: 'textarea',
          label: 'bin-locations',
          name: 'binLocations',
          placeholder: '1,2,3,...'
        },
        {
          type: 'checkbox',
          label: 'is-empty',
          name: 'isEmpty'
        },
        {
          type: 'location-increase-pattern',
          label: '',
          name: '',
          property: {
            event: {
              'increase-location-pattern': event => {
                var { increasingDirection, skipNumbering, startSection, startUnit } = event.detail
                const rackTable = this.parent
                rackTable.increaseLocation(increasingDirection, skipNumbering, startSection, startUnit)
              }
            }
          }
        },
        {
          type: 'editor-table',
          label: '',
          name: '',
          property: {
            merge: false,
            split: false
          }
        }
      ]
    }
  }

  set merged(merged) {
    this.set('merged', !!merged)
    if (merged) this.set('text', '')
  }

  get merged() {
    return this.get('merged')
  }

  set rowspan(rowspan) {
    this.set('rowspan', rowspan)
  }

  get rowspan() {
    return this.get('rowspan')
  }

  set colspan(colspan) {
    this.set('colspan', colspan)
  }

  get colspan() {
    return this.get('colspan')
  }

  get border() {
    return this.model.border || EMPTY_BORDER
  }

  get isEmpty() {
    return this.get('isEmpty')
  }

  _drawBorder(context, x, y, to_x, to_y, style) {
    if (style && style.strokeStyle && style.lineWidth && style.lineDash) {
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(to_x, to_y)
      Component.drawStroke(context, style, this)
    }
  }

  render(context) {
    var { left, top, width, height } = this.model

    var border = this.border

    if (!this.model.isEmpty) this._draw_rack_cell(context)

    // Cell 채우기.
    context.beginPath()
    context.lineWidth = 0
    context.rect(left, top, width, height)

    // Border 그리기
    var parent = this.parent
    var idx = parent.components.indexOf(this)
    var columns = parent.columns || 1
    var rows = parent.rows || 1

    this._drawBorder(context, left, top, left + width, top, border.top)
    this._drawBorder(context, left, top + height, left, top, border.left)
    if (isRightMost(idx, rows, columns))
      this._drawBorder(context, left + width, top, left + width, top + height, border.right)
    if (isBottomMost(idx, rows, columns))
      this._drawBorder(context, left + width, top + height, left, top + height, border.bottom)
  }

  _draw_rack_cell(context) {
    var { left, top, width, height } = this.model

    context.save()
    context.fillStyle = EMPTY_CELL_FILL_STYLE
    context.fillRect(left, top, width, height)

    context.beginPath()
    context.lineWidth = EMPTY_CELL_LINE_WIDTH
    context.strokeStyle = EMPTY_CELL_STROKE_STYLE

    context.moveTo(left, top)
    context.lineTo(left + width, top + height)
    context.moveTo(left + width, top)
    context.lineTo(left, top + height)

    context.stroke()
    context.closePath()
    context.restore()
  }

  get tag() {
    var rackTable = this.parent
    var { locPattern, zone } = rackTable.model

    locPattern = locPattern.substring(0, locPattern.indexOf('{u}') + 3)

    var locationString = ''
    if (this.get('section') && this.get('unit'))
      locationString = locPattern
        .replace('{z}', zone)
        .replace('{s}', this.get('section'))
        .replace('{u}', this.get('unit'))

    return locationString || ''
  }

  get index() {
    let rackTable = this.parent
    var index = rackTable.components.indexOf(this)

    var rowIndex = Math.floor(index / rackTable.columns)
    var columnIndex = index % rackTable.columns

    return {
      row: rowIndex,
      column: columnIndex
    }
  }

  get rowIndex() {
    return this.index.row
  }

  get columnIndex() {
    return this.index.column
  }

  get leftCell() {
    let rackTable = this.parent
    var index = rackTable.components.indexOf(this)

    var rowIndex = this.rowIndex
    var columnIndex = this.columnIndex

    if (columnIndex === 0) return null

    var leftCell = rackTable.components[rowIndex * rackTable.columns + columnIndex - 1]

    return leftCell
  }

  get rightCell() {
    let rackTable = this.parent
    var index = rackTable.components.indexOf(this)

    var rowIndex = this.rowIndex
    var columnIndex = this.columnIndex

    if (columnIndex === rackTable.columns) return null

    var rightCell = rackTable.components[rowIndex * rackTable.columns + columnIndex + 1]

    return rightCell
  }

  get aboveCell() {
    let rackTable = this.parent
    var index = rackTable.components.indexOf(this)

    var rowIndex = this.rowIndex
    var columnIndex = this.columnIndex

    if (rowIndex === 0) return null

    var aboveCell = rackTable.components[(rowIndex - 1) * rackTable.columns + columnIndex]

    return aboveCell
  }

  get belowCell() {
    var rackTable = this.parent
    var index = rackTable.components.indexOf(this)

    var rowIndex = this.rowIndex
    var columnIndex = this.columnIndex

    if (rowIndex === rackTable.rows) return null

    var belowCell = rackTable.components[(rowIndex + 1) * rackTable.columns + columnIndex]

    return belowCell
  }

  get rowCells() {
    var rackTable = this.parent
    return rackTable.getCellsByRow(this.rowIndex)
  }

  get columnCells() {
    var rackTable = this.parent
    return rackTable.getCellsByColumn(this.columnIndex)
  }

  get aboveRowCells() {
    var aboveCell = this.aboveCell
    while (1) {
      var aboveRowCells = aboveCell.notEmptyRowCells

      if (aboveRowCells.length > 0) return aboveRowCells

      aboveCell = aboveCell.aboveCell
    }
  }

  get lastUnit() {
    var rowCells = this.aboveRowCells

    for (let i = rowCells.length - 1; i > 0; i--) {
      var cell = rowCells[i]

      var unit = cell.get('unit')

      if (unit) return Number(unit)
    }

    return 0
  }

  get firstUnit() {
    var rowCells = this.aboveRowCells

    for (let i = 0; i < rowCells.length; i++) {
      var cell = rowCells[i]

      var unit = cell.get('unit')

      if (unit) return Number(unit)
    }

    return 0
  }

  get notEmptyRowCells() {
    return this.rowCells.filter(c => {
      return !c.get('isEmpty')
    })
  }

  get emptyRowCells() {
    return this.rowCells.filter(c => {
      return c.get('isEmpty')
    })
  }

  get isAisle() {
    return this.notEmptyRowCells.length === 0
  }

  onchange(after, before) {
    if (hasAnyProperty(after, 'isEmpty')) {
      delete this.model.unit
      delete this.model.section
    }
  }

  onmouseenter() {
    this.trigger('tag', this)
  }

  onmouseleave() {
    this.trigger('tagreset', this)
  }

  contains(x, y) {
    var contains = super.contains(x, y)
    if (!contains) {
      this._focused = false
      this.invalidate()
    }

    return contains
  }
}

;['border'].forEach(getter => Component.memoize(RackTableCell.prototype, getter, false))

Component.register('rack-table-cell', RackTableCell)
