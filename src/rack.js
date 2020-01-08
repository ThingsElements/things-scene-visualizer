/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'
import Component3d from './component-3d'

import * as THREE from 'three'

import Stock from './stock'

export default class Rack extends Object3D {
  constructor(model, canvasSize, visualizer) {
    super(model, canvasSize, visualizer)

    this._frames = []
    this._boards = []
  }

  dispose() {
    super.dispose()

    delete this._visualizer
  }

  get cz() {
    if (!this._cz) {
      var { shelves = 1, depth = 1 } = this.model

      this._cz = 0.5 * depth * shelves
    }

    return this._cz
  }

  static get rackFrameGeometry() {
    if (!Rack._rackFrameGeometry) Rack._rackFrameGeometry = new THREE.BoxBufferGeometry(1, 1, 1)

    return Rack._rackFrameGeometry
  }

  static get boardGeometry() {
    if (!Rack._boardGeometry) Rack._boardGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1)

    return Rack._boardGeometry
  }

  static get boardMaterial() {
    if (!Rack._boardMaterial)
      Rack._boardMaterial = new THREE.MeshStandardMaterial({
        color: '#dedede',
        side: THREE.DoubleSide
      })

    Rack._boardMaterial.polygonOffset = true
    Rack._boardMaterial.polygonOffsetFactor = -0.1

    return Rack._boardMaterial
  }

  static get frameMaterial() {
    if (!Rack._frameMaterial)
      Rack._frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.5,
        metalness: 0.3
      })
    // Rack._frameMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc, linewidth: 3 })

    return Rack._frameMaterial
  }

  get frames() {
    return this._frames
  }

  get boards() {
    return this._boards
  }

  async createObject() {
    var {
      type,
      width,
      height,
      depth,
      fillStyle,
      hideRackFrame,
      shelves,
      shelfLocations,
      binLocations = '',
      stockScale = 0.7
    } = this.model

    let scale = stockScale

    this.type = type

    if (!hideRackFrame) {
      var frame = this.createRackFrame(width, height, depth * shelves)
      // this._frames.push(frame)

      this.add(frame)
    }

    var shelfLocIds

    if (!shelfLocations) {
      shelfLocIds = []
      for (var i = 0; i < shelves; i++) shelfLocIds.push(i + 1)
    } else shelfLocIds = shelfLocations.split(/\s*,\s*/)

    var shelfBins = binLocations
      .trim()
      .split('\n')
      .reverse()

    for (var i = 0; i < shelves; i++) {
      let bottom = -depth * shelves * 0.5
      if (shelfLocIds[i] == '') continue

      if (i > 0 && !hideRackFrame) {
        let board = this.createRackBoard(width, height)
        board.position.set(0, bottom + depth * i, 0)
        board.rotation.x = Math.PI / 2
        board.material.opacity = 0.5
        board.material.transparent = true

        this.add(board)
        // frame.geometry.merge(board.geometry, board.matrix)

        // this._boards.push(board)
      }

      var bins = (shelfBins[i] || '').trim().split(/\s*,\s*/)

      var binWidth = width / (bins.length || 1)
      for (var b = 0; b < bins.length; b++) {
        let stock = new Stock(
          {
            width: binWidth * scale,
            height: height * scale,
            depth: depth * scale,
            fillStyle: fillStyle
          },
          this._canvasSize,
          this._visualizer
        )

        let stockDepth = depth * scale

        stock.position.set(
          (width / 2) * ((2 * b - (bins.length - 1)) / bins.length),
          bottom + depth * i + stockDepth * 0.5,
          0
        )
        var binCode = (bins[b] || '').replace('.', '')
        stock.name = `${this.makeLocationString(shelfLocIds[i])}${binCode}`

        this.add(stock)
        this._visualizer.putObject(stock.name, stock)
      }
    }
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
      var geometry = Rack.rackFrameGeometry
      var material = Rack.frameMaterial
      var frame = new THREE.Mesh(geometry, material)
      frame.scale.set(frameWeight, d, frameWeight)
      switch (i) {
        case 0:
          frame.position.set(w / 2, 0, h / 2)
          break
        case 1:
          frame.position.set(w / 2, 0, -h / 2)
          break
        case 2:
          frame.position.set(-w / 2, 0, h / 2)
          break
        case 3:
          frame.position.set(-w / 2, 0, -h / 2)
          break
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
    var boardMaterial = Rack.boardMaterial
    var boardGeometry = Rack.boardGeometry
    // var boardGeometry = new THREE.PlaneGeometry(w, h, 1, 1);
    var board = new THREE.Mesh(boardGeometry, boardMaterial)

    board.scale.set(w, h, 1)

    return board
  }

  makeLocationString(shelfString) {
    var { locPattern = '{z}{s}-{u}-{sh}', zone = '', section = '', unit = '' } = this._model

    var locationString = locPattern

    locationString = locationString.replace(/{z}/i, zone)
    locationString = locationString.replace(/{s}/i, section)
    locationString = locationString.replace(/{u}/i, unit)
    locationString = locationString.replace(/{sh}/i, shelfString)

    return locationString
  }

  makeShelfString(pattern, shelf, length) {
    /**
     *  pattern #: 숫자
     *  pattern 0: 고정 자리수
     *  pattern -: 역순
     */

    if (!pattern || !shelf || !length) return

    var isReverse = /^\-/.test(pattern)
    pattern = pattern.replace(/#+/, '#')

    var fixedLength = (pattern.match(/0/g) || []).length || 0
    var shelfString = String(isReverse ? length - shelf + 1 : shelf)

    if (shelfString.length > fixedLength && fixedLength > 0) {
      shelfString = shelfString
        .split('')
        .shift(shelfString.length - fixedLength)
        .join('')
    } else {
      var prefix = ''
      for (var i = 0; i < fixedLength - shelfString.length; i++) {
        prefix += '0'
      }
      shelfString = prefix + shelfString
    }

    return shelfString
  }

  setOpacity() {}

  raycast(raycaster, intersects) {}

  onchange(after, before) {
    if (after.hasOwnProperty('data')) {
      this.data = after.data
    }
  }
}

Component3d.register('rack', Rack)
