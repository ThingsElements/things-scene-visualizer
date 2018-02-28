export default {
  name: 'three container',
  /* 다국어 키 표현을 어떻게.. */
  description: '...',
  /* 다국어 키 표현을 어떻게.. */
  group: '3D',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon: '../',
  template: {
    type: 'three container',
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
}
