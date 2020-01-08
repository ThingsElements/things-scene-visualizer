/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import NanumGothicFont from '../obj/fonts/nanum_gothic.json?3d'
import Component3d from './component-3d'
import Object3D from './object3d'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'number',
      label: 'z-pos',
      name: 'zPos',
      property: 'zPos'
    },
    {
      type: 'number',
      label: 'depth',
      name: 'depth',
      property: 'depth'
    }
  ]
}

export default class TextExtrude extends Object3D {
  get fontLoader() {
    if (!this._fontLoader) {
      this._fontLoader = new THREE.FontLoader()
    }

    return this._fontLoader
  }

  get cx() {
    if (!this._cx) {
      var {
        left = 0,
        width = 1
        // width = 0
      } = this.model
      var canvasSize = this._canvasSize

      var width = this.children[0].geometry.boundingBox.max.x - this.children[0].geometry.boundingBox.min.x

      this._cx = left + width / 2 - canvasSize.width / 2
    }
    return this._cx
  }

  get cy() {
    if (!this._cy) {
      var { top = 0, height = 0 } = this.model
      var canvasSize = this._canvasSize

      var height = this.children[0].geometry.boundingBox.max.y - this.children[0].geometry.boundingBox.min.y

      this._cy = top + height / 2 - canvasSize.height / 2
    }
    return this._cy
  }

  set fontJSON(font) {
    this._fontJSON = font
  }
  get fontJSON() {
    return this._fontJSON
  }

  get fontSettings() {
    return {
      steps: 1,
      curveSegments: 8,
      bevelEnabled: false
    }
  }

  async createObject() {
    var { type, depth = 1, fontSize = 10, text = '', fontColor = 0x000000 } = this.model

    this.fontLoader.load(NanumGothicFont, font => {
      this.fontJSON = font

      var geometry = this.createTextGeometry()
      var materials = [
        new THREE.MeshStandardMaterial({ color: fontColor }), // front
        new THREE.MeshStandardMaterial({ color: fontColor }) // side
      ]

      var mesh = new THREE.Mesh(geometry, materials)
      mesh.rotation.x = -Math.PI / 2

      this.add(mesh)
      this._fontLoaded = true
      this.setPosition()

      // setInterval(() => {
      //   var t = Math.round(Math.random() * 1000)
      //   this.model.text = t;
      //   this.changeText()
      // }, 10000)
    })
  }

  setPosition() {
    if (!this._fontLoaded) return

    super.setPosition()
  }

  createTextGeometry() {
    var { fontSize = 10, depth = 1, text = '' } = this.model
    var font = this.fontJSON

    var fontSettings = Object.assign(this.fontSettings, {
      font: font,
      size: fontSize,
      height: depth
    })

    var geometry = new THREE.TextGeometry(text, fontSettings)
    geometry.center()

    return geometry
  }

  changeText() {
    if (this.children && this.children[0]) {
      this.children[0].geometry.dispose()
      this.children[0].geometry = this.createTextGeometry()

      this._cx = this._cy = null

      this.setPosition()
    }
  }

  raycast(raycaster, intersects) {}

  onUserDataChanged() {
    super.onUserDataChanged()

    if (!(this.userData && this.userData.items && this.userData.items.length > 0)) return

    var data = this.userData.items[0].data

    this.model.text = data
    this.changeText()
  }
}

Component3d.register('text', TextExtrude)
