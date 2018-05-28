/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'
import palletSymbol from '../assets/pallet_symbol.png'

import emptyPallet from '../obj/Pallet/EmptyPallet/EmptyPallet.dae?3d'
import smallPallet from '../obj/Pallet/SmallPallet/SmallPallet.dae?3d'
import mediumPallet from '../obj/pallet/MediumPallet/MediumPallet.dae?3d'
import fullPallet from '../obj/pallet/FullPallet/FullPallet.dae?3d'

const PALLET_MODELS = {
  empty: emptyPallet,
  small: smallPallet,
  medium: mediumPallet,
  full: fullPallet
}

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
    type: 'select',
    label: 'stock-type',
    name: 'stockType',
    property: {
      options: [{
        display: 'Empty',
        value: 'empty'
      }, {
        display: 'Small',
        value: 'small'
      }, {
        display: 'Medium',
        value: 'medium'
      }, {
        display: 'Full',
        value: 'full'
      }]
    }
  }]
}

export default class Pallet extends Object3D {

  static get threedObjectLoader() {
    if (!Pallet._threedObjectLoader) {
      Pallet._threedObjectLoader = new Promise((resolve, reject) => {
        let colladaLoader = new THREE.ColladaLoader(THREE.DefaultLoadingManager);

        colladaLoader.load(PALLET_MODELS["empty"], collada => {
          var scene = collada.scene;
          var extObj = scene;
          // if (extObj && extObj.children && extObj.children.length > 0) {
          //   extObj = extObj.children[0];
          // }

          // extObj.geometry.center();
          resolve(extObj)
        })
      });
    }

    return Pallet._threedObjectLoader;
  }

  static getPalletObject(type) {

  }

  createObject() {
    var {
      stockType = 'empty'
    } = this.model

    // Pallet.getPalletObject(stockType)

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

    var object = extObject.clone();

    var box3 = new THREE.Box3().setFromObject(object);
    var center = box3.getCenter(object.position);
    var size = box3.getSize(new THREE.Vector3());

    center.multiplyScalar(- 1);

    object.updateMatrix();

    this.add(object);
    this.scale.set(width / size.x, depth / size.y, height / size.z);

    this.updateMatrix();

    this.setRotation();
    this.setPosition();
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
