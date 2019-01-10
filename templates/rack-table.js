import icon from '../assets/rack-table.png'

export default {
  type: 'rack-table',
  description: '3D rack-table',
  group: '3D' /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */,
  icon,
  model: {
    type: 'rack-table',
    top: 100,
    left: 100,
    width: 500,
    height: 200,
    locPattern: '{z}{s}-{u}{sh}',
    increasePattern: '+u+s',
    strokeStyle: '#999',
    lineWidth: 2,
    rows: 5,
    columns: 5
  }
}
