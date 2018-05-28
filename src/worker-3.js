/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import path from 'path'

const workerPath = path.resolve('../obj/worker3')

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

export default class Worker3 extends Object3D {

  static get threedObjectLoader() {
    if (!Worker3._threedObjectLoader) {
      Worker3._threedObjectLoader = new Promise((resolve, reject) => {
        let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
        let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

        objLoader.setPath(`${workerPath}/`)
        mtlLoader.setPath(`${workerPath}/`)

        mtlLoader.load('Worker3.mtl', materials => {
          materials.preload();
          objLoader.setMaterials(materials)

          objLoader.load('Worker3.obj', obj => {
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

    return Worker3._threedObjectLoader;
  }

  createObject() {
    Worker3.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth
    } = this.model

    this.type = 'worker-3'

    width /= 537.199
    height /= 495.9
    depth /= 1600.44

    var object = extObject.clone();
    object.rotation.y = Math.PI

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

export class Worker2d3 extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!Worker2d3._image) {
      Worker2d3._image = new Image()
      // Worker2d3._image.src = palletSymbol
    }

    return Worker2d3._image
  }

  render(context) {
    var {
      left,
      top,
      width,
      height
    } = this.bounds;

    context.beginPath();
    context.drawImage(Worker2d3.image, left, top, width, height);
  }

  get nature() {
    return NATURE
  }
}

Component.register('worker-3', Worker2d3)
Component3d.register('worker-3', Worker3)
