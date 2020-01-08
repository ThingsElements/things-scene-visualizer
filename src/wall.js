/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, Rect } from '@hatiolab/things-scene'
import * as THREE from 'three'
import Component3d from './component-3d'
import Mesh from './mesh'

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

export default class Wall extends Mesh {
  // constructor(model, canvasSize, visualizer) {
  //   console.log(model, canvasSize);
  //   super(model, canvasSize, visualizer);

  //   this.createObject(canvasSize);
  // }

  async createObject() {
    var { type, width, height, depth = 1 } = this.model

    this.type = type
    this.createWall(width, height, depth)
  }

  createWall(w, h, d) {
    let { fillStyle = 'gray' } = this.model

    this.geometry = new THREE.BoxBufferGeometry(w, d, h)
    this.material = new THREE.MeshStandardMaterial({ color: fillStyle, side: THREE.FrontSide })

    // this.castShadow = true
  }

  raycast(raycaster, intersects) {}
}

export class Wall2d extends Rect {
  is3dish() {
    return true
  }

  get nature() {
    return NATURE
  }

  get controls() {}
}

Component.register('wall', Wall2d)
Component3d.register('wall', Wall)
