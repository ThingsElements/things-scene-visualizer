/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import ThreeLayout from './three-layout'
import ThreeControls from './three-controls'

THREE.Cache.enabled = true

var {
  Component,
  Container,
  Layout
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

      floorMaterial = new THREE.MeshBasicMaterial({
        map: floorTexture,
        side: THREE.DoubleSide
      });
    } else {
      floorMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.FrontSide
      })
    }


    var floorGeometry = new THREE.PlaneGeometry(width, height)

    var floor = new THREE.Mesh(floorGeometry, floorMaterial)

    // floor.receiveShadow = true

    floor.rotation.x = -Math.PI / 2
    floor.position.y = -2

    floor.name = 'floor'

    this._scene3d.add(floor)
  }

  createObjects(components, canvasSize) {

    var stockVertexShader = `
      precision highp float;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      attribute vec3 scale;
      attribute vec3 position;
      attribute vec3 offset;
      attribute vec2 uv;
      attribute vec4 orientation;
      attribute vec4 color;

      varying vec2 vUv;
      varying vec4 vColor;
      void main() {
        vec3 vPosition = position;
        vec3 vScale = scale;
        vUv = uv;

        vColor = color;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vScale * vPosition, 1.0 );
      }
    `;

    var stockFragmentShader = `
      precision highp float;
      uniform sampler2D map;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec4 vColor;

      void main() {
        vec4 color = vec4( vColor );
        gl_FragColor = color;
      }
    `;

  //   var stockVertexShader = `
  //   precision highp float;
  //   uniform mat4 modelViewMatrix;
  //   uniform mat4 projectionMatrix;
  //   attribute vec3 scale;
  //   attribute vec3 position;
  //   attribute vec3 offset;
  //   attribute vec2 uv;
  //   attribute vec4 orientation;
  //   attribute vec4 color;

  //   varying vec2 vUv;
  //   varying vec3 vNormal;
  //   varying vec4 vColor;
  //   void main() {
  //     vec3 vPosition = position;
  //     vec3 vScale = scale;
  //     vUv = uv;

  //     vColor = color;

  //     vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
  //     gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vScale * vPosition, 1.0 );
  //   }
  // `;

  // var stockFragmentShader = `
  //   precision highp float;
  //   uniform sampler2D map;
  //   uniform float lightIntensity;

  //   struct PointLight {
  //     vec3 color;
  //     vec3 position; // light position, in camera coordinates
  //     float distance; // used for attenuation purposes. Since
  //                     // we're writing our own shader, it can
  //                     // really be anything we want (as long as
  //                     // we assign it to our light in its
  //                     // "distance" field
  //   };

  //   uniform PointLight pointLights[NUM_POINT_LIGHTS];

  //   varying vec2 vUv;
  //   varying vec3 vPosition;
  //   varying vec3 vNormal;
  //   varying vec4 vColor;

  //   void main() {

  //     vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);
  //     for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
  //       vec3 lightDirection = normalize(vPosition - pointLights[l].position);
  //       addedLights.rgb += clamp(dot(-lightDirection, vecNormal), 0.0, 1.0) * pointLights[l].color  * lightIntensity;
  //     }

  //     vec4 color = vec4( vColor );
  //     gl_FragColor = color;
  //   }
  // `;



    // components.forEach(component => {

    //   var clazz = scene.Component3d.register(component.model.type)

    //   if (!clazz) {
    //     console.warn("Class not found : 3d class is not exist");
    //     return;
    //   }

    //   var item = new clazz(component.model, canvasSize, this, component)

    //   if (item) {
    //     // items.push(item)
    //     setTimeout(function () {
    //       item.name = component.model.id;
    //       this._scene3d.add(item)
    //       this.putObject(component.model.id, item);
    //     }.bind(this))
    //   }

    // })

    var racks = components.filter(c => { return c.model.type == 'rack' });

    var bufferGeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );

    var geometry = new THREE.InstancedBufferGeometry();
    geometry.index = bufferGeometry.index;
    geometry.attributes.position = bufferGeometry.attributes.position;
    geometry.attributes.uv = bufferGeometry.attributes.uv;

    var scales = [];
    var offsets = [];
    var colors = [];
    // var vector = new THREE.Vector4();
    for (var i = 0; i < racks.length; i++) {
      var rack = this.transcoord3d(racks[i].model);
      var shelves = rack.shelves;

      if (!shelves)
        continue;

      for (var s = 0; s < shelves; s++) {
        var stock = JSON.parse(JSON.stringify(rack));
        stock.width *= 0.7
        stock.height *= 0.7
        stock.depth *= 0.7
        stock.y = s * rack.height - (rack.height - stock.height) / 2 + stock.y;

        offsets.push( stock.x, stock.y, stock.z );
        scales.push(stock.width, stock.height, stock.depth);
        colors.push(Math.random(), Math.random(), Math.random(), 1)
      }
    }

    var offsetAttribute = new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 );
    var scaleAttribute = new THREE.InstancedBufferAttribute( new Float32Array( scales ), 3 );
    var colorAttribute = new THREE.InstancedBufferAttribute( new Float32Array( colors ), 4 );
    geometry.addAttribute( 'offset', offsetAttribute );
    geometry.addAttribute( 'scale', scaleAttribute );
    geometry.addAttribute( 'color', colorAttribute );

    var material = new THREE.RawShaderMaterial( {
      // uniforms: {
      //   map: { value: new THREE.TextureLoader().load( 'textures/crate.gif' ) }
      // },
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],
        {
          lightIntensity: {type: 'f', value: 1.0},
          textureSampler: {type: 't', value: null}
        }
      ]),
      vertexShader: stockVertexShader,
      fragmentShader: stockFragmentShader,
      transparent: true
      // ,
      // lights: true
    } );

    var mesh = new THREE.Mesh( geometry, material );
    this._scene3d.add( mesh );

  }

  makeTextSprite(message, parameters) {

    if (!message)
      return

    if (parameters === undefined) parameters = {};

    var fontFace = parameters.hasOwnProperty("fontFace") ?
      parameters["fontFace"] : "Arial";

    var fontSize = parameters.hasOwnProperty("fontSize") ?
      parameters["fontSize"] : 32;

    var textColor = parameters.hasOwnProperty("textColor") ?
      parameters["textColor"] : 'rgba(255,255,255,1)';

    var borderWidth = parameters.hasOwnProperty("borderWidth") ?
      parameters["borderWidth"] : 2;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
      parameters["borderColor"] : 'rgba(0, 0, 0, 1.0)';

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
      // parameters["backgroundColor"] : 'rgba(51, 51, 51, 1.0)';
      parameters["backgroundColor"] : 'rgba(0, 0, 0, 0.7)';

    var radius = parameters.hasOwnProperty("radius") ?
      parameters["radius"] : 30;

    var vAlign = parameters.hasOwnProperty("vAlign") ?
      parameters["vAlign"] : 'middle';

    var hAlign = parameters.hasOwnProperty("hAlign") ?
      parameters["hAlign"] : 'center';


    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    // document.body.appendChild(canvas)

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

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
    sprite.scale.set(600, 300, 1);
    // sprite.scale.set(canvas.width, canvas.height, 1.0);

    sprite.raycast = function () { }

    return sprite;
  }


  destroy_scene3d() {
    this.stop();
    if (this._renderer)
      this._renderer.clear()
    this._renderer = undefined
    this._camera = undefined
    this._2dCamera = undefined
    this._keyboard = undefined
    this._controls = undefined
    this._projector = undefined
    this._load_manager = undefined

    if (this._scene3d) {
      for (let i in this._scene3d.children) {
        let child = this._scene3d.children[i]
        if (child.dispose)
          child.dispose();
        if (child.geometry)
          child.geometry.dispose();
        if (child.material)
          child.material.dispose();
        if (child.texture)
          child.texture.dispose();
        this._scene3d.remove(child)
      }
    }

    if (this._scene2d) {
      for (let i in this._scene2d.children) {
        let child = this._scene2d.children[i]
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

    this._scene3d = undefined
    this._scene2d = undefined
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
      precision = 'highp'
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
    this._camera.position.set(height * 0.8, Math.max(width, height) * 0.8, width * 0.8)
    this._2dCamera.position.set(height * 0.8, Math.max(width, height) * 0.8, width * 0.8)
    this._camera.lookAt(this._scene3d.position)
    this._2dCamera.lookAt(this._scene2d.position)
    this._camera.zoom = this.model.zoom * 0.01

    if (this.model.showAxis) {
      var axisHelper = new THREE.AxisHelper( width );
      this._scene3d.add( axisHelper );
    }


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

    // CONTROLS
    this._controls = new ThreeControls(this._camera, this)

    // LIGHT
    var _light = new THREE.HemisphereLight(light, 0x000000, 1)
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
    if(this._clock)
      delta = this._clock.getDelta();

    var mixers = this.mixers
    for (var i in mixers) {
      if (mixers.hasOwnProperty(i)) {
        var mixer = mixers[i];
        if ( mixer ) {
          mixer.update( delta );
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

  transcoord3d(position) {
    var {
      left,
      top,
      zPos = 0,
      width,
      height,
      depth = 0
    } = position

    var transPos = JSON.parse(JSON.stringify(position));
    transPos.width = width;
    transPos.height = depth;
    transPos.depth = height;

    transPos.x = - (left - this.model.width / 2 + width / 2);
    transPos.y = zPos + depth / 2;
    transPos.z = top - this.model.height / 2  + height / 2;

    return transPos
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

          setTimeout(function () {
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
          }.bind(this))
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

            setTimeout(function () {
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
            }.bind(this))

          }
        }
      }
    }

    this._dataChanged = false

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

      this._camera.near = this.model.near
      this._camera.far = this.model.far
      this._camera.zoom = this.model.zoom * 0.01
      this._camera.fov = this.model.fov
      this._camera.updateProjectionMatrix();

      this._controls.cameraChanged = true

      this._controls.update()
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

  onmousemove(e) {
    if (this._controls) {
      var pointer = this.transcoordC2S(e.offsetX, e.offsetY)

      // this._mouse.originX = this.getContext().canvas.offsetLeft +e.offsetX;
      // this._mouse.originY = this.getContext().canvas.offsetTop + e.offsetY;

      this._mouse.x = ((pointer.x - this.model.left) / (this.model.width)) * 2 - 1;
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

      var object = this.getObjectByRaycast()
      console.log(object)

      var helper = new THREE.BoxHelper( object, 0xffff00 );
      this._scene3d.add( helper );

      if (object && object.onmousemove)
        object.onmousemove(e, this)
      else {
        if (!this._scene2d)
          return
        this._scene2d.remove(this._scene2d.getObjectByName('tooltip'))
        this.render_threed()
      }

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
    zoom += delta * 0.01
    if (zoom < 0)
      zoom = 0

    this.set('zoom', zoom)

  }

}

Component.register('visualizer', Visualizer)

