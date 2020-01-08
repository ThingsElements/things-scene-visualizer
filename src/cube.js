/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, Rect } from '@hatiolab/things-scene'
import * as THREE from 'three'
import Component3d from './component-3d'
import Mesh from './mesh'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'number',
      label: 'depth',
      name: 'depth',
      property: 'depth'
    },
    {
      type: 'checkbox',
      label: 'show-axis',
      name: 'showAxis',
      property: 'showAxis'
    }
  ]
}

export default class Cube extends Mesh {
  constructor(model, canvasSize, visualizer) {
    super(model, canvasSize, visualizer)

    this.updateMatrixWorld()

    if (model.showAxis) {
      var axisHelper = new THREE.AxesHelper(100)
      this.add(axisHelper)
    }
  }

  async createObject() {
    var { width = 0, height = 0, depth = 0 } = this.model

    this.createCube(width, height, depth)
  }

  createCube(w, h, d) {
    let { fillStyle = 'lightgray' } = this.model

    this.geometry = new THREE.BoxBufferGeometry(w, d, h)
    this.material = new THREE.MeshStandardMaterial({ color: fillStyle, side: THREE.FrontSide })
  }

  get model() {
    return this._model
  }

  get mixer() {
    if (!this._mixer) {
      this._mixer = new THREE.AnimationMixer(this)
      this._visualizer.mixers.push(this._mixer)
    }

    return this._mixer
  }
}

export class Cube2d extends Rect {
  is3dish() {
    return true
  }

  get controls() {}

  get nature() {
    return NATURE
  }
}

Component.register('cube', Cube2d)
Component3d.register('cube', Cube)
