/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Component, RectPath, Shape } from '@hatiolab/things-scene'
// import truckModel from '../obj/CJ_Truck/Vehicle_Big.dae?3d'
import path from 'path'
import * as THREE from 'three'
import symbol from '../assets/canvasicon-cj-truck.png'
import Component3d from './component-3d'
import ColladaLoader from './loaders/ColladaLoader'
import Object3D from './object3d'

const TRUCK_MODEL = 'Vehicle_Big.dae'
const TRUCK_PATH = path.resolve('../obj/CJ_Truck')

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'number',
      label: 'depth',
      name: 'depth',
      property: 'depth'
    }
  ]
}

export default class CJTruck extends Object3D {
  static get threedObjectLoader() {
    if (!CJTruck._threedObjectLoader) {
      CJTruck._threedObjectLoader = new Promise((resolve, reject) => {
        let colladaLoader = new ColladaLoader(THREE.DefaultLoadingManager)

        colladaLoader.setPath(`${TRUCK_PATH}/`)

        colladaLoader.load(TRUCK_MODEL, collada => {
          var scene = collada.scene
          var extObj = scene

          resolve(extObj)
        })
      })
    }

    return CJTruck._threedObjectLoader
  }

  async createObject() {
    var extObj = await CJTruck.threedObjectLoader
    this.addObject(extObj)
  }

  addObject(extObject) {
    var { width, height, depth } = this.model

    this.type = 'cj-truck'

    var object = extObject.clone()
    object.rotation.z = -Math.PI / 2

    var boundingBox = new THREE.Box3().setFromObject(object)
    var center = boundingBox.getCenter(object.position)
    var size = boundingBox.getSize(new THREE.Vector3())

    center.multiplyScalar(-1)

    object.updateMatrix()

    this.add(object)
    this.scale.set(width / size.x, depth / size.y, height / size.z)
  }
}

export class CJTruck2D extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!CJTruck2D._image) {
      CJTruck2D._image = new Image()
      CJTruck2D._image.src = symbol
    }

    return CJTruck2D._image
  }

  get controls() {}

  render(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(CJTruck2D.image, left, top, width, height)
  }

  get nature() {
    return NATURE
  }
}

Component.register('cj-truck', CJTruck2D)
Component3d.register('cj-truck', CJTruck)
