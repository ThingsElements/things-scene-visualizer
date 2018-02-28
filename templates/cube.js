export default {
  name: 'cube',
  /* 다국어 키 표현을 어떻게.. */
  description: '...',
  /* 다국어 키 표현을 어떻게.. */
  group: '3D',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon: '../',
  template: {
    type: 'cube',
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
}
