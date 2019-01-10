import icon from '../assets/cube.png'

export default {
  type: 'cube',
  description: '3D cube',
  group: '3D' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'cube',
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    depth: 100,
    fillStyle: '#ffffff',
    strokeStyle: '#999',
    lineWidth: 1,
    alpha: 1
  }
}
