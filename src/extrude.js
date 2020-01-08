/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as THREE from 'three'
import tinycolor from 'tinycolor2'
import BoundingUVGenerator from './bounding-uv-generator'
import Object3D from './object3d'

export default class Extrude extends Object3D {
  get shape() {
    // console.warn('shape ')
    return null
  }

  get sideShape() {
    return null
  }

  get extrudeSettings() {
    var { depth = 1 } = this.model

    return {
      steps: 1,
      depth: depth,
      bevelEnabled: false,
      UVGenerator: this.boundingUVGenerator
    }
  }

  get boundingUVGenerator() {
    if (!this._boundingUVGenerator) this._boundingUVGenerator = new BoundingUVGenerator()

    return this._boundingUVGenerator
  }

async createObject() {
    var { fillStyle = 0xffffff, strokeStyle = 0x636363, lineWidth = 1, alpha = 1 } = this.model

    // 다각형 그리기
    var shape = this.shape
    if (!shape) return

    var extrudeSettings = this.extrudeSettings
    var boundingUVGenerator = this.boundingUVGenerator

    if (boundingUVGenerator) {
      boundingUVGenerator.setShape({
        extrudedShape: shape,
        extrudedOptions: extrudeSettings
      })
    }

    var geometry = this.createGeometry(shape, extrudeSettings)
    var material = this.createMaterial()

    if (fillStyle && fillStyle != 'none') {
      var mesh = this.createMesh(geometry, material)
      this.add(mesh)
    }

    if (strokeStyle && strokeStyle != 'transparent' && lineWidth > 0) {
      var sideMesh = this.createSideMesh(geometry, shape, extrudeSettings)
      this.add(sideMesh)
    }
  }

  createGeometry(shape, extrudeSettings) {
    var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings)
    geometry.center()

    return geometry
  }

  createMaterial() {
    var { fillStyle, alpha = 1 } = this.model

    var material
    if (fillStyle.type == 'pattern' && fillStyle.image) {
      var texture = this._visualizer._textureLoader.load(this._visualizer.app.url(fillStyle.image), texture => {
        texture.minFilter = THREE.LinearFilter
        this._visualizer.render_threed()
      })

      material = [
        new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide
        }),
        new THREE.MeshStandardMaterial({
          color: fillStyle,
          side: THREE.DoubleSide
        })
      ]
    } else {
      material = new THREE.MeshStandardMaterial({
        color: fillStyle
      })
    }

    var tinyFillStyle = tinycolor(fillStyle)
    var fillAlpha = tinyFillStyle.getAlpha()
    material.opacity = alpha * fillAlpha
    material.transparent = alpha < 1 || fillAlpha < 1

    return material
  }

  createMesh(geometry, material) {
    var mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.rotation.y = -Math.PI
    mesh.rotation.z = -Math.PI

    return mesh
  }

  createSideMesh(geometry, shape) {
    var { strokeStyle = 0x000000, depth = 0, lineWidth = 0, alpha = 1 } = this.model

    var hole = new THREE.Path()
    hole.setFromPoints(shape.getPoints())

    var sideMaterial = new THREE.MeshStandardMaterial({
      color: strokeStyle
    })

    var tinyStrokeStyle = tinycolor(strokeStyle)
    var strokeAlpha = tinyStrokeStyle.getAlpha()
    sideMaterial.opacity = alpha * strokeAlpha
    sideMaterial.transparent = alpha < 1 || strokeAlpha < 1

    // prevent overlapped layers flickering
    sideMaterial.polygonOffset = true
    sideMaterial.polygonOffsetFactor = -0.1

    shape = this.sideShape || shape
    shape.holes.push(hole)

    var sideExtrudeSettings = {
      steps: 1,
      depth,
      bevelEnabled: true,
      bevelThickness: 0,
      bevelSize: lineWidth,
      bevelSizeSegments: 5
    }

    var sideGeometry = new THREE.ExtrudeBufferGeometry(shape, sideExtrudeSettings)
    sideGeometry.center()

    var sideMesh = new THREE.Mesh(sideGeometry, sideMaterial)
    sideMesh.rotation.x = -Math.PI / 2
    sideMesh.rotation.y = -Math.PI
    sideMesh.rotation.z = -Math.PI

    return sideMesh
  }

  raycast(raycaster, intersects) {}
}
