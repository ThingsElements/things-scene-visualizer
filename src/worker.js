/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, RectPath, Shape } from '@hatiolab/things-scene'
import path from 'path'
import * as THREE from 'three'
import symbol from '../assets/canvasicon-worker-1.png'
import Component3d from './component-3d'
import ColladaLoader from './loaders/ColladaLoader'
import Mesh from './mesh'

const WORKER_PATH = path.resolve('../obj/worker')

const WORKER_MODEL = 'Worker.dae'

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
        let colladaLoader = new ColladaLoader(THREE.DefaultLoadingManager)

        colladaLoader.setPath(`${WORKER_PATH}/`)

        colladaLoader.load(WORKER_MODEL, collada => {
          var scene = collada.scene
          var extObj = scene

          resolve(extObj)
        })
      })
    }

    return Worker1._threedObjectLoader
  }

  async createObject() {
    var extObj = await Worker1.threedObjectLoader
    this.addObject(extObj)
  }

  addObject(extObject) {
    var { width, height, depth } = this.model

    this.type = 'worker-1'

    var object = extObject.clone()

    var boundingBox = new THREE.Box3().setFromObject(object)
    var center = boundingBox.getCenter(object.position)
    var size = boundingBox.getSize(new THREE.Vector3())

    center.multiplyScalar(-1)

    object.updateMatrix()

    this.add(object)
    this.scale.set(width / size.x, depth / size.y, height / size.z)

    this.updateMatrix()
  }

  onBeforeRender(renderer, scene, camera, geometry, material, group) {
    super.onBeforeRender(renderer, scene, camera, geometry, material, group)
    this.lookAt(camera.position)
  }
}

export class Worker2d extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!Worker2d._image) {
      Worker2d._image = new Image()
      Worker2d._image.src = symbol
    }

    return Worker2d._image
  }

  render(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(Worker2d.image, left, top, width, height)
  }

  get nature() {
    return NATURE
  }
}

Component.register('worker-1', Worker2d)
Component3d.register('worker-1', Worker1)
