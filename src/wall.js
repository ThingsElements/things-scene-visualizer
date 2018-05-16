/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Component3d from './component-3d'

import Mesh from './mesh'

import { Component, Rect } from '@hatiolab/things-scene'

import * as THREE from 'three'

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
      zPos = 0,
      alpha = 1
    } = this.model

    let cx = (left + (width / 2)) - canvasSize.width / 2
    let cy = (top + (height / 2)) - canvasSize.height / 2
    let cz = zPos + 0.5 * depth

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

export class Wall2d extends Rect {
  is3dish() {
    return true
  }

  get nature() {
    return NATURE
  }

  get controls() { }
}

Component.register('wall', Wall2d)
Component3d.register('wall', Wall)
