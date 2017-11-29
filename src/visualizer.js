/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import ThreeLayout from './three-layout'
import ThreeControls from './three-controls'

THREE.Cache.enabled = true

var {
  Component,
  Container,
  Layout,
  Layer
} = scene

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'fov',
    name: 'fov',
    property: 'fov'
  }, {
    type: 'number',
    label: 'near',
    name: 'near',
    property: 'near'
  }, {
    type: 'number',
    label: 'far',
    name: 'far',
    property: 'far'
  }, {
    type: 'number',
    label: 'zoom',
    name: 'zoom',
    property: 'zoom'
  }, {
    type: 'select',
    label: 'precision',
    name: 'precision',
    property: {
      options: ['highp', 'mediump', 'lowp']
    }
  }, {
    type: 'checkbox',
    label: 'anti-alias',
    name: 'antialias',
    property: 'antialias'
  }, {
    type: 'checkbox',
    label: 'auto-rotate',
    name: 'autoRotate',
    property: 'autoRotate'
  }, {
    type: 'checkbox',
    label: 'show-axis',
    name: 'showAxis',
    property: 'showAxis'
  }, {
    type: 'checkbox',
    label: '3dmode',
    name: 'threed',
    property: 'threed'
  }, {
    type: 'checkbox',
    label: 'debug',
    name: 'debug',
    property: 'threed'
  }, {
    type: 'string',
    label: 'popup-scene',
    name: 'popupScene'
  }, {
    type: 'stock-status',
    label: '',
    name: 'stockStatus'
  }]
}

const WEBGL_NO_SUPPORT_TEXT = 'WebGL no support'

function registerLoaders() {
  if (!registerLoaders.done) {
    THREE.Loader.Handlers.add(/\.tga$/i, new THREE.TGALoader());
    registerLoaders.done = true
  }
}

export default class Visualizer extends Container {

  containable(component) {
    return component.is3dish()
  }

  putObject(id, object) {
    if (!this._objects)
      this._objects = {}

    this._objects[id] = object;
  }

  getObject(id) {
    if (!this._objects)
      this._objects = {}

    return this._objects[id]
  }

  /* THREE Object related .. */

