export default {
  name: 'cylinder',
  /* 다국어 키 표현을 어떻게.. */
  description: '...',
  /* 다국어 키 표현을 어떻게.. */
  group: '3D',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon: '../',
  template: {
    type: 'cylinder',
    model: {
      type: 'cylinder',
      cx: 100,
      cy: 100,
      rx: 100,
      ry: 100,
      rz: 100,
      fillStyle: '#ffffff',
      strokeStyle: '#999',
      lineWidth: 1,
      alpha: 1
    }
  }
}
