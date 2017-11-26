/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export default class Group3D extends THREE.Group {
  constructor(model, canvasSize) {
    super();

    this._model = model;
    // this.createObject(canvasSize);
  }

  dispose() {

    this.children.slice().forEach(child => {
      if (child.dispose)
        child.dispose();
      if (child.geometry)
        child.geometry.dispose();
      if (child.material)
        child.material.dispose();
      if (child.texture)
        child.texture.dispose();
      this.remove(child)
    })
  }

  createObject(canvasSize) {}

  get model() {
    return this._model
  }
}
