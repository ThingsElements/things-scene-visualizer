/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as BABYLON from 'babylonjs'

export default class Stock {

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
      width,
      height,
      depth
    } = model

    this._object = BABYLON.MeshBuilder.CreateBox(id, model, scene);
    this._material = new BABYLON.StandardMaterial(`stock ${id}- material`, scene);

    var rgba = {};
    var color;
    var matched = rgbaRegExp.exec(fillStyle);
    if (matched && matched.length > 0) {
      matched = matched.splice(1);
      matched = matched.filter(m => { return !!m })

      if (matched.length === 3)
        color = BABYLON.Color3.FromArray(matched)
      else {
        color = BABYLON.Color4.FromArray(matched)
        this._material.alpha = matched[3]
      }
    } else {
      color = BABYLON.Color3.FromHexString(fillStyle)
    }

    this._material.diffuseColor = color;
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

scene.Component3d.register('stock', Stock)

