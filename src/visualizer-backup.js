/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Component3d from './component-3d'

import ThreeControls from './three-controls'

import { Component, Container, Layout, Layer } from '@hatiolab/things-scene'

THREE.Cache.enabled = true

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'number',
      label: 'fov',
      name: 'fov',
      property: 'fov'
    },
    {
      type: 'number',
      label: 'near',
      name: 'near',
      property: 'near'
    },
    {
      type: 'number',
      label: 'far',
      name: 'far',
      property: 'far'
    },
    {
      type: 'number',
      label: 'zoom',
      name: 'zoom',
      property: 'zoom'
    },
    {
      type: 'select',
      label: 'precision',
      name: 'precision',
      property: {
        options: [
          {
            display: 'High',
            value: 'highp'
          },
          {
            display: 'Medium',
            value: 'mediump'
          },
          {
            display: 'Low',
            value: 'lowp'
          }
        ]
      }
    },
    {
      type: 'checkbox',
      label: 'anti-alias',
      name: 'antialias',
      property: 'antialias'
    },
    {
      type: 'checkbox',
      label: 'auto-rotate',
      name: 'autoRotate',
      property: 'autoRotate'
    },
    {
      type: 'checkbox',
      label: 'show-axis',
      name: 'showAxis',
      property: 'showAxis'
    },
    {
      type: 'checkbox',
      label: '3dmode',
      name: 'threed',
      property: 'threed'
    },
    {
      type: 'checkbox',
      label: 'debug',
      name: 'debug',
      property: 'threed'
    },
    {
      type: 'string',
      label: 'location-field',
      name: 'locationField'
    },
    {
      type: 'string',
      label: 'popup-scene',
      name: 'popupScene'
    },
    {
      type: 'string',
      label: 'legend-target',
      name: 'legendTarget'
    },
    {
      type: 'number',
      label: 'rotation-speed',
      name: 'rotationSpeed'
    }
  ]
}

const WEBGL_NO_SUPPORT_TEXT = 'WebGL no support'

function registerLoaders() {
  if (!registerLoaders.done) {
    THREE.Loader.Handlers.add(/\.tga$/i, new THREE.TGALoader())
    registerLoaders.done = true
  }
}

export default class Visualizer extends Container {
  get legendTarget() {
    var { legendTarget } = this.model

    if (!this._legendTarget && legendTarget) {
      this._legendTarget = this.root.findById(legendTarget)
      this._legendTarget && this._legendTarget.on('change', this.onLegendTargetChanged, this)
    }

    return this._legendTarget
  }

  containable(component) {
    return component.is3dish()
  }

  putObject(id, object) {
    if (!this._objects) this._objects = {}

    this._objects[id] = object
  }

  getObject(id) {
    if (!this._objects) this._objects = {}

    return this._objects[id]
  }

  /* THREE Object related .. */

  createFloor(color, width, height) {
    let fillStyle = this.model.fillStyle

    var floorMaterial

    var self = this

    if (fillStyle.type == 'pattern' && fillStyle.image) {
      var floorTexture = this._textureLoader.load(this.app.url(fillStyle.image), function(texture) {
        texture.minFilter = THREE.LinearFilter
        self.render_threed()
      })

      var floorMaterial = [
        (floorMaterial = new THREE.MeshStandardMaterial({
          color: color
        })),
        (floorMaterial = new THREE.MeshStandardMaterial({
          color: color
        })),
        (floorMaterial = new THREE.MeshStandardMaterial({
          color: color
        })),
        (floorMaterial = new THREE.MeshStandardMaterial({
          color: color
        })),
        new THREE.MeshStandardMaterial({
          map: floorTexture
        }),
        (floorMaterial = new THREE.MeshStandardMaterial({
          color: color
        }))
      ]
    } else {
      floorMaterial = new THREE.MeshStandardMaterial({
        color: color
      })
    }

    var floorGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
    // var floorGeometry = new THREE.PlaneGeometry(width, height)

    var floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.scale.set(width, height, 5)

    // floor.receiveShadow = true

    floor.rotation.x = -Math.PI / 2
    floor.position.y = -2

    floor.name = 'floor'

    this._scene3d.add(floor)
  }

  async createObjects(components, canvasSize) {
    components.forEach(component => {
      // requestAnimationFrame(() => {
      var clazz = Component3d.register(component.model.type)

      if (!clazz) {
        console.warn('Class not found : 3d class is not exist')
        return
      }

      var item = new clazz(component.hierarchy, canvasSize, this, component)

      if (item) {
        // requestAnimationFrame(() => {
        item.name = component.model.id
        this._scene3d.add(item)
        this.putObject(component.model.id, item)
        // })
      }
    })
    // })
  }

