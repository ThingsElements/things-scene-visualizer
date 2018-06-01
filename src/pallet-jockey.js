/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'
import palletJockeySymbol from '../assets/pallet_symbol.png'

import palletJockeyModel from '../obj/Pallet_Jockey/SmallJockey.dae?3d'

import path from 'path'
const palletJockeyPath = path.resolve('../obj/Pallet_Jockey')

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

export default class PalletJockey extends Object3D {

  static get threedObjectLoader() {
    if (!PalletJockey._threedObjectLoader) {
      PalletJockey._threedObjectLoader = new Promise((resolve, reject) => {
        let colladaLoader = new THREE.ColladaLoader(THREE.DefaultLoadingManager);

        colladaLoader.setPath(`${palletJockeyPath}/`)

        colladaLoader.load(palletJockeyModel, collada => {
          var scene = collada.scene;
          var extObj = scene;

          resolve(extObj);
        })
      });
    }

    return PalletJockey._threedObjectLoader;
  }

  static getPalletJockeyObject(type) {

  }

  createObject() {
    var {
      stockType = 'empty'
    } = this.model

    PalletJockey.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth,
      rotation = 0
    } = this.model

    this.type = 'pallet-jockey'

    var object = extObject.clone();
    object.rotation.z = - Math.PI / 2;

    var boundingBox = new THREE.Box3().setFromObject(object);
    var center = boundingBox.getCenter(object.position);
    var size = boundingBox.getSize(new THREE.Vector3());

    center.multiplyScalar(- 1);

    object.updateMatrix();

    this.add(object);
    this.scale.set(width / size.x, depth / size.y, height / size.z);

    this.updateMatrix();

    this.setRotation();
    this.setPosition();
  }

}

export class PalletJockey2d extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!PalletJockey2d._image) {
      PalletJockey2d._image = new Image()
      PalletJockey2d._image.src = palletJockeySymbol
    }

    return PalletJockey2d._image
  }

  render(context) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    context.beginPath();
    context.drawImage(PalletJockey2d.image, left, top, width, height);
  }

  get nature() {
    return NATURE
  }
}

Component.register('pallet-jockey', PalletJockey2d);
Component3d.register('pallet-jockey', PalletJockey);
