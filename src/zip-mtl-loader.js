import JSZip from 'jszip'

const RGBFormat = 1022
const RGBAFormat = 1023

export default class ZipMTLLoader extends THREE.MTLLoader {
  constructor(zip, manager) {
    super(manager)
    this.zip = zip
  }

  parse(text) {
    var parsed = super.parse(text)

    var materialCreator = new MaterialCreator(this.texturePath || this.path, this.materialOptions, this.zip)
    materialCreator.setCrossOrigin(this.crossOrigin)
    materialCreator.setManager(this.manager)
    materialCreator.setMaterials(parsed.materialsInfo)
    return materialCreator
  }
}

export class MaterialCreator extends THREE.MTLLoader.MaterialCreator {
  constructor(baseUrl, options, zip) {
    super(baseUrl, options)
    this.zip = zip
  }

  loadImage(image) {
    var path = decodeURI(image)

    // Hack to support relative paths
    path = path.replace('../', '')

    var regex = new RegExp(path + '$')
    var files = this.zip.file(regex)

    // console.log( image, files );
    var img = new Image()
    var imgData

    if (files.length) {
      var file = files[0]

      if (JSZip.support.blob) {
        var imgBlob = new Blob([file.asArrayBuffer()])
        imgData = URL.createObjectURL(imgBlob)
      } else {
        // if you don't need old browser support, please remove this branch !
        // /!\ warning, file.asBase64() doesn't exist so I use here the
        // DEPRECATED JSZip.base64 object.
        // It will be removed in JSZip v3: you should then use file.async("base64").
        var base64 = JSZip.base64.encode(file.asBinary())
        // TODO: handle other mime types
        imgData = 'data:image/png;base64,' + base64
      }

      // var blob = new Blob([file.asArrayBuffer()], { type: 'application/octet-binary' });
      img.src = imgData
    }

    return img
  }

  loadTexture(url, mapping, onLoad, onProgress, onError) {
    var texture = new THREE.Texture()

    var image = this.loadImage(url)

    texture.image = image

    // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
    var isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:image\/jpeg/) === 0

    texture.format = isJPEG ? RGBFormat : RGBAFormat
    texture.needsUpdate = true

    return texture
  }
}
