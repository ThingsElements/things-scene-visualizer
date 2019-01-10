import icon from '../assets/sphere.png'

export default {
  type: 'sphere',
  description: '3D sphere',
  group: '3D' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'sphere',
    cx: 100,
    cy: 100,
    rx: 100,
    ry: 100,
    rz: 100,
    fillStyle: '#ffffff',
    strokeStyle: '#999',
    lineWidth: 1,
    alpha: 1
  }
}
