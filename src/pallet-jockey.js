/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, RectPath, Shape } from '@hatiolab/things-scene'
import path from 'path'
import * as THREE from 'three'
import palletJockeySymbol from '../assets/canvasicon-pallet-jockey.png'
import Component3d from './component-3d'
import ColladaLoader from './loaders/ColladaLoader'
import Object3D from './object3d'

const PALLET_JOKEY_MODEL = 'SmallJockey.dae'

const PALLET_JOKEY_PATH = path.resolve('../obj/Pallet_Jockey')

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
        let colladaLoader = new ColladaLoader(THREE.DefaultLoadingManager)

        colladaLoader.setPath(`${PALLET_JOKEY_PATH}/`)

        colladaLoader.load(PALLET_JOKEY_MODEL, collada => {
          var scene = collada.scene
          var extObj = scene

          resolve(extObj)
        })
      })
    }

    return PalletJockey._threedObjectLoader
  }

  static getPalletJockeyObject(type) {}

  async createObject() {
    var extObj = await PalletJockey.threedObjectLoader
    this.addObject(extObj)
  }

  addObject(extObject) {
    var { width, height, depth, rotation = 0 } = this.model

    this.type = 'pallet-jockey'

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

    this.setRotation()
    this.setPosition()
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
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(PalletJockey2d.image, left, top, width, height)
  }

  get nature() {
    return NATURE
  }
}

Component.register('pallet-jockey', PalletJockey2d)
Component3d.register('pallet-jockey', PalletJockey)
