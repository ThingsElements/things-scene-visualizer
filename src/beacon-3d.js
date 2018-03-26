/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

const STATUS_COLORS = ['#6666ff', '#ccccff', '#ffcccc', '#cc3300']

export default class Beacon3D extends Object3D {

  get cz() {
    var {
      width = 0,
      height = 0,
      zPos = 0
    } = this.model

    if (!this._cz) {
      var rx = Math.min(width, height);
      this._cz = zPos + rx
    }

    return this._cz;
  }

  createObject() {
    var {
      width,
      height,
      location,
    } = this.model

    var rx = Math.min(width, height);

    if (location)
      this.name = location


    for (var i = 0; i < 3; i++) {
      let mesh = this.createSensor(rx * (1 + 0.5 * i) / 2, i)
      mesh.material.opacity = 0.5 - (i * 0.15)
    }

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
