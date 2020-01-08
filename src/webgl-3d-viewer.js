/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
import * as THREE from 'three'
import ForkLift from './forkLift'
import Person from './person'
import Rack from './rack'

export default class WebGL3dViewer {
  constructor(target, model, data) {
    if (typeof target == 'string') this._container = document.getElementById(target)
    else this._container = target

    this._model = model

    this.init()

    // EVENTS
    this.bindEvents()

    this.run()
  }

  init() {
    var model = this._model

    this.registerLoaders()

    // PROPERTY
    this._mouse = { x: 0, y: 0 }
    this.INTERSECTED

    this.FLOOR_WIDTH = model.width
    this.FLOOR_HEIGHT = model.height

    // SCENE
    this._scene = new THREE.Scene()

    // CAMERA
    this.SCREEN_WIDTH = this._container.clientWidth
    this.SCREEN_HEIGHT = this._container.clientHeight
    this.VIEW_ANGLE = 45
    this.ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT
    this.NEAR = 0.1
    this.FAR = 20000

    this._camera = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR)
    this._scene.add(this._camera)
    this._camera.position.set(800, 800, 800)
    this._camera.lookAt(this._scene.position)

    // RENDERER
    if (this._renderer && this._renderer.domElement) {
      this._container.removeChild(this._renderer.domElement)
    }

