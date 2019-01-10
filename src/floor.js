/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import Cube from './cube'

export default class Floor extends Cube {
  createColors() {
    var colorsOfFaces = [
      [1.0, 0.3, 0.3, 1.0], // Front face: cyan
      [1.0, 0.3, 0.3, 1.0], // Back face: red
      [1.0, 0.3, 0.3, 1.0], // Top face: green
      [1.0, 0.3, 0.3, 1.0], // Bottom face: blue
      [1.0, 0.3, 0.3, 1.0], // Right face: yellow
      [1.0, 0.3, 0.3, 1.0] // Left face: purple
    ]

    var colors = []

    for (var j = 0; j < 6; j++) {
      var polygonColor = colorsOfFaces[j]

      for (var i = 0; i < 4; i++) {
        colors = colors.concat(polygonColor)
      }
    }

    return colors
  }

  createPositions() {
    var positions = [
      // Front face
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,

      // Back face
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,

      // Top face
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,

      // Bottom face
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,

      // Right face
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,
      1.0,

      // Left face
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      -1.0
    ]

    return positions
  }

  createElements() {
    var elements = [
      0,
      1,
      2,
      0,
      2,
      3, // front
      4,
      5,
      6,
      4,
      6,
      7, // back
      8,
      9,
      10,
      8,
      10,
      11, // top
      12,
      13,
      14,
      12,
      14,
      15, // bottom
      16,
      17,
      18,
      16,
      18,
      19, // right
      20,
      21,
      22,
      20,
      22,
      23 // left
    ]

    return elements
  }
}