  createFloor(color, width, height) {

    let fillStyle = this.model.fillStyle

    var floorMaterial

    var self = this;

    if (fillStyle.type == 'pattern' && fillStyle.image) {

      var floorTexture = this._textureLoader.load(this.app.url(fillStyle.image), function (texture) {
        texture.minFilter = THREE.LinearFilter
        self.render_threed()
      })

      var floorMaterial = [
        floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        }),
        floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        }),
        floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        }),
        floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        }),
        new THREE.MeshLambertMaterial({
          map: floorTexture
        }),
        floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        })
      ]
    } else {
      floorMaterial = new THREE.MeshLambertMaterial({
        color: color
      })
    }


    var floorGeometry = new THREE.BoxGeometry(1, 1, 1);
    // var floorGeometry = new THREE.PlaneGeometry(width, height)

    var floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.scale.set(width, height, 5);

    // floor.receiveShadow = true

    floor.rotation.x = -Math.PI / 2
    floor.position.y = -2

    floor.name = 'floor'

    this._scene3d.add(floor)
  }

  createObjects(components, canvasSize) {

    components.forEach(component => {
      requestAnimationFrame(() => {
        var clazz = scene.Component3d.register(component.model.type)

        if (!clazz) {
          console.warn("Class not found : 3d class is not exist");
          return;
        }

        var item = new clazz(component.hierarchy, canvasSize, this, component)


        if (item) {
          setTimeout(function () {
            item.name = component.model.id;
            this._scene3d.add(item)
            this.putObject(component.model.id, item);
          }.bind(this))
        }
      })
    })
  }

  makeTextSprite(message, parameters) {

    if (!message)
      return

    if (parameters === undefined) parameters = {};

    var fontFace = parameters.hasOwnProperty("fontFace") ?
      parameters["fontFace"] : "Arial";

    var fontSize = parameters.hasOwnProperty("fontSize") ?
      parameters["fontSize"] : 16;

    var textColor = parameters.hasOwnProperty("textColor") ?
      parameters["textColor"] : 'rgba(255,255,255,1)';

    var borderWidth = parameters.hasOwnProperty("borderWidth") ?
      parameters["borderWidth"] : 0;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
      parameters["borderColor"] : 'rgba(0, 0, 0, 1.0)';

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
      // parameters["backgroundColor"] : 'rgba(51, 51, 51, 1.0)';
      parameters["backgroundColor"] : 'rgba(0, 0, 0, 0.7)';

    var radius = parameters.hasOwnProperty("radius") ?
      parameters["radius"] : 15;

    var vAlign = parameters.hasOwnProperty("vAlign") ?
      parameters["vAlign"] : 'middle';

    var hAlign = parameters.hasOwnProperty("hAlign") ?
      parameters["hAlign"] : 'center';


    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var span = document.createElement('span');
    span.style.font = `${fontSize}px ${fontFace}`;
    span.style.whiteSpace = 'pre-wrap';

    span.innerText = message;

    document.body.appendChild(span)

    canvas.width = span.offsetWidth + (borderWidth + radius) * 2
    canvas.height = span.offsetHeight + (borderWidth + radius) * 2

    document.body.removeChild(span);

    span.remove();

    context.font = fontSize + "px " + fontFace;
    context.textBaseline = "alphabetic";
    context.textAlign = "left";

    var textWidth = 0

    var msgArr = String(message).trim().split('\n')

    var cx = canvas.width / 2;
    var cy = canvas.height / 2;

    for (let i in msgArr) {
      // get size data (height depends only on font size)
      var metrics = context.measureText(msgArr[i]);

      if (textWidth < metrics.width)
        textWidth = metrics.width;

    }

    var tx = textWidth / 2.0;
    var ty = fontSize / 2.0;

    // then adjust for the justification
    if (vAlign == "bottom")
      ty = fontSize;
    else if (vAlign == "top")
      ty = 0;

    if (hAlign == "left")
      tx = textWidth;
    else if (hAlign == "right")
      tx = 0;


    this.roundRect(
      context,
      cx - tx,
      cy - fontSize * msgArr.length * 0.5,
      // cy - fontSize * msgArr.length * 0.5 + ty - 0.28 * fontSize,
      textWidth,
      fontSize * msgArr.length,
      // fontSize * msgArr.length * 1.28,
      radius,
      borderWidth,
      borderColor,
      backgroundColor,
      5
    );

    // text color
    context.fillStyle = textColor;
    context.lineWidth = 3

    var offsetY = cy - fontSize * msgArr.length * 0.5 - 5 - borderWidth

    for (var i in msgArr) {
      i = Number(i)
      offsetY += fontSize

      context.fillText(
        msgArr[i],
        cx - tx,
        // cy - fontSize * (i - msgArr.length/2) + ty
        offsetY
      );
    }

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width, canvas.height, 1.0);

    sprite.raycast = function () { }

    return sprite;
  }


  destroy_scene3d() {
    this.stop();
    if (this._renderer)
      this._renderer.clear()
    delete this._renderer
    delete this._camera
    delete this._2dCamera
    delete this._keyboard
    delete this._controls
    delete this._projector
    delete this._load_manager
    delete this._objects

    if (this._scene3d) {
      let children = this._scene3d.children.slice();
      for (let i in children) {
        let child = children[i]
        if (child.dispose)
          child.dispose();
        if (child.geometry && child.geometry.dispose)
          child.geometry.dispose();
        if (child.material && child.material.dispose)
          child.material.dispose();
        if (child.texture && child.texture.dispose)
          child.texture.dispose();
        this._scene3d.remove(child)
      }
    }

    if (this._scene2d) {
      let children = this._scene2d.children.slice();
      for (let i in children) {
        let child = children[i]
        if (child.dispose)
          child.dispose();
        if (child.geometry)
          child.geometry.dispose();
        if (child.material)
          child.material.dispose();
        if (child.texture)
          child.texture.dispose();
        this._scene2d.remove(child)
      }
    }

    delete this._scene3d
    delete this._scene2d
  }

  init_scene3d() {

    if (this._scene3d)
      this.destroy_scene3d()

    registerLoaders()
    this._textureLoader = new THREE.TextureLoader()
    this._textureLoader.withCredential = true
    this._textureLoader.crossOrigin = 'use-credentials'

    this._exporter = new THREE.OBJExporter();

    var {
      width,
      height,
      fov = 45,
      near = 0.1,
      far = 20000,
      fillStyle = '#424b57',
      light = 0xffffff,
      antialias = true,
      precision = 'highp',
      stockStatus
    } = this.model
    var components = this.components || []

    // SCENE
    this._scene3d = new THREE.Scene()
    this._scene2d = new THREE.Scene()

    // CAMERA
    var aspect = width / height

    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this._2dCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 1000)

    this._scene3d.add(this._camera)
    this._scene2d.add(this._2dCamera)
    this._camera.position.set(height * 0.8, Math.floor(Math.min(width, height)), width * 0.8)
    this._2dCamera.position.set(0, 0, 0)
    this._camera.lookAt(this._scene3d.position)
    this._2dCamera.lookAt(this._scene2d.position)
    this._camera.zoom = this.model.zoom * 0.01

    if (this.model.showAxis) {
      var axisHelper = new THREE.AxisHelper(width);
      this._scene3d.add(axisHelper);
    }

    this._stockStatus = stockStatus;

    try {
      // RENDERER
      this._renderer = new THREE.WebGLRenderer({
        precision: precision,
        alpha: true,
        antialias: antialias
      });
    } catch (e) {
      this._noSupportWebgl = true
    }

    if (this._noSupportWebgl)
      return


    this._renderer.autoClear = false

    this._renderer.setClearColor(0xffffff, 0) // transparent
    this._renderer.setSize(width, height)
    // this._renderer.setSize(1600, 900)
    // this._renderer.shadowMap.enabled = true
    // this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // this._renderer.setPixelRatio(window.devicePixelRatio)

    // CONTROLS
    this._controls = new ThreeControls(this._camera, this)

    // LIGHT
    var _light = new THREE.HemisphereLight(light, 0x000000, 1)

    _light.position.set(-this._camera.position.x, this._camera.position.y, -this._camera.position.z)
    this._camera.add(_light)

    // this._camera.castShadow = true

    this._raycaster = new THREE.Raycaster()
    // this._mouse = { x: 0, y: 0, originX: 0, originY : 0 }
    this._mouse = new THREE.Vector2()


    this._tick = 0
    this._clock = new THREE.Clock(true)
    this.mixers = new Array();

    this.createFloor(fillStyle, width, height)
    this.createObjects(components, {
      width,
      height
    })

    this._load_manager = new THREE.LoadingManager();
    this._load_manager.onProgress = function (item, loaded, total) {

    }

    this.threed_animate()
  }

  threed_animate() {
    this._animationFrame = requestAnimationFrame(this.threed_animate.bind(this));

    // if (this.model.autoRotate)
    this.update();

  }

  stop() {
    cancelAnimationFrame(this._animationFrame)
  }

  update() {
    this._controls.update();
    this.render_threed();
  }

  get scene3d() {
    if (!this._scene3d)
      this.init_scene3d()
    return this._scene3d
  }

  render_threed() {
    var delta
    if (this._clock)
      delta = this._clock.getDelta();

    var mixers = this.mixers
    for (var i in mixers) {
      if (mixers.hasOwnProperty(i)) {
        var mixer = mixers[i];
        if (mixer) {
          mixer.update(delta);
        }

      }
    }

    if (this._renderer) {
      this._renderer.clear()
      this._renderer.render(this._scene3d, this._camera)
    }

    if (this._renderer && this._scene2d) {
      this._renderer.render(this._scene2d, this._2dCamera)
    }

    this.invalidate()
  }

  /* Container Overides .. */
  _draw(ctx) {
    if (this.app.isViewMode) {
      if (!this.model.threed)
        this.model.threed = true
    }

    if (this.model.threed && !this._noSupportWebgl) {
      return
    }

    super._draw(ctx)

  }

  _post_draw(ctx) {
    var {
      left,
      top,
      width,
      height,
      debug,
      threed
    } = this.model

    if (threed) {

      if (!this._scene3d) {
        this.init_scene3d()
        this.render_threed()
      }

      if (this._noSupportWebgl) {
        this._showWebglNoSupportText(ctx);
        return
      }

      if (this._dataChanged) {
        this._onDataChanged()
      }

      this.showTooltip(this._selectedPickingLocation)

      ctx.drawImage(
        this._renderer.domElement, 0, 0, width, height,
        left, top, width, height
      )

      // this.showTooltip('LOC-2-1-1-A-1')

      if(debug) {
        ctx.font = 100 + 'px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = 'black'
        ctx.globalAlpha = 0.5
        ctx.fillText(scene.FPS(), 100, 100)
      }

    } else {
      super._post_draw(ctx);
    }
  }

  dispose() {
    super.dispose();
    this.destroy_scene3d()
  }

  get layout() {
    return Layout.get('three')
  }

  get nature() {
    return NATURE
  }

  roundRect(ctx, x, y, w, h, r, borderWidth, borderColor, fillColor, padding, image) {
    // no point in drawing it if it isn't going to be rendered
    if (fillColor == undefined && borderColor == undefined)
      return;

    let left = x - borderWidth - r - padding;
    let right = left + w + borderWidth * 2 + r * 2 + padding * 2
    let top = y - borderWidth - r - padding
    let bottom = top + h + borderWidth * 2 + r * 2 + padding * 2

    ctx.beginPath();
    ctx.moveTo(left + r, top);
    ctx.lineTo(right - r, top);
    ctx.quadraticCurveTo(right, top, right, top + r);
    ctx.lineTo(right, bottom - r);
    ctx.quadraticCurveTo(right, bottom, right - r, bottom);
    ctx.lineTo(left + r, bottom);
    ctx.quadraticCurveTo(left, bottom, left, bottom - r);
    ctx.lineTo(left, top + r);
    ctx.quadraticCurveTo(left, top, left + r, top);
    ctx.closePath();

    ctx.lineWidth = borderWidth;

    // background color
    // border color

    // if the fill color is defined, then fill it
    if (fillColor != undefined) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    if (borderWidth > 0 && borderColor != undefined) {
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

  }

  getObjectByRaycast() {

    var intersects = this.getObjectsByRaycast()
    var intersected

    if (intersects.length > 0) {
      intersected = intersects[0].object
    }

    return intersected
  }

  getObjectsByRaycast() {
    // find intersections

    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)

    var vector = this._mouse
    if (!this._camera)
      return

    this._raycaster.setFromCamera(vector, this._camera)

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = this._raycaster.intersectObjects(this._scene3d.children, true);

    return intersects
  }

  moveCameraTo(targetName) {

    if (!targetName)
      return

    let object = this._scene3d.getObjectByName(targetName, true)
    if (!object)
      return


    var self = this
    // this._controls.rotateLeft(5)
    // setTimeout(function() {
    //   self.moveCameraTo(5)
    // }, 100)

    let objectPositionVector = object.getWorldPosition()
    objectPositionVector.y = 0
    let distance = objectPositionVector.distanceTo(new THREE.Vector3(0, 0, 0))

    objectPositionVector.multiplyScalar(1000 / (distance || 1))

    var self = this
    var diffX = this._camera.position.x - objectPositionVector.x
    var diffY = this._camera.position.y - 300
    var diffZ = this._camera.position.z - objectPositionVector.z


    this.animate({
      step: function (delta) {

        let vector = new THREE.Vector3()

        vector.x = objectPositionVector.x - diffX * (delta - 1)
        vector.y = 0
        vector.z = objectPositionVector.z - diffZ * (delta - 1)

        let distance = vector.distanceTo(new THREE.Vector3(0, 0, 0))

        vector.multiplyScalar(1000 / (distance || 1))

        self._camera.position.x = vector.x
        self._camera.position.y = 300 - diffY * (delta - 1)
        self._camera.position.z = vector.z

        self._camera.lookAt(self._scene3d.position)

      },
      duration: 2000,
      delta: 'linear'
    }).start()

    // this._camera.position.x = objectPositionVector.x
    // this._camera.position.y = 300
    // this._camera.position.z = objectPositionVector.z

  }

  exportModel() {
    var exported = this._exporter.parse(this._scene3d);
    var blob = new Blob([exported], { type: "text/plain;charset=utf-8" });
    console.log(exported)
    // saveAs(blob, "exported.txt");
  }

  createTooltipForNavigator(messageObject) {

    if (!messageObject)
      return

    let isMarker = true;
    let fontFace = "Arial";
    let fontSize = 40;
    let textColor = 'rgba(255,255,255,1)';
    let borderWidth = 2;
    let borderColor = 'rgba(0, 0, 0, 1.0)';
    let backgroundColor = 'rgba(0, 0, 0, 0.7)';
    let radius = 30;
    let vAlign = 'middle';
    let hAlign = 'center';

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    // document.body.appendChild(canvas)

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    context.font = fontSize + "px " + fontFace;
    context.textBaseline = "alphabetic";
    context.textAlign = "left";

    var textWidth = 0

    let cx = canvas.width / 2;
    let cy = canvas.height / 2;

    // for location label
    context.font = Math.floor(fontSize) + "px " + fontFace;
    var metrics = context.measureText("Location");
    if (textWidth < metrics.width)
      textWidth = metrics.width;

    // for location value
    context.font = "bold " + fontSize * 2 + "px " + fontFace;
    metrics = context.measureText(messageObject.location);
    if (textWidth < metrics.width)
      textWidth = metrics.width;

    // for values (material, qty)
    context.font = fontSize + "px " + fontFace;
    metrics = context.measureText("- Material : " + messageObject.material);
    if (textWidth < metrics.width)
      textWidth = metrics.width;

    metrics = context.measureText("- QTY : " + messageObject.qty);
    if (textWidth < metrics.width)
      textWidth = metrics.width;


    var tx = textWidth / 2.0;
    var ty = fontSize / 2.0;

    // then adjust for the justification
    if (vAlign == "bottom")
      ty = fontSize;
    else if (vAlign == "top")
      ty = 0;

    if (hAlign == "left")
      tx = textWidth;
    else if (hAlign == "right")
      tx = 0;

    var offsetY = cy

    this.roundRect(
      context,
      cx - tx,
      cy - fontSize * 6 * 0.5,
      // cy - fontSize * 6 * 0.5 + ty - 0.28 * fontSize,
      textWidth,
      // fontSize * 6 * 1.28,
      fontSize * 8,
      radius,
      borderWidth,
      borderColor,
      backgroundColor,
      0
    );

    // text color
    context.fillStyle = textColor;
    context.lineWidth = 3

    // for location label
    offsetY += -fontSize * 6 * 0.5 + Math.floor(fontSize)
    context.font = Math.floor(fontSize) + "px " + fontFace;
    context.fillStyle = 'rgba(134,199,252,1)'
    context.fillText(
      "Location",
      cx - tx,
      offsetY
    );

    // for location value
    offsetY += fontSize * 2.5
    context.font = "bold " + fontSize * 2 + "px " + fontFace;
    context.fillStyle = textColor;
    context.fillText(
      messageObject.location,
      cx - tx,
      offsetY
    );

    // for values (material, qty)
    offsetY += fontSize * 2
    context.font = fontSize + "px " + fontFace;
    context.fillStyle = 'rgba(204,204,204,1)';
    context.fillText(
      "- Material : " + messageObject.material,
      cx - tx,
      offsetY
    );

    offsetY += fontSize + ty
    context.fillText(
      "- QTY : " + messageObject.qty,
      cx - tx,
      offsetY
    );


    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(window.innerWidth / 4 * 3, window.innerWidth / 8 * 3, 1);
    // sprite.scale.set(canvas.width, canvas.height,1.0);

    sprite.raycast = function () { }

    return sprite;

  }

  showTooltip(targetName) {
    if (!targetName)
      return

    var tooltip = this._scene2d.getObjectByName('navigator-tooltip')
    if (tooltip)
      this._scene2d.remove(tooltip)

    var object = this._scene3d.getObjectByName(targetName, true)
    var nav = this._scene3d.getObjectByName(targetName + '-marker', true)

    if (object && nav) {
      let vector = nav.getWorldPosition().clone()
      vector.project(this._camera)
      vector.z = 0.5

      var tooltipTextObject = {
        location: object.userData.location,
        material: object.userData.material,
        qty: object.userData.qty
      };

      tooltip = this.createTooltipForNavigator(tooltipTextObject)

      var vector2 = tooltip.getWorldScale().clone()

      var widthMultiplier = vector2.x / this.model.width
      var heightMultiplier = vector2.y / this.model.height

      vector2.normalize()

      vector2.x = 0
      vector2.y = vector2.y * 1.5 * heightMultiplier
      vector2.z = 0;

      vector.add(vector2)

      vector.unproject(this._2dCamera)
      tooltip.position.set(vector.x, vector.y, vector.z)
      tooltip.name = 'navigator-tooltip'

      tooltip.scale.x = tooltip.scale.x * widthMultiplier
      tooltip.scale.y = tooltip.scale.y * heightMultiplier

      this._scene2d.add(tooltip)
      this.render_threed()
    }

  }

  transcoord2dTo3d(position) {
    var {
      width,
      height
    } = this.model;

    var {
      x = 0,
      y = 0,
      z = 0
    } = position;

    var cx = width / 2;
    var cy = height / 2;

    var coord3d = {};
    coord3d.x = x - cx;
    coord3d.y = y - cy;
    coord3d.z = z;

    return coord3d;
  }

  _showWebglNoSupportText(context) {
    context.save();

    var {
      width,
      height
    } = this.model

    context.font = width / 20 + 'px Arial'
    context.textAlign = 'center'
    context.fillText(WEBGL_NO_SUPPORT_TEXT, width / 2 - width / 40, height / 2)

    context.restore();
  }

  _onDataChanged() {

    /* for picking navigator

    if (this._pickingLocations) {
      // set picking locations
      for (let i in this._pickingLocations) {
        let loc = this._pickingLocations[i]

        let obj = this._scene3d.getObjectByName(loc, true)
        if (obj) {
          obj.userData = {}
        }

        let empObj = this._scene3d.getObjectByName(loc + '-emp', true)
        if (empObj) {
          this._scene3d.remove(empObj)
        }
        let navObj = this._scene3d.getObjectByName(loc + '-marker', true)
        if (navObj) {
          navObj.parent.remove(navObj)
        }

        let navTooltipObj = this._scene2d.getObjectByName('navigator-tooltip', true)
        if (navTooltipObj) {
          this._scene2d.remove(navTooltipObj)
        }
      }
    }

    if (this._selectedPickingLocation) {
      // set selected picking location
      let obj = this._scene3d.getObjectByName(this._selectedPickingLocation, true)
      if (obj && obj.userData) {
        delete obj.userData.selected
      }
    }

    this._pickingLocations = []
    this._selectedPickingLocation = null

    */

    if (this._data) {
      if (this._data instanceof Array) {
        /**
         *  Array type data
         *  (e.g. data: [{
         *    'loc' : 'location1',
         *    'description': 'description1'
         *  },
         *  ...
         *  ])
         */
        this._data.forEach(d => {
          let data = d

          requestAnimationFrame(() => {
            let loc = data.loc || data.LOC || data.location || data.LOCATION;
            let object = this.getObject(loc)
            if (object) {
              object.userData = data;
              object.onUserDataChanged()

              // if (d.navigationData) {
              //   this._pickingLocations.push(loc)
              // }
              // if (d.selected) {
              //   this._selectedPickingLocation = loc
              // }
            }
          })
        })
      } else {
        /**
         *  Object type data
         *  (e.g. data: {
         *    'location1': {description: 'description'},
         *    ...
         *  })
         */
        for (var loc in this._data) {
          let location = loc
          if (this._data.hasOwnProperty(location)) {

            requestAnimationFrame(() => {
              let d = this._data[location]
              let object = this.getObject(location)
              if (object) {
                object.userData = d;
                object.onUserDataChanged()

                // if (d.navigationData) {
                //   this._pickingLocations.push(location)
                // }
                // if (d.selected) {
                //   this._selectedPickingLocation = location
                // }
              }
            })

          }
        }
      }
    }

    this._dataChanged = false

    // draw navigatePath
    if (this._pickingLocations && this._pickingLocations.length > 0)
      this.navigatePath(this._pickingLocations)

    this.render_threed();
  }

  /* Event Handlers */

  onchange(after, before) {

    if (after.hasOwnProperty('width') ||
      after.hasOwnProperty('height') ||
      after.hasOwnProperty('threed'))
      this.destroy_scene3d()

    if (after.hasOwnProperty('autoRotate')) {
      this._controls.autoRotate = after.autoRotate
    }

    if (after.hasOwnProperty('fov') ||
      after.hasOwnProperty('near') ||
      after.hasOwnProperty('far') ||
      after.hasOwnProperty('zoom')) {

      if (this._camera) {
        this._camera.near = this.model.near
        this._camera.far = this.model.far
        this._camera.zoom = this.model.zoom * 0.01
        this._camera.fov = this.model.fov
        this._camera.updateProjectionMatrix();

        this._controls.cameraChanged = true

        this._controls.update()
      }

    }

    if (after.hasOwnProperty("data")) {
      if (this._data !== after.data) {
        this._data = after.data
        this._dataChanged = true
      }
    }

    // if(after.hasOwnProperty('autoRotate')) {
    //   this.model.autoRotate = after.autoRotate
    // }

    this.invalidate()
  }

  onmousedown(e) {
    if (this._controls) {
      this._controls.onMouseDown(e)
    }
  }

  onmouseup(e) {

    if (this._controls) {
      if (this._lastFocused)
        this._lastFocused._focused = false;

      var modelLayer = Layer.register('model-layer')
      var popup = modelLayer.Popup;
      var ref = this.model.popupScene

      var pointer = this.transcoordC2S(e.offsetX, e.offsetY)

      // this._mouse.originX = this.getContext().canvas.offsetLeft +e.offsetX;
      // this._mouse.originY = this.getContext().canvas.offsetTop + e.offsetY;

      this._mouse.x = ((pointer.x - this.model.left) / (this.model.width)) * 2 - 1;
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

      var object = this.getObjectByRaycast()

      if (object && object.onmouseup) {
        if(ref)
          object.onmouseup(e, this, popup.show.bind(this, this, ref))
        object._focused = true;
        this._lastFocused = object
      }
      else {
        popup.hide(this.root)
      }
      // else {
      //   if (!this._scene2d)
      //     return
      //   this._scene2d.remove(this._scene2d.getObjectByName('tooltip'))
      //   this.render_threed()
      // }

      // this._controls.onMouseMove(e)

      e.stopPropagation()
    }

  }

  onmousemove(e) {
    if (this._controls) {
      var pointer = this.transcoordC2S(e.offsetX, e.offsetY)

      // this._mouse.originX = this.getContext().canvas.offsetLeft +e.offsetX;
      // this._mouse.originY = this.getContext().canvas.offsetTop + e.offsetY;

      this._mouse.x = ((pointer.x - this.model.left) / (this.model.width)) * 2 - 1;
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

      // var object = this.getObjectByRaycast()

      // if (object && object.onmousemove)
      //   object.onmousemove(e, this)
      // else {
      //   if (!this._scene2d)
      //     return
      //   this._scene2d.remove(this._scene2d.getObjectByName('tooltip'))
      //   this.render_threed()
      // }

      this._controls.onMouseMove(e)

      e.stopPropagation()
    }
  }

  onmouseleave(e) {
    if (!this._scene2d)
      return

    var tooltip = this._scene2d.getObjectByName('tooltip')
    if (tooltip) {
      this._scene2d.remove(tooltip)
    }
  }

  onwheel(e) {
    if (this._controls) {
      this.handleMouseWheel(e)
      e.stopPropagation()
    }
  }

  ondragstart(e) {
    if (this._controls) {
      var pointer = this.transcoordC2S(e.offsetX, e.offsetY)

      // this._mouse.originX = this.getContext().canvas.offsetLeft +e.offsetX;
      // this._mouse.originY = this.getContext().canvas.offsetTop + e.offsetY;

      this._mouse.x = ((pointer.x - this.model.left) / (this.model.width)) * 2 - 1;
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

      this._controls.onDragStart(e)
      e.stopPropagation()
    }
  }

  ondragmove(e) {
    if (this._controls) {
      this._controls.onDragMove(e)
      e.stopPropagation()
    }
  }

  ondragend(e) {
    if (this._controls) {
      this._controls.onDragEnd(e)
      e.stopPropagation()
    }
  }

  ontouchstart(e) {
    if (this._controls) {
      this._controls.onTouchStart(e)
      e.stopPropagation()
    }
  }

  ontouchmove(e) {
    if (this._controls) {
      this._controls.onTouchMove(e)
      e.stopPropagation()
    }
  }

  ontouchend(e) {
    if (this._controls) {
      this._controls.onTouchEnd(e)
      e.stopPropagation()
    }
  }

  onkeydown(e) {
    if (this._controls) {
      this._controls.onKeyDown(e)
      e.stopPropagation()
    }
  }

  handleMouseWheel(event) {

    var delta = 0;
    var zoom = this.model.zoom

    delta = -event.deltaY
    zoom += delta * 0.1
    if (zoom < 100)
      zoom = 100

    this.set('zoom', zoom)

  }

}

Component.register('visualizer', Visualizer)