  destroy_scene3d() {
    this.stop()

    window.removeEventListener('focus', this._onFocus)

    if (this._renderer) this._renderer.clear()
    delete this._renderer
    delete this._camera
    delete this._2dCamera
    delete this._keyboard
    delete this._controls
    delete this._projector
    delete this._load_manager
    delete this._objects

    if (this._scene3d) {
      let children = this._scene3d.children.slice()
      for (let i in children) {
        let child = children[i]
        if (child.dispose) child.dispose()
        if (child.geometry && child.geometry.dispose) child.geometry.dispose()
        if (child.material && child.material.dispose) child.material.dispose()
        if (child.texture && child.texture.dispose) child.texture.dispose()
        this._scene3d.remove(child)
      }
    }

    delete this._scene3d
  }

  init_scene3d() {
    this.trigger('visualizer-initialized', this)

    this.root.on('redraw', this.onredraw, this)

    if (this._scene3d) this.destroy_scene3d()

    registerLoaders()
    this._textureLoader = new THREE.TextureLoader()
    this._textureLoader.withCredential = true
    this._textureLoader.crossOrigin = 'use-credentials'

    this._exporter = new THREE.OBJExporter()

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
      legendTarget
    } = this.model
    var components = this.components || []

    // SCENE
    this._scene3d = new THREE.Scene()

    // CAMERA
    var aspect = width / height

    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    this._scene3d.add(this._camera)
    this._camera.position.set(height * 0.8, Math.floor(Math.min(width, height)), width * 0.8)
    this._camera.lookAt(this._scene3d.position)
    this._camera.zoom = this.model.zoom * 0.01

    if (this.model.showAxis) {
      var axisHelper = new THREE.AxisHelper(width)
      this._scene3d.add(axisHelper)
    }

    try {
      // RENDERER
      this._renderer = new THREE.WebGLRenderer({
        precision: precision,
        alpha: true,
        antialias: antialias
      })
    } catch (e) {
      this._noSupportWebgl = true
    }

    if (this._noSupportWebgl) return

    this._renderer.autoClear = true

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
    this.mixers = new Array()

    this.createFloor(fillStyle, width, height)
    this.createObjects(components, {
      width,
      height
    })

    this._load_manager = new THREE.LoadingManager()
    this._load_manager.onProgress = function(item, loaded, total) {}

    this._onFocus = function() {
      this.render_threed()
    }.bind(this)

