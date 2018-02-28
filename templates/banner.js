export default {
  name: 'banner',
  /* 다국어 키 표현을 어떻게.. */
  description: '...',
  /* 다국어 키 표현을 어떻게.. */
  group: '3D',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon: '../',
  template: {
    type: 'banner',
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
}
