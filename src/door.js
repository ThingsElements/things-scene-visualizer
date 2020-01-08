/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, Rect } from '@hatiolab/things-scene'
import * as THREE from 'three'
import Component3d from './component-3d'

export default class Door extends THREE.Mesh {
  constructor(model, canvasSize) {
    super()

    this._model = model

    this.createObject(model, canvasSize)
  }

  async createObject(model, canvasSize) {
    let cx = model.left + model.width / 2 - canvasSize.width / 2
    let cy = model.top + model.height / 2 - canvasSize.height / 2
    let cz = 0.5 * model.depth

    let rotation = model.rotation
    this.type = model.type

    this.createDoor(model.width, model.height, model.depth)

    this.position.set(cx, cz, cy)
    this.rotation.y = rotation || 0
  }

  createDoor(w, h, d) {
    let { fillStyle = 'saddlebrown' } = this.model

    this.geometry = new THREE.BoxBufferGeometry(w, d, h)
    this.material = new THREE.MeshStandardMaterial({ color: fillStyle, side: THREE.FrontSide })

    // this.castShadow = true
  }

  get model() {
    return this._model
  }
}

export class Door2d extends Rect {
  is3dish() {
    return true
  }
}

Component.register('door', Door2d)
Component3d.register('door', Door)
