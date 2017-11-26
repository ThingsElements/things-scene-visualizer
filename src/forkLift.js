/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var extObj

function init() {
  if (init.done)
    return

  init.done = true

  let objLoader = new THREE.OBJLoader();
  let mtlLoader = new THREE.MTLLoader();

  objLoader.setPath('./obj/Fork_lift/')
  mtlLoader.setPath('./obj/Fork_lift/')

  mtlLoader.load('ForkLift.mtl', function (materials) {
    materials.preload();
    objLoader.setMaterials(materials)
    materials.side = THREE.frontSide

    objLoader.load('ForkLift.obj', function (obj) {
      extObj = obj
    })
  })
}

export default class ForkLift extends Object3D {

  constructor(model, canvasSize) {

    super(model);

    this.createObject(model, canvasSize);

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

    if (!ForkLift.extObject) {
      setTimeout(this.createObject.bind(this, this.model, canvasSize), 50)
      return;
    }

    cx = cx - canvasSize.width / 2
    cy = cy - canvasSize.height / 2
    var cz = 0.5 * depth

    var left = left - canvasSize.width / 2
    var top = top - canvasSize.height / 2

    var rotation = rotation

    this.type = 'forklift'

    this.add(ForkLift.extObject.clone())
    this.scale.set(10, 10, 10)
    this.position.set(cx, 0, cy)
    this.rotation.y = rotation

  }

}

scene.Component3d.register('forklift', ForkLift)
