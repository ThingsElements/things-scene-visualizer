/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export default class Object3D extends THREE.Object3D {
  constructor(model, canvasSize, visualizer) {
    super();

    this._model = model;

    this._visualizer = visualizer;
    this._canvasSize = canvasSize;

    this.createObject();

    this.setPosition();
    this.setRotation();
  }

  get model() {
    return this._model
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

  dispose() {

    this.children.slice().forEach(child => {
      if (child.dispose)
        child.dispose();
      if (child.geometry && child.geometry.dispose)
        child.geometry.dispose();
      if (child.material && child.material.dispose)
        child.material.dispose();
      if (child.texture && child.texture.dispose)
        child.texture.dispose();
      this.remove(child)
    })
  }

  createObject() { }

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

  raycast(raycaster, intersects) { }

}
