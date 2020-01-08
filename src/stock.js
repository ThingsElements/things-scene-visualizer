/*
 * Copyright � HatioLab Inc. All rights reserved.
 */

import * as THREE from 'three'
import Mesh from './mesh'

const STOCK_COLOR = '#ccaa76'
// const STATUS_COLORS = {
//   A: 'black',
//   B: '#ccaa76',
//   C: '#ff1100',
//   D: '#252525',
//   E: '#6ac428'
// }

export default class Stock extends Mesh {
  dispose() {
    super.dispose()

    delete this._visualizer
  }

  getMaterial(index) {
    if (!this.stockMaterials[index]) {
      if (
        !(
          this._visualizer &&
          this._visualizer &&
          this._visualizer.legendTarget &&
          this._visualizer.legendTarget.get('status')
        )
      )
        return this.userDefineDefaultMaterial

      var stockStatus = this._visualizer.legendTarget.get('status')
      var range = stockStatus.ranges[index]

      if (!(range && range.color)) this.stockMaterials[index] = this.userDefineDefaultMaterial

      this.stockMaterials[index] = new THREE.MeshStandardMaterial({
        color: range.color,
        side: THREE.FrontSide,
        roughness: 0.7
      })
    }

    return this.stockMaterials[index]
  }

  static get stockGeometry() {
    if (!Stock._geometry) Stock._geometry = new THREE.BoxBufferGeometry(1, 1, 1)

    return Stock._geometry
  }

  get stockMaterials() {
    if (!this._visualizer._stock_materials) this._visualizer._stock_materials = []

    return this._visualizer._stock_materials
  }

  get userDefineDefaultMaterial() {
    if (!this._visualizer._default_material) {
      if (
        !(
          this._visualizer &&
          this._visualizer &&
          this._visualizer.legendTarget &&
          this._visualizer.legendTarget.get('status')
        )
      )
        return Stock.defaultMaterial

      var stockStatus = this._visualizer.legendTarget.get('status')
      var defaultColor = stockStatus.defaultColor

      if (!defaultColor) return Stock.defaultMaterial

      this._visualizer._default_material = new THREE.MeshStandardMaterial({
        color: defaultColor,
        side: THREE.FrontSide,
        roughness: 0.7
      })
    }

    return this._visualizer._default_material
  }

  get emptyMaterial() {
    var defaultColor = STOCK_COLOR
    if (!this._visualizer._empty_material) {
      if (
        this._visualizer &&
        this._visualizer &&
        this._visualizer.legendTarget &&
        this._visualizer.legendTarget.get('status')
      ) {
        var stockStatus = this._visualizer.legendTarget.get('status')
        defaultColor = stockStatus.defaultColor || STOCK_COLOR
      }

      this._visualizer._empty_material = new THREE.MeshStandardMaterial({
        color: defaultColor
      })
      this._visualizer._empty_material.opacity = 0.33
      this._visualizer._empty_material.transparent = true
    }

    return this._visualizer._empty_material
  }

  static get defaultMaterial() {
    if (!Stock._material_default)
      Stock._material_default = new THREE.MeshStandardMaterial({
        color: STOCK_COLOR,
        side: THREE.FrontSide,
        roughness: 0.7
      })

    return Stock._material_default
  }

  async createObject() {
    var { width, height, depth } = this.model

    this._hideEmptyStock = this._visualizer && this._visualizer.model.hideEmptyStock

    this.createStock(width, height, depth)
  }

  createStock(w, h, d) {
    this.geometry = Stock.stockGeometry
    this.material = this._hideEmptyStock ? this.emptyMaterial : this.userDefineDefaultMaterial
    this.type = 'stock'

    this.scale.set(w, d, h)

    this.receiveShadow = true

    this.castShadow = true
  }

  setOpacity() {}

  onUserDataChanged() {
    super.onUserDataChanged()

    if (
      !(
        this._visualizer &&
        this._visualizer &&
        this._visualizer.legendTarget &&
        this._visualizer.legendTarget.get('status')
      )
    )
      return

    var stockStatus = this._visualizer.legendTarget.get('status')
    var statusField = stockStatus.field
    var ranges = stockStatus.ranges

    if (!(statusField && ranges)) return

    var data = (this.userData.items ? this.userData.items : [this.userData]).slice(0, 1)

    for (let i in data) {
      let d = data[i]

      var status = d[statusField]

      if (status == undefined) {
        // this.visible = !this._hideEmptyStock;
        this.material = this._hideEmptyStock ? this.emptyMaterial : this.userDefineDefaultMaterial
        return
      }

      ranges.some((range, index) => {
        let { min, max } = range

        min = Number(min) || min
        max = Number(max) || max

        if (max > status) {
          if (min !== undefined) {
            if (min <= status) {
              this.material = this.getMaterial(index)
            } else return false
          } else this.material = this.getMaterial(index)

          // this.visible = true;
          return true
        } else {
          this.material = this._hideEmptyStock ? this.emptyMaterial : this.userDefineDefaultMaterial
        }
      })
    }
  }

