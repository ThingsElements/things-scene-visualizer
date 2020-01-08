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

export default class Sphere extends Mesh {
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
      var { zPos = 0, rx = 0 } = this.model

      this._cz = zPos + rx
    }

    return this._cz
  }

  async createObject() {
    var { rx = 0 } = this.model

    this.createSphere(rx)
  }

  createSphere(rx) {
    let { fillStyle = 'lightgray' } = this.model

    this.geometry = new THREE.SphereBufferGeometry(rx, 20, 20)
    this.material = new THREE.MeshStandardMaterial({
      color: fillStyle,
      side: THREE.FrontSide
    })

    // this.castShadow = true
  }

  get model() {
    return this._model
  }
}

export class Sphere2d extends Ellipse {
  is3dish() {
    return true
  }

  get controls() {}

  get nature() {
    return NATURE
  }
}

Component.register('sphere', Sphere2d)
Component3d.register('sphere', Sphere)
