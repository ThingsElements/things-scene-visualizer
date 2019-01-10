import icon from '../assets/visualizer.png'

export default {
  type: 'visualizer',
  description: '3D visualizer',
  group: '3D' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'visualizer',
    left: 100,
    top: 100,
    width: 800,
    height: 600,
    fillStyle: 'darkgray',
    fov: 60,
    near: 10,
    far: 10000,
    zoom: 100,
    threed: false
  }
}
