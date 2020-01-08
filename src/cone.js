/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, Ellipse } from '@hatiolab/things-scene'
import * as THREE from 'three'
import Component3d from './component-3d'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'number',
      label: 'depth',
      name: 'rz',
      property: 'rz'
    }
  ]
}

export default class Cone extends THREE.Mesh {
  constructor(model, canvasSize) {
    super()

    this._model = model

    this.createObject(model, canvasSize)
  }

  async createObject(model, canvasSize) {
    let cx = model.cx - canvasSize.width / 2
    let cy = model.cy - canvasSize.height / 2
    let cz = this.model.rx

    let rotation = model.rotation
    this.type = model.type

    this.createCone(this.model.rx, this.model.rz)

    this.position.set(cx, cz, cy) // z좌표는 땅에 붙어있게 함
    this.rotation.y = rotation || 0
  }

  createCone(rx, rz) {
    let { fillStyle = 'lightgray' } = this.model

    this.geometry = new THREE.ConeBufferGeometry(rx, rz, 20)
    this.material = new THREE.MeshStandardMaterial({
      color: fillStyle,
      side: THREE.FrontSide
    })

    // this.castShadow = true
  }

  setEuler(euler) {
    var { yaw, pitch, roll } = euler

    this.setRotationFromEuler(new THREE.Vector3(roll, pitch, yaw))
  }

  setQuaternion(quaternion) {
    var { x, y, z, w } = quaternion

    this.setRotationFromQuaternion(new THREE.Quaternion(x, y, z, w))
  }

  get model() {
    return this._model
  }
}

export class Cone2d extends Ellipse {
  is3dish() {
    return true
  }

  get controls() {}

  get nature() {
    return NATURE
  }
}

Component.register('cone', Cone2d)
Component3d.register('cone', Cone)
