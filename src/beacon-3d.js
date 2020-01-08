/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as THREE from 'three'
import Component3d from './component-3d'
import Object3D from './object3d'

export default class Beacon3D extends Object3D {
  get cz() {
    var { width = 0, height = 0, zPos = 0 } = this.model

    if (!this._cz) {
      var rx = Math.min(width, height)
      this._cz = zPos + rx
    }

    return this._cz
  }

  async createObject() {
    var { width, height, location } = this.model

    var rx = Math.min(width, height)

    if (location) this.name = location

    for (var i = 0; i < 3; i++) {
      let mesh = this.createSensor((rx * (1 + 0.5 * i)) / 2, i)
      mesh.material.opacity = 0.5 - i * 0.15
    }
  }

  createSensor(w, i) {
    var isFirst = i === 0

    let geometry = new THREE.SphereBufferGeometry(w, 32, 32)
    var material
    if (isFirst) {
      material = new THREE.MeshStandardMaterial({
        color: '#57a1d6',
        side: THREE.FrontSide
      })
    } else {
      material = new THREE.MeshStandardMaterial({
        color: '#57a1d6',
        side: THREE.FrontSide,
        wireframe: true,
        wireframeLinewidth: 1
      })
    }

    var mesh = new THREE.Mesh(geometry, material)
    mesh.material.transparent = true

    this.add(mesh)

    return mesh
  }
}

Component3d.register('beacon', Beacon3D)
