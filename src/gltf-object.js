/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Component, RectPath, Shape } from '@hatiolab/things-scene'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import GLTFLogo from '../assets/canvasicon-gltf.png'
import Component3d from './component-3d'
import Object3D from './object3d'

const BASE_URL_ALIAS = '$base_url'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'gltf-selector',
      label: 'url',
      name: 'src',
      property: {
        displayField: 'id',
        displayFullUrl: true,
        baseUrlAlias: BASE_URL_ALIAS,
        defaultStorage: '3d-model',
        storageFilters: {
          type: Array,
          value: [
            {
              name: 'category',
              value: 'image'
            }
          ]
        },
        useUpload: true,
        category: 'application'
      }
    }
  ]
}

export default class GLTFObject extends Object3D {
  async createObject() {
    var { src } = this.model

    let gltfLoader = new GLTFLoader()

    var fullSrc = this._visualizer.app.url(src)
    gltfLoader.setCrossOrigin('use-credentials')

    return new Promise(resolve => {
      gltfLoader.load(fullSrc, gltf => {
        var scene = gltf.scene
        var extObj = scene

        var animations = gltf.animations
        this.addObject(extObj.clone(), animations)

        resolve()
      })
    })
  }

  addObject(extObject, animations) {
    var { width, height, depth } = this.model

    this.type = 'gltf-object'

    var object = extObject

    var boundingBox = new THREE.Box3().setFromObject(object)
    var center = boundingBox.getCenter(object.position)
    var size = boundingBox.getSize(new THREE.Vector3())

    center.multiplyScalar(-1)

    object.updateMatrix()

    this.add(object)
    this.scale.set(width / size.x, depth / size.y, height / size.z)

    if (animations && animations.length) {
      for (var i = 0; i < animations.length; i++) {
        var animation = animations[i]
        var action = this._visualizer.mixer.clipAction(animation)
        action.play()
      }
    }
  }
}

export class GLTFObject2D extends RectPath(Shape) {
  is3dish() {
    return true
  }

  static get image() {
    if (!GLTFObject2D._image) {
      GLTFObject2D._image = new Image()
      GLTFObject2D._image.src = GLTFLogo
    }

    return GLTFObject2D._image
  }

  get controls() {}

  render(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.drawImage(GLTFObject2D.image, left, top, width, height)
  }

  get nature() {
    return NATURE
  }
}

Component.register('gltf-object', GLTFObject2D)
Component3d.register('gltf-object', GLTFObject)
