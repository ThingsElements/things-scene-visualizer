import icon from '../assets/wall.png'

export default {
  type: 'wall',
  description: '3D wall',
  group: '3D' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'wall',
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    depth: 50,
    fillStyle: '#ffffff',
    strokeStyle: '#999',
    lineWidth: 1,
    alpha: 1
  }
}
