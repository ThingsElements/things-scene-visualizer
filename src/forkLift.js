/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var extObj

function init() {
  if (init.done)
    return

  init.done = true

  let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
  let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

  objLoader.setPath('/obj/Fork_lift/')
  mtlLoader.setPath('/obj/Fork_lift/')

  mtlLoader.load('fork_lift.mtl', function (materials) {
    materials.preload();
    objLoader.setMaterials(materials)
    materials.side = THREE.frontSide

  objLoader.load('fork_lift.obj', function (obj) {
    extObj = obj
      if (extObj && extObj.children && extObj.children.length > 0) {
        extObj = extObj.children[0];
      }

      extObj.geometry.center();
    })
  })
}

export default class ForkLift extends Object3D {

   static get extObject() {
    if (!extObj)
      init()

    return extObj
  }

  createObject() {

    var {
      width,
      height,
      depth,
      rotation = 0
    } = this.model

    if (!ForkLift.extObject) {
      setTimeout(this.createObject.bind(this), 50)
      return;
    }

    this.type = 'forklift'

    var object = ForkLift.extObject.clone();

    this.add(object)

    this.scale.set(width, depth, height)
  }

}

scene.Component3d.register('forklift', ForkLift)
