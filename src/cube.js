/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var { Component, Rect } = scene

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }, {
    type: 'checkbox',
    label: 'show-axis',
    name: 'showAxis',
    property: 'showAxis'
  }]
}

export default class Cube extends THREE.Mesh {

  constructor(model, canvasSize, visualizer) {

    super();

    this._model = model;
    this._visualizer = visualizer;

    this.createObject(model, canvasSize);

    this.updateMatrixWorld();

    if (model.showAxis) {
      var axisHelper = new THREE.AxesHelper(100);
      this.add(axisHelper);
    }



  }

  createObject(model, canvasSize) {

    let cx = (model.left + (model.width / 2)) - canvasSize.width / 2
    let cy = (model.top + (model.height / 2)) - canvasSize.height / 2
    let cz = model.zPos || 0.5 * model.depth

    let rotation = model.rotation
    this.type = model.type

    this.createCube(model.width, model.height, model.depth)

    this.position.set(cx, cz, cy)
    this.rotation.y = rotation || 0

  }

  createCube(w, h, d) {

    let {
      fillStyle = 'lightgray'
    } = this.model

    this.geometry = new THREE.BoxBufferGeometry(w, d, h);
    this.material = new THREE.MeshLambertMaterial({ color: fillStyle, side: THREE.FrontSide });


  }

  get model() {
    return this._model
  }

  get mixer() {
    if (!this._mixer) {
      this._mixer = new THREE.AnimationMixer(this);
      this._visualizer.mixers.push(this._mixer);
    }

    return this._mixer;
  }

}

export class Cube2d extends Rect {
  is3dish() {
    return true
  }

  get controls() { }

  get nature() {
    return NATURE
  }
}


Component.register('cube', Cube2d)
scene.Component3d.register('cube', Cube)
