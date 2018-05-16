/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'
import Component3d from './component-3d'

import OBJLoader from 'three-obj-loader'
import MTLLoader from 'three-mtl-loader'

import truckMtl from '../obj/CJ_Truck/CJ_Truck.mtl?3d'
import truckObj from '../obj/CJ_Truck/CJ_Truck.obj?3d'

import * as THREE from 'three'

import {
  RectPath,
  Shape,
  Component
} from '@hatiolab/things-scene'

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

export default class CJTruck extends Object3D {
  static get threedObjectLoader() {
    if (!CJTruck._threedObjectLoader) {
      CJTruck._threedObjectLoader = new Promise((resolve, reject) => {
        let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
        let mtlLoader = new MTLLoader(THREE.DefaultLoadingManager);

        mtlLoader.load(truckMtl, materials => {
          materials.preload();
          objLoader.setMaterials(materials)

          objLoader.load(truckObj, obj => {
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

    return CJTruck._threedObjectLoader;
  }

  createObject() {
    CJTruck.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth
    } = this.model

    this.type = 'cj-truck'

    var object = extObject.clone();
    this.add(object)

    width /= 630.674
    height /= 185.159
    depth /= 125.607

    this.scale.set(width, depth, height)
  }

}

export class CJTruck2D extends RectPath(Shape) {
  is3dish() {
    return true
  }

  get controls() { }

  get nature() {
    return NATURE
  }
}

Component.register('cj-truck', CJTruck2D)
Component3d.register('cj-truck', CJTruck)
