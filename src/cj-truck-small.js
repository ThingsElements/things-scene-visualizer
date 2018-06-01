/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'
import Component3d from './component-3d'

import truckModel from '../obj/CJ_Truck_Small/Vehicle_Small.dae?3d'

import path from 'path'
const truckPath = path.resolve('../obj/CJ_Truck_Small')

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

export default class CJTruckSmall extends Object3D {
  static get threedObjectLoader() {
    if (!CJTruckSmall._threedObjectLoader) {
      CJTruckSmall._threedObjectLoader = new Promise((resolve, reject) => {
        let colladaLoader = new THREE.ColladaLoader(THREE.DefaultLoadingManager);

        colladaLoader.setPath(`${truckPath}/`);

        colladaLoader.load(truckModel, collada => {
          var scene = collada.scene;
          var extObj = scene;

          // for (const key in collada.library.images) {
          //   if (collada.library.images.hasOwnProperty(key)) {
          //     const img = collada.library.images[key];
          //     if(img.build.indexOf('png') > -1) {
          //       var id = Number(key.replace('ID', '')) - 2;
          //       collada.library.materials[`ID${id}`].build.transparent = false;
          //     }

          //   }
          // }

          // scene.traverse(o => {
          //   if(!o.material)
          //     return;

          //   if(!o.material.map || typeof o.material.map == 'function')
          //     return

          //   o.material.map.minFilter = THREE.LinearFilter;

          //   if(o.material.transparent)
          //     o.material.transparent = false;
          // })

          resolve(extObj);
        })
      });
    }

    return CJTruckSmall._threedObjectLoader;
  }

  createObject() {
    CJTruckSmall.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth
    } = this.model

    this.type = 'cj-truck-small'

    var object = extObject.clone();
    object.rotation.z = - Math.PI / 2

    var boundingBox = new THREE.Box3().setFromObject(object);
    var center = boundingBox.getCenter(object.position);
    var size = boundingBox.getSize(new THREE.Vector3());

    center.multiplyScalar(- 1);

    object.updateMatrix();

    this.add(object);
    this.scale.set(width / size.x, depth / size.y, height / size.z);
  }

}

export class CJTruckSmall2D extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!CJTruckSmall2D._image) {
      CJTruckSmall2D._image = new Image()
    }

    return CJTruckSmall2D._image
  }

  get controls() { }

  render(context) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    context.beginPath();
    context.drawImage(CJTruckSmall2D.image, left, top, width, height);
  }

  get nature() {
    return NATURE
  }
}

Component.register('cj-truck-small', CJTruckSmall2D)
Component3d.register('cj-truck-small', CJTruckSmall)