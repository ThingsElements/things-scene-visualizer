import icon from '../assets/gltf-object.png'

export default {
  type: 'gltf-object',
  description: '3D gltf-object',
  group: '3D' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'gltf-object',
    left: 100,
    top: 100,
    width: 200,
    height: 200,
    depth: 200,
    fillStyle: '#CCAA76',
    strokeStyle: '#999',
    lineWidth: 1,
    alpha: 1
  }
}
