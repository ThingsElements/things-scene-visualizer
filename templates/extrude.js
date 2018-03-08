// import icon from '../assets/extrude.png';
var icon = ''

export default {
  type: 'extrude',
  description: '3D extrude',
  group: '3D', /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon,
  model: {
    type: 'extrude',
    path: [{ x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 200 }, { x: 100, y: 200 }],
    fillStyle: '#fff',
    strokeStyle: '#000',
    alpha: 1,
    hidden: false,
    lineWidth: 1,
    lineDash: 'solid',
    lineCap: 'butt'
  }
}
