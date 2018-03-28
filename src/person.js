/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import OBJLoader from 'three-obj-loader'
import MTLLoader from 'three-mtl-loader'

import personMtl from '../obj/Casual_Man_02/Casual_Man.mtl?3d'
import personObj from '../obj/Casual_Man_02/Casual_Man.obj?3d'

var extObj

function init() {
  if (init.done)
    return

  OBJLoader(THREE)

  init.done = true

  // let tgaLoader = new THREE.TGALoader();

  // THREE.Loader.Handlers.add(/\.tga$/i, tgaLoader);

  let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
  let mtlLoader = new MTLLoader(THREE.DefaultLoadingManager);

  mtlLoader.load(personMtl, materials => {
    materials.preload();
    objLoader.setMaterials(materials)
    materials.side = THREE.frontSide

    objLoader.load(personObj, obj => {
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

Component3d.register('person', Person)
