/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'
import Component3d from './component-3d'
import NanumGothicFont from "../obj/fonts/nanum_gothic.json?3d"

import * as THREE from 'three'

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'z-pos',
    name: 'zPos',
    property: 'zPos'
  }, {
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]
}

export default class TextTextureObject extends Object3D {

  createObject() {
    var {
      width,
      height,
      type,
      depth = 1,
      fontSize = 10,
      text = '',
      fontFamily: font = 'serif',
      lineHeight = fontSize * 1.2, // default(line-height: normal) lineHeight
      fontColor = 0x000000
    } = this.model

    if (!text)
      return;

    var span = document.createElement('span')
    span.style.font = `${fontSize}px ${font}`
    span.style.lineHeight = lineHeight
    span.style.whiteSpace = 'pre'
    span.innerText = text;

    document.body.appendChild(span)

    var textBounds = span.getBoundingClientRect()

    width = this.model.width = textBounds.width;
    height = this.model.height = textBounds.height;

    // recalculate cx,cy,cz
    delete this._cx
    delete this._cy
    delete this._cz

    document.body.removeChild(span)

    var canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = fontColor
    ctx.font = `${fontSize}px ${font}`;
    ctx.textBaseline = 'top'
    ctx.strokeStyle = fontColor

    var lineText = text.split('\n');
    lineHeight = lineHeight === undefined ? canvas.height / lineText.length : lineHeight;
    lineText.forEach((t, i) => {
      ctx.fillText(t, 0, Number(i) * lineHeight)
      ctx.strokeText(t, 0, Number(i) * lineHeight)
    })

    var geometry = new THREE.BoxBufferGeometry();
    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.5
    });

    var mesh = new THREE.Mesh(geometry, material);

    this.add(mesh)

    mesh.rotation.x = - Math.PI / 2
    mesh.scale.set(width, height, 1)

  }

  raycast(raycaster, intersects) {

  }

  onUserDataChanged() {
    super.onUserDataChanged();

    if (!(this.userData && this.userData.items && this.userData.items.length > 0))
      return

    var data = this.userData.items[0].data

    this.model.text = data;
    this.changeText();
  }

}


Component3d.register('text', TextTextureObject)
