/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
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

export default class ForkLift extends THREE.Object3D {

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

    if (!ForkLift.extObject) {
      setTimeout(this.createObject.bind(this, model, canvasSize), 50)
      return;
    }

    let cx = model.cx - canvasSize.width / 2
    let cy = model.cy - canvasSize.height / 2
    let cz = 0.5 * model.depth

    let left = model.left - canvasSize.width / 2
    let top = model.top - canvasSize.height / 2

    let rotation = model.rotation

    this.type = 'forklift'

    this.add(ForkLift.extObject.clone())
    this.scale.set(10, 10, 10)
    this.position.set(cx, 0, cy)
    this.rotation.y = model.rotation || 0

  }

}

scene.Component3d.register('forklift', ForkLift)
