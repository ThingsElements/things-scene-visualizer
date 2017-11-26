/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

export default class Mesh extends THREE.Mesh {
  constructor(model) {
    super();

    this._model = model;
  }

  dispose() {}

  get model() {
    return this._model
  }
}
