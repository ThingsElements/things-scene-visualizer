/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var {
  Component3d
} = scene

const STATUS_COLORS = ['#6666ff', '#ccccff', '#ffcccc', '#cc3300']

export default class Beacon3D extends Object3D {

  constructor(model, canvasSize, visualizer) {

    super(model);

    this._visualizer = visualizer

    this.createObject(canvasSize);

  }

  createObject(canvasSize) {
    var {
      left,
      top,
      width,
      height,
      rotation = 0,
      zPos,
      location,
    } = this.model

    var rx = Math.min(width, height);

    var cx = (left) - canvasSize.width / 2
    var cy = (top) - canvasSize.height / 2
    var cz = (zPos || 0) + (rx / 2)

    this.type = 'beacon'

    if (location)
      this.name = location


    for (var i = 0; i < 3; i++) {
      let mesh = this.createSensor(rx * (1 + 0.5 * i) / 2, i)
      mesh.material.opacity = 0.5 - (i * 0.15)
    }


    this.position.set(cx, cz, cy)
    this.rotation.y = rotation

  }

  createSensor(w, i) {

    var isFirst = i === 0

    let geometry = new THREE.SphereBufferGeometry(w, 32, 32);
    var material
    if (isFirst) {
      material = new THREE.MeshLambertMaterial({ color: '#57a1d6', side: THREE.FrontSide });
    } else {
      material = new THREE.MeshBasicMaterial({ color: '#57a1d6', side: THREE.FrontSide, wireframe: true, wireframeLinewidth: 1 });
    }

    var mesh = new THREE.Mesh(geometry, material)
    mesh.material.transparent = true;

    this.add(mesh);

    return mesh

  }

}

Component3d.register('beacon', Beacon3D)
