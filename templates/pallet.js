import icon from '../assets/pallet.png'

export default {
  type: 'pallet',
  description: '3D pallet',
  group: 'warehouse' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'pallet',
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    depth: 10,
    fillStyle: '#CCAA76',
    strokeStyle: '#999',
    lineWidth: 1,
    alpha: 1
  }
}
