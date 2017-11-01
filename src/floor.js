/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as BABYLON from 'babylonjs'

export default class Floor {

  constructor(visualizer, model, scene) {
    this._visualizer = visualizer;
    this._model = model;
    this._scene = scene;

    this.createObject(model, scene);
  }

  getAssets(url) {
    var task = this._visualizer.assetsManager.addTextureTask('floor-material task', url)
    task.onSuccess = function (task) {
      this._material.opacityTexture = task.texture;
      this._material.diffuseTexture = task.texture;
    }.bind(this)
  }


  createObject(model, scene) {
    let {
      x, y, z, width, height, depth, rotation, id, fillStyle = '#fff'
    } = model;

    var rgbaRegExp = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/

    this.type = model.type

    this._object = BABYLON.Mesh.CreateGround(id, width, depth, 1, scene);
    this._material = new BABYLON.StandardMaterial('floor-material', scene);


    if (fillStyle.type == 'pattern' && fillStyle.image)
      this.getAssets(this._visualizer.app.url(fillStyle.image))
    else {
      var rgba = {};
      var color;
      var matched = rgbaRegExp.exec(fillStyle);
      if (matched && matched.length > 0) {
        matched = matched.splice(1);
        matched = matched.filter(m => { return !!m })

        if (matched.length === 3)
          color = BABYLON.Color3.FromArray(matched)
        else {
          color = BABYLON.Color4.FromArray(matched)
          this._material.alpha = matched[3];
        }
      } else {
        color = BABYLON.Color3.FromHexString(fillStyle)
      }

      this._material.diffuseColor = color;
    }

    this._object.material = this._material;
    // this._material.

    // this._object.;
  }

}


scene.Component3d.register('floor', Floor)

