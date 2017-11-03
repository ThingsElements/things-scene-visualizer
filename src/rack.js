/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as BABYLON from 'babylonjs'

export default class Rack {

  constructor(visualizer, model, scene) {
    this._visualizer = visualizer;
    this._model = model;
    this._scene = scene;

    this.createObject(model, scene);
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

  createObject(model, scene) {
    var {
      id,
      x = 0,
      y = 0,
      z = 0,
      height,
      shelves = 1
    } = model

    this._object = new BABYLON.Mesh(id, scene);

    this.createRackFrame(model, scene);

    // for (var i = 0; i < model.shelves; i++) {

    //   let bottom = -model.depth * model.shelves * 0.5
    //   if (i > 0) {
    //     let board = this.createRackBoard(model.width, model.height)
    //     board.position.set(0, bottom + (model.depth * i), 0)
    //     board.rotation.x = Math.PI / 2;
    //     board.material.opacity = 0.5
    //     board.material.transparent = true

    //     this.add(board)
    //     // frame.geometry.merge(board.geometry, board.matrix)
    //   }

    //   let stock = new Stock({
    //     width: model.width * scale,
    //     height: model.height * scale,
    //     depth: model.depth * scale,
    //     fillStyle: model.fillStyle
    //   })

    //   let stockDepth = model.depth * scale

    //   stock.position.set(0, bottom + (model.depth * i) + (stockDepth * 0.5), 0)
    //   stock.name = this.makeLocationString(this.makeShelfString(shelfPattern, i + 1, model.shelves))

    //   this.add(stock)
    //   this._threeContainer.putObject(stock.name, stock);
    // }

    // this._object = BABYLON.MeshBuilder.CreateBox(id, model, scene);



    // var frame = this.createRackFrame(model.width, model.height, model.depth * model.shelves)

    // this.add(frame)

    // var shelfPattern = model.shelfPattern;

    // for (var i = 0; i < model.shelves; i++) {

    //   let bottom = -model.depth * model.shelves * 0.5
    //   if (i > 0) {
    //     let board = this.createRackBoard(model.width, model.height)
    //     board.position.set(0, bottom + (model.depth * i), 0)
    //     board.rotation.x = Math.PI / 2;
    //     board.material.opacity = 0.5
    //     board.material.transparent = true

    //     this.add(board)
    //     // frame.geometry.merge(board.geometry, board.matrix)
    //   }

    //   let stock = new Stock({
    //     width: model.width * scale,
    //     height: model.height * scale,
    //     depth: model.depth * scale,
    //     fillStyle: model.fillStyle
    //   })

    //   let stockDepth = model.depth * scale

    //   stock.position.set(0, bottom + (model.depth * i) + (stockDepth * 0.5), 0)
    //   stock.name = this.makeLocationString(this.makeShelfString(shelfPattern, i + 1, model.shelves))

    //   this.add(stock)
    //   this._threeContainer.putObject(stock.name, stock);
    // }

    y = y > height / 2 ? y : 0;

    this._object.setAbsolutePosition(new BABYLON.Vector3(x, y + (height * shelves / 2), z))
    // this.rotation.y = rotation || 0

  }

  createRackFrame(model, scene) {
    var stockScaleFactor = 0.7;

    var {
      width,
      height,
      depth,
      x,
      y,
      z,
      shelves = 1,
      shelfPattern
    } = model;

    // create frame
    var frameWeight = Math.round(Math.min(width, depth) / 10)
    var frameHeight = height * shelves;
    var frameModel = {
      height: frameHeight,
      width: frameWeight,
      depth: frameWeight
    }

    var frameBottom = frameHeight / 2;
    var frameWidthArr = [
      width / 2 - frameWeight / 2,
      width / 2 - frameWeight / 2,
      -(width / 2 - frameWeight / 2),
      -(width / 2 - frameWeight / 2)
    ]
    var frameDepthArr = [
      depth / 2 - frameWeight / 2,
      (-depth / 2 - frameWeight / 2),
      depth / 2 - frameWeight / 2,
      (-depth / 2 - frameWeight / 2)
    ]

    var frameMeshArray = [];
    var originFrame
    for (var i = 0; i < 4; i++) {
      var frame
      if (!originFrame)
        frame = originFrame = BABYLON.MeshBuilder.CreateBox(null, frameModel, scene);
      else
        frame = originFrame.clone(null);
      frame.parent = parent;
      frame.position.set(frameWidthArr[i], 0, frameDepthArr[i])
      frame.occlusionQueryAlgorithmType = BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
      frame.isOccluded = true;
      frame.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_STRICT;
      frame.convertToUnIndexedMesh();
      // frame.freezeWorldMatrix();
      frameMeshArray.push(frame);
    }

    var mergedFrameMesh = BABYLON.Mesh.MergeMeshes(frameMeshArray);

    this._visualizer.sps.addShape(mergedFrameMesh);

    var boardMeshArray = [];

    var boardModel = {
      width: width,
      height: depth,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }

    var boardMaterial = new BABYLON.StandardMaterial("boardMaterial", scene)
    boardMaterial.useAlphaFromDiffuseTexture = true;
    boardMaterial.diffuseColor = BABYLON.Color3.FromInts(33, 33, 33);
    boardMaterial.alpha = 0.5
    boardMaterial.freeze();


    var stockModel = {
      width: width * 0.7,
      height: height * 0.7,
      depth: depth * 0.7
    }

    var stockMaterial = new BABYLON.StandardMaterial("stockMaterial", scene);
    // stockMaterial.useAlphaFromDiffuseTexture = true;
    stockMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ccaa76");

    var originBoard;
    var originStock;

    // board & stock create
    for (var i = 0; i < shelves; i++) {
      let bottom = -model.height * model.shelves * 0.5
      if (i > 0) {
        var board
        if (!originBoard)
          board = originBoard = BABYLON.MeshBuilder.CreatePlane(null, boardModel, scene);
        else
          board = originBoard.clone(null);
        board.parent = parent;
        board.position.set(0, bottom + (model.height * i), 0)
        board.rotation.x = - Math.PI / 2
        // board.rotation.x = Math.PI / 2
        board.material = boardMaterial;
        board.occlusionQueryAlgorithmType = BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
        board.isOccluded = true;
        board.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_STRICT;
        board.convertToUnIndexedMesh();
        // board.freezeWorldMatrix();
        boardMeshArray.push(board)
      }

      // var stockId = this.makeLocationString(this.makeShelfString(shelfPattern, i + 1, model.shelves))
      // var stock
      // if (!originStock)
      //   stock = originStock = BABYLON.MeshBuilder.CreateBox(stockId, stockModel, scene);
      // else
      //   stock = originStock.clone(stockId);
      // stock.parent = parent;
      // stock.material = stockMaterial;
      // stock.position.set(0, bottom + (model.height * i) + stockModel.height / 2, 0);
      // stock.occlusionQueryAlgorithmType = BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
      // stock.isOccluded = true;
      // stock.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_STRICT;
      // stock.convertToUnIndexedMesh();
      // stock.freezeWorldMatrix();
    }

    var mergedBoardMesh = BABYLON.Mesh.MergeMeshes(boardMeshArray);

    this._visualizer.sps.addShape(mergedBoardMesh);

  }

  getFrameMesh() {

    var {
      x, y, z, width, height, depth
    } = model
    width /= 2;
    height /= 2;
    depth /= 2;

    var corners = [
      new BABYLON.Vector3(width, depth, ),
      new BABYLON.Vector3(1, -1),
      new BABYLON.Vector3(-1, 1),
      new BABYLON.Vector3(-1, -1)
    ]

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

