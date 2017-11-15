/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var extObj

function init() {
  if (init.done)
    return

  init.done = true

  let tgaLoader = new THREE.TGALoader();

  THREE.Loader.Handlers.add(/\.tga$/i, tgaLoader);

  let objLoader = new THREE.OBJLoader();
  let mtlLoader = new THREE.MTLLoader();

  objLoader.setPath('./obj/Casual_Man_02/')
  mtlLoader.setPath('./obj/Casual_Man_02/')

  mtlLoader.load('Casual_Man.mtl', function (materials) {
    materials.preload();
    objLoader.setMaterials(materials)
    materials.side = THREE.frontSide

    objLoader.load('Casual_Man.obj', function (obj) {
      extObj = obj
    })

  })
}

export default class Person extends THREE.Object3D {

  constructor(model, canvasSize, visualizer) {

    super();

    this._model = model;
    this._visualizer = visualizer;

    this.createObject(model, canvasSize);

  }

  static get extObject() {
    if (!extObj)
      init()

    return extObj
  }

  createObject(model, canvasSize) {

    if (!Person.extObject) {
      setTimeout(this.createObject.bind(this, model, canvasSize), 50)
      return;
    }

    let cx = (model.left + (model.width / 2)) - canvasSize.width / 2
    let cy = (model.top + (model.height / 2)) - canvasSize.height / 2
    let cz = 0.5 * model.depth

    let left = model.left - canvasSize.width / 2
    let top = model.top - canvasSize.height / 2

    let rotation = model.rotation

    this.type = 'person'
    let person = Person.extObject.clone()

    this.add(person)
    person.scale.set(150, 150, 150)
    // let boundBox = THREE.BoxHelper(person)

    // console.log(boundBox);

    /*

    var MySize = MyObjInstance.renderer.bounds.size;
    var MaxSize = 1/Mathf.Max(MySize.x, Mathf.Max(MySize.y, MySize.z));
    MyObjInstance.transform.localScale = Vector3 (MaxSize, MaxSize, MaxSize);
    */

    // this.scale.set(model.width, model.depth, model.height)
    this.position.set(cx, 0, cy)
    this.rotation.y = model.rotation || 0

    this._visualizer.render_threed()
  }

}

scene.Component3d.register('person', Person)