    this._renderer = new THREE.WebGLRenderer({ precision: 'mediump' })
    // this._renderer = new THREE.WebGLRenderer( {antialias:true, precision: 'mediump'} );
    this._renderer.setClearColor('#424b57')
    this._renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)

    this._container.appendChild(this._renderer.domElement)

    // KEYBOARD
    this._keyboard = new THREEx.KeyboardState()

    // CONTROLS
    this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement)

    // LIGHT
    var light = new THREE.PointLight(0xffffff)
    light.position.set(10, 10, 0)
    this._camera.add(light)

    this.createFloor()

    ////////////
    // CUSTOM //
    ////////////
    this.createObjects(model.components)

    // initialize object to perform world/screen calculations
    this._projector = new THREE.Projector()

    this._loadManager = new THREE.LoadingManager()
    this._loadManager.onProgress = function(item, loaded, total) {}

    // this.loadExtMtl('obj/Casual_Man_02/', 'Casual_Man.mtl', '', function(materials){
    //   materials.preload();
    //
    //   this.loadExtObj('obj/Casual_Man_02/', 'Casual_Man.obj', materials, function(object){
    //
    //     object.position.x = 0;
    //     object.position.y = 0;
    //     object.position.z = 350;
    //     object.rotation.y = Math.PI;
    //     object.scale.set(15, 15, 15)
    //
    //     this._scene.add(object);
    //   })
    // })
  }

  registerLoaders() {
    THREE.THREE.Loader.Handlers.add(/\.tga$/i, new THREE.TGALoader())
  }

  loadExtMtl(path, filename, texturePath, funcSuccess) {
    var self = this
    var mtlLoader = new THREE.MTLLoader()
    mtlLoader.setPath(path)
    if (texturePath) mtlLoader.setTexturePath(texturePath)

    mtlLoader.load(filename, funcSuccess.bind(self))
  }

  loadExtObj(path, filename, materials, funcSuccess) {
    var self = this
    var loader = new THREE.OBJLoader(this._loadManager)

    loader.setPath(path)

    if (materials) loader.setMaterials(materials)

    loader.load(
      filename,
      funcSuccess.bind(self),
      function() {},
      function() {
        console.log('error')
      }
    )
  }

  createFloor() {
    // FLOOR
    let model = this._model
    let floorColor = model.color || '#7a8696'

    // var floorTexture = new THREE.TextureLoader().load('textures/Light-gray-rough-concrete-wall-Seamless-background-photo-texture.jpg');
    // floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    // floorTexture.repeat.set( 1, 1 );
    // var floorMaterial = new THREE.MeshStandardMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    var floorMaterial = new THREE.MeshStandardMaterial({ color: floorColor, side: THREE.DoubleSide })
    var floorGeometry = new THREE.BoxBufferGeometry(this.FLOOR_WIDTH, this.FLOOR_HEIGHT, 1, 10, 10)
    // var floorMaterial = new THREE.MeshStandardMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    // var floorGeometry = new THREE.PlaneGeometry(this.FLOOR_WIDTH, this.FLOOR_HEIGHT, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.position.y = -1
    floor.rotation.x = Math.PI / 2
    this._scene.add(floor)
  }

  createSkyBox() {
    // SKYBOX/FOG
    var skyBoxGeometry = new THREE.BoxBufferGeometry(10000, 10000, 10000)
    var skyBoxMaterial = new THREE.MeshStandardMaterial({ color: 0x9999ff, side: THREE.BackSide })
    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial)
    this._scene.add(skyBox)
  }

  async createObjects(models) {
    let scene = this._scene
    let model = this._model
    let canvasSize = {
      width: this.FLOOR_WIDTH,
      height: this.FLOOR_HEIGHT
    }

    var obj = new THREE.Object3D()

    models.forEach(model => {
      var item
      switch (model.type) {
        case 'rack':
          item = new Rack(model, canvasSize)
          break

        case 'forklift':
          item = new ForkLift(model, canvasSize)

          break
        case 'person':
          item = new Person(model, canvasSize)

          break
        default:
          break
      }
      obj.add(item)
    })

    scene.add(obj)
  }

  animate() {
    this._animFrame = requestAnimationFrame(this.animate.bind(this))
    this.rotateCam(0.015)
    this.render()
    this.update()
  }

  update() {
    var tooltip = document.getElementById('tooltip')

    // find intersections

    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)
    var vector = new THREE.Vector3(this._mouse.x, this._mouse.y, 1)
    vector.unproject(this._camera)
    var ray = new THREE.Raycaster(this._camera.position, vector.sub(this._camera.position).normalize())

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = ray.intersectObjects(this._scene.children, true)

    // INTERSECTED = the object in the scene currently closest to the camera
    //		and intersected by the Ray projected from the mouse position

    // if there is one (or more) intersections
    if (intersects.length > 0) {
      // if the closest object intersected is not the currently stored intersection object
      if (intersects[0].object != this.INTERSECTED) {
        // restore previous intersection object (if it exists) to its original color
        // if ( this.INTERSECTED )
        //   this.INTERSECTED.material.color.setHex( this.INTERSECTED.currentHex );
        // store reference to closest object as current intersection object
        this.INTERSECTED = intersects[0].object
        // store color of closest object (for later restoration)
        // this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
        // set a new color for closest object
        // this.INTERSECTED.material.color.setHex( 0xffff00 );

        if (this.INTERSECTED.type === 'stock') {
          if (!this.INTERSECTED.visible) return

          if (!this.INTERSECTED.userData) this.INTERSECTED.userData = {}

          var loc = this.INTERSECTED.name
          var status = this.INTERSECTED.userData.status
          var boxId = this.INTERSECTED.userData.boxId
          var inDate = this.INTERSECTED.userData.inDate
          var type = this.INTERSECTED.userData.type
          var count = this.INTERSECTED.userData.count

          tooltip.textContent = ''

          for (let key in this.INTERSECTED.userData) {
            if (this.INTERSECTED.userData[key])
              tooltip.textContent += key + ': ' + this.INTERSECTED.userData[key] + '\n'
          }

          var mouseX = ((this._mouse.x + 1) / 2) * this.SCREEN_WIDTH
          var mouseY = ((-this._mouse.y + 1) / 2) * this.SCREEN_HEIGHT

          tooltip.style.left = mouseX + 20 + 'px'
          tooltip.style.top = mouseY - 20 + 'px'
          tooltip.style.display = 'block'
        } else {
          tooltip.style.display = 'none'
        }
      }
    } // there are no intersections
    else {
      // restore previous intersection object (if it exists) to its original color
      // if ( this.INTERSECTED )
      //   this.INTERSECTED.material.color.setHex( this.INTERSECTED.currentHex );
      // remove previous intersection object reference
      //     by setting current intersection object to "nothing"
      this.INTERSECTED = null

      tooltip.style.display = 'none'
    }

    if (this._keyboard.pressed('z')) {
      // do something
    }

    this._controls.update()
  }

  render() {
    this._renderer.render(this._scene, this._camera)
  }

  bindEvents() {
    // when the mouse moves, call the given function
    // this._container.addEventListener( 'mousedown', this.onMouseMove.bind(this), false );
    this._container.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    // this.bindResize()
    THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) })
  }

  onMouseDown(e) {
    this._mouse.x = (e.offsetX / this.SCREEN_WIDTH) * 2 - 1
    this._mouse.y = -(e.offsetY / this.SCREEN_HEIGHT) * 2 + 1
  }

  onMouseMove(e) {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    // update the mouse variable
    this._mouse.x = (e.offsetX / this.SCREEN_WIDTH) * 2 - 1
    this._mouse.y = -(e.offsetY / this.SCREEN_HEIGHT) * 2 + 1
  }

  bindResize() {
    var renderer = this._renderer
    var camera = this._camera

    var callback = function() {
      this.SCREEN_WIDTH = this._container.clientWidth
      this.SCREEN_HEIGHT = this._container.clientHeight

      // notify the renderer of the size change
      // renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT)
      renderer.setFaceCulling('front_and_back', 'cw')
      // update the camera
      camera.aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT
      camera.updateProjectionMatrix()
    }
    // bind the resize event
    this._container.addEventListener('resize', callback.bind(this), false)
    // return .stop() the function to stop watching window resize
    return {
      /**
       * Stop watching window resize
       */
      stop: function() {
        this._container.removeEventListener('resize', callback)
      }
    }
  }

  run() {
    this.animate()
  }

  stop() {
    cancelAnimationFrame(this._animFrame)
  }

  rotateCam(angle) {
    this._controls.rotateLeft(angle)
  }
}
