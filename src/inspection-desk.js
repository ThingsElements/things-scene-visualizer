/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import symbol from '../assets/canvasicon-inspection-desk.png'
const INSPECTION_DESK_MODEL = 'InspectionDesk.dae'

import path from 'path'
const INSPECTION_DESK_PATH = path.resolve('../obj/inspection_desk')

import { RectPath, Shape, Component } from '@hatiolab/things-scene'

import * as THREE from 'three'
import ColladaLoader from 'three/examples/js/loaders/ColladaLoader'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'select',
      label: 'stock-type',
      name: 'stockType',
      property: {
        options: [
          {
            display: 'Empty',
            value: 'empty'
          },
          {
            display: 'Small',
            value: 'small'
          },
          {
            display: 'Medium',
            value: 'medium'
          },
          {
            display: 'Full',
            value: 'full'
          }
        ]
      }
    }
  ]
}

export default class InspectionDesk extends Object3D {
  static get threedObjectLoader() {
    if (!InspectionDesk._threedObjectLoader) {
      InspectionDesk._threedObjectLoader = new Promise((resolve, reject) => {
        let colladaLoader = new ColladaLoader(THREE.DefaultLoadingManager)

        colladaLoader.setPath(`${INSPECTION_DESK_PATH}/`)

        colladaLoader.load(INSPECTION_DESK_MODEL, collada => {
          var scene = collada.scene
          var extObj = scene

          resolve(extObj)
        })
      })
    }

    return InspectionDesk._threedObjectLoader
  }

  static getInspectionDeskObject(type) {}

  createObject() {
    var { stockType = 'empty' } = this.model

    InspectionDesk.threedObjectLoader.then(this.addObject.bind(this))
  }

  addObject(extObject) {
    var { width, height, depth, rotation = 0 } = this.model

    this.type = 'inspection-desk'

    var object = extObject.clone()
    // object.rotation.z = - Math.PI / 2;

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

export class InspectionDesk2d extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!InspectionDesk2d._image) {
      InspectionDesk2d._image = new Image()
      InspectionDesk2d._image.src = symbol
    }

    return InspectionDesk2d._image
  }

  render(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(InspectionDesk2d.image, left, top, width, height)
  }

  get nature() {
    return NATURE
  }
}

Component.register('inspection-desk', InspectionDesk2d)
Component3d.register('inspection-desk', InspectionDesk)
