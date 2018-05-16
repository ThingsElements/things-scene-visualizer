/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Component3d from './component-3d'

import {
  Component,
  Ellipse
} from '@hatiolab/things-scene'

import * as THREE from 'three'

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


export default class Sphere extends THREE.Mesh {

  constructor(model, canvasSize, visualizer) {

    super();

    this._model = model;
    this._visualizer = visualizer;

    this.createObject(model, canvasSize);

  }

  createObject(model, canvasSize) {

    var {
      cx = 0,
      cy = 0,
      zPos = 0,
      rx = 0
    } = this.model

    cx -= canvasSize.width / 2
    cy -= canvasSize.height / 2
    let cz = zPos + rx

    let rotation = model.rotation
    this.type = model.type

    this.createSphere(rx)

    this.position.set(cx, cz, cy) // z좌표는 땅에 붙어있게 함
    this.rotation.y = - rotation || 0

  }

  createSphere(rx) {

    let {
      fillStyle = 'lightgray'
    } = this.model

    this.geometry = new THREE.SphereBufferGeometry(rx, 20, 20);
    this.material = new THREE.MeshLambertMaterial({
      color: fillStyle,
      side: THREE.FrontSide
    });

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

  get controls() { }

  get nature() {
    return NATURE
  }
}


Component.register('sphere', Sphere2d)
Component3d.register('sphere', Sphere)

