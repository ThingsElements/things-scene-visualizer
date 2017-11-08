/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
// const STATUS_COLORS = ['black', '#ccaa76', '#ff1100', '#252525', '#6ac428']
const STATUS_COLORS = {
  A: 'black',
  B: '#ccaa76',
  C: '#ff1100',
  D: '#252525',
  E: '#6ac428'
}

export default class Stock extends THREE.Mesh {

  constructor(model) {

    super();

    this._model = model;

    this.createObject(model);

  }

  static get blackMaterial() {
    if (!Stock._material_black)
      Stock._material_black = new THREE.MeshLambertMaterial({
        color: STATUS_COLORS.A,
        side: THREE.FrontSide
      })

    return Stock._material_black
  }
  static get brownMaterial() {
    if (!Stock._material_brown)
      Stock._material_brown = new THREE.MeshLambertMaterial({
        color: STATUS_COLORS.B,
        side: THREE.FrontSide
      })

    return Stock._material_brown
  }
  static get redMaterial() {
    if (!Stock._material_red)
      Stock._material_red = new THREE.MeshLambertMaterial({
        color: STATUS_COLORS.C,
        side: THREE.FrontSide
      })

    return Stock._material_red
  }
  static get darkMaterial() {
    if (!Stock._material_dark)
      Stock._material_dark = new THREE.MeshLambertMaterial({
        color: STATUS_COLORS.D,
        side: THREE.FrontSide
      })

    return Stock._material_dark
  }
  static get greenMaterial() {
    if (!Stock._material_green)
      Stock._material_green = new THREE.MeshLambertMaterial({
        color: STATUS_COLORS.E,
        side: THREE.FrontSide
      })

    return Stock._material_green
  }

  static getMaterial(status) {
    var material
    switch (status) {
      default:
      case 'A':
        material = Stock.blackMaterial
        break;
      case 'B':
        material = Stock.brownMaterial
        break;
      case 'C':
        material = Stock.redMaterial
        break;
      case 'D':
        material = Stock.darkMaterial
        break;
      case 'E':
        material = Stock.greenMaterial
        break;

    }

    return material
  }

  createObject(model) {

    this.createStock(model.width, model.height, model.depth)

  }

  createStock(w, h, d) {

    let {
      fillStyle = '#ccaa76'
    } = this.model

    this.geometry = new THREE.BoxBufferGeometry(w, d, h);
    this.material = Stock.getMaterial('B')
    this.type = 'stock'

    // this.visible = false

    // this.castShadow = true

  }

  get model() {
    return this._model
  }

  onUserDataChanged() {
    super.onUserDataChanged();

    this.material = Stock.getMaterial(this.userData.GUBUN || this.userData.gubun)

    if ((this.userData.GUBUN || this.userData.gubun) == 'A') {
      this.visible = false
    } else {
      this.visible = true
    }
  }

  onmousemove(e, threeContainer) {

    var tooltip = threeContainer.tooltip || threeContainer._scene2d.getObjectByName("tooltip")

    if (tooltip) {
      threeContainer._scene2d.remove(tooltip)
      threeContainer.tooltip = null
      threeContainer.render_threed()
    }

    if (!this.visible)
      return;

    if (!this.userData)
      this.userData = {};

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
      tooltip = threeContainer.tooltip = threeContainer.makeTextSprite(tooltipText)

      var vector = new THREE.Vector3()
      var vector2 = new THREE.Vector3()

      vector.set(threeContainer._mouse.x, threeContainer._mouse.y, 0.5)
      vector2.set(100, 50, 0)
      //
      // vector2.normalize()
      //
      // vector2.subScalar(0.5)
      //
      // vector2.y = -vector2.y
      // vector2.z = 0

      // vector.add(vector2)

      vector.unproject(threeContainer._2dCamera)
      vector.add(vector2)
      tooltip.position.set(vector.x, vector.y, vector.z)
      tooltip.name = "tooltip"

      threeContainer._scene2d.add(tooltip)
      threeContainer._renderer && threeContainer._renderer.render(threeContainer._scene2d, threeContainer._2dCamera)
      threeContainer.invalidate()
    }

  }
}

