/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

import path from 'path'
const personPath = path.resolve('../obj/Casual_Man_02')

import * as THREE from 'three'
import OBJLoader from 'three-dlc/src/loaders/OBJLoader'
import MTLLoader from 'three-dlc/src/loaders/MTLLoader'

export default class Person extends Object3D {
  static get threedObjectLoader() {
    if (!Person._threedObjectLoader) {
      Person._threedObjectLoader = new Promise((resolve, reject) => {
        let objLoader = new OBJLoader(THREE.DefaultLoadingManager)
        let mtlLoader = new MTLLoader(THREE.DefaultLoadingManager)

        objLoader.setPath(`${personPath}/`)
        mtlLoader.setPath(`${personPath}/`)

        mtlLoader.load('Casual_Man.mtl', materials => {
          materials.preload()
          objLoader.setMaterials(materials)

          objLoader.load('Casual_Man.obj', obj => {
            var extObj = obj
            if (extObj && extObj.children && extObj.children.length > 0) {
              extObj = extObj.children[0]
            }

            extObj.geometry.center()
            resolve(obj)
          })
        })
      })
    }

    return Person._threedObjectLoader
  }

  createObject() {
    Person.threedObjectLoader.then(this.addObject.bind(this))
  }

  addObject(extObject) {
    var { width, height, depth } = this.model

    this.type = 'person'
    let object = extObject.clone()
    this.add(object)

    width /= 3.7
    height /= 3.7
    depth /= 3.7

    this.scale.set(width, depth, height)
  }
}

Component3d.register('person', Person)
