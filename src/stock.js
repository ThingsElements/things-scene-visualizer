/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
const STOCK_COLOR = '#ccaa76'
// const STATUS_COLORS = {
//   A: 'black',
//   B: '#ccaa76',
//   C: '#ff1100',
//   D: '#252525',
//   E: '#6ac428'
// }

export default class Stock extends THREE.Mesh {

  constructor(model, visualizer) {

    super();

    this._visualizer = visualizer;
    this._model = model;

    this.createObject(model);

  }

  getMaterial(index) {
    if (!this.stockMaterials[index]) {
      if (!(this._visualizer && this._visualizer._stockStatus))
        return Stock.defaultMaterial;

      var stockStatus = this._visualizer._stockStatus;
      var range = stockStatus.ranges[index];

      if (!(range && range.color))
        this.stockMaterials[index] = Stock.defaultMaterial;

      this.stockMaterials[index] = new THREE.MeshLambertMaterial({
        color: range.color,
        side: THREE.FrontSide
      })
    }

    return this.stockMaterials[index];
  }

  get stockMaterials() {
    if (!this._visualizer._stock_materials)
      this._visualizer._stock_materials = [];

    return this._visualizer._stock_materials
  }

  static get defaultMaterial() {
    if (!Stock._material_default)
      Stock._material_default = new THREE.MeshLambertMaterial({
        color: STOCK_COLOR,
        side: THREE.FrontSide
      })

    return Stock._material_default
  }

  createObject(model) {

    this.createStock(model.width, model.height, model.depth)

  }

  createStock(w, h, d) {

    this.geometry = new THREE.BoxBufferGeometry(w, d, h);
    this.material = Stock.defaultMaterial;
    this.type = 'stock'

    // this.visible = false

    // this.castShadow = true

  }

  get model() {
    return this._model
  }

  onUserDataChanged() {
    super.onUserDataChanged();

    if (!(this._visualizer && this._visualizer._stockStatus))
      return

    var stockStatus = this._visualizer._stockStatus;
    var statusField = stockStatus.field;
    var ranges = stockStatus.ranges

    if (!(statusField && ranges))
      return

    ranges.some((range, index) => {
      let {
        min,
        max
      } = range

      var status = this.userData[statusField];

      if (max > status) {
        if (min !== undefined) {
          if (min <= status) {
            this.material = this.getMaterial(index)
          }
        } else
          this.material = this.getMaterial(index)

        return true;
      }
    })
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

  onclick(e, visualizer) {


    var tooltip = visualizer.tooltip || visualizer._scene2d.getObjectByName("tooltip")

        if (tooltip) {
          visualizer._scene2d.remove(tooltip)
          visualizer.tooltip = null
          visualizer.render_threed()
        }

        if (!this.visible)
          return;

        if (!this.userData || Object.keys(this.userData).length === 0)
          this.userData = {
            location: this.name
          };

        var tooltipText = '';

        for (let key in this.userData) {
          // exclude private data
          if (/^__/.test(key))
            continue;

          if (this.userData[key] && typeof this.userData[key] != 'object') {
            tooltipText += key + ": " + this.userData[key] + "\n"
          }
        }

        // tooltipText = 'loc : ' + loc

        if (tooltipText.length > 0) {
          tooltip = visualizer.tooltip = visualizer.makeTextSprite(tooltipText)

          var vector = new THREE.Vector3()
          var vector2 = new THREE.Vector3()

          vector.set(visualizer._mouse.x, visualizer._mouse.y, 0.5)
          vector2.set(tooltip.scale.x / 2, - tooltip.scale.y / 2, 0)
          //
          // vector2.normalize()
          //
          // vector2.subScalar(0.5)
          //
          // vector2.y = -vector2.y
          // vector2.z = 0

          // vector.add(vector2)

          vector.unproject(visualizer._2dCamera)
          vector.add(vector2)
          tooltip.position.set(vector.x, vector.y, vector.z)
          tooltip.name = "tooltip"

          visualizer._scene2d.add(tooltip)
          visualizer._renderer && visualizer._renderer.render(visualizer._scene2d, visualizer._2dCamera)
          visualizer.invalidate()
        }


  }
}

