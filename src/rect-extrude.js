/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as THREE from 'three'
import Component3d from './component-3d'
import Extrude from './extrude'

export default class RectExtrude extends Extrude {
  get shape() {
    var { width, height, round } = this.model
    var shape = new THREE.Shape()

    if (round > 0) {
      var radius = (round / 100) * (width / 2)

      shape.moveTo(radius, 0)
      shape.lineTo(width - radius, 0)
      shape.quadraticCurveTo(width, 0, width, radius)
      shape.lineTo(width, height - radius)
      shape.quadraticCurveTo(width, height, width - radius, height)
      shape.lineTo(radius, height)
      shape.quadraticCurveTo(0, height, 0, height - radius)
      shape.lineTo(0, radius)
      shape.quadraticCurveTo(0, 0, radius, 0)
    } else {
      shape.moveTo(0, 0)
      shape.lineTo(width, 0)
      shape.lineTo(width, height)
      shape.lineTo(0, height)
      shape.lineTo(0, 0)
    }

    return shape
  }
}

Component3d.register('rect', RectExtrude)
