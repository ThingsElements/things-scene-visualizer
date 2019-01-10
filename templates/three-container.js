import icon from '../assets/three-container.png'

export default {
  type: 'three container',
  description: '3D container',
  group: '3D' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'three-container',
    left: 100,
    top: 100,
    width: 800,
    height: 600,
    fillStyle: 'darkgray',
    fov: 20,
    near: 0.1,
    far: 2000,
    zoom: 100,
    threed: false
  }
}
