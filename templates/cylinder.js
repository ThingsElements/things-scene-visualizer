import icon from '../assets/cylinder.png'

export default {
  type: 'cylinder',
  description: '3D cylinder',
  group: '3D' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'cylinder',
    cx: 100,
    cy: 100,
    rx: 100,
    ry: 100,
    depth: 100,
    fillStyle: '#ffffff',
    strokeStyle: '#999',
    lineWidth: 1,
    alpha: 1
  }
}
