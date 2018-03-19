/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'
import Component3d from './component-3d'

import { Component, Text } from '@hatiolab/things-scene'

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

export default class TextPillar extends Object3D {

  constructor(model, canvasSize, visualizer) {

    super(model);

    this._visualizer = visualizer;
    this._fontLoader = new THREE.FontLoader();

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
      fontSize,
      font3d,
      text,
      color,
      rotation = 0
    } = this.model

    var fontSettings = {
      steps: 1,
      size: fontSize,
      height: depth,
      curveSegments: 8,
      bevelEnabled: false
    };

    // 다각형을 그린다.
    this._fontLoader.load(font3d, (font) => {
      var geometry = new THREE.TextGeometry(text, fontSettings);
      geometry.center();
      var materials = [
        new THREE.MeshLambertMaterial({ color: color, flatShading: true }), // front
        new THREE.MeshLambertMaterial({ color: color }) // side
      ]

      var mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = - Math.PI / 2
      mesh.rotation.y = - Math.PI
      mesh.rotation.z = - Math.PI

      this.add(mesh);


      let cx = (left + width / 2) - canvasSize.width / 2
      let cy = (top + height / 2) - canvasSize.height / 2
      let cz = zPos + depth / 2

      this.type = type

      this.position.set(cx, cz, cy)
      this.rotation.y = - rotation
    })

  }

  createOutline(geometry) {
    var {
      strokeStyle,
      lineWidth
    } = this.model

    var edges = new THREE.EdgesGeometry(geometry);
    var lineMaterial = new THREE.LineDashedMaterial({
      color: strokeStyle,
      linewidth: lineWidth
    });
    var line = new THREE.LineSegments(edges, lineMaterial)

    // lineMaterial.opacity = 0.33;
    lineMaterial.transparent = true;
    lineMaterial.linewidth = lineWidth
    lineMaterial.lineWidth = lineWidth

    line.rotation.x = - Math.PI / 2
    line.rotation.y = - Math.PI
    line.rotation.z = - Math.PI

    return line
  }

  raycast(raycaster, intersects) {

  }

}


Component3d.register('text', TextPillar)
