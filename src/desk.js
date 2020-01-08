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
      label: 'depth',
      name: 'depth',
      property: 'depth'
    },
    {
      type: 'color',
      label: 'leg-color',
      name: 'legColor',
      property: 'legColor'
    }
  ]
}

export default class Desk extends Object3D {
  get boardThickness() {
    var { depth } = this.model

    return Math.min(10, depth / 10)
  }

  get legThickness() {
    var { width, height } = this.model

    var min = Math.min(width, height)

    return Math.min(10, min / 10)
  }

  get margin() {
    return Math.min(this.legThickness / 5, 2)
  }

  async createObject() {
    var { left, top, width, height, depth } = this.model

    var legs = this.createDeskLegs(width, height, depth)
    this.add(legs)

    top = depth / 2 - this.boardThickness
    let board = this.createDeskBoard(width, height)
    board.position.set(0, top, 0)
    board.rotation.x = Math.PI / 2

    this.add(board)
  }

  createDeskLegs(w, h, d) {
    var legThickness = this.legThickness
    var margin = this.margin
    d = d - this.boardThickness

    var legs = new THREE.Group()
    var posX = w / 2 - legThickness / 2 - margin
    var posY = h / 2 - legThickness / 2 - margin
    var posZ = -1

    for (var i = 0; i < 4; i++) {
      var geometry = new THREE.BoxBufferGeometry(legThickness, d, legThickness)
      var material = new THREE.MeshStandardMaterial({
        color: this.model.legColor || '#252525'
      })
      var leg = new THREE.Mesh(geometry, material)
      switch (i) {
        case 0:
          leg.position.set(posX, posZ, posY)
          break
        case 1:
          leg.position.set(posX, posZ, -posY)
          break
        case 2:
          leg.position.set(-posX, posZ, posY)
          break
        case 3:
          leg.position.set(-posX, posZ, -posY)
          break
      }

      legs.add(leg)
    }

    return legs
  }

  createDeskBoard(w, h) {
    var d = 10

    var boardMaterial = new THREE.MeshStandardMaterial({
      color: this.model.fillStyle || '#ccaa76'
    })
    var boardGeometry = new THREE.BoxBufferGeometry(w, h, d, 1, 1)
    var board = new THREE.Mesh(boardGeometry, boardMaterial)

    return board
  }

  raycast(raycaster, intersects) {}

  onchange(after, before) {
    if (after.hasOwnProperty('data')) {
      this.data = after.data
    }
  }
}

export class Desk2d extends Rect {
  is3dish() {
    return true
  }

  get controls() {}

  get nature() {
    return NATURE
  }
}

Component.register('desk', Desk2d)
Component3d.register('desk', Desk)
