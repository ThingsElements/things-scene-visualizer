/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import Component3d from './component-3d'
import Object3D from './object3d'

export default class TextTextureObject extends Object3D {
  async createObject() {
    var {
      width,
      height,
      fontSize = 10,
      text = '',
      bold = false,
      italic = false,
      fontFamily: font = 'serif',
      lineHeight = fontSize * 1.2, // default(line-height: normal) lineHeight
      fontColor = 0x000000
    } = this.model

    if (!text) return

    var textBounds = this._getTextBounds({
      fontSize,
      text,
      font,
      bold,
      italic,
      lineHeight
    })

    width = this.model.width = textBounds.width
    height = this.model.height = textBounds.height

    // recalculate cx,cy,cz
    delete this._cx
    delete this._cy
    delete this._cz

    var canvas = this._createOffcanvas(width, height)
    this._drawTextTexture(canvas, { fontColor, fontSize, font, text, lineHeight, bold, italic })

    var geometry = new THREE.BoxBufferGeometry()
    var texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    var material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.5
    })

    var mesh = new THREE.Mesh(geometry, material)

    this.add(mesh)

    mesh.rotation.x = -Math.PI / 2
    mesh.scale.set(width, height, 1)
  }

  _drawTextTexture(canvas, { fontColor, fontSize, font, text = '', lineHeight, bold = false, italic = false }) {
    var ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = fontColor
    ctx.font = `${bold ? 'bold' : ''} ${italic ? 'italic' : ''} ${fontSize}px ${font}`
    ctx.textBaseline = 'top'
    ctx.strokeStyle = fontColor
    var lineText = text.split('\n')
    lineText.forEach((t, i) => {
      ctx.fillText(t, 0, Number(i) * lineHeight)
      ctx.strokeText(t, 0, Number(i) * lineHeight)
    })
  }

  _createOffcanvas(width, height) {
    var canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  }

  _getTextBounds({
    fontSize = 10,
    text = '',
    font = 'arial',
    bold = false,
    italic = false,
    lineHeight = fontSize * 1.2 // default(line-height: normal) lineHeight
  }) {
    var span = document.createElement('span')
    span.style.font = `${bold ? 'bold ' : ''}${italic ? 'italic ' : ''}${fontSize}px ${font}`
    span.style.lineHeight = `${lineHeight}px`
    span.style.whiteSpace = 'pre'
    span.style.position = 'absolute'
    span.textContent = text

    document.body.appendChild(span)

    var textBounds = span.getBoundingClientRect()

    document.body.removeChild(span)

    return {
      width: textBounds.width,
      height: textBounds.height
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

Component3d.register('text', TextTextureObject)
