/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var { Component, ImageView, Component3d } = scene

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
  }, {
    type: 'number',
    label: 'rotation',
    name: 'rotation',
    property: 'rotation'
  }, {
    type: 'color',
    label: 'box-color',
    name: 'boxColor',
    property: 'boxColor'
  }]
}

export default class Banner extends THREE.Object3D {

  constructor(model, canvasSize, visualizer) {

    super();

    this._model = model;
    this._visualizer = visualizer;

    this.createObject(model, canvasSize);
  }

  createObject(model, canvasSize) {

    let { left = 0, top = 0, zPos = 0, width = 1, height = 1, depth = 1 } = model

    let cx = (left + width / 2) - canvasSize.width / 2
    let cy = (top + height / 2) - canvasSize.height / 2
    let cz = zPos + 0.5 * depth

    let rotation = model.rotation

    this.add(this.createCube(width, height, depth))
    let textureBoard = this.createTextureBoard(width, depth)
    this.add(textureBoard)
    textureBoard.position.set(0, 0, 0.5 * height)

    this.type = model.type

    this.position.set(cx, cz, cy)
    this.rotation.y = - rotation || 0


  }

  createCube(w, h, d) {

    var { boxColor = '#ccaa76' } = this._model

    var geometry = new THREE.BoxGeometry(w, d, h);
    var material = new THREE.MeshLambertMaterial({ color: boxColor, side: THREE.FrontSide });

    var cube = new THREE.Mesh(geometry, material);

    return cube

  }

  createTextureBoard(w, h) {

    var boardMaterial
    var self = this

    let {
      fillStyle = '#ccaa76'
    } = this._model

    if (fillStyle && fillStyle.type == 'pattern' && fillStyle.image) {

      var texture = this._visualizer._textureLoader.load(
        this._visualizer.app.url(fillStyle.image),
        function () {
          self._visualizer.render_threed()
        }
      )
      // texture.wrapS = THREE.RepeatWrapping
      // texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(1, 1)
      texture.minFilter = THREE.LinearFilter

      boardMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });

    } else {
      boardMaterial = new THREE.MeshLambertMaterial({ color: fillStyle || '#ccaa76', side: THREE.FrontSide });
    }

    var boardGeometry = new THREE.PlaneGeometry(w, h, 1, 1);
    var board = new THREE.Mesh(boardGeometry, boardMaterial);

    return board
  }

  raycast(raycaster, intersects) {

  }

}

export class Banner2d extends ImageView {
  is3dish() {
    return true
  }

  get nature() {
    return NATURE
  }
}


Component.register('banner', Banner2d)
Component3d.register('banner', Banner)
