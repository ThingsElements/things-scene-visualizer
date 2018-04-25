/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'
import ThreeControls from './three-controls';
import ZipLoader from './zip-loader';

var {
  RectPath,
  Shape,
  Component,
  Component3d
} = scene

const NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]
}

// function init() {
//   if (initDone)
//     return

//   initDone = true

//   // let zipLoader = new ZipLoader();

//   // zipLoader.load('/obj/untitled/untitle.zip', function(obj) {
//   //   extObj = obj;
//   // })

//   let tdsLoader = new THREE.TDSLoader(THREE.DefaultLoadingManager);

//   tdsLoader.setPath( '/obj/CJ_Truck/' );
//   tdsLoader.load( '/obj/CJ_Truck/Commercial_Truck_Transfer.3ds', function ( object ) {
//     extObj = object;
//   });
//   // let colladaLoader = new THREE.ColladaLoader(THREE.DefaultLoadingManager);

//   // colladaLoader.load('/obj/CJ_Truck/Commercial_Truck_Transfer.dae', function (collada) {
//   //   extObj = collada.scene;
//   //   // if (extObj && extObj.children && extObj.children.length > 0) {
//   //   //   extObj = extObj.children[0];
//   //   // }

//   //   // extObj.geometry.center();
//   // })
// //   let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
// //   let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

// //   mtlLoader.setPath('/obj/CJ_Truck/');
// //   objLoader.setPath('/obj/CJ_Truck/');

// //   mtlLoader.load('CJ_Truck.mtl', function (materials) {
// //     materials.preload();
// //     objLoader.setMaterials(materials)
// //     if(materials && materials.length > 0) {
// //       materials.forEach(m => {
// //         m.side = THREE.DoubleSide;
// //         m.transparent = true;
// //       })
// //     }


// //     objLoader.load('CJ_Truck.obj', function (obj) {
// //       extObj = obj
// //       // if (extObj && extObj.children && extObj.children.length > 0) {
// //       //   extObj = extObj.children[0];
// //       // }

// //       // extObj.geometry.center();
// //     })
// //   })
// }

export default class CJTruck extends Object3D {
  static get threedObjectLoader() {
    if (!CJTruck._threedObjectLoader) {
      CJTruck._threedObjectLoader = new Promise((resolve, reject) => {
        let colladaLoader = new THREE.ColladaLoader(THREE.DefaultLoadingManager);
          colladaLoader.load('obj/CJ_Truck/Commercial_Truck_Transfer.dae', (collada) => {
            var extObj = collada.scene;

            // if (extObj && extObj.children && extObj.children.length > 0) {
            //   extObj = extObj.children[0];
            // }

            // extObj.geometry.center();

            // var extObj = obj
            // if (extObj && extObj.children && extObj.children.length > 0) {
            //   extObj = extObj.children[0];
            // }

            // extObj.geometry.center();
            resolve(extObj);
        })
      });
    }

    return CJTruck._threedObjectLoader;
  }

  createObject() {
    CJTruck.threedObjectLoader.then(this.addObject.bind(this));
  }

  addObject(extObject) {
    var {
      width,
      height,
      depth,
      rotation = 0
    } = this.model

    this.type = 'cj-truck';

    this.scale.set(width, depth, height)

    width /= 63.173
    height /= 72.1887
    depth /= 9.0388

    var object = extObject.clone();
    this.add(object)

    this.scale.set(width, depth, height)
  }

}

export class CJTruck2D extends RectPath(Shape) {
  is3dish() {
    return true
  }

  get controls() { }

  get nature() {
    return NATURE
  }
}

Component.register('cj-truck', CJTruck2D)
Component3d.register('cj-truck', CJTruck)
