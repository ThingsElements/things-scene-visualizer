/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as THREE from 'three'
export default class Object3D extends THREE.Object3D {
  constructor(model, canvasSize, visualizer) {
    super()

    this._model = model

    this._visualizer = visualizer
    this._canvasSize = canvasSize

    this.name = this.model.id

    this._initializeComplete = new Promise(resolve => {
      this.initialize(resolve)
    })
  }

  async initialize(resolve) {
    await this.createObject()

    this.setPosition()
    this.setRotation()
    this.setOpacity()

    resolve()
  }

  get initializeComplete() {
    return this._initializeComplete
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
      var { left = 0, width = 0 } = this.model
      var canvasSize = this._canvasSize

      this._cx = left + width / 2 - canvasSize.width / 2
    }
    return this._cx
  }

  get cy() {
    if (!this._cy) {
      var { top = 0, height = 0 } = this.model
      var canvasSize = this._canvasSize

      this._cy = top + height / 2 - canvasSize.height / 2
    }
    return this._cy
  }

  get cz() {
    if (!this._cz) {
      var { zPos = 0, depth = 1 } = this.model

      this._cz = zPos + depth / 2
    }

    return this._cz
  }

  dispose() {
    this.children.slice().forEach(child => {
      if (child.dispose) child.dispose()
      if (child.geometry && child.geometry.dispose) child.geometry.dispose()
      if (child.material && child.material.dispose) child.material.dispose()
      if (child.texture && child.texture.dispose) child.texture.dispose()
      this.remove(child)
    })
  }

  onBeforeRender() {
    super.onBeforeRender()
  }

  async createObject() {}

  setPosition() {
    this.position.set(this.cx, this.cz, this.cy)
  }

  setRotation() {
    var { rotationX = 0, rotationY = 0, rotation = 0 } = this.model

    this.rotation.x = -rotationX
    this.rotation.y = -rotation
    this.rotation.z = -rotationY
  }

  setOpacity() {
    var { alpha } = this.model

    alpha = alpha == undefined ? 1 : alpha

    this.traverse(o => {
      var materials = o.material
      if (!o.material) return

      if (!Array.isArray(materials)) materials = [materials]

      materials.forEach(m => {
        m.opacity *= alpha
        m.transparent = alpha < 1
      })
    })
  }

  onUserDataChanged() {
    if (!this.userData) return

    if (this.userData.hasOwnProperty('position')) {
      if (!this._visualizer) return

      this._setPosition(this._visualizer.transcoord2dTo3d(this.userData.position))
    }

    if (this.userData.hasOwnProperty('euler')) {
      this._setEuler({
        yaw: this.userData.euler.yaw,
        pitch: this.userData.euler.pitch,
        roll: this.userData.euler.roll
      })
    }

    if (this.userData.hasOwnProperty('quaternion')) {
      this._setQuaternion({
        x: this.userData.quaternion.qx,
        y: this.userData.quaternion.qy,
        z: this.userData.quaternion.qz,
        w: this.userData.quaternion.qw
      })
    }
  }

  _setPosition(location) {
    var { x, y } = location

    var index = this._visualizer.mixers.indexOf(this._mixer)
    if (index >= 0) {
      this._visualizer.mixers.splice(index, 1)
    }

    this._mixer = new THREE.AnimationMixer(this)
    this._visualizer.mixers.push(this._mixer)

    var positionKF = new THREE.VectorKeyframeTrack(
      '.position',
      [0, 1],
      [this.position.x, this.position.y, this.position.z, x, this.position.y, y]
    )
    var clip = new THREE.AnimationClip('Move', 2, [positionKF])

    // create a ClipAction and set it to play
    var clipAction = this._mixer.clipAction(clip)
    clipAction.clampWhenFinished = true
    clipAction.loop = THREE.LoopOnce
    clipAction.play()
  }

  _setQuaternion(quaternion) {
    var { x, y, z, w } = quaternion

    // var euler = new THREE.Euler();

    // // var currentRotation = this.rotation;

    // // console.log(currentRotation)

    var q = new THREE.Quaternion()

    q.set(x, y, z, w)

    // euler.setFromQuaternion(q, 'ZYX');

    // // euler.z -= Math.PI / 2;
    // euler.z -= Math.PI / 2;

    // var mat = new THREE.Matrix4();
    // mat.makeRotationFromQuaternion(q);
    // mat.transpose();

    // q.setFromRotationMatrix(mat);

    // this.setRotationFromEuler(euler);

    this.setRotationFromQuaternion(q)
    this.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI)
    this.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI)
    this.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2)
    // this.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI);
    // this.updateMatrix()
  }

  _setEuler(euler) {
    var { yaw, pitch, roll } = euler
    var e = new THREE.Euler()

    e.set(yaw, pitch, roll, 'ZYX')

    this.setRotationFromEuler(e)
  }
}
