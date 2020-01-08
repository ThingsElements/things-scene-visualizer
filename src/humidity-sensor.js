/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import { Component, Ellipse } from '@hatiolab/things-scene'
import * as THREE from 'three'
import Component3d from './component-3d'
import Object3D from './object3d'

const STATUS_COLORS = ['#6666ff', '#ccccff', '#ffcccc', '#cc3300']

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [
    {
      type: 'number',
      label: 'z-pos',
      name: 'zPos',
      property: 'zPos'
    },
    {
      type: 'string',
      label: 'location',
      name: 'location',
      property: 'location'
    }
  ]
}

export default class HumiditySensor extends Object3D {
  constructor(model, canvasSize, visualizer) {
    super(model, canvasSize, visualizer)
    this.userData.temperature = model.humidity ? model.humidity[0] : 0
    this.userData.humidity = model.humidity ? model.humidity[1] : 0
  }

  get cx() {
    var { cx = 0 } = this.model
    if (!this._cx) this._cx = cx - this._canvasSize.width / 2

    return this._cx
  }

  get cy() {
    var { cy = 0 } = this.model
    if (!this._cy) this._cy = cy - this._canvasSize.height / 2

    return this._cy
  }

  get cz() {
    var { zPos = 0, rx = 0 } = this.model

    if (!this._cz) this._cz = zPos + rx

    return this._cz
  }

async createObject(canvasSize) {
    var { depth, cx, cy, rx, ry, rotation = 0, location } = this.model

    this.type = 'humidity-sensor'

    if (location) this.name = location

    for (var i = 0; i < 3; i++) {
      let mesh = this.createSensor(rx * (1 + 0.5 * i), ry * (1 + 0.5 * i), depth * (1 + 0.5 * i), i)
      mesh.material.opacity = 0.5 - i * 0.15
    }

    if (this._visualizer._heatmap) {
      this._visualizer._heatmap.addData({
        x: Math.floor(cx),
        y: Math.floor(cy),
        value: this.userData.temperature
      })
      this._visualizer.updateHeatmapTexture()
    }

    // var self = this
    //
    // setInterval(function(){
    //
    //   var data = self._visualizer._heatmap._store._data
    //
    //   // var value = self._visualizer._heatmap.getValueAt({x:model.cx, y: model.cy})
    //   var value = data[model.cx][model.cy]
    //
    //   self._visualizer._heatmap.addData({
    //     x: model.cx,
    //     y: model.cy,
    //     // min: -100,
    //     // value: -1
    //     value: (Math.random() * 40 - 10) - value
    //   })
    //   self._visualizer._heatmap.repaint()
    //
    //   self._visualizer.render_threed()
    // }, 1000)
  }

  createSensor(w, h, d, i) {
    var isFirst = i === 0

    let geometry = new THREE.SphereBufferGeometry(w, 32, 32)
    // let geometry = new THREE.SphereGeometry(w, d, h);
    var material
    if (isFirst) {
      // var texture = new THREE.TextureLoader().load('./images/drop-34055_1280.png')
      // texture.repeat.set(1,1)
      // // texture.premultiplyAlpha = true
      //  material = new THREE.MeshStandardMaterial( { color : '#cc3300', side: THREE.FrontSide, wireframe: true, wireframeLinewidth : 1} );
      material = new THREE.MeshStandardMaterial({ color: '#cc3300', side: THREE.FrontSide })
      // material = new THREE.MeshStandardMaterial( { color : '#74e98a', side: THREE.FrontSide} );
    } else {
      material = new THREE.MeshStandardMaterial({
        color: '#cc3300',
        side: THREE.FrontSide,
        wireframe: true,
        wireframeLinewidth: 1
      })
      // material = new THREE.MeshStandardMaterial( { color : '#74e98a', side: THREE.FrontSide, wireframe: true, wireframeLinewidth : 1} );
    }

    // let material = new THREE.MeshStandardMaterial( { color : '#ff3300', side: THREE.DoubleSide, wireframe: true, wireframeLinewidth : 1} );

    var mesh = new THREE.Mesh(geometry, material)
    mesh.material.transparent = true

    if (isFirst) mesh.onmousemove = this.onmousemove
    else mesh.raycast = function() {}

    this.add(mesh)

    return mesh
  }

