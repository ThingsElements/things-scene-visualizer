/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var { Component } = scene

export default class Plane extends THREE.Mesh {

  constructor(model, canvasSize) {

    super();

    this._model = model;

    this.createObject(model, canvasSize);

  }

  createObject(model, canvasSize) {

    this.createPlane(model.width, model.height, model.fillStyle)

    let cx = (model.left + (model.width / 2)) - canvasSize.width / 2
    let cy = (model.top + (model.height / 2)) - canvasSize.height / 2

    this.position.x = cx;
    this.position.z = cy;

  }

  createPlane(w, h, fillStyle) {

    this.geometry = new THREE.PlaneBufferGeometry(w, h);
    if (fillStyle && fillStyle.type == 'pattern' && fillStyle.image) {
      var texture = new THREE.TextureLoader().load(fillStyle.image)
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(1, 1)
      this.material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
    } else {
      this.material = new THREE.MeshBasicMaterial({ color: fillStyle || '#ccaa76', side: THREE.FrontSide });
    }

    this.rotation.x = - Math.PI / 2
    this.type = 'rect'

  }

}

scene.Component3d.register('rect', Plane)
