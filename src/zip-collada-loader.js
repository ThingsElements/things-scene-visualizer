import JSZip from 'jszip'

import * as THREE from 'three'

export default class ZipColladaLoader {

  constructor(manager) {
    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
    this.colladaLoader = new THREE.ColladaLoader();
  }

  load(url, onLoad, onProgress, onError) {
    var scope = this;

    var loader = new THREE.FileLoader(scope.manager);
    loader.setResponseType('arraybuffer');
    loader.load(url, function (text) {
      scope.parse(text, onLoad)
    }, onProgress, onError);
  }

  parse(data, callback) {
    var scope = this;
    return JSZip.loadAsync(data).then(zip => {
      function setTextureImage(path, targetMaterial, callback) {

        var regex = new RegExp(path + '$', 'i');
        var files = zip.file(regex);

        if (files.length) {
          var file = files[0];
          return file.async("uint8array").then(content => {
            var img = new Image();
            img.onload = () => {
              callback(img, targetMaterial)
            }
            var regex = /\w+(?!\.)$/i
            var type = regex.exec(path);
            var blob = new Blob([content], { type: `image/${type}` });
            img.src = URL.createObjectURL(blob);
          })
        }
      }

      // load dae
      var files = zip.file(/\.dae$/i);
      if (files.length) {
        var file = files[0];
        file.async("string").then(content => {
          var dae = scope.colladaLoader.parse(content);
          var {
            library = {}
          } = dae;

          var {
            images = {},
            materials = {}
          } = library;

          for (const key in images) {
            if (images.hasOwnProperty(key)) {
              const image = images[key];
              var id = Number(key.replace('ID', '')) - 2;
              var material = materials[`ID${id}`];
              if (!material)
                continue;

              if (!material.build)
                continue;

              setTextureImage(image.build, material, (img, material) => {
                var map = material.build.map || material.build.specularMap || material.build.emissiveMap

                if (!map)
                  return;

                map.image = img;
                map.needsUpdate = true;
              })

            }
          }

          return callback(dae);
        })

      } else {
        console.error('ZipColladaLoader: Couldn\'t find .dae file.');

        return callback({
          scene: new THREE.Group()
        });
      }

    });
  }
}
