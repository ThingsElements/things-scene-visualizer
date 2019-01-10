import icon from '../assets/banner.png'

export default {
  type: 'banner',
  description: '3D banner',
  group: '3D' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'banner',
    cx: 100,
    cy: 100,
    zPos: 0,
    width: 100,
    height: 10,
    depth: 50,
    fillStyle: '#ffffff',
    strokeStyle: '#999',
    lineWidth: 1,
    alpha: 1
  }
}
