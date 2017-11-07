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

    // components.forEach(component => {

    //   var clazz = scene.Component3d.register(component.type)
    //   var transModel = this.transcoord3d(component);

    //   if (!clazz) {
    //     console.warn("Class not found : 3d class is not exist");
    //     return;
    //   }

    //   var item = new clazz(this, transModel, this.scene)

    //   if (item) {
    //     this.putObject(component.id, item);
    //   }

    // })

    var stock = BABYLON.MeshBuilder.CreateBox('stock', {
      size: 1
    }, this.scene);

    var frame1 = BABYLON.MeshBuilder.CreateBox('frame1', {
      width: 0.1,
      height: 1,
      depth: 0.1
    }, this.scene);
    var frame2 = BABYLON.MeshBuilder.CreateBox('frame2', {
      width: 0.1,
      height: 1,
      depth: 0.1
    }, this.scene);
    var frame3 = BABYLON.MeshBuilder.CreateBox('frame3', {
      width: 0.1,
      height: 1,
      depth: 0.1
    }, this.scene);
    var frame4 = BABYLON.MeshBuilder.CreateBox('frame4', {
      width: 0.1,
      height: 1,
      depth: 0.1
    }, this.scene);

    frame1.position = new BABYLON.Vector3(-0.5, 0, -0.5)
    frame2.position = new BABYLON.Vector3(-0.5, 0, 0.5)
    frame3.position = new BABYLON.Vector3(0.5, 0, -0.5)
    frame4.position = new BABYLON.Vector3(0.5, 0, 0.5)

    var frames = [frame1, frame2, frame3, frame4];

    var mergedFrame = BABYLON.Mesh.MergeMeshes(frames, true);

    frames = null;

    var board = BABYLON.MeshBuilder.CreatePlane('board', {
      width: 1,
      height: 1,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, this.scene);

    // board.rotation.x = - Math.PI / 2
    // board.material.alpha = 0.5;

    var stockCount = 0;
    var frameCount = 0;
    var boardCount = 0;
    components.forEach(component => {
      if (component.type == 'rack') {
        frameCount++;
        boardCount += component.shelves - 1;
        stockCount += component.shelves;
      }
    });

    var racks = components.filter(c => {
      return c.type == 'rack'
    })

    this.sps.addShape(mergedFrame, frameCount)
    this.sps.addShape(board, boardCount)
    this.sps.addShape(stock, stockCount)

    mergedFrame.dispose();
    board.dispose();
    stock.dispose();

    // this.assetsManager.load();

    this.sps.buildMesh();

    this.sps.initParticles = function () {
      var stockP = 0;
      var boardP = 0;

      for (var i = 0; i < racks.length; i++) {
        var rack = this.transcoord3d(racks[i]);
        var frameParticle = this.sps.particles[i];

        frameParticle._sceneModel = rack;
        frameParticle.position.x = rack.x;
        frameParticle.position.y = rack.y + rack.height * rack.shelves / 2 - rack.height / 2;
        frameParticle.position.z = rack.z;

        frameParticle.scaling = new BABYLON.Vector3(rack.width, rack.height * rack.shelves, rack.depth);

        for (var s = 0; s < rack.shelves; s++) {
          if (s < rack.shelves - 1) {
            var boardParticle = this.sps.particles[frameCount + boardP];
            boardParticle._sceneModel = rack;
            boardParticle.position.x = rack.x;
            boardParticle.position.y = (s + 0.5) * rack.height + rack.y;
            boardParticle.position.z = rack.z;

            boardParticle.rotation.x = - Math.PI / 2

            boardParticle.scaling = new BABYLON.Vector3(rack.width, rack.depth, 1);

            boardP++;
          }

          var particle = this.sps.particles[frameCount + boardCount + stockP];
          var stock = JSON.parse(JSON.stringify(rack));
          var location = this.makeLocationString(stock, this.makeShelfString(stock.shelfPattern, s + 1, stock.shelves));
          stock.width *= 0.7;
          stock.height *= 0.7;
          stock.depth *= 0.7;
          stock.y = s * rack.height - (rack.height - stock.height) / 2 + stock.y;

          particle._sceneModel = stock;
          particle.position.x = stock.x;
          particle.position.y = stock.y;
          particle.position.z = stock.z;

          particle.color = BABYLON.Color3.FromHexString('#ccaa76')

          particle.scaling = new BABYLON.Vector3(stock.width, stock.height, stock.depth);

          this.putObject(location, particle);

          stockP++;
        }

      }
    }.bind(this)
    this.sps.initParticles();
    this.sps.setParticles();
    this.sps.refreshVisibleSize();


    this.sps.updateParticle = function (p) {
      if (p.shapeId !== 2)
        return;

      if (p == this._pickedStock.mesh) {
        p.rotation.y += 0.02;
        return;
      }

      // if (p.userData) {
      //   var color = BABYLON.Color3.FromHexString('#ccaa76')
      //   switch (p.userData.status || p.userData.gubun) {
      //     case 'A':
      //       color = new BABYLON.Color3.Red()
      //       break;
      //     case 'B':
      //       color = new BABYLON.Color3.Blue()
      //       break;
      //     case 'C':
      //       color = new BABYLON.Color3.Green()
      //       break;
      //     case 'D':
      //       color = new BABYLON.Color3.Black()
      //       break;
      //   }

      //   if(color)
      //     p.color = color;
      // }

      if (p._originColor)
        p.color = p._originColor;
      p.rotation.y = 0;
    }.bind(this)



    var start = 0;
    var end = 0;
    var particleUpdated = 200;

    this.scene.registerBeforeRender(function () {
      if (end >= this.sps.particles.length - 1) {
        start = 0;
      }
      end = start + particleUpdated;
      this.sps.setParticles(start, end);
      start = end + 1;

      if (this._pickedStock.mesh && this._pickedStock.mesh.idx > -1)
        this.sps.setParticles(this._pickedStock.mesh.idx, this._pickedStock.mesh.idx);
    }.bind(this));

    this.engine.runRenderLoop(function () {
      this.scene.render();
    }.bind(this));

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

    this.assetsManager.onFinish = function (tasks) {
      this.createObjects(this.hierarchy.components)
      // this.engine.runRenderLoop(function() {
      //     this.scene.render();
      // }.bind(this));
    }.bind(this);

    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    var camera = new BABYLON.ArcRotateCamera('camera1', 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);
    // camera.upperBetaLimit = 1.4835298642;
    camera.allowUpsideDown = false;

    // target the camera to scene origin
    camera.setPosition(new BABYLON.Vector3(0, minSize, maxSize));
    // camera.setPosition(new BABYLON.Vector3(0, minSize, hypotenuseSize));

    // attach the camera to the canvas
    camera.attachControl(this.engine.getRenderingCanvas(), true);

    console.log(this.engine.getRenderingCanvas())

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

    this.assetsManager.load();

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

      ctx.drawImage(
        this.engine.getRenderingCanvas(), 0, 0, width, height,
        left, top, width, height
      )
    } else {
      super._post_draw(ctx);
    }
  }

  _initialize() {
    if (this._initialized)
      return;

    var {
      components
    } = this.hierarchy
    var {
      width,
      height,
      antialias
    } = this.model

    var transModel = this.transcoord3d(this.model);

    // load the 3D engine
    var canvas = document.createElement('canvas')

    this.engine = new BABYLON.Engine(canvas, antialias, null, false);

    canvas.width = width;
    canvas.height = height;

    // call the createScene function
    this.scene = this.createScene();

    if (this.model.showAxis)
      this.showAxis(Math.min(transModel.width, transModel.depth));

    this.sps = new BABYLON.SolidParticleSystem('sps', this.scene, { isPickable: true });

    // run the render loop
    this.engine.runRenderLoop(function () {
      this.scene.render();
      this.invalidate();
    }.bind(this));

    // the canvas/window resize event handler
    window.addEventListener('resize', function () {
      this.engine.resize();
    }.bind(this));

    // this.createObjects(components)

    // this.scene.freezeActiveMeshes();

    this.sps.computeParticleTexture = false;

    this.scene.onPointerObservable.add(function (pointerInfo, evt) {
      var pickInfo = pointerInfo.pickInfo
      var faceId = pickInfo.faceId;

      if (faceId == -1 || pointerInfo.type !== BABYLON.PointerEventTypes.POINTERPICK) { return; }
      var idx = this.sps.pickedParticles[faceId].idx;
      var p = this.sps.particles[idx];

      if (p.shapeId !== 2)
        return;

      var lastPickedIndex = -1;
      if (this._pickedStock.mesh != p) {
        if (this._pickedStock.mesh)
          lastPickedIndex = this._pickedStock.mesh.idx
        this._pickedStock.mesh = p;
        p._originColor = p.color;
        p.color = new BABYLON.Color3.Teal();
      }

      if (lastPickedIndex > -1) {
        this.sps.setParticles(lastPickedIndex, lastPickedIndex);
      }

    }.bind(this))

    this._pickedStock = {}

    this._initialized = true;
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

  makeLocationString(model, shelfString) {
    var {
      locPattern = "{z}{s}-{u}-{sh}",
      zone = "",
      section = "",
      unit = ""
    } = model

    var locationString = locPattern

    locationString = locationString.replace(/{z}/i, zone);
    locationString = locationString.replace(/{s}/i, section);
    locationString = locationString.replace(/{u}/i, unit);
    locationString = locationString.replace(/{sh}/i, shelfString);

    return locationString;
  }

  makeShelfString(pattern, shelf, length) {
    /**
     *  pattern #: 숫자
     *  pattern 0: 고정 자리수
     *  pattern -: 역순
     */

    if (!pattern || !shelf || !length)
      return

    var isReverse = /^\-/.test(pattern);
    pattern = pattern.replace(/#+/, '#');

    var fixedLength = (pattern.match(/0/g) || []).length || 0
    var shelfString = String(isReverse ? length - shelf + 1 : shelf)

    if (shelfString.length > fixedLength && fixedLength > 0) {
      shelfString = shelfString.split('').shift(shelfString.length - fixedLength).join('')
    } else {
      var prefix = '';
      for (var i = 0; i < fixedLength - shelfString.length; i++) {
        prefix += '0';
      }
      shelfString = prefix + shelfString;
    }

    return shelfString
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
    transPos.z = top - this.model.height / 2 + height / 2;

    return transPos
  }

  get nature() {
    return NATURE
  }

  setStockColor(stock) {
    if (!stock.userData)
      return;

    var color = BABYLON.Color3.FromHexString('#ccaa76')
    switch (stock.userData.status || stock.userData.gubun) {
      case 'A':
        color = new BABYLON.Color3.Red()
        break;
      case 'B':
        color = new BABYLON.Color3.Blue()
        break;
      case 'C':
        color = new BABYLON.Color3.Green()
        break;
      case 'D':
        color = new BABYLON.Color3.Black()
        break;
    }

    if(color)
      stock.color = color;
  }

  onchangeData(after, before) {

    if (after.data instanceof Array) {
      /**
       *  Array type data
       *  (e.g. data: [{
       *    'loc' : 'location1',
       *    'description': 'description1'
       *  },
       *  ...
       *  ])
       */
      after.data.forEach(d => {
        let data = d

        // setTimeout(function () {
          let loc = data.loc || data.LOC || data.location || data.LOCATION;
          let object = this.getObject(loc)
          if (object) {
            object.userData = data;
            this.setStockColor(object);
          }
        // }.bind(this))
      })
    } else {
      /**
       *  Object type data
       *  (e.g. data: {
       *    'location1': {description: 'description'},
       *    ...
       *  })
       */
      for (var loc in after.data) {
        let location = loc
        if (after.data.hasOwnProperty(location)) {

          // setTimeout(function () {
            let d = after.data[location]
            let object = this.getObject(location)
            if (object) {
              object.userData = d;
              this.setStockColor(object);
            }
          // }.bind(this))

        }
      }
    }
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
    if (this.engine)
      this.engine.isPointerLock = true;

  }
  onmouseup(e) {
    if (this.engine)
      this.engine.isPointerLock = false;

  }

  // onmousemove(e) {
  //   if (this.engine) {

  //   }
  // }

  onmouseleave(e) {
    if (!this._scene2d)
      return

    var tooltip = this._scene2d.getObjectByName('tooltip')
    if (tooltip) {
      this._scene2d.remove(tooltip)
    }
  }

  onwheel(e) {
    if (this.engine) {

      e.stopPropagation()
    }
  }

  ondragstart(e) {
    // if (this._controls) {
      var pointer = this.transcoordC2S(e.offsetX, e.offsetY)

      // this._mouse.originX = this.getContext().canvas.offsetLeft +e.offsetX;
      // this._mouse.originY = this.getContext().canvas.offsetTop + e.offsetY;

      // this._controls.onDragStart(e)
    console.log(e)

    var obj = e;
    obj.movementX = e.offsetX;
    obj.movementY = e.offsetY;

      var mouseEvent = new MouseEvent("mousemove", e);

      this.engine.getRenderingCanvas().dispatchEvent(mouseEvent)
      e.stopPropagation()
    // }
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

