/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'
import Component3d from './component-3d'

import { Component, Rect } from '@hatiolab/things-scene'

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

export default class RectPillar extends Object3D {

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
      strokeStyle = 0x636363,
      lineWidth = 1,
      lineDash = 'solid',
      round = 0
    } = this.model

    // 다각형을 그린다.

    // 박스 그리기
    var shape = new THREE.Shape();

    if (round > 0) {
      var radius = round //(round / 100) * (width / 2)

      shape.moveTo(radius, 0);
      shape.lineTo(width - radius, 0);
      shape.quadraticCurveTo(width, 0, width, radius);
      shape.lineTo(width, height - radius);
      shape.quadraticCurveTo(width, height, width - radius, height);
      shape.lineTo(radius, height);
      shape.quadraticCurveTo(0, height, 0, height - radius);
      shape.lineTo(0, radius);
      shape.quadraticCurveTo(0, 0, radius, 0);
    } else {
      shape.moveTo(0, 0);
      shape.lineTo(width, 0);
      shape.lineTo(width, height);
      shape.lineTo(0, height);
      shape.lineTo(0, 0);
    }
    // shape.moveTo(round, 0);
    // shape.bezierCurveTo(width, 0, width, height, round, round);
    // shape.bezierCurveTo(width, height, 0, height, round, round);
    // shape.bezierCurveTo(0, height, 0, 0, round, round);
    // shape.bezierCurveTo(0, 0, width, 0, round, round);

    var extrudeSettings = {
      steps: 1,
      amount: depth,
      bevelEnabled: false
    };

    // var points = shape.getPoints();

    // var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    geometry.center();

    var edges = new THREE.EdgesGeometry(geometry);
    var line = new THREE.LineSegments(edges, new THREE.LineDashedMaterial({
      color: strokeStyle,
      linewidth: lineWidth
    }))

    line.rotation.x = - Math.PI / 2
    line.rotation.y = - Math.PI
    line.rotation.z = - Math.PI

    var material;

    if (fillStyle.type == 'pattern' && fillStyle.image) {

      var texture = this._visualizer._textureLoader.load(this._visualizer.app.url(fillStyle.image), function (texture) {
        texture.minFilter = THREE.LinearFilter
        this._visualizer.render_threed()
      }.bind(this))

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
    this.add( line );

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


Component3d.register('rect', RectPillar)
