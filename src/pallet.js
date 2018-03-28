/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import OBJLoader from 'three-obj-loader'
import MTLLoader from 'three-mtl-loader'

import palletMtl from '../obj/pallet/pallet2.mtl?3d'
import palletObj from '../obj/pallet/pallet2.obj?3d'

import {
  RectPath,
  Shape,
  Component
} from '@hatiolab/things-scene'

var extObj

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

function init() {
  if (init.done)
    return

  OBJLoader(THREE)

  init.done = true

  let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
  let mtlLoader = new MTLLoader(THREE.DefaultLoadingManager);

  mtlLoader.load(palletMtl, materials => {
    materials.preload();
    objLoader.setMaterials(materials)
    materials.side = THREE.frontSide

    objLoader.load(palletObj, obj => {
      extObj = obj
      if (extObj && extObj.children && extObj.children.length > 0) {
        extObj = extObj.children[0];
      }

      extObj.geometry.center();
    })
  })
}

export default class Pallet extends Object3D {

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

    if (!Pallet.extObject) {
      setTimeout(this.createObject.bind(this), 50)
      return;
    }

    this.type = 'pallet'

    this.add(Pallet.extObject.clone())
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
