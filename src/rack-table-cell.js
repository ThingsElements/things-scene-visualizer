/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var {
  Component,
  Component3d,
  Container,
  RectPath,
  Layout,
  TableCell
} = scene;

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'editor-table',
    label: '',
    name: '',
    property: {
      merge: false,
      split: false
    }
  }, {
    type: 'checkbox',
    label: 'is-empty',
    name: 'isEmpty'
  }]
}

const EMPTY_BORDER = {}

function isBottomMost(idx, rows, columns) {
  return idx >= (rows - 1) * columns
}

function isRightMost(idx, rows, columns) {
  return (idx + 1) % columns == 0
}

const EMPTY_CELL_STROKE_STYLE = '#ccc'
const EMPTY_CELL_LINE_WIDTH = 1
const EMPTY_CELL_FILL_STYLE = '#efefef'
const HIGHLIGHT_FILL_STYLE = 'rgba(00, 00, 255, 0.7)'

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
    return NATURE
  }

  set merged(merged) {
    this.set('merged', !!merged)
    if (merged)
      this.set('text', '')
  }

  get merged() {
    return this.get('merged')
  }

  set rowspan(rowspan) {
    this.set('rowspan', rowspan);
  }

  get rowspan() {
    return this.get('rowspan')
  }

  set colspan(colspan) {
    this.set('colspan', colspan);
  }

  get colspan() {
    return this.get('colspan')
  }

  get border() {
    var border = this.model.border || EMPTY_BORDER;
  }

  _drawBorder(context, x, y, to_x, to_y, style) {
    if (style && style.strokeStyle && style.lineWidth && style.lineDash) {
      context.beginPath();
      context.moveTo(x, y)
      context.lineTo(to_x, to_y);
      Component.drawStroke(context, style, this);
    }
  }

  _draw(context) {
    var {
      left,
      top,
      width,
      height
    } = this.model;

    var border = this.model.border || {};

    if (!this.model.isEmpty)
      this._draw_rack_cell(context);

    // Cell 채우기.
    context.beginPath();
    context.lineWidth = 0;
    context.rect(left, top, width, height);

    // Border 그리기
    var parent = this.parent
    var idx = parent.components.indexOf(this)
    var columns = parent.columns || 1
    var rows = parent.rows || 1

    this._drawBorder(context, left, top, left + width, top, border.top);
    this._drawBorder(context, left, top + height, left, top, border.left);
    if (isRightMost(idx, rows, columns))
      this._drawBorder(context, left + width, top, left + width, top + height, border.right);
    if (isBottomMost(idx, rows, columns))
      this._drawBorder(context, left + width, top + height, left, top + height, border.bottom);

  }

  _post_draw(context) {
    var {
      left, top, width, height
    } = this.bounds

    super._post_draw(context);

    if (this._focused) {
      context.beginPath();
      context.fillStyle = HIGHLIGHT_FILL_STYLE
      context.rect(left, top, width, height);

      context.fill();
      context.closePath();
    }
  }

  _draw_rack_cell(context) {
    var {
      left, top, width, height
    } = this.model;

    context.save();
    context.fillStyle = EMPTY_CELL_FILL_STYLE;
    context.fillRect(left, top, width, height);

    context.beginPath();
    context.lineWidth = EMPTY_CELL_LINE_WIDTH
    context.strokeStyle = EMPTY_CELL_STROKE_STYLE

    context.moveTo(left, top);
    context.lineTo(left + width, top + height);
    context.moveTo(left + width, top);
    context.lineTo(left, top + height);

    context.stroke();
    context.closePath();
    context.restore();
  }

  ondragstart() {
    this._focused = false;
  }

  onmouseenter(e) {
    this._focused = true;
  }

  onmouseleave(e) {
    this._focused = false;
  }
}

["border"].forEach(getter => Component.memoize(RackTableCell.prototype, getter, false));

Component.register('rack-table-cell', RackTableCell);
