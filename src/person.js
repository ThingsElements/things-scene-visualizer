/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'

var extObj
var initDone = false

function init() {
  if (initDone)
    return

  initDone = true

  let tgaLoader = new THREE.TGALoader();

  THREE.Loader.Handlers.add(/\.tga$/i, tgaLoader);

  let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
  let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

  objLoader.setPath('/obj/Casual_Man_02/')
  mtlLoader.setPath('/obj/Casual_Man_02/')

  mtlLoader.load('Casual_Man.mtl', function (materials) {
    materials.preload();
    objLoader.setMaterials(materials)
    materials.side = THREE.frontSide

    objLoader.load('Casual_Man.obj', function (obj) {
      extObj = obj
      if (extObj && extObj.children && extObj.children.length > 0) {
        extObj = extObj.children[0];
      }

      extObj.geometry.center();
    })

  })
}

export default class Person extends Object3D {

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

    if (!Person.extObject) {
      setTimeout(this.createObject.bind(this), 50)
      return;
    }

    this.type = 'person'
    let person = Person.extObject.clone()

    this.add(person)

    width /= 3.7
    height /= 3.7
    depth /= 3.7

    this.scale.set(width, depth, height)
  }

}

scene.Component3d.register('person', Person)