  onUserDataChanged() {
    super.onUserDataChanged()

    var { cx, cy } = this._model
    cx = Math.floor(cx)
    cy = Math.floor(cy)

    var temperature = this.userData.temperature

    for (let sphere of this.children) {
      var colorIndex = 0
      if (temperature < 0) {
        colorIndex = 0
      } else if (temperature < 10) {
        colorIndex = 1
      } else if (temperature < 20) {
        colorIndex = 2
      } else {
        colorIndex = 3
      }

      sphere.material.color.set(STATUS_COLORS[colorIndex])
    }

    if (!this._visualizer._heatmap) return

    var data = this._visualizer._heatmap._store._data

    // var value = self._visualizer._heatmap.getValueAt({x:model.cx, y: model.cy})
    var value = data[cx][cy]

    this._visualizer._heatmap.addData({
      x: cx,
      y: cy,
      // min: -100,
      // value: -1
      value: temperature - value
    })
    this._visualizer._heatmap.repaint()

    // this._visualizer.render_threed()
    this._visualizer.updateHeatmapTexture()
  }

  onmousemove(e, visualizer) {
    var tooltip = visualizer.tooltip || visualizer._scene2d.getObjectByName('tooltip')

    if (tooltip) {
      visualizer._scene2d.remove(tooltip)
      visualizer.tooltip = null
      visualizer.render_threed()
    }

    if (!this.parent.visible) return

    if (!this.parent.userData) this.parent.userData = {}

    var tooltipText = ''

    for (let key in this.parent.userData) {
      if (this.parent.userData[key]) tooltipText += key + ': ' + this.parent.userData[key] + '\n'
    }

    // tooltipText = 'loc : ' + loc

    // currentLabel.lookAt( camera.position );

    if (tooltipText.length > 0) {
      tooltip = visualizer.tooltip = visualizer.makeTextSprite(tooltipText)

      var vector = new THREE.Vector3()
      var vector2 = tooltip.getWorldScale().clone()

      var widthMultiplier = vector2.x / visualizer.model.width
      var heightMultiplier = vector2.y / visualizer.model.height

      vector.set(visualizer._mouse.x, visualizer._mouse.y, 0.5)
      vector2.normalize()

      vector2.x = (vector2.x / 2) * widthMultiplier
      vector2.y = (-vector2.y / 2) * heightMultiplier
      vector2.z = 0

      vector.add(vector2)

      vector.unproject(visualizer._2dCamera)
      tooltip.position.set(vector.x, vector.y, vector.z)
      tooltip.name = 'tooltip'

      tooltip.scale.x = tooltip.scale.x * widthMultiplier
      tooltip.scale.y = tooltip.scale.y * heightMultiplier

      // tooltip.position.set(this.getWorldPosition().x, this.getWorldPosition().y, this.getWorldPosition().z)
      // visualizer._scene3d.add(tooltip)

      visualizer._scene2d.add(tooltip)
      visualizer._renderer && visualizer._renderer.render(visualizer._scene2d, visualizer._2dCamera)
      visualizer.invalidate()
    }
  }
}

export class Sensor extends Ellipse {
  is3dish() {
    return true
  }

  _draw(context) {
    var { left, top, width, height } = this.bounds

    context.beginPath()
    context.rect(left, top, width, height)

    this.model.fillStyle = {
      type: 'pattern',
      fitPattern: true,
      image:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAABBCAYAAACTiffeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDQ0E1QkUzRTRDMDcxMUU2QkMyRDk3MzlGN0EzMTI2NSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDQ0E1QkUzRjRDMDcxMUU2QkMyRDk3MzlGN0EzMTI2NSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjJFQ0Q4QzE5NEI1MjExRTZCQzJEOTczOUY3QTMxMjY1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjJFQ0Q4QzFBNEI1MjExRTZCQzJEOTczOUY3QTMxMjY1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+tgU1kQAAB4pJREFU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'
    }
    this.drawFill(context)
  }

  get nature() {
    return NATURE
  }
}

Component.register('humidity-sensor', Sensor)
Component3d.register('humidity-sensor', HumiditySensor)
