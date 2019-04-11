/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import Component3d from './component-3d'
import Extrude from './extrude'

export default class PolygonExtrude extends Extrude {
  get shape() {
    var { path = [] } = this.model

    var shape = new THREE.Shape()
    shape.moveTo(path[0].x, path[0].y)
    for (let i = 1; i < path.length; i++) shape.lineTo(path[i].x, path[i].y)

    return shape
  }

  get minMax() {
    if (!this._minMax) {
      var { path } = this.model

      var minX
      var minY
      var maxX
      var maxY

      path.forEach((p, i) => {
        if (i == 0) {
          minX = maxX = p.x
          minY = maxY = p.y
          return
        }

        minX = Math.min(minX, p.x)
        maxX = Math.max(maxX, p.x)
        minY = Math.min(minY, p.y)
        maxY = Math.max(maxY, p.y)
      })

      this._minMax = {
        minX,
        minY,
        maxX,
        maxY
      }
    }

    return this._minMax
  }

  get cx() {
    if (!this._cx) {
      var { minX, maxX } = this.minMax

      var left = minX
      var width = maxX - minX

      var canvasSize = this._canvasSize

      this._cx = left + width / 2 - canvasSize.width / 2
    }
    return this._cx
  }

  get cy() {
    if (!this._cy) {
      var { minY, maxY } = this.minMax

      var top = minY
      var height = maxY - minY
      var canvasSize = this._canvasSize

      this._cy = top + height / 2 - canvasSize.height / 2
    }
    return this._cy
  }

  raycast(raycaster, intersects) {}
}

Component3d.register('polygon', PolygonExtrude)
