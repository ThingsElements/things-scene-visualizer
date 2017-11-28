/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var { Component, Rect } = scene

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }, {
    type: 'color',
    label: 'leg-color',
    name: 'legColor',
    property: 'legColor'
  }]
}

export default class Desk extends Object3D {

  constructor(model, canvasSize, visualizer, sceneComponent) {

    super(model);

    this._visualizer = visualizer;

    this.createObject(canvasSize);
  }

  get boardThickness() {
    var {
      depth
    } = this.model;

    return Math.min(10, depth / 10);
  }

  get legThickness() {
    var {
      width, height
    } = this.model;

    var min = Math.min(width, height);

    return Math.min(10, min / 10);
  }

  get margin() {
    return Math.min(this.legThickness / 5, 2);
  }

  createObject(canvasSize) {

    var {
      type,
      left,
      top,
      width,
      height,
      depth,
      rotation = 0,

    } = this.model;

    let cx = (left + (width / 2)) - canvasSize.width / 2
    let cy = (top + (height / 2)) - canvasSize.height / 2
    let cz = 0.5 * depth

    var legs = this.createDeskLegs(width, height, depth)
    this.add(legs)

    top = depth / 2 - this.boardThickness;
    let board = this.createDeskBoard(width, height)
    board.position.set(0, top, 0)
    board.rotation.x = Math.PI / 2;

    this.add(board)

    this.position.set(cx, cz, cy)
    this.rotation.y = rotation || 0
  }

  createDeskLegs(w, h, d) {

    var legThickness = this.legThickness;
    var margin = this.margin;
    d = d - legThickness;

    var legs = new THREE.Group()
    var posX = w / 2 - legThickness / 2 - margin;
    var posY = h / 2 - legThickness / 2 - margin;
    var posZ = -legThickness;

    for (var i = 0; i < 4; i++) {
      var geometry = new THREE.BoxGeometry(legThickness, d, legThickness);
      var material = new THREE.MeshBasicMaterial({
        color: this.model.legColor || '#252525'
      });
      var leg = new THREE.Mesh(geometry, material);
      switch (i) {
        case 0:
          leg.position.set(posX, posZ, posY)
          break;
        case 1:
          leg.position.set(posX, posZ, -posY)
          break;
        case 2:
          leg.position.set(-posX, posZ, posY)
          break;
        case 3:
          leg.position.set(-posX, posZ, -posY)
          break;
      }

      legs.add(leg)
    }

    return legs
  }

  createDeskBoard(w, h) {

    var d = 10;

    var boardMaterial = new THREE.MeshBasicMaterial({
      color: this.model.fillStyle || '#ccaa76'
    });
    var boardGeometry = new THREE.BoxGeometry(w, h, d, 1, 1);
    var board = new THREE.Mesh(boardGeometry, boardMaterial);

    return board
  }

  cube(size) {

    var w = size.width * 0.5;
    var h = size.height * 0.5;
    var d = size.depth * 0.5;

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(-w, -h, -d),
      new THREE.Vector3(-w, h, -d),
      new THREE.Vector3(-w, h, -d),
      new THREE.Vector3(w, h, -d),
      new THREE.Vector3(w, h, -d),
      new THREE.Vector3(w, -h, -d),
      new THREE.Vector3(w, -h, -d),
      new THREE.Vector3(-w, -h, -d),
      new THREE.Vector3(-w, -h, d),
      new THREE.Vector3(-w, h, d),
      new THREE.Vector3(-w, h, d),
      new THREE.Vector3(w, h, d),
      new THREE.Vector3(w, h, d),
      new THREE.Vector3(w, -h, d),
      new THREE.Vector3(w, -h, d),
      new THREE.Vector3(-w, -h, d),
      new THREE.Vector3(-w, -h, -d),
      new THREE.Vector3(-w, -h, d),
      new THREE.Vector3(-w, h, -d),
      new THREE.Vector3(-w, h, d),
      new THREE.Vector3(w, h, -d),
      new THREE.Vector3(w, h, d),
      new THREE.Vector3(w, -h, -d),
      new THREE.Vector3(w, -h, d)
    );

    return geometry;

  }

  raycast(raycaster, intersects) {

  }

  onchange(after, before) {
    if (after.hasOwnProperty("data")) {
      this.data = after.data;
    }
  }

}


export class Desk2d extends Rect {
  is3dish() {
    return true
  }

  get controls() { }

  get nature() {
    return NATURE
  }
}


Component.register('desk', Desk2d)
scene.Component3d.register('desk', Desk)

