/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as THREE from 'three'
import Component3d from './component-3d'
import Extrude from './extrude'

export default class EllipseExtrude extends Extrude {
  get cx() {
    if (!this._cx) {
      var { cx = 0 } = this.model

      var canvasSize = this._canvasSize

      this._cx = cx - canvasSize.width / 2
    }

    return this._cx
  }

  get cy() {
    if (!this._cy) {
      var { cy = 0 } = this.model

      var canvasSize = this._canvasSize

      this._cy = cy - canvasSize.height / 2
    }

    return this._cy
  }

  get shape() {
    var { cx = 0, cy = 0, rx = 1, ry = 1, startAngle = 0, endAngle = 2 * Math.PI, anticlockwise = false } = this.model
    var shape = new THREE.Shape()

    shape.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, startAngle, endAngle, anticlockwise)

    return shape
  }
}

Component3d.register('ellipse', EllipseExtrude)
