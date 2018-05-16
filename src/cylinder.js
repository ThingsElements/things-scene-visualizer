/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Component3d from './component-3d'

import { Component, Ellipse } from '@hatiolab/things-scene'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'rz',
    property: 'rz'
  }]
}

import { Mesh } from 'three'

export default class Cylinder extends Mesh {

  constructor(model, canvasSize) {

    super();

    this._model = model;

    this.createObject(model, canvasSize);

  }

  createObject(model, canvasSize) {

    let cx = (model.cx) - canvasSize.width / 2
    let cy = (model.cy) - canvasSize.height / 2
    let cz = this.model.rz / 2

    let rotation = model.rotation
    this.type = model.type

    this.createCylinder(this.model.rx, this.model.rz)

    this.position.set(cx, cz, cy) // z좌표는 땅에 붙어있게 함
    this.rotation.y = rotation || 0

  }

  createCylinder(rx, rz) {

    let {
      fillStyle = 'lightgray'
    } = this.model

    this.geometry = new THREE.CylinderBufferGeometry(rx, rx, rz, 25);
    this.material = new THREE.MeshLambertMaterial({ color: fillStyle, side: THREE.FrontSide });

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

  get controls() { }

  get nature() {
    return NATURE
  }
}


Component.register('cylinder', Cylinder2d)
Component3d.register('cylinder', Cylinder)
