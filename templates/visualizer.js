export default {
  name: 'visualizer',
  /* 다국어 키 표현을 어떻게.. */
  description: '...',
  /* 다국어 키 표현을 어떻게.. */
  group: 'warehouse',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon: '../',
  /* 또는, Object */
  template: {
    type: 'visualizer',
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
}
