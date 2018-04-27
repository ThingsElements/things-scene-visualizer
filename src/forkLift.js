/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import OBJLoader from 'three-obj-loader'
import MTLLoader from 'three-mtl-loader'

import forkLiftMtl from '../obj/Fork_lift/fork_lift.mtl?3d'
import forkLiftObj from '../obj/Fork_lift/fork_lift.obj?3d'

export default class ForkLift extends Object3D {

  static get threedObjectLoader() {
    if (!ForkLift._threedObjectLoader) {
      ForkLift._threedObjectLoader = new Promise((resolve, reject) => {
        let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
        let mtlLoader = new MTLLoader(THREE.DefaultLoadingManager);

        mtlLoader.load(forkLiftMtl, materials => {
          materials.preload();
          objLoader.setMaterials(materials)

          objLoader.load(forkLiftObj, obj => {
            var extObj = obj
            // if (extObj && extObj.children && extObj.children.length > 0) {
            //   extObj = extObj.children[0];
            // }

            // extObj.geometry.center();
            resolve(obj)
          })
        })
      });
    }

    return ForkLift._threedObjectLoader;
  }

  createObject() {
    ForkLift.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth
    } = this.model

    this.type = 'forklift'

    var object = extObject.clone();
    this.add(object)

    this.scale.set(width, depth, height)
  }

}
Component3d.register('forklift', ForkLift)
