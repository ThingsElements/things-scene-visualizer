/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var extObj
var initDone = false

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

export default class Pallet extends Object3D {
  static get threedObjectLoader() {
    if (!Pallet._threedObjectLoader) {
      Pallet._threedObjectLoader = new Promise((resolve, reject) => {
        let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
        let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

        mtlLoader.setPath('obj/pallet/');
        objLoader.setPath('obj/pallet/');

        mtlLoader.load('new_pallet.mtl', (materials) => {
          materials.preload();
          objLoader.setMaterials(materials)
          materials.side = THREE.frontSide

          objLoader.load('new_pallet.obj', (obj) => {
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

    return Pallet._threedObjectLoader;
  }

  createObject() {
    Pallet.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth,
      rotation = 0
    } = this.model

    this.type = 'pallet'

    width /= 63.173
    height /= 72.1887
    depth /= 9.0388

    var object = extObject.clone();
    this.add(object)

    this.scale.set(width, depth, height)
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
