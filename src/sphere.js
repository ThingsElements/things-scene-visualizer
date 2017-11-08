/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var {
  Component,
  Ellipse
} = scene

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

  constructor(model, canvasSize, threeContainer) {

    super();

    this._model = model;
    this._threeContainer = threeContainer;

    this.createObject(model, canvasSize);

  }

  createObject(model, canvasSize) {

    let cx = (model.cx) - canvasSize.width / 2
    let cy = (model.cy) - canvasSize.height / 2
    let cz = this.model.rx

    let rotation = model.rotation
    this.type = model.type

    this.createSphere(this.model.rx, this.model.rz)

    this.position.set(cx, cz, cy) // z좌표는 땅에 붙어있게 함
    this.rotation.y = rotation || 0

  }

  createSphere(rx, rz) {

    let {
      fillStyle = 'lightgray'
    } = this.model

    this.geometry = new THREE.SphereGeometry(rx, 20, 20);
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
scene.Component3d.register('sphere', Sphere)

