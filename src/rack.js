/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Stock from './stock'

export default class Rack extends THREE.Object3D {

  constructor(model, canvasSize, visualizer, sceneComponent) {

    super();

    this._model = model;
    this._visualizer = visualizer;

    this._frames = [];
    this._boards = [];

    this.createObject(model, canvasSize);
    // this.castShadow = true
  }

  static get boardMaterial() {
    if (!Rack._boardMaterial)
      Rack._boardMaterial = new THREE.MeshBasicMaterial({
        color: '#dedede',
        side: THREE.DoubleSide
      })

    return Rack._boardMaterial
  }

  static get frameMaterial() {
    if (!Rack._frameMaterial)
      Rack._frameMaterial = new THREE.MeshLambertMaterial({
        color: 0xcccccc
      })
    // Rack._frameMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc, linewidth: 3 })

    return Rack._frameMaterial
  }

  get frames() {
    return this._frames;
  }

  get boards() {
    return this._boards;
  }

  createObject(model, canvasSize) {

    let scale = 0.7;

    let cx = (model.left + (model.width / 2)) - canvasSize.width / 2
    let cy = (model.top + (model.height / 2)) - canvasSize.height / 2
    let cz = 0.5 * model.depth * model.shelves

    let rotation = model.rotation

    this.type = model.type

    var frame = this.createRackFrame(model.width, model.height, model.depth * model.shelves)
    this._frames.push(frame)

    this.add(frame)

    var shelfPattern = model.shelfPattern;

    for (var i = 0; i < model.shelves; i++) {

      let bottom = -model.depth * model.shelves * 0.5
      if (i > 0) {
        let board = this.createRackBoard(model.width, model.height)
        board.position.set(0, bottom + (model.depth * i), 0)
        board.rotation.x = Math.PI / 2;
        board.material.opacity = 0.5
        board.material.transparent = true

        this.add(board)
        // frame.geometry.merge(board.geometry, board.matrix)

        this._boards.push(board)
      }

      let stock = new Stock({
        width: model.width * scale,
        height: model.height * scale,
        depth: model.depth * scale,
        fillStyle: model.fillStyle
      }, this._visualizer)

      let stockDepth = model.depth * scale

      stock.position.set(0, bottom + (model.depth * i) + (stockDepth * 0.5), 0)
      stock.name = this.makeLocationString(this.makeShelfString(shelfPattern, i + 1, model.shelves))

      this.add(stock)
      this._visualizer.putObject(stock.name, stock);
    }

    this.position.set(cx, cz, cy)
    this.rotation.y = - rotation || 0

  }

  createRackFrame(w, h, d) {

    // this.geometry = this.cube({
    //   width: w,
    //   height : d,
    //   depth : h
    // })

    var frameWeight = Math.round(Math.min(w, h) / 10)

    var frames = new THREE.Group()
    for (var i = 0; i < 4; i++) {
      var geometry = new THREE.BoxBufferGeometry(frameWeight, d, frameWeight);
      var material = Rack.frameMaterial;
      var frame = new THREE.Mesh(geometry, material);
      switch (i) {
        case 0:
          frame.position.set(w / 2, 0, h / 2)
          break;
        case 1:
          frame.position.set(w / 2, 0, -h / 2)
          break;
        case 2:
          frame.position.set(-w / 2, 0, h / 2)
          break;
        case 3:
          frame.position.set(-w / 2, 0, -h / 2)
          break;
      }

      frames.add(frame)
    }

    return frames

    // return new THREE.LineSegments(
    //   this.geometry,
    //   Rack.frameMaterial
    // );

  }

  createRackBoard(w, h) {

    var boardMaterial = Rack.boardMaterial;
    var boardGeometry = new THREE.PlaneBufferGeometry(w, h, 1, 1);
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

  makeLocationString(shelfString) {
    var {
      locPattern = "{z}{s}-{u}-{sh}",
      zone = "",
      section = "",
      unit = ""
    } = this._model

    var locationString = locPattern

    locationString = locationString.replace(/{z}/i, zone);
    locationString = locationString.replace(/{s}/i, section);
    locationString = locationString.replace(/{u}/i, unit);
    locationString = locationString.replace(/{sh}/i, shelfString);

    return locationString;
  }

  makeShelfString(pattern, shelf, length) {
    /**
     *  pattern #: 숫자
     *  pattern 0: 고정 자리수
     *  pattern -: 역순
     */

    if (!pattern || !shelf || !length)
      return

    var isReverse = /^\-/.test(pattern);
    pattern = pattern.replace(/#+/, '#');

    var fixedLength = (pattern.match(/0/g) || []).length || 0
    var shelfString = String(isReverse ? length - shelf + 1 : shelf)

    if (shelfString.length > fixedLength && fixedLength > 0) {
      shelfString = shelfString.split('').shift(shelfString.length - fixedLength).join('')
    } else {
      var prefix = '';
      for (var i = 0; i < fixedLength - shelfString.length; i++) {
        prefix += '0';
      }
      shelfString = prefix + shelfString;
    }

    return shelfString
  }

  raycast(raycaster, intersects) {

  }

  onchange(after, before) {
    if (after.hasOwnProperty("data")) {
      this.data = after.data;
    }
  }

}


scene.Component3d.register('rack', Rack)

