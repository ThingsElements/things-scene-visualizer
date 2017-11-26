/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

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

export default class Pallet extends Object3D {

  constructor(model, canvasSize) {

    super(model);

    this.createObject(canvasSize);
  }

  static get extObject() {
    if (!extObj)
      init()

    return extObj
  }

  createObject(canvasSize) {

    var {
      left,
      top,
      width,
      height,
      cx,
      cy,
      depth,
      rotation = 0
    } = this.model

    if (!Pallet.extObject) {
      setTimeout(this.createObject.bind(this, this.model, canvasSize), 50)
      return;
    }

    cx -= canvasSize.width / 2
    cy -= canvasSize.height / 2
    var cz = 0.5 * depth

    var left = left - canvasSize.width / 2
    var top = top - canvasSize.height / 2

    this.type = 'pallet'

    this.add(Pallet.extObject.clone())
    this.scale.set(10, 10, 10)
    this.position.set(cx, 0, cy)
    this.rotation.y = rotation

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
