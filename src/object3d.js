/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as THREE from 'three'
export default class Object3D extends THREE.Object3D {
  constructor(model, canvasSize, visualizer) {
    super();

    this._model = model;

    this._visualizer = visualizer;
    this._canvasSize = canvasSize;

    this.name = this.model.id;

    this.createObject();

    this.setPosition();
    this.setRotation();
    this.setOpacity();
  }

  get model() {
    return this._model
  }

  get type() {
    return this.model.type || this._type
  }
  set type(type) {
    this._type = type
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

    this._visualizer = visualizer;
    this._canvasSize = canvasSize;

    this.createObject();

  onBeforeRender() {
    super.onBeforeRender();
  }

  createObject() { }

  setPosition() {
    this.position.set(this.cx, this.cz, this.cy)
  }

  setRotation() {
    var {
      rotationX = 0,
      rotationY = 0,
      rotation = 0
    } = this.model

    this.rotation.x = - rotationX;
    this.rotation.y = - rotation;
    this.rotation.z = - rotationY;
  }

  setOpacity() {
    var {
      alpha
    } = this.model

    alpha = alpha == undefined ? 1 : alpha;

    this.traverse(o => {
      var materials = o.material;
      if(!o.material)
        return;

      if(!Array.isArray(materials))
        materials = [materials];

      materials.forEach(m => {
        m.opacity *= alpha
        m.transparent = alpha < 1
      })
    })
  }

  onUserDataChanged() {
    if (!this.userData)
      return

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

  get type() {
    return this.model.type || this._type
  }
  set type(type) {
    this._type = type
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
      rotationY = 0,
      rotation = 0
    } = this.model

    this.rotation.x = - rotationX;
    this.rotation.y = - rotation;
    this.rotation.z = - rotationY;
  }

  raycast(raycaster, intersects) { }

}
