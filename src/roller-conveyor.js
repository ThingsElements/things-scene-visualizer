/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, RectPath, Shape } from '@hatiolab/things-scene'
import path from 'path'
import * as THREE from 'three'
import symbol from '../assets/canvasicon-conveyor.png'
import Component3d from './component-3d'
import ColladaLoader from './loaders/ColladaLoader'
import Object3D from './object3d'

const ROLLER_CONVEYOR_MODEL = 'Roller_Conveyor2.dae'

const ROLLER_CONVEYOR_PATH = path.resolve('../obj/RollerConveyor')

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
        let colladaLoader = new ColladaLoader(THREE.DefaultLoadingManager)

        colladaLoader.setPath(`${ROLLER_CONVEYOR_PATH}/`)

        colladaLoader.load(ROLLER_CONVEYOR_MODEL, collada => {
          var scene = collada.scene
          var extObj = scene

          resolve(extObj)
        })
      })
    }

    return RollerConveyor._threedObjectLoader
  }

  static getRollerConveyorObject(type) {}

  async createObject() {
    var extObj = await RollerConveyor.threedObjectLoader
    this.addObject(extObj)
  }

  addObject(extObject) {
    var { width, height, depth, rotation = 0 } = this.model

    this.type = 'roller-conveyor'

    var object = extObject.clone()
    object.rotation.z = -Math.PI / 2

    var boundingBox = new THREE.Box3().setFromObject(object)
    var center = boundingBox.getCenter(object.position)
    var size = boundingBox.getSize(new THREE.Vector3())

    center.multiplyScalar(-1)

    object.updateMatrix()

    this.add(object)
    this.scale.set(width / size.x, depth / size.y, height / size.z)

    this.updateMatrix()
  }
}

export class RollerConveyor2d extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!RollerConveyor2d._image) {
      RollerConveyor2d._image = new Image()
      RollerConveyor2d._image.src = symbol
    }

    return RollerConveyor2d._image
  }

  render(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(RollerConveyor2d.image, left, top, width, height)
  }

  get nature() {
    return NATURE
  }
}

Component.register('roller-conveyor', RollerConveyor2d)
Component3d.register('roller-conveyor', RollerConveyor)
