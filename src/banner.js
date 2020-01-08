/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, Rect } from '@hatiolab/things-scene'
import * as THREE from 'three'
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
    },
    {
      type: 'number',
      label: 'rotation',
      name: 'rotation',
      property: 'rotation'
    },
    {
      type: 'color',
      label: 'box-color',
      name: 'boxColor',
      property: 'boxColor'
    }
  ]
}

export default class Banner extends Object3D {
  async createObject() {
    var { width = 1, height = 1, depth = 1 } = this.model

    this.add(this.createCube(width, height, depth))
    let textureBoard = this.createTextureBoard(width, depth)
    this.add(textureBoard)
    textureBoard.position.set(0, 0, 0.5 * height)
  }

  createCube(w, h, d) {
    var { boxColor = '#ccaa76' } = this.model

    var geometry = new THREE.BoxBufferGeometry(w, d, h)
    var material = new THREE.MeshStandardMaterial({
      color: boxColor,
      side: THREE.FrontSide
    })

    var cube = new THREE.Mesh(geometry, material)

    return cube
  }

  createTextureBoard(w, h) {
    var boardMaterial

    let { fillStyle = '#ccaa76' } = this.model

    if (fillStyle && fillStyle.type == 'pattern' && fillStyle.image) {
      var texture = this._visualizer._textureLoader.load(this._visualizer.app.url(fillStyle.image), () => {
        texture.minFilter = THREE.LinearFilter
        texture.repeat.set(1, 1)
        this._visualizer.render_threed()
      })
      // texture.wrapS = THREE.RepeatWrapping
      // texture.wrapT = THREE.RepeatWrapping
      // texture.repeat.set(1, 1)
      // texture.minFilter = THREE.LinearFilter

      // boardMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.FrontSide });
      boardMaterial = new THREE.MeshStandardMaterial({ map: texture })
    } else {
      boardMaterial = new THREE.MeshStandardMaterial({
        color: fillStyle || '#ccaa76',
        side: THREE.FrontSide
      })
    }

    var boardGeometry = new THREE.PlaneBufferGeometry(w, h, 1, 1)
    var board = new THREE.Mesh(boardGeometry, boardMaterial)

    return board
  }

  raycast(raycaster, intersects) {}
}

export class Banner2d extends Rect {
  is3dish() {
    return true
  }

  get nature() {
    return NATURE
  }

  get controls() {}
}

Component.register('banner', Banner2d)
Component3d.register('banner', Banner)
