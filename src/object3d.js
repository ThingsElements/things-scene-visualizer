/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
export default class Object3D extends THREE.Object3D {
  constructor(model, canvasSize) {
    super();

    this._model = model;
    // this.createObject(canvasSize);
  }

  dispose() {

    this.children.slice().forEach(child => {
      if (child.dispose)
        child.dispose();
      if (child.geometry && child.geometry.dispose)
        child.geometry.dispose();
      if (child.material && child.material.dispose)
        child.material.dispose();
      if (child.texture && child.texture.dispose)
        child.texture.dispose();
      this.remove(child)
    })
  }

  createObject(canvasSize) { }

  get model() {
    return this._model
  }

  get type() {
    return this.model.type || this._type
  }
  set type(type) {
    this._type = type
  }

  onUserDataChanged() {
    if (!this.userData)
      return

    if (this.userData.hasOwnProperty('position')) {
      if (!this._visualizer)
        return

      this._setPosition(this._visualizer.transcoord2dTo3d(this.userData.position));
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
    var { x, y } = location;

    var index = this._visualizer.mixers.indexOf(this._mixer);
    if (index >= 0) {
      this._visualizer.mixers.splice(index, 1);
    }

    this._mixer = new THREE.AnimationMixer(this);
    this._visualizer.mixers.push(this._mixer);

    var positionKF = new THREE.VectorKeyframeTrack('.position', [0, 1], [this.position.x, this.position.y, this.position.z, x, this.position.y, y]);
    var clip = new THREE.AnimationClip('Move', 2, [positionKF]);

    // create a ClipAction and set it to play
    var clipAction = this._mixer.clipAction(clip);
    clipAction.clampWhenFinished = true;
    clipAction.loop = THREE.LoopOnce;
    clipAction.play();
  }

  _setQuaternion(quaternion) {
    var { x, y, z, w } = quaternion

    // var euler = new THREE.Euler();

    // // var currentRotation = this.rotation;

    // // console.log(currentRotation)

    var q = new THREE.Quaternion();

    q.set(x, y, z, w);

    // euler.setFromQuaternion(q, 'ZYX');

    // // euler.z -= Math.PI / 2;
    // euler.z -= Math.PI / 2;

    // var mat = new THREE.Matrix4();
    // mat.makeRotationFromQuaternion(q);
    // mat.transpose();

    // q.setFromRotationMatrix(mat);

    // this.setRotationFromEuler(euler);

    this.setRotationFromQuaternion(q)
    this.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI);
    this.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
    this.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
    // this.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI);
    // this.updateMatrix()
  }

  _setEuler(euler) {
    var { yaw, pitch, roll } = euler
    var e = new THREE.Euler();

    e.set(yaw, pitch, roll, 'ZYX');

    this.setRotationFromEuler(e);
  }

}
