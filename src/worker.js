/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Mesh from './mesh'
import Component3d from './component-3d'

import path from 'path'
const workerPath = path.resolve('../obj/worker2')

import workerModel from '../obj/worker/Worker.dae?3d'

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

export default class Worker1 extends Mesh {

  static get threedObjectLoader() {
    if (!Worker1._threedObjectLoader) {
      Worker1._threedObjectLoader = new Promise((resolve, reject) => {
        let colladaLoader = new THREE.ColladaLoader(THREE.DefaultLoadingManager);

        colladaLoader.setPath(`${workerPath}/`);

        colladaLoader.load(workerModel, collada => {
          var scene = collada.scene;
          var extObj = scene;

          resolve(extObj);
        })
      });
    }

    return Worker1._threedObjectLoader;
  }

  createObject() {
    Worker1.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth
    } = this.model

    this.type = 'worker-1'

    var object = extObject.clone();

    var boundingBox = new THREE.Box3().setFromObject(object);
    var center = boundingBox.getCenter(object.position);
    var size = boundingBox.getSize(new THREE.Vector3());

    center.multiplyScalar(- 1);

    object.updateMatrix();

    this.add(object);
    this.scale.set(width / size.x, depth / size.y, height / size.z);

    this.updateMatrix();
  }

  onBeforeRender(renderer, scene, camera, geometry, material, group) {
    super.onBeforeRender(renderer, scene, camera, geometry, material, group);
    this.lookAt(camera.position);
  }

}

export class Worker2d extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!Worker2d._image) {
      Worker2d._image = new Image()
      // Worker2d._image.src = palletSymbol
    }

    return Worker2d._image
  }

  render(context) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    context.beginPath();
    context.drawImage(Worker2d.image, left, top, width, height);
  }

  get nature() {
    return NATURE
  }
}

Component.register('worker-1', Worker2d)
Component3d.register('worker-1', Worker1)