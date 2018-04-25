/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var {
  Component3d
} = scene

export default class ForkLift extends Object3D {

  static get threedObjectLoader() {
    if (!ForkLift._threedObjectLoader) {
      ForkLift._threedObjectLoader = new Promise((resolve, reject) => {
        let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
        let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

        objLoader.setPath('/obj/Fork_lift/')
        mtlLoader.setPath('/obj/Fork_lift/')

        mtlLoader.load('fork_lift.mtl', (materials) => {
          materials.preload();
          objLoader.setMaterials(materials)
          materials.side = THREE.frontSide

          objLoader.load('fork_lift.obj', (obj) => {
            var extObj = obj
            if (extObj && extObj.children && extObj.children.length > 0) {
              extObj = extObj.children[0];
            }

            extObj.geometry.center();
            resolve(extObj);
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
      depth,
      rotation = 0
    } = this.model

    this.type = 'forklift'

    var object = extObject.clone();

    this.add(object)

    this.scale.set(width, depth, height)
  }

}

Component3d.register('forklift', ForkLift)
