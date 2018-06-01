/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import rollerConveyorModel from '../obj/RollerConveyor/Roller_Conveyor2.dae?3d'

import path from 'path'
const rollerConveyorPath = path.resolve('../obj/RollerConveyor')

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

export default class RollerConveyor extends Object3D {

  static get threedObjectLoader() {
    if (!RollerConveyor._threedObjectLoader) {
      RollerConveyor._threedObjectLoader = new Promise((resolve, reject) => {
        let colladaLoader = new THREE.ColladaLoader(THREE.DefaultLoadingManager);

        colladaLoader.setPath(`${rollerConveyorPath}/`)

        colladaLoader.load(rollerConveyorModel, collada => {
          var scene = collada.scene;
          var extObj = scene;

          resolve(extObj);
        })
      });
    }

    return RollerConveyor._threedObjectLoader;
  }

  static getRollerConveyorObject(type) {

  }

  createObject() {
    var {
      stockType = 'empty'
    } = this.model

    RollerConveyor.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth,
      rotation = 0
    } = this.model

    this.type = 'roller-conveyor'

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
  }

}

export class RollerConveyor2d extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!RollerConveyor2d._image) {
      RollerConveyor2d._image = new Image()
    }

    return RollerConveyor2d._image
  }

  render(context) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    context.beginPath();
    context.drawImage(RollerConveyor2d.image, left, top, width, height);
  }

  get nature() {
    return NATURE
  }
}

Component.register('roller-conveyor', RollerConveyor2d);
Component3d.register('roller-conveyor', RollerConveyor);
