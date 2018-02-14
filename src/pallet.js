/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var extObj
var {
  RectPath,
  Shape,
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

  let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
  let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

  mtlLoader.load('/obj/pallet/pallet2.mtl', function (materials) {
    materials.preload();
    objLoader.setMaterials(materials)
    materials.side = THREE.frontSide

    objLoader.load('/obj/pallet/pallet2.obj', function (obj) {
      extObj = obj
    })
  })
}

export default class Pallet extends Object3D {

  constructor(model, canvasSize, visualizer) {

    super(model, canvasSize);

    this._visualizer = visualizer;

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
      depth,
      rotation = 0
    } = this.model

    if (!Pallet.extObject) {
      setTimeout(this.createObject.bind(this, canvasSize), 50)
      return;
    }

    let cx = (left + (width / 2)) - canvasSize.width / 2
    let cy = (top + (height / 2)) - canvasSize.height / 2
    var cz = 0.5 * depth

    var left = left - canvasSize.width / 2
    var top = top - canvasSize.height / 2

    this.type = 'pallet'

    this.add(Pallet.extObject.clone())
    this.scale.set(width, depth, height)
    this.position.set(cx, 0, cy)
    this.rotation.y = rotation

  }

}

export class Pallet2d extends RectPath(Shape) {
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
