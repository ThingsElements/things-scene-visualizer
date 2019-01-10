/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Object3D from './object3d'
import Component3d from './component-3d'

const forkLiftModel = 'ForkLift.dae'
// import forkLiftModel from '../obj/Forklift/ForkLift.dae?3d'

import path from 'path'
const forkLiftPath = path.resolve('../obj/Forklift')

import * as THREE from 'three'
import ColladaLoader from 'three-dlc/src/loaders/ColladaLoader'

export default class ForkLift extends Object3D {
  static get threedObjectLoader() {
    if (!ForkLift._threedObjectLoader) {
      ForkLift._threedObjectLoader = new Promise((resolve, reject) => {
        let colladaLoader = new ColladaLoader(THREE.DefaultLoadingManager)

        colladaLoader.setPath(`${forkLiftPath}/`)

        colladaLoader.load(forkLiftModel, collada => {
          var scene = collada.scene
          var extObj = scene

          resolve(extObj)
        })
      })
    }

    return ForkLift._threedObjectLoader
  }

  createObject() {
    ForkLift.threedObjectLoader.then(this.addObject.bind(this))
  }

  addObject(extObject) {
    var { width, height, depth } = this.model

    this.type = 'forklift'

    var object = extObject.clone()
    object.rotation.z = -Math.PI / 2

    var boundingBox = new THREE.Box3().setFromObject(object)
    var center = boundingBox.getCenter(object.position)
    var size = boundingBox.getSize(new THREE.Vector3())

    center.multiplyScalar(-1)

    object.updateMatrix()

    this.add(object)
    this.scale.set(width / size.x, depth / size.y, height / size.z)
  }
}
Component3d.register('forklift', ForkLift)
