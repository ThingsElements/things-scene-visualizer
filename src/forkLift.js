/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import OBJLoader from 'three-obj-loader'
import MTLLoader from 'three-mtl-loader'

import forkLiftMtl from '../obj/Fork_lift/fork_lift.mtl?3d'
import forkLiftObj from '../obj/Fork_lift/fork_lift.obj?3d'

var extObj

function init() {
  if (init.done)
    return

  OBJLoader(THREE)

  init.done = true

  let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
  let mtlLoader = new MTLLoader(THREE.DefaultLoadingManager);

  mtlLoader.load(forkLiftMtl, materials => {
    materials.preload();
    objLoader.setMaterials(materials)
    materials.side = THREE.frontSide

    objLoader.load(forkLiftObj, obj => {
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
      depth
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
Component3d.register('forklift', ForkLift)
