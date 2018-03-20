/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import tinycolor from 'tinycolor2'

import BoundingUVGenerator from './bounding-uv-generator'

export default class Extrude extends Object3D {

  constructor(model, canvasSize, visualizer) {

    super(model);

    this._visualizer = visualizer;
    this._canvasSize = canvasSize;

    this.createObject(canvasSize);

    this.setPosition();
    this.setRotation();

  }

  get cx() {
    if (!this._cx) {
      var {
        left = 0,
        width = 0
      } = this.model
      var canvasSize = this._canvasSize;

      this._cx = (left + width / 2) - canvasSize.width / 2
    }
    return this._cx
  }

  get cy() {
    if (!this._cy) {
      var {
        top = 0,
        height = 0
      } = this.model
      var canvasSize = this._canvasSize;

      this._cy = (top + height / 2) - canvasSize.height / 2
    }
    return this._cy
  }

  get cz() {
    if (!this._cz) {
      var {
        zPos = 0,
        depth = 1
      } = this.model

      this._cz = zPos + depth / 2
    }

    return this._cz
  }

  get shape() {
    // console.warn('shape ')
    return null
  }

  get extrudeSettings() {
    var { depth = 1 } = this.model;

    return {
      steps: 1,
      amount: depth,
      bevelEnabled: false
    };
  }

  get boundingUVGenerator() {
    if (!this._boundingUVGenerator)
      this._boundingUVGenerator = new BoundingUVGenerator();

    return this._boundingUVGenerator
  }

  createObject() {
    var {
      fillStyle = 0xffffff,
      strokeStyle = 0x636363,
      lineWidth = 1,
      alpha = 1,
    } = this.model

    // 다각형 그리기
    var shape = this.shape;
    if (!shape)
      return

    var extrudeSettings = this.extrudeSettings;

    var boundingUVGenerator = this.boundingUVGenerator;

    if (boundingUVGenerator) {
      boundingUVGenerator.setShape({
        extrudedShape: shape,
        extrudedOptions: extrudeSettings
      })
    }

    var geometry = this.createGeometry(shape, extrudeSettings);

    var material = this.createMaterial();

    if (fillStyle && fillStyle != 'none') {
      var mesh = this.createMesh(geometry, material);
      this.add(mesh);
    }

    if (strokeStyle && strokeStyle != 'transparent' && lineWidth > 0) {
      var sideMesh = this.createSideMesh(geometry, shape, extrudeSettings)
      this.add(sideMesh)
    }

    this.opacity = alpha
  }

  createGeometry(shape, extrudeSettings) {
    var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    geometry.center();

    return geometry
  }

  createMaterial() {
    var {
      fillStyle
    } = this.model

    var material;

    if (fillStyle.type == 'pattern' && fillStyle.image) {

      var texture = this._visualizer._textureLoader.load(this._visualizer.app.url(fillStyle.image), texture => {
        texture.minFilter = THREE.LinearFilter
        this._visualizer.render_threed()
      })

      material = [
        new THREE.MeshLambertMaterial({
          map: texture,
          side: THREE.DoubleSide
        }),
        new THREE.MeshLambertMaterial({
          color: fillStyle,
          side: THREE.DoubleSide
        })
      ]
    } else {
      material = new THREE.MeshLambertMaterial({
        color: fillStyle,
        transparent: true
      })
    }

    material.transparent = true;
    material.visible = fillStyle && fillStyle != 'none';

    return material;
  }

  createMesh(geometry, material) {
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = - Math.PI / 2
    mesh.rotation.y = - Math.PI
    mesh.rotation.z = - Math.PI

    return mesh
  }

  createSideMesh(geometry, shape) {
    var {
      strokeStyle = 0x000000,
      depth = 0,
      lineWidth = 0
    } = this.model

    var hole = new THREE.Path();
    hole.setFromPoints(shape.getPoints());

    var sideMaterial = new THREE.MeshLambertMaterial({
      color: strokeStyle,
      transparent: true
    })

    var tinyStrokeStyle = tinycolor(strokeStyle);
    var strokeAlpha = tinyStrokeStyle.getAlpha();
    sideMaterial.opacity = strokeAlpha;

    // prevent overlapped layers flickering
    sideMaterial.polygonOffset = true;
    sideMaterial.polygonOffsetFactor = -0.1;

    shape.holes.push(hole);

    var sideExtrudeSettings = {
      steps: 1,
      amount: depth,
      bevelEnabled: true,
      bevelThickness: 0,
      bevelSize: lineWidth,
      bevelSizeSegments: 5
    };

    var sideGeometry = new THREE.ExtrudeBufferGeometry(shape, sideExtrudeSettings);
    sideGeometry.center();

    var sideMesh = new THREE.Mesh(sideGeometry, sideMaterial);
    sideMesh.rotation.x = - Math.PI / 2
    sideMesh.rotation.y = - Math.PI
    sideMesh.rotation.z = - Math.PI

    return sideMesh
  }

  setPosition() {
    this.position.set(this.cx, this.cz, this.cy)
  }

  setRotation() {
    var {
      rotationX = 0,
      rotation = 0,
      rotationZ = 0
    } = this.model

    this.rotation.x = - rotationX;
    this.rotation.y = - rotation;
    this.rotation.z = - rotationZ;
  }

  raycast(raycaster, intersects) {

  }
}
