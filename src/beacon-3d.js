/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var {
  Component3d
} = scene

const STATUS_COLORS = ['#6666ff', '#ccccff', '#ffcccc', '#cc3300']

export default class Beacon3D extends THREE.Object3D {

  constructor(model, canvasSize, visualizer) {

    super();

    this._model = model;
    this._visualizer = visualizer

    this.createObject(model, canvasSize);

  }

  createObject(model, canvasSize) {

    let rx = Math.min(model.width, model.height);

    let cx = (model.left) - canvasSize.width / 2
    let cy = (model.top) - canvasSize.height / 2
    let cz = (model.zPos || 0) + (rx / 2)

    let rotation = model.rotation

    this.type = 'beacon'

    if (model.location)
      this.name = model.location


    for (var i = 0; i < 3; i++) {
      let mesh = this.createSensor(rx * (1 + 0.5 * i) / 2, i)
      mesh.material.opacity = 0.5 - (i * 0.15)
    }


    this.position.set(cx, cz, cy)
    this.rotation.y = rotation || 0

  }

  createSensor(w, i) {

    var isFirst = i === 0

    let geometry = new THREE.SphereGeometry(w, 32, 32);
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
