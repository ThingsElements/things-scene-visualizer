/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var extObj
var {
  Rect,
  Component,
  Component3d
} = scene

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]
}

function init() {
  if (init.done)
    return

  init.done = true

  let objLoader = new THREE.OBJLoader2();

  objLoader.setPath('/obj/pallet/')

  objLoader.loadMtl('Pallet.mtl', 'pallet.mtl', null, function (materials) {
    objLoader.setMaterials('pallet')
    objLoader.setMaterials(materials)

    objLoader.load('Pallet.obj', function (obj) {
      extObj = obj
    })
  })
}

export default class Pallet extends THREE.Object3D {

  constructor(model, canvasSize) {

    super();

    this._model = model;

    this.createObject(model, canvasSize);

  }

  static get extObject() {
    if (!extObj)
      init()

    return extObj
  }

  createObject(model, canvasSize) {

    if (!Pallet.extObject) {
      setTimeout(this.createObject.bind(this, model, canvasSize), 50)
      return;
    }

    let cx = model.cx - canvasSize.width / 2
    let cy = model.cy - canvasSize.height / 2
    let cz = 0.5 * model.depth

    let left = model.left - canvasSize.width / 2
    let top = model.top - canvasSize.height / 2

    let rotation = model.rotation

    this.type = 'pallet'

    this.add(Pallet.extObject.clone())
    this.scale.set(10, 10, 10)
    this.position.set(cx, 0, cy)
    this.rotation.y = model.rotation || 0

  }

}

export class Pallet2d extends Rect {
  is3dish() {
    return true
  }

  get controls() { }

  get nature() {
    return NATURE
  }
}

Component.register('pallet', Pallet2d)
Component3d.register('pallet', Pallet)
