/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'
import Component3d from './component-3d'

import { Component, Polygon } from '@hatiolab/things-scene'

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
  }]
}

export default class Extrude extends Object3D {

  constructor(model, canvasSize, visualizer) {

    super(model);

    this._visualizer = visualizer;

    this.createObject(canvasSize);
  }

  createObject(canvasSize) {
    var {
      type,
      left = 0,
      top = 0,
      zPos = 0,
      width = 1,
      height = 1,
      depth = 1,
      rotation = 0,
      fillStyle = 0xffffff,
      path = []
    } = this.model

    if(path.length <= 1)
      return;

    // 다각형을 그린다.
    var shape = new THREE.Shape();
    shape.moveTo(path[0].x, path[0].y)
    for(let i = 1;i < path.length;i++)
      shape.lineTo(path[i].x, path[i].y)

    var extrudeSettings = {
      steps: 1,
      amount: depth,
      bevelEnabled: false
    };

    var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    var material;

    if (fillStyle.type == 'pattern' && fillStyle.image) {

      var texture = this._visualizer._textureLoader.load(this._visualizer.app.url(fillStyle.image), function (texture) {
        texture.minFilter = THREE.LinearFilter
        self.render_threed()
      })

      material = new THREE.MeshLambertMaterial({
        map: texture
      })
    } else {
      material = new THREE.MeshLambertMaterial({
        color: fillStyle
      })
    }

    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = - Math.PI / 2
    mesh.rotation.y = - Math.PI
    mesh.rotation.z = - Math.PI

    this.add( mesh );

    let cx = (left + width / 2) - canvasSize.width / 2
    let cy = (top + height / 2) - canvasSize.height / 2
    let cz = zPos + depth

    // this.add(this.createCube(width, height, depth))
    // let textureBoard = this.createTextureBoard(width, depth)
    // this.add(textureBoard)
    // textureBoard.position.set(0, 0, 0.5 * height)

    this.type = type

    this.position.set(cx, cz, cy)
    this.rotation.y = - rotation

  }

  raycast(raycaster, intersects) {

  }

}

export class Extrude2d extends Polygon {
  is3dish() {
    return true
  }

  get nature() {
    return NATURE
  }
}


Component.register('extrude', Extrude2d)
Component3d.register('extrude', Extrude)
