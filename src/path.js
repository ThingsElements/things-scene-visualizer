/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as THREE from 'three'
import Object3D from './object3d'

const STATUS_COLORS = ['#6666ff', '#ccccff', '#ffcccc', '#cc3300']

export default class Path extends Object3D {
  constructor(model, canvasSize, container) {
    super(model)

    this._container = container

    this.createObject(canvasSize)
  }

  async createObject(canvasSize) {
    var { x1, y1, x2, y2, lineWidth = 5, location } = this.model

    x1 = x1 - canvasSize.width / 2
    y1 = y1 - canvasSize.height / 2
    x2 = x2 - canvasSize.width / 2
    y2 = y2 - canvasSize.height / 2
    let z = 0

    this.type = 'path'

    if (location) this.name = location

    let material = new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: lineWidth
    })

    let geometry = new THREE.BufferGeometry()

    geometry.vertices.push(new THREE.Vector3(x1, z, y1))
    geometry.vertices.push(new THREE.Vector3(x2, z, y2))

    let line = new THREE.Line(geometry, material)

    this.add(line)

    //
    // for(var i=0; i<3; i++ ){
    //   let mesh = this.createSensor(model.rx * (1 + 0.5*i), model.ry * (1 + 0.5*i), model.depth * (1 + 0.5*i), i)
    //   mesh.material.opacity = 0.5 - (i * 0.15)
    // }
    //
    // this.position.set(cx, cz, cy)
    // this.rotation.y = model.rotation || 0
    //
    // this._container._heatmap.addData({
    //   x: Math.floor(model.cx),
    //   y: Math.floor(model.cy),
    //   value: this.userData.temperature
    // })
    //
    // this._container.updateHeatmapTexture()

    // var self = this
    //
    // setInterval(function(){
    //
    //   var data = self._container._heatmap._store._data
    //
    //   // var value = self._container._heatmap.getValueAt({x:model.cx, y: model.cy})
    //   var value = data[model.cx][model.cy]
    //
    //   self._container._heatmap.addData({
    //     x: model.cx,
    //     y: model.cy,
    //     // min: -100,
    //     // value: -1
    //     value: (Math.random() * 40 - 10) - value
    //   })
    //   self._container._heatmap.repaint()
    //
    //   self._container.render_threed()
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

    var data = this._container._heatmap._store._data

    // var value = self._container._heatmap.getValueAt({x:model.cx, y: model.cy})
    var value = data[cx][cy]

    this._container._heatmap.addData({
      x: cx,
      y: cy,
      // min: -100,
      // value: -1
      value: temperature - value
    })
    this._container._heatmap.repaint()

    // this._container.render_threed()
    this._container.updateHeatmapTexture()
  }
}

var { Component, Line } = scene

export class LinePath extends Line {
  is3dish() {
    return true
  }
}

Component.register('path', LinePath)