  // onmousemove(e, visualizer) {

  //   var tooltip = visualizer.tooltip || visualizer._scene2d.getObjectByName("tooltip")

  //   if (tooltip) {
  //     visualizer._scene2d.remove(tooltip)
  //     visualizer.tooltip = null
  //     visualizer.render_threed()
  //   }

  //   if (!this.visible)
  //     return;

  //   if (!this.userData)
  //     this.userData = {};

  //   var tooltipText = '';

  //   for (let key in this.userData) {
  //     // exclude private data
  //     if (/^__/.test(key))
  //       continue;

  //     if (this.userData[key] && typeof this.userData[key] != 'object') {
  //       tooltipText += key + ": " + this.userData[key] + "\n"
  //     }
  //   }

  //   // tooltipText = 'loc : ' + loc

  //   if (tooltipText.length > 0) {
  //     tooltip = visualizer.tooltip = visualizer.makeTextSprite(tooltipText)

  //     var vector = new THREE.Vector3()
  //     var vector2 = new THREE.Vector3()

  //     vector.set(visualizer._mouse.x, visualizer._mouse.y, 0.5)
  //     vector2.set(tooltip.scale.x / 2, - tooltip.scale.y / 2, 0)
  //     //
  //     // vector2.normalize()
  //     //
  //     // vector2.subScalar(0.5)
  //     //
  //     // vector2.y = -vector2.y
  //     // vector2.z = 0

  //     // vector.add(vector2)

  //     vector.unproject(visualizer._2dCamera)
  //     vector.add(vector2)
  //     tooltip.position.set(vector.x, vector.y, vector.z)
  //     tooltip.name = "tooltip"

  //     visualizer._scene2d.add(tooltip)
  //     visualizer._renderer && visualizer._renderer.render(visualizer._scene2d, visualizer._2dCamera)
  //     visualizer.invalidate()
  //   }

  // }

  onBeforeRender() {
    // if (!this._originScale)
    //   this._originScale = this.scale.toArray();

    if (this._focused) {
      var lastTime = performance.now() - this._focusedAt
      var progress = lastTime / 2000

      // if (progress > 1)
      //   progress %= 1

      // var currScale = new THREE.Vector3().fromArray(this._originScale);
      // var total_scale = 0.5;

      // currScale.multiplyScalar(1 + total_scale * progress)

      // this.scale.copy(currScale);
      this.rotation.y = 2 * Math.PI * progress
      this._visualizer.invalidate()
    } else {
      if (this._focusedAt) {
        delete this._focusedAt
        this.rotation.y = 0
        this._visualizer.invalidate()
      }

      // this.scale.fromArray(this._originScale);
    }
  }

  onmouseup(e, visualizer, callback) {
    // var tooltip = visualizer.tooltip || visualizer._scene2d.getObjectByName("tooltip")

    // if (tooltip) {
    //   visualizer._scene2d.remove(tooltip)
    //   visualizer.tooltip = null
    //   visualizer.render_threed()
    // }

    if (!this.visible) return

    if (!this.userData || Object.keys(this.userData).length === 0)
      this.userData = {
        loc: this.name,
        items: [
          {
            loc: this.name
          }
        ]
      }

    if (callback && typeof callback == 'function') {
      var data = Object.assign(
        {
          color: '#' + this.material.color.getHexString()
        },
        this.userData
      )

      callback({
        data: data,
        location: 'right-top'
      })
    }

    // var tooltipText = '';

    // for (let key in this.userData) {
    //   // exclude private data
    //   if (/^__/.test(key))
    //     continue;

    //   if (this.userData[key] && typeof this.userData[key] != 'object') {
    //     tooltipText += key + ": " + this.userData[key] + "\n"
    //   }
    // }

    // // tooltipText = 'loc : ' + loc

    // if (tooltipText.length > 0) {
    //   tooltip = visualizer.tooltip = visualizer.makeTextSprite(tooltipText)

    //   var vector = new THREE.Vector3()
    //   var vector2 = new THREE.Vector3()

    //   vector.set(visualizer._mouse.x, visualizer._mouse.y, 0.5)
    //   vector2.set(tooltip.scale.x / 2, - tooltip.scale.y / 2, 0)
    //   //
    //   // vector2.normalize()
    //   //
    //   // vector2.subScalar(0.5)
    //   //
    //   // vector2.y = -vector2.y
    //   // vector2.z = 0

    //   // vector.add(vector2)

    //   vector.unproject(visualizer._2dCamera)
    //   vector.add(vector2)
    //   tooltip.position.set(vector.x, vector.y, vector.z)
    //   tooltip.name = "tooltip"

    //   visualizer._scene2d.add(tooltip)
    //   visualizer._renderer && visualizer._renderer.render(visualizer._scene2d, visualizer._2dCamera)
    //   visualizer.invalidate()
    // }
  }
}
