/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, Ellipse } from '@hatiolab/things-scene'
import * as THREE from 'three'
import Component3d from './component-3d'
import Mesh from './mesh'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: []
}

export default class Cylinder extends Mesh {
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

  get cz() {
    if (!this._cz) {
      var { zPos = 0, depth = 0 } = this.model

      this._cz = zPos + depth / 2
    }

    return this._cz
  }

  async createObject() {
    var { depth = 0, rx = 0 } = this.model

    this.createCylinder(rx, depth)
  }

  createCylinder(rx, rz) {
    let { fillStyle = 'lightgray' } = this.model

    this.geometry = new THREE.CylinderBufferGeometry(rx, rx, rz, 25)
    this.material = new THREE.MeshStandardMaterial({ color: fillStyle, side: THREE.FrontSide })

    // this.castShadow = true
  }

  get model() {
    return this._model
  }
}

export class Cylinder2d extends Ellipse {
  is3dish() {
    return true
  }

  get controls() {}

  get nature() {
    return NATURE
  }
}

Component.register('cylinder', Cylinder2d)
Component3d.register('cylinder', Cylinder)
