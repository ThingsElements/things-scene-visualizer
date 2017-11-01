/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as BABYLON from 'babylonjs'

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

const WEBGL_NO_SUPPORT_TEXT = 'WebGL is not supported'

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

  getRegister(type) {
    return scene.Component3d.register(type)
  }

  /* THREE Object related .. */
  createObjects(components) {

    components.forEach(component => {

      var clazz = scene.Component3d.register(component.type)
      var transModel = this.transcoord3d(component);

      if (!clazz) {
        console.warn("Class not found : 3d class is not exist");
        return;
      }

      var item = new clazz(this, transModel, this.scene)

      if (item) {
        this.putObject(component.id, item);
      }

    })

    this.assetsManager.load();
  }

  createScene() {
    var model = this.transcoord3d(this.model);
    var maxSize = Math.max(model.width, model.depth);
    var minSize = Math.min(model.width, model.depth);
    // var hypotenuseSize = Math.floor(Math.sqrt(Math.pow(model.width, 2) + Math.pow(model.depth, 2)));
    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(this.engine);

    // Assets Manager
    this.assetsManager = new BABYLON.AssetsManager(scene);

    this.assetsManager.onFinish = function(tasks) {
      this.engine.runRenderLoop(function() {
          this.scene.render();
      }.bind(this));
    }.bind(this);

    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    var camera = new BABYLON.ArcRotateCamera('camera1', 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.upperBetaLimit = 1.4835298642;
    camera.allowUpsideDown = false;

    // target the camera to scene origin
    camera.setPosition(new BABYLON.Vector3(0, minSize, maxSize));
    // camera.setPosition(new BABYLON.Vector3(0, minSize, hypotenuseSize));

    // attach the camera to the canvas
    camera.attachControl(this.canvas, true);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('hemi-light', new BABYLON.Vector3(0, 1, 0), scene);
    // var directionalLight = new BABYLON.DirectionalLight('directional-light', new BABYLON.Vector3(1, -1, -1), scene);
    // directionalLight.diffuse = new BABYLON.Color3(1, 1, 1)
    // directionalLight.specular = new BABYLON.Color3(1, 1, 1)
    // directionalLight.groundColor = new BABYLON.Color3(0, 0, 0)
    // directionalLight.position = camera.position
    // directionalLight.parent = camera

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    var ground = new (this.getRegister('floor'))(this, model, scene);

    scene.registerBeforeRender(function () {
      if(model.autoRotate)
        camera.alpha += 0.001 * scene.getAnimationRatio();
    });

    // return the created scene
    return scene;
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
      threed,
      showAxis
    } = this.model

    if (threed) {
      this._initialize();
    } else {
      super._post_draw(ctx);
    }
  }

  _initialize() {
    var {
      components
    } = this.hierarchy
    var {
      antialias
    } = this.model

    var transModel = this.transcoord3d(this.model);

    // get the canvas DOM element
    var threedLayer = this.root.assist_layers.filter((layer) => { return layer.model.type == 'threed-layer' })[0];

    /* layer 정보에 맞춰서 assist layer 객체들을 생성한다. */
    this.canvas = threedLayer.canvas;

    // load the 3D engine
    this.engine = new BABYLON.Engine(this.canvas, antialias);

    // call the createScene function
    this.scene = this.createScene();

    if (this.model.showAxis)
      this.showAxis(Math.min(transModel.width, transModel.depth));

    // run the render loop
    this.engine.runRenderLoop(function () {
      this.scene.render();
    }.bind(this));

    // the canvas/window resize event handler
    window.addEventListener('resize', function () {
      this.engine.resize();
    }.bind(this));

    this.createObjects(components)
  }


  // show axis
  showAxis(size) {
    var scene = this.scene;
    var makeTextPlane = function (text, color, size) {
      var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
      var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
      plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
      plane.material.backFaceCulling = false;
      plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
    };

    var axisX = BABYLON.Mesh.CreateLines("axisX", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], scene);

    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
  }


  dispose() {
    super.dispose();
    this.destroy_scene3d()
  }

  // get layout() {
  //   return Layout.get('three')
  // }

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

  get nature() {
    return NATURE
  }

  _onDataChanged() {

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

