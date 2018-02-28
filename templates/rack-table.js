export default {
  name: 'rack table',
  /* 다국어 키 표현을 어떻게.. */
  description: '...',
  /* 다국어 키 표현을 어떻게.. */
  group: 'warehouse',
  /* line|shape|textAndMedia|chartAndGauge|table|container|dataSource|IoT|3D|warehouse|form|etc */
  icon: '../',
  /* 또는, Object */
  template: {
    type: 'rack-table',
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
}
