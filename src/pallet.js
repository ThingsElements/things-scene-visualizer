/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import palletMtl from '../obj/pallet/pallet2.mtl?3d'
import palletObj from '../obj/pallet/pallet2.obj?3d'

import {
  RectPath,
  Shape,
  Component
} from '@hatiolab/things-scene'

import * as THREE from 'three'

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

        mtlLoader.load(palletMtl, materials => {
          materials.preload();
          objLoader.setMaterials(materials)

          objLoader.load(palletObj, obj => {
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

    return Pallet._threedObjectLoader;
  }

  createObject() {
    Pallet.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth
    } = this.model

    this.type = 'pallet'

    var object = extObject.clone();
    this.add(object);
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
