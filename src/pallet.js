/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var extObj
var initDone = false

var {
  RectPath,
  Shape,
  Component,
  Component3d
} = scene

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]
}

function init() {
  if (initDone)
    return

  initDone = true

  let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
  let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

  mtlLoader.load('/obj/pallet/pallet4.mtl', function (materials) {
    materials.preload();
    objLoader.setMaterials(materials)
    if(materials && materials.length > 0) {
      materials.forEach(m => {
        m.transparent = true;
      })
    }

    objLoader.load('/obj/pallet/pallet4.obj', function (obj) {
      extObj = obj
      var newObj = new Mesh()

      // if (extObj && extObj.children && extObj.children.length > 0) {
      //   extObj = extObj.children[0];
      // }

      extObj.geometry.center();
    })
  })
}

export default class Pallet extends Object3D {
  static get extObject() {
    if (!extObj)
      init()

    return extObj
  }

  createObject() {

    var {
      width,
      height,
      depth
    } = this.model

    if (!Pallet.extObject) {
      setTimeout(this.createObject.bind(this), 50)
      return;
    }

    this.type = 'pallet'

    width /= 2
    height /= 2
    depth /= 2

    this.add(Pallet.extObject.clone())
    this.scale.set(width, depth, height)

  }

}

export class Pallet2d extends RectPath(Shape) {
  is3dish() {
    return true
  }

  get controls() { }

  get nature() {
    return NATURE
  }
}

Component.register('pallet', Pallet2d)
Component3d.register('pallet', Pallet)
