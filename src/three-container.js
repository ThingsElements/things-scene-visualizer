/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, Container, error, FPS, Layer, Layout, ScriptLoader } from '@hatiolab/things-scene'
import * as THREE from 'three'
import Component3d from './component-3d'
import ThreeControls from './three-controls'

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
    }
  ]
}

const WEBGL_NO_SUPPORT_TEXT = 'WebGL no support'

function registerLoaders() {
  if (!registerLoaders.done) {
    // THREE.Loader.Handlers.add(/\.tga$/i, new THREE.TGALoader());
    registerLoaders.done = true
  }
}

export default class ThreeContainer extends Container {
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

  added() {
    if (!this.app.isViewMode) return

    if (!THREE) {
      ScriptLoader.load(three).then(() => {
        THREE.Cache.enabled = true
        // require('./object-3d-overload');
        // ScriptLoader.load
        // loadLoaders();
      }, error)
    }
  }

  /* THREE Object related .. */

  createFloor(color, width, height) {
    let fillStyle = this.model.fillStyle

    var floorMaterial

    if (fillStyle.type == 'pattern' && fillStyle.image) {
      var floorTexture = this._textureLoader.load(this.app.url(fillStyle.image), texture => {
        texture.minFilter = THREE.LinearFilter
        texture.repeat.set(1, 1)
        this.render_threed()
      })

      floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture,
        side: THREE.DoubleSide
      })
    } else {
      floorMaterial = new THREE.MeshStandardMaterial({
        color: color,
        side: THREE.FrontSide
      })
    }

    var floorGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
    var floor = new THREE.Mesh(floorGeometry, floorMaterial)

    floor.scale.set(width, height, 5)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -2

    floor.name = 'floor'

    this._scene3d.add(floor)
  }

