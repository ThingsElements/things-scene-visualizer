/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var extObj

function init() {
  if (init.done)
    return

  init.done = true

  let tgaLoader = new THREE.TGALoader();

  THREE.Loader.Handlers.add(/\.tga$/i, tgaLoader);

  let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
  let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

  objLoader.setPath('/obj/Casual_Man_02/')
  mtlLoader.setPath('/obj/Casual_Man_02/')

  mtlLoader.load('Casual_Man.mtl', function (materials) {
    materials.preload();
    objLoader.setMaterials(materials)
    materials.side = THREE.frontSide

    objLoader.load('Casual_Man.obj', function (obj) {
      extObj = obj
    })

  })
}

export default class Person extends Object3D {

  constructor(model, canvasSize, visualizer) {

    super(model);

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

    if (!Person.extObject) {
      setTimeout(this.createObject.bind(this, canvasSize), 50)
      return;
    }

    let cx = (left + (width / 2)) - canvasSize.width / 2
    let cy = (top + (height / 2)) - canvasSize.height / 2
    let cz = 0.5 * depth

    left -= canvasSize.width / 2
    top -= canvasSize.height / 2

    this.type = 'person'
    let person = Person.extObject.clone()

    this.add(person)

    width /= 3.7
    height /= 3.7
    depth /= 3.7

    this.scale.set(width, depth, height)
    this.position.set(cx, 0, cy)
    this.rotation.y = rotation

  }

}

scene.Component3d.register('person', Person)
