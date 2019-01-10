import JSZip from 'jszip'
import ZipMTLLoader from './zip-mtl-loader'

export default class ZipLoader {
  constructor(manager) {
    this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager
  }

  load(url, onLoad, onProgress, onError) {
    var scope = this

    var loader = new THREE.FileLoader(scope.manager)
    loader.setResponseType('arraybuffer')
    loader.load(
      url,
      function(text) {
        onLoad(scope.parse(text))
      },
      onProgress,
      onError
    )
  }

  parse(data) {
    var zip = new JSZip(data) // eslint-disable-line no-undef

    // console.log( zip );

    // var xml = new DOMParser().parseFromString( zip.file( 'doc.kml' ).asText(), 'application/xml' );

    function loadImage(image) {
      var path = decodeURI(image.init_from)

      // Hack to support relative paths
      path = path.replace('../', '')

      var regex = new RegExp(path + '$')
      var files = zip.file(regex)

      // console.log( image, files );

      if (files.length) {
        var file = files[0]
        var blob = new Blob([file.asArrayBuffer()], { type: 'application/octet-binary' })
        image.build.src = URL.createObjectURL(blob)
      }
    }

    // load obj
    var files = zip.file(/obj$/i)
    if (files.length) {
      var file = files[0]
      var obj = new THREE.OBJLoader().parse(file.asText())

      // load mtl
      let mtlFiles = zip.file(/mtl$/i)
      if (mtlFiles.length) {
        var mtlFile = mtlFiles[0]
        // var mtl = new THREE.ZipMTLLoader(zip).parse(mtlFile.asText());
        var mtl = new ZipMTLLoader(zip).parse(mtlFile.asText())
        mtl.preload()

        // var images = mtl.library.images;

        // for (var name in images) {

        //   loadImage(images[name]);

        // }
      }

      return obj
    }

    console.error("KMZLoader: Couldn't find .dae file.")

    return {
      scene: new THREE.Group()
    }
  }
  // parse(data) {
  //   var zip = new JSZip; // eslint-disable-line no-undef

  //   // console.log( zip );

  //   // var xml = new DOMParser().parseFromString( zip.file( 'doc.kml' ).asText(), 'application/xml' );

  //   function loadImage(image) {

  //     var path = decodeURI(image.init_from);

  //     // Hack to support relative paths
  //     path = path.replace('../', '');

  //     var regex = new RegExp(path + '$');
  //     var files = zip.file(regex);

  //     // console.log( image, files );

  //     if (files.length) {

  //       var file = files[0];
  //       var blob = new Blob([file.asArrayBuffer()], { type: 'application/octet-binary' });
  //       image.build.src = URL.createObjectURL(blob);

  //     }

  //   }

  //   // load obj
  //   var files = zip.file(/obj$/i);
  //   if (files.length) {
  //     var file = files[0];
  //     var obj = new THREE.OBJLoader().parse(file.asText());

  //     // load mtl
  //     let mtlFiles = zip.file(/mtl$/i)
  //     if (mtlFiles.length) {
  //       var mtlFile = mtlFiles[0];
  //       var mtl = new THREE.MTLLoader().parse(mtlFile.asText());

  //       var images = mtl.library.images;

  //       for (var name in images) {

  //         loadImage(images[name]);

  //       }
  //     }

  //     return obj;
  //   }

  //   console.error('KMZLoader: Couldn\'t find .dae file.');

  //   return {
  //     scene: new THREE.Group()
  //   };

  // }
}