async createObjects(components, canvasSize) {
    components.forEach(component => {
      var clazz = Component3d.register(component.model.type)
      if (!clazz) {
        console.warn(`Class not found : 3d ${component.model.type} class is not exist`)
        return
      }

      var item = new clazz(component.hierarchy, canvasSize, this, component)
      if (item) {
        item.name = component.model.id
        this._scene3d.add(item)
        this.putObject(component.model.id, item)
      }
    })
  }

  createHeatmap(width, height) {
    if (this._model.useHeatmap === false) return

    var div = document.createElement('div')

    this._heatmap = {}
    // h337.create({
    //   container: div,
    //   width: width,
    //   height: height,
    //   radius: Math.sqrt(width * width + height * height) / 4
    // })

    var heatmapMaterial = new THREE.MeshStandardMaterial({
      side: THREE.FrontSide,
      transparent: true,
      visible: false
    })

    var heatmapGeometry = new THREE.PlaneGeometry(width, height)

    var heatmap = new THREE.Mesh(heatmapGeometry, heatmapMaterial)

    heatmap.rotation.x = -Math.PI / 2
    heatmap.position.y = -1

    heatmap.name = 'heatmap'

    this._scene3d.add(heatmap)
  }

  navigatePath(targetNames) {
    var currentPosition = {
      x: 0,
      y: 0,
      z: 0
    }

    for (let i in targetNames) {
      let targetName = targetNames[i]
      let targetObject = this.findTarget(targetName)

      this.emphasizeTarget(targetObject)

      let targetRack = targetObject.parent
      targetRack.geometry.computeBoundingBox()
      let targetRackBoundBox = targetRack.geometry.boundingBox

      // let targetPath = this.findPath(targetName)
      let sprite = this.createMarker(Number(i) + 1)
      sprite.position.set(0, 100, 0)

      sprite.position.set(0, targetRackBoundBox.max.y + 25, 0)

      sprite.name = targetName + '-marker'

      targetRack.add(sprite)
      // this._scene3d.add(sprite)

      //
      // this._scene3d.add(sprite)

      // if(targetPath)
      //   currentPosition = this.drawPath(currentPosition, targetPath)
    }

    this.render_threed()
  }

  findTarget(name) {
    var targetObject = this._scene3d.getObjectByName(name, true)
    if (!targetObject) return

    return targetObject
  }

  emphasizeTarget(object) {
    this._scene3d.updateMatrixWorld()

    var box = new THREE.Mesh(object.geometry.clone(), object.material.clone())

    box.name = object.name + '-emp'
    box.material.color.set(0x44a6f6)
    box.raycast = function() {}

    box.position.copy(object.getWorldPosition())

    this._scene3d.add(box)
  }

  findPath(target) {
    var targetObject = this._scene3d.getObjectByName(target, true)
    if (!targetObject) return

    targetObject = targetObject.parent // 찾은 stock에 강조표시를 하면 눈이 띄지 않는다.
    // 부모(Rack)에 강조표시.

    // targetObject.updateMatrix()
    this._scene3d.updateMatrixWorld()

    var position = targetObject.getWorldPosition()

    var scale = targetObject.getWorldScale()

    var box = new THREE.BoxHelper(targetObject, 0xff3333)

    box.material.linewidth = this.model.zoom * 0.1

    this._scene3d.add(box)

    // this.makeTextSprite()

    // var box = new THREE.BoxHelper(targetObject, 0xff3333)
    // box.material.linewidth = 10
    //
    // this._scene3d.add(box)

    // position =

    return {
      x: position.x,
      y: position.y,
      z: position.z
    }
  }

  drawPath(current, target) {
    let tX = target.x
    let tY = target.y
    let tZ = target.z

    let cX = current.x
    let cY = current.y
    let cZ = current.z

    let lineWidth = 5

    let material = new THREE.LineBasicMaterial({
      color: 0xff3333,
      linewidth: lineWidth
    })

    let geometry = new THREE.Geometry()

    geometry.vertices.push(new THREE.Vector3(cX, 0, cZ))
    geometry.vertices.push(new THREE.Vector3(tX, 0, tZ))

    let line = new THREE.Line(geometry, material)

    this._scene3d.add(line)

    return target
  }

  updateHeatmapTexture() {
    var heatmap = this._scene3d.getObjectByName('heatmap', true)

    var texture = new THREE.Texture(this._heatmap._renderer.canvas)
    texture.needsUpdate = true

    heatmap.material.map = texture

    heatmap.material.visible = true
  }

  createMarker(message) {
    var fontFace = 'Arial'
    var fontSize = 32
    var textColor = 'rgba(255,255,255,1)'
    var vAlign = 'middle'
    var hAlign = 'center'
    var padding = 10

    var image = new Image()
    image.src =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH0AAABuCAYAAAAKwhwQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3MkZDRjQ0RjVDOTYxMUU2QjMxRjhENEQwQjZBMjk5OSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3MkZDRjQ1MDVDOTYxMUU2QjMxRjhENEQwQjZBMjk5OSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjcyRkNGNDRENUM5NjExRTZCMzFGOEQ0RDBCNkEyOTk5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjcyRkNGNDRFNUM5NjExRTZCMzFGOEQ0RDBCNkEyOTk5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+nKWOowAAIaRJREFU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'

    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')

    // document.body.appendChild(canvas)

    canvas.width = image.width
    canvas.height = image.height

    context.font = fontSize + 'px ' + fontFace
    context.textBaseline = 'alphabetic'
    context.textAlign = 'left'

    var cx = canvas.width / 2
    var cy = canvas.height / 2

    var metrics = context.measureText(String(message))
    var textWidth = metrics.width

    var tx = textWidth / 2.0
    var ty = fontSize / 2.0

    // then adjust for the justification
    if (vAlign == 'bottom') ty = fontSize
    else if (vAlign == 'top') ty = 0

    if (hAlign == 'left') tx = textWidth
    else if (hAlign == 'right') tx = 0

    context.drawImage(image, cx - image.width * 0.5, cy - image.height * 0.5, image.width, image.height)

    // text color
    context.fillStyle = textColor

    var offsetY = cy - fontSize * 0.5 + padding

    context.fillText(message, cx - tx, offsetY)

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true

    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture
    })
    var sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(Math.floor(image.width * 0.5), Math.floor(image.height * 0.5), 1)
    // sprite.scale.set(canvas.width, canvas.height,1.0);

    sprite.raycast = function() {}

    return sprite
  }

  makeTextSprite(message, parameters) {
    if (!message) return

    if (parameters === undefined) parameters = {}

    var fontFace = parameters.hasOwnProperty('fontFace') ? parameters['fontFace'] : 'Arial'

    var fontSize = parameters.hasOwnProperty('fontSize') ? parameters['fontSize'] : 32

    var textColor = parameters.hasOwnProperty('textColor') ? parameters['textColor'] : 'rgba(255,255,255,1)'

    var borderWidth = parameters.hasOwnProperty('borderWidth') ? parameters['borderWidth'] : 2

    var borderColor = parameters.hasOwnProperty('borderColor') ? parameters['borderColor'] : 'rgba(0, 0, 0, 1.0)'

    var backgroundColor = parameters.hasOwnProperty('backgroundColor')
      ? // parameters["backgroundColor"] : 'rgba(51, 51, 51, 1.0)';
        parameters['backgroundColor']
      : 'rgba(0, 0, 0, 0.7)'

    var radius = parameters.hasOwnProperty('radius') ? parameters['radius'] : 30

    var vAlign = parameters.hasOwnProperty('vAlign') ? parameters['vAlign'] : 'middle'

    var hAlign = parameters.hasOwnProperty('hAlign') ? parameters['hAlign'] : 'center'

    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')

    // document.body.appendChild(canvas)

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    context.font = fontSize + 'px ' + fontFace
    context.textBaseline = 'alphabetic'
    context.textAlign = 'left'

    var textWidth = 0

    var msgArr = String(message)
      .trim()
      .split('\n')

    var cx = canvas.width / 2
    var cy = canvas.height / 2

    for (let i in msgArr) {
      // get size data (height depends only on font size)
      var metrics = context.measureText(msgArr[i])

      if (textWidth < metrics.width) textWidth = metrics.width
    }

    var tx = textWidth / 2.0
    var ty = fontSize / 2.0

    // then adjust for the justification
    if (vAlign == 'bottom') ty = fontSize
    else if (vAlign == 'top') ty = 0

    if (hAlign == 'left') tx = textWidth
    else if (hAlign == 'right') tx = 0

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
    )

    // text color
    context.fillStyle = textColor
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
      )
    }

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true

    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture
    })
    var sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(600, 300, 1)
    // sprite.scale.set(canvas.width, canvas.height, 1.0);

    sprite.raycast = function() {}

    return sprite
  }

  destroy_scene3d() {
    this.stop()
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

    if (this._scene2d) {
      let children = this._scene2d.children.slice()
      for (let i in children) {
        let child = children[i]
        if (child.dispose) child.dispose()
        if (child.geometry && child.geometry.dispose) child.geometry.dispose()
        if (child.material && child.material.dispose) child.material.dispose()
        if (child.texture && child.texture.dispose) child.texture.dispose()
        this._scene2d.remove(child)
      }
    }

    delete this._scene2d
  }

  init_scene3d() {
    this.root.on('redraw', this.onredraw, this)

    if (this._scene3d) this.destroy_scene3d()

    registerLoaders()
    this._textureLoader = new THREE.TextureLoader()
    this._textureLoader.withCredential = true
    this._textureLoader.crossOrigin = 'use-credentials'

    // this._exporter = new THREE.OBJExporter();

    var { width, height } = this.bounds

    var {
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
    this._camera.position.set(height * 0.8, Math.floor(Math.min(width, height)), width * 0.8)
    this._2dCamera.position.set(height * 0.8, Math.floor(Math.min(width, height)), width * 0.8)
    this._camera.lookAt(this._scene3d.position)
    this._2dCamera.lookAt(this._scene2d.position)
    this._camera.zoom = this.model.zoom * 0.01

    if (this.model.showAxis) {
      var axisHelper = new THREE.AxesHelper(width)
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

    this._renderer.autoClear = false

    this._renderer.setClearColor(0xffffff, 0) // transparent
    this._renderer.setSize(Math.min(width, window.innerWidth), Math.min(height, window.innerHeight))
    // this._renderer.setSize(1600, 900)
    // this._renderer.shadowMap.enabled = true

    // CONTROLS
    this._controls = new ThreeControls(this._camera, this)
    this._controls.cameraChanged = true

    // LIGHT
    var _light = new THREE.HemisphereLight(light, 0x000000, 1)
    _light.position.set(-this._camera.position.x, this._camera.position.y, -this._camera.position.z)
    this._camera.add(_light)

    this._raycaster = new THREE.Raycaster()
    this._mouse = new THREE.Vector2()

    this._tick = 0
    this._clock = new THREE.Clock(true)
    this.mixers = new Array()

    this.createHeatmap(width, height)
    this.createFloor(fillStyle, width, height)
    this.createObjects(components, {
      width,
      height
    })

    this._camera.updateProjectionMatrix()

    this._onFocus = function() {
      this.render_threed()
    }.bind(this)

    window.addEventListener('focus', this._onFocus)

    this.invalidate()
  }

  threed_animate() {
    if (!this._controls) return

    this._controls.update()
    this.render_threed()
  }

  stop() {}

  get scene3d() {
    if (!this._scene3d) this.init_scene3d()
    return this._scene3d
  }

  get scene2d() {
    return this._scene2d
  }

  update() {
    this._controls.update()
    this.render_threed()
  }

  get scene3d() {
    if (!this._scene3d) this.init_scene3d()
    return this._scene3d
  }

  render_threed() {
    var delta
    if (this._clock) delta = this._clock.getDelta()

    var mixers = this.mixers
    for (var i in mixers) {
      if (mixers.hasOwnProperty(i)) {
        var mixer = mixers[i]
        if (mixer) {
          mixer.update(delta)
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
  render(ctx) {
    if (this.app.isViewMode) {
      if (!this.model.threed) this.model.threed = true
    }

    if (this.model.threed && !this._noSupportWebgl) {
      return
    }

    super.render(ctx)
  }

  postrender(ctx) {
    var { left, top, debug, threed } = this.model

    var { width, height } = this.bounds

    // ios에서 width, height에 소수점이 있으면 3d를 표현하지 못하는 문제가 있어 정수화
    width = Math.floor(width)
    height = Math.floor(height)

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

      if (this._loadComplete === false) return

      if (!this._renderer) return

      var rendererSize = this._renderer.getSize()
      var { width: rendererWidth, height: rendererHeight } = rendererSize

      this.showTooltip(this._selectedPickingLocation)

      ctx.drawImage(this._renderer.domElement, 0, 0, rendererWidth, rendererHeight, left, top, width, height)

      if (debug) {
        ctx.font = 100 + 'px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = 'black'
        ctx.globalAlpha = 0.5
        ctx.fillText(FPS(), 100, 100)
        this.invalidate()
      }
    } else {
      super.postrender(ctx)
    }
  }

  dispose() {
    this.root.off('redraw', this.onredraw, this)

    this.destroy_scene3d()

    super.dispose()
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
    if (fillColor == undefined && borderColor == undefined) return

    let left = x - borderWidth - r - padding
    let right = left + w + borderWidth * 2 + r * 2 + padding * 2
    let top = y - borderWidth - r - padding
    let bottom = top + h + borderWidth * 2 + r * 2 + padding * 2

    ctx.beginPath()
    ctx.moveTo(left + r, top)
    ctx.lineTo(right - r, top)
    ctx.quadraticCurveTo(right, top, right, top + r)
    ctx.lineTo(right, bottom - r)
    ctx.quadraticCurveTo(right, bottom, right - r, bottom)
    ctx.lineTo(left + r, bottom)
    ctx.quadraticCurveTo(left, bottom, left, bottom - r)
    ctx.lineTo(left, top + r)
    ctx.quadraticCurveTo(left, top, left + r, top)
    ctx.closePath()

    ctx.lineWidth = borderWidth

    // background color
    // border color

    // if the fill color is defined, then fill it
    if (fillColor != undefined) {
      ctx.fillStyle = fillColor
      ctx.fill()
    }

    if (borderWidth > 0 && borderColor != undefined) {
      ctx.strokeStyle = borderColor
      ctx.stroke()
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
    if (!this._camera) return

    this._raycaster.setFromCamera(vector, this._camera)

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = this._raycaster.intersectObjects(this._scene3d.children, true)

    return intersects
  }

  moveCameraTo(targetName) {
    if (!targetName) return

    let object = this._scene3d.getObjectByName(targetName, true)
    if (!object) return

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
      step: function(delta) {
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
    // var exported = this._exporter.parse(this._scene3d);
    // var blob = new Blob([exported], { type: "text/plain;charset=utf-8" });
    // console.log(exported)
    // saveAs(blob, "exported.txt");
  }

  createTooltipForNavigator(messageObject) {
    if (!messageObject) return

    let isMarker = true
    let fontFace = 'Arial'
    let fontSize = 40
    let textColor = 'rgba(255,255,255,1)'
    let borderWidth = 2
    let borderColor = 'rgba(0, 0, 0, 1.0)'
    let backgroundColor = 'rgba(0, 0, 0, 0.7)'
    let radius = 30
    let vAlign = 'middle'
    let hAlign = 'center'

    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')

    // document.body.appendChild(canvas)

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    context.font = fontSize + 'px ' + fontFace
    context.textBaseline = 'alphabetic'
    context.textAlign = 'left'

    var textWidth = 0

    let cx = canvas.width / 2
    let cy = canvas.height / 2

    // for location label
    context.font = Math.floor(fontSize) + 'px ' + fontFace
    var metrics = context.measureText('Location')
    if (textWidth < metrics.width) textWidth = metrics.width

    // for location value
    context.font = 'bold ' + fontSize * 2 + 'px ' + fontFace
    metrics = context.measureText(messageObject.location)
    if (textWidth < metrics.width) textWidth = metrics.width

    // for values (material, qty)
    context.font = fontSize + 'px ' + fontFace
    metrics = context.measureText('- Material : ' + messageObject.material)
    if (textWidth < metrics.width) textWidth = metrics.width

    metrics = context.measureText('- QTY : ' + messageObject.qty)
    if (textWidth < metrics.width) textWidth = metrics.width

    var tx = textWidth / 2.0
    var ty = fontSize / 2.0

    // then adjust for the justification
    if (vAlign == 'bottom') ty = fontSize
    else if (vAlign == 'top') ty = 0

    if (hAlign == 'left') tx = textWidth
    else if (hAlign == 'right') tx = 0

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
    )

    // text color
    context.fillStyle = textColor
    context.lineWidth = 3

    // for location label
    offsetY += -fontSize * 6 * 0.5 + Math.floor(fontSize)
    context.font = Math.floor(fontSize) + 'px ' + fontFace
    context.fillStyle = 'rgba(134,199,252,1)'
    context.fillText('Location', cx - tx, offsetY)

    // for location value
    offsetY += fontSize * 2.5
    context.font = 'bold ' + fontSize * 2 + 'px ' + fontFace
    context.fillStyle = textColor
    context.fillText(messageObject.location, cx - tx, offsetY)

    // for values (material, qty)
    offsetY += fontSize * 2
    context.font = fontSize + 'px ' + fontFace
    context.fillStyle = 'rgba(204,204,204,1)'
    context.fillText('- Material : ' + messageObject.material, cx - tx, offsetY)

    offsetY += fontSize + ty
    context.fillText('- QTY : ' + messageObject.qty, cx - tx, offsetY)

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true

    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture
    })
    var sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set((window.innerWidth / 4) * 3, (window.innerWidth / 8) * 3, 1)
    // sprite.scale.set(canvas.width, canvas.height,1.0);

    sprite.raycast = function() {}

    return sprite
  }

  showTooltip(targetName) {
    if (!targetName) return

    var tooltip = this._scene2d.getObjectByName('navigator-tooltip')
    if (tooltip) this._scene2d.remove(tooltip)

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
      }

      tooltip = this.createTooltipForNavigator(tooltipTextObject)

      var vector2 = tooltip.getWorldScale().clone()

      var widthMultiplier = vector2.x / this.model.width
      var heightMultiplier = vector2.y / this.model.height

      vector2.normalize()

      vector2.x = 0
      vector2.y = vector2.y * 1.5 * heightMultiplier
      vector2.z = 0

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
    var { width, height } = this.model

    var { x = 0, y = 0, z = 0 } = position

    var cx = width / 2
    var cy = height / 2

    var coord3d = {}
    coord3d.x = x - cx
    coord3d.y = y - cy
    coord3d.z = z

    return coord3d
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

          setTimeout(
            function() {
              let loc = data.loc || data.LOC || data.location || data.LOCATION
              let object = this.getObject(loc)
              if (object) {
                object.userData = data
                object.onUserDataChanged()

                // if (d.navigationData) {
                //   this._pickingLocations.push(loc)
                // }
                // if (d.selected) {
                //   this._selectedPickingLocation = loc
                // }
              }
            }.bind(this)
          )
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
            setTimeout(
              function() {
                let d = this._data[location]
                let object = this.getObject(location)
                if (object) {
                  object.userData = d
                  object.onUserDataChanged()

                  // if (d.navigationData) {
                  //   this._pickingLocations.push(location)
                  // }
                  // if (d.selected) {
                  //   this._selectedPickingLocation = location
                  // }
                }
              }.bind(this)
            )
          }
        }
      }
    }

    this._dataChanged = false

    // draw navigatePath
    if (this._pickingLocations && this._pickingLocations.length > 0) this.navigatePath(this._pickingLocations)

    this.render_threed()
  }

  /* Event Handlers */

  onchange(after, before) {
    if (after.hasOwnProperty('width') || after.hasOwnProperty('height') || after.hasOwnProperty('threed'))
      this.destroy_scene3d()

    if (after.hasOwnProperty('autoRotate')) {
      if (this._controls) {
        this._controls.doAutoRotate(after.autoRotate)
      }
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
      }
    }

    if (after.hasOwnProperty('data')) {
      if (this._data !== after.data) {
        this._data = after.data
        this._dataChanged = true
      }
    }

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

      this._mouse.x = ((pointer.x - this.model.left) / this.model.width) * 2 - 1
      this._mouse.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1

      var object = this.getObjectByRaycast()

      if (object && object.onmouseup) {
        if (ref) object.onmouseup(e, this, popup.show.bind(this, this, ref))

        object._focused = true
        object._focusedAt = performance.now()
        this._lastFocused = object
      } else {
        popup.hide(this.root)
      }

      this.invalidate()
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

      var object = this.getObjectByRaycast()

      if (object && object.onmousemove) object.onmousemove(e, this)
      else {
        if (!this._scene2d) return
        this._scene2d.remove(this._scene2d.getObjectByName('tooltip'))
        this.render_threed()
      }

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

  ondblclick(e) {
    if (this._controls) {
      this._controls.reset()
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
      this._controls.cameraChanged = true
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

  onpan(e) {
    if (this._controls) {
      this._controls.cameraChanged = true
      this._controls.onTouchMove(e)
      e.stopPropagation()
    }
  }
  ontouchend(e) {
    if (this._controls) {
      this._controls.onTouchEnd(e)
      this.onmouseup(e)
      e.stopPropagation()
    }
  }

  onkeydown(e) {
    if (this._controls) {
      this._controls.onKeyDown(e)
      e.stopPropagation()
    }
  }

  onpinch(e) {
    if (this._controls) {
      var zoom = this.model.zoom
      zoom *= e.scale

      if (zoom < 100) zoom = 100

      this.set('zoom', zoom)
      e.stopPropagation()
    }
  }

  ondoubletap() {
    this._controls.reset()
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

Component.register('three-container', ThreeContainer)
