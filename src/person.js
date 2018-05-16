/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import personMtl from '../obj/Casual_Man_02/Casual_Man.mtl?3d'
import personObj from '../obj/Casual_Man_02/Casual_Man.obj?3d'

import * as THREE from 'three'

export default class Person extends Object3D {

  static get threedObjectLoader() {
    if (!Person._threedObjectLoader) {
      Person._threedObjectLoader = new Promise((resolve, reject) => {
        let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
        let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

        mtlLoader.load(personMtl, materials => {
          materials.preload();
          objLoader.setMaterials(materials)

          objLoader.load(personObj, obj => {
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

    return Person._threedObjectLoader;
  }

  createObject() {
    Person.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth
    } = this.model

    this.type = 'person'
    let object = extObject.clone();
    this.add(object);

    width /= 3.7
    height /= 3.7
    depth /= 3.7

    this.scale.set(width, depth, height)
  }

}

Component3d.register('person', Person)
