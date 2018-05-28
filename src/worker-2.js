/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import path from 'path'

const workerPath = path.resolve('../obj/worker2')

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

export default class Worker2 extends Object3D {

  static get threedObjectLoader() {
    if (!Worker2._threedObjectLoader) {
      Worker2._threedObjectLoader = new Promise((resolve, reject) => {
        let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
        let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

        objLoader.setPath(`${workerPath}/`)
        mtlLoader.setPath(`${workerPath}/`)

        mtlLoader.load('Worker2.mtl', materials => {
          materials.preload();
          objLoader.setMaterials(materials)

          objLoader.load('Worker2.obj', obj => {
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

    return Worker2._threedObjectLoader;
  }

  createObject() {
    Worker2.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth
    } = this.model

    this.type = 'worker-2'

    width /= 447.4
    height /= 413.1
    depth /= 1582.58

    var object = extObject.clone();
    this.add(object)

    this.scale.set(width, depth, height)

    this._beforeRender = () => {
      this.lookAt(this._visualizer._camera.position)
    }

    object.onBeforeRender = this._beforeRender;
  }

  dispose() {
    delete this._beforeRender;
  }

}

export class Worker2d2 extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!Worker2d2._image) {
      Worker2d2._image = new Image()
      // Worker2d2._image.src = palletSymbol
    }

    return Worker2d2._image
  }

  render(context) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    context.beginPath();
    context.drawImage(Worker2d2.image, left, top, width, height);
  }

  get nature() {
    return NATURE
  }
}

Component.register('worker-2', Worker2d2)
Component3d.register('worker-2', Worker2)
