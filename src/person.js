/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

export default class Person extends Object3D {

  static get threedObjectLoader() {
    if (!Person._threedObjectLoader) {
      Person._threedObjectLoader = new Promise((resolve, reject) => {
        let tgaLoader = new THREE.TGALoader();

        THREE.Loader.Handlers.add(/\.tga$/i, tgaLoader);

        let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
        let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

        objLoader.setPath('/obj/Casual_Man_02/')
        mtlLoader.setPath('/obj/Casual_Man_02/')

        mtlLoader.load('Casual_Man.mtl', (materials) => {
          materials.preload();
          objLoader.setMaterials(materials)
          materials.side = THREE.frontSide

          objLoader.load('Casual_Man.obj', (obj) => {
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

    return Person._threedObjectLoader;
  }

  createObject() {
    Person.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth,
      rotation = 0
    } = this.model

    width /= 3.7
    height /= 3.7
    depth /= 3.7

    this.type = 'person'
    var object = extObject.clone();
    this.add(object)
    this.scale.set(width, depth, height)
  }

}

scene.Component3d.register('person', Person)
