/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as THREE from 'three'
import Component3d from './component-3d'

export default class Group3D extends THREE.Group {
  constructor(model, canvasSize, visualizer) {
    super()

    this._model = model
    this._visualizer = visualizer
    // this.createObject(canvasSize);
    // this.createChildrenObject(canvasSize);
    // this.createObject(canvasSize);
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

async createObject(canvasSize) {
    var { left = 0, top = 0, width = 0, height = 0 } = this.model

    let cx = left + width / 2 - canvasSize.width / 2
    let cy = top + height / 2 - canvasSize.height / 2
    // let cz = this.model.rx

    this.position.x = cx
    this.position.z = cy
  }

  createChildrenObject(canvasSize) {
    var { components } = this._model

    components.forEach(component => {
      var clazz = Component3d.register(component.type)
      if (!clazz) {
        console.warn('Class not found : 3d class is not exist')
        return
      }

      var item = new clazz(component, canvasSize, this._visualizer)
      if (item) {
        item.name = component.id
        this.add(item)
        // this.putObject(component.model.id, item);
      }
    })
  }

  get model() {
    return this._model
  }
}

Component3d.register('group', Group3D)