    window.addEventListener('focus', this._onFocus)
  }

  threed_animate() {
    // this._animationFrame = requestAnimationFrame(this._threed_animate_func);

    this._controls.update()
    this.render_threed()
  }

  stop() {
    // cancelAnimationFrame(this._animationFrame)
  }

  // update() {
  //   if (this._need_control_update || this.get('autoRotate')) {
  //     this._controls.update()
  //     this._need_control_update = false;
  //   } else {
  //     // this.invalidate()
  //     // this.render_threed();
  //   }
  // }

  get scene3d() {
    if (!this._scene3d) this.init_scene3d()
    return this._scene3d
  }

  render_threed() {
    // var delta
    // if (this._clock)
    //   delta = this._clock.getDelta();

    // var mixers = this.mixers
    // for (var i in mixers) {
    //   if (mixers.hasOwnProperty(i)) {
    //     var mixer = mixers[i];
    //     if (mixer) {
    //       mixer.update(delta);
    //     }

    //   }
    // }

    if (this._renderer) {
      // this._renderer.clear()
      this._renderer.render(this._scene3d, this._camera)
    }
  }

  /* Container Overides .. */
  _draw(ctx) {
    if (this.app.isViewMode) {
      if (!this.model.threed) this.model.threed = true
    }

    if (this.model.threed && !this._noSupportWebgl) {
      return
    }

    super._draw(ctx)
  }

  _post_draw(ctx) {
    var { left, top, width, height, debug, threed } = this.model

    if (threed) {
      if (!this._scene3d) {
        this.init_scene3d()
        this.render_threed()
      }

      if (this._noSupportWebgl) {
        this._showWebglNoSupportText(ctx)
        return
      }

      if (this._dataChanged) {
        this._onDataChanged()
      }

      ctx.drawImage(this._renderer.domElement, 0, 0, width, height, left, top, width, height)

      if (debug) {
        ctx.font = 100 + 'px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = 'black'
        ctx.globalAlpha = 0.5
        ctx.fillText(scene.FPS(), 100, 100)
        this.invalidate()
      }
    } else {
      super._post_draw(ctx)
    }
  }

  dispose() {
    this._legendTarget && this._legendTarget.off('change', this.onLegendTargetChanged, this)
    delete this._legendTarget

    this.root.off('redraw', this.onredraw, this)

    this.destroy_scene3d()

    super.dispose()
  }

  get layout() {
    return Layout.get('three')
  }

  get nature() {
    return NATURE
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
    if (!this._camera) return

    this._raycaster.setFromCamera(vector, this._camera)

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = this._raycaster.intersectObjects(this._scene3d.children, true)

    return intersects
  }

  exportModel() {
    var exported = this._exporter.parse(this._scene3d)
    var blob = new Blob([exported], { type: 'text/plain;charset=utf-8' })
    console.log(exported)
    // saveAs(blob, "exported.txt");
  }

  _showWebglNoSupportText(context) {
    context.save()

    var { width, height } = this.model

    context.font = width / 20 + 'px Arial'
    context.textAlign = 'center'
    context.fillText(WEBGL_NO_SUPPORT_TEXT, width / 2 - width / 40, height / 2)

    context.restore()
  }

  resetMaterials() {
    if (!this._stock_materials) return

    this._stock_materials.forEach(m => {
      if (m.dispose) m.dispose()
    })

    delete this._stock_materials
  }

  _onDataChanged() {
    var locationField = this.getState('locationField') || 'location'

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

          let loc = data[locationField]
          let object = this.getObject(loc)
          if (object) {
            object.userData = data
            object.onUserDataChanged()
          }
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
            let d = this._data[location]
            let object = this.getObject(location)
            if (object) {
              object.userData = d
              object.onUserDataChanged()
            }
          }
        }
      }
    }

    this._dataChanged = false

    this.invalidate()
  }

  /* Event Handlers */

  onLegendTargetChanged(after, before) {
    if (after.hasOwnProperty('status') && before.hasOwnProperty('status')) this.resetMaterials()
  }

  onchange(after, before) {
    if (before.hasOwnProperty('legendTarget') || after.hasOwnProperty('legendTarget')) {
      this._legendTarget && this._legendTarget.off('change', this.onLegendTargetChanged, this)
      delete this._legendTarget
      this.resetMaterials()
      this._onDataChanged()
    }

    if (after.hasOwnProperty('width') || after.hasOwnProperty('height') || after.hasOwnProperty('threed'))
      this.destroy_scene3d()

    if (after.hasOwnProperty('autoRotate')) {
      if (this._controls) this._controls.autoRotate = after.autoRotate
    }

    if (
      after.hasOwnProperty('fov') ||
      after.hasOwnProperty('near') ||
      after.hasOwnProperty('far') ||
      after.hasOwnProperty('zoom')
    ) {
      if (this._camera) {
        this._camera.near = this.model.near
        this._camera.far = this.model.far
        this._camera.zoom = this.model.zoom * 0.01
        this._camera.fov = this.model.fov
        this._camera.updateProjectionMatrix()

        this._controls.cameraChanged = true

        this.invalidate()
      }
    }

    if (after.hasOwnProperty('data')) {
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
      if (this._lastFocused) this._lastFocused._focused = false

      var modelLayer = Layer.register('model-layer')
      var popup = modelLayer.Popup
      var ref = this.model.popupScene

      var pointer = this.transcoordC2S(e.offsetX, e.offsetY)

      // this._mouse.originX = this.getContext().canvas.offsetLeft +e.offsetX;
      // this._mouse.originY = this.getContext().canvas.offsetTop + e.offsetY;

      this._mouse.x = ((pointer.x - this.model.left) / this.model.width) * 2 - 1
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1

      var object = this.getObjectByRaycast()

      if (object && object.onmouseup) {
        if (ref) object.onmouseup(e, this, popup.show.bind(this, this, ref))
        object._focused = true
        this._lastFocused = object
      } else {
        popup.hide(this.root)
      }

      e.stopPropagation()
    }
  }

  onmousemove(e) {
    if (this._controls) {
      var pointer = this.transcoordC2S(e.offsetX, e.offsetY)

      // this._mouse.originX = this.getContext().canvas.offsetLeft +e.offsetX;
      // this._mouse.originY = this.getContext().canvas.offsetTop + e.offsetY;

      this._mouse.x = ((pointer.x - this.model.left) / this.model.width) * 2 - 1
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1

      this._controls.onMouseMove(e)

      e.stopPropagation()
    }
  }

  onmouseleave(e) {
    if (!this._scene2d) return

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

      this._mouse.x = ((pointer.x - this.model.left) / this.model.width) * 2 - 1
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1

      this._controls.onDragStart(e)
      e.stopPropagation()
    }
  }

  ondragmove(e) {
    if (this._controls) {
      this._controls.cameraChanged = true
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
    var delta = 0
    var zoom = this.model.zoom

    delta = -event.deltaY
    zoom += delta * 0.1
    if (zoom < 100) zoom = 100

    this.set('zoom', zoom)
  }

  onredraw() {
    this.threed_animate()
  }
}

Component.register('visualizer', Visualizer)
