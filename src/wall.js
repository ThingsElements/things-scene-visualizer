/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Mesh from './mesh'

var { Component, RectPath, Shape } = scene

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]
}

export default class Wall extends Mesh {

  constructor(model, canvasSize) {
    super(model);

    this.createObject(canvasSize);
  }

  createObject(canvasSize) {
    var {
      type,
      left,
      top,
      width,
      height,
      depth = 1,
      rotation = 0,
      alpha = 0.7
    } = this.model

    let cx = (left + (width / 2)) - canvasSize.width / 2
    let cy = (top + (height / 2)) - canvasSize.height / 2
    let cz = 0.5 * depth

    this.type = type

    this.createWall(width, height, depth)

    this.position.set(cx, cz, cy)
    this.rotation.y = rotation

    this.material.opacity = alpha
    this.material.transparent = alpha < 1
  }

  createWall(w, h, d) {

    let {
      fillStyle = 'gray'
    } = this.model

    this.geometry = new THREE.BoxBufferGeometry(w, d, h);
    this.material = new THREE.MeshLambertMaterial({ color: fillStyle, side: THREE.FrontSide });

    // this.castShadow = true

  }

  raycast(raycaster, intersects) { }
}

export class Wall2d extends RectPath(Shape) {
  is3dish() {
    return true
  }

  get nature() {
    return NATURE
  }
}

Component.register('wall', Wall2d)
scene.Component3d.register('wall', Wall)
