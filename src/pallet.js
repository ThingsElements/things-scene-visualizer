/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'
import palletSymbol from '../assets/pallet_symbol.png'

import path from 'path'

const palletPath = path.resolve('../obj/pallet')

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
  properties: []
}

export default class Pallet extends Object3D {

  static get threedObjectLoader() {
    if (!Pallet._threedObjectLoader) {
      Pallet._threedObjectLoader = new Promise((resolve, reject) => {
        let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
        let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

        objLoader.setPath(`${palletPath}/`)
        mtlLoader.setPath(`${palletPath}/`)

        mtlLoader.load('new_pallet.mtl', materials => {
          materials.preload();
          objLoader.setMaterials(materials)

          objLoader.load('new_pallet.obj', obj => {
            var extObj = obj
            if (extObj && extObj.children && extObj.children.length > 0) {
              extObj = extObj.children[0];
            }

            extObj.geometry.center();
            resolve(extObj)
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
    this.add(object);
    this.scale.set(width, depth, height)
  }

}

export class Pallet2d extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!Pallet2d._image) {
      Pallet2d._image = new Image()
      Pallet2d._image.src = palletSymbol
    }

    return Pallet2d._image
  }

  render(context) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    context.beginPath();
    context.drawImage(Pallet2d.image, left, top, width, height);
  }

  get nature() {
    return NATURE
  }
}

Component.register('pallet', Pallet2d)
Component3d.register('pallet', Pallet)
