/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Object3D from './object3d'
import ThreeControls from './three-controls';
import ZipLoader from './zip-loader';

var extObj
var initDone = false;
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

function init() {
  if (initDone)
    return

  initDone = true

  // let zipLoader = new ZipLoader();

  // zipLoader.load('/obj/untitled/untitle.zip', function(obj) {
  //   extObj = obj;
  // })

  // let tdsLoader = new THREE.TDSLoader(THREE.DefaultLoadingManager);

  // tdsLoader.setPath( '/obj/untitled5/' );
  // tdsLoader.load( '/obj/untitled5/untitled5.3ds', function ( object ) {
  //   extObj = object;
  // });
  // let colladaLoader = new THREE.ColladaLoader(THREE.DefaultLoadingManager);

  // colladaLoader.load('/obj/untitled4/untitled4.dae', function (collada) {
  //   extObj = collada.scene;
  //   // if (extObj && extObj.children && extObj.children.length > 0) {
  //   //   extObj = extObj.children[0];
  //   // }

  //   // extObj.geometry.center();
  // })
  let objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
  let mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

  mtlLoader.setPath('/obj/CJ_Truck/');
  objLoader.setPath('/obj/CJ_Truck/');

  mtlLoader.load('CJ_Truck.mtl', function (materials) {
    materials.preload();
    objLoader.setMaterials(materials)
    if(materials && materials.length > 0) {
      materials.forEach(m => {
        m.side = THREE.DoubleSide;
        m.transparent = true;
      })
    }


    objLoader.load('CJ_Truck.obj', function (obj) {
      extObj = obj
      // if (extObj && extObj.children && extObj.children.length > 0) {
      //   extObj = extObj.children[0];
      // }

      // extObj.geometry.center();
    })
  })
}

export default class CJTruck extends Object3D {
  static get extObject() {
    if (!extObj)
      init()

    return extObj
  }

  createObject() {

    var {
      width,
      height,
      depth
    } = this.model

    if (!CJTruck.extObject) {
      setTimeout(this.createObject.bind(this), 50)
      return;
    }

    this.type = 'cj-truck'

    this.add(CJTruck.extObject.clone())

    // width /= 630.674
    // height /= 185.159
    // depth /= 125.607

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
