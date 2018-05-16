/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 32);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var support = __webpack_require__(3);
var compressions = __webpack_require__(8);
var nodeBuffer = __webpack_require__(10);
/**
 * Convert a string to a "binary string" : a string containing only char codes between 0 and 255.
 * @param {string} str the string to transform.
 * @return {String} the binary string.
 */
exports.string2binary = function (str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) & 0xff);
    }
    return result;
};
exports.arrayBuffer2Blob = function (buffer, mimeType) {
    exports.checkSupport("blob");
    mimeType = mimeType || 'application/zip';

    try {
        // Blob constructor
        return new Blob([buffer], {
            type: mimeType
        });
    } catch (e) {

        try {
            // deprecated, browser only, old way
            var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            var builder = new Builder();
            builder.append(buffer);
            return builder.getBlob(mimeType);
        } catch (e) {

            // well, fuck ?!
            throw new Error("Bug : can't construct the Blob.");
        }
    }
};
/**
 * The identity function.
 * @param {Object} input the input.
 * @return {Object} the same input.
 */
function identity(input) {
    return input;
}

/**
 * Fill in an array with a string.
 * @param {String} str the string to use.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to fill in (will be mutated).
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated array.
 */
function stringToArrayLike(str, array) {
    for (var i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i) & 0xFF;
    }
    return array;
}

/**
 * Transform an array-like object to a string.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
 * @return {String} the result.
 */
function arrayLikeToString(array) {
    // Performances notes :
    // --------------------
    // String.fromCharCode.apply(null, array) is the fastest, see
    // see http://jsperf.com/converting-a-uint8array-to-a-string/2
    // but the stack is limited (and we can get huge arrays !).
    //
    // result += String.fromCharCode(array[i]); generate too many strings !
    //
    // This code is inspired by http://jsperf.com/arraybuffer-to-string-apply-performance/2
    var chunk = 65536;
    var result = [],
        len = array.length,
        type = exports.getTypeOf(array),
        k = 0,
        canUseApply = true;
    try {
        switch (type) {
            case "uint8array":
                String.fromCharCode.apply(null, new Uint8Array(0));
                break;
            case "nodebuffer":
                String.fromCharCode.apply(null, nodeBuffer(0));
                break;
        }
    } catch (e) {
        canUseApply = false;
    }

    // no apply : slow and painful algorithm
    // default browser on android 4.*
    if (!canUseApply) {
        var resultStr = "";
        for (var i = 0; i < array.length; i++) {
            resultStr += String.fromCharCode(array[i]);
        }
        return resultStr;
    }
    while (k < len && chunk > 1) {
        try {
            if (type === "array" || type === "nodebuffer") {
                result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
            } else {
                result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
            }
            k += chunk;
        } catch (e) {
            chunk = Math.floor(chunk / 2);
        }
    }
    return result.join("");
}

exports.applyFromCharCode = arrayLikeToString;

/**
 * Copy the data from an array-like to an other array-like.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayFrom the origin array.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayTo the destination array which will be mutated.
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated destination array.
 */
function arrayLikeToArrayLike(arrayFrom, arrayTo) {
    for (var i = 0; i < arrayFrom.length; i++) {
        arrayTo[i] = arrayFrom[i];
    }
    return arrayTo;
}

// a matrix containing functions to transform everything into everything.
var transform = {};

// string to ?
transform["string"] = {
    "string": identity,
    "array": function array(input) {
        return stringToArrayLike(input, new Array(input.length));
    },
    "arraybuffer": function arraybuffer(input) {
        return transform["string"]["uint8array"](input).buffer;
    },
    "uint8array": function uint8array(input) {
        return stringToArrayLike(input, new Uint8Array(input.length));
    },
    "nodebuffer": function nodebuffer(input) {
        return stringToArrayLike(input, nodeBuffer(input.length));
    }
};

// array to ?
transform["array"] = {
    "string": arrayLikeToString,
    "array": identity,
    "arraybuffer": function arraybuffer(input) {
        return new Uint8Array(input).buffer;
    },
    "uint8array": function uint8array(input) {
        return new Uint8Array(input);
    },
    "nodebuffer": function nodebuffer(input) {
        return nodeBuffer(input);
    }
};

// arraybuffer to ?
transform["arraybuffer"] = {
    "string": function string(input) {
        return arrayLikeToString(new Uint8Array(input));
    },
    "array": function array(input) {
        return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
    },
    "arraybuffer": identity,
    "uint8array": function uint8array(input) {
        return new Uint8Array(input);
    },
    "nodebuffer": function nodebuffer(input) {
        return nodeBuffer(new Uint8Array(input));
    }
};

// uint8array to ?
transform["uint8array"] = {
    "string": arrayLikeToString,
    "array": function array(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
    },
    "arraybuffer": function arraybuffer(input) {
        return input.buffer;
    },
    "uint8array": identity,
    "nodebuffer": function nodebuffer(input) {
        return nodeBuffer(input);
    }
};

// nodebuffer to ?
transform["nodebuffer"] = {
    "string": arrayLikeToString,
    "array": function array(input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
    },
    "arraybuffer": function arraybuffer(input) {
        return transform["nodebuffer"]["uint8array"](input).buffer;
    },
    "uint8array": function uint8array(input) {
        return arrayLikeToArrayLike(input, new Uint8Array(input.length));
    },
    "nodebuffer": identity
};

/**
 * Transform an input into any type.
 * The supported output type are : string, array, uint8array, arraybuffer, nodebuffer.
 * If no output type is specified, the unmodified input will be returned.
 * @param {String} outputType the output type.
 * @param {String|Array|ArrayBuffer|Uint8Array|Buffer} input the input to convert.
 * @throws {Error} an Error if the browser doesn't support the requested output type.
 */
exports.transformTo = function (outputType, input) {
    if (!input) {
        // undefined, null, etc
        // an empty string won't harm.
        input = "";
    }
    if (!outputType) {
        return input;
    }
    exports.checkSupport(outputType);
    var inputType = exports.getTypeOf(input);
    var result = transform[inputType][outputType](input);
    return result;
};

/**
 * Return the type of the input.
 * The type will be in a format valid for JSZip.utils.transformTo : string, array, uint8array, arraybuffer.
 * @param {Object} input the input to identify.
 * @return {String} the (lowercase) type of the input.
 */
exports.getTypeOf = function (input) {
    if (typeof input === "string") {
        return "string";
    }
    if (Object.prototype.toString.call(input) === "[object Array]") {
        return "array";
    }
    if (support.nodebuffer && nodeBuffer.test(input)) {
        return "nodebuffer";
    }
    if (support.uint8array && input instanceof Uint8Array) {
        return "uint8array";
    }
    if (support.arraybuffer && input instanceof ArrayBuffer) {
        return "arraybuffer";
    }
};

/**
 * Throw an exception if the type is not supported.
 * @param {String} type the type to check.
 * @throws {Error} an Error if the browser doesn't support the requested type.
 */
exports.checkSupport = function (type) {
    var supported = support[type.toLowerCase()];
    if (!supported) {
        throw new Error(type + " is not supported by this browser");
    }
};
exports.MAX_VALUE_16BITS = 65535;
exports.MAX_VALUE_32BITS = -1; // well, "\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF" is parsed as -1

/**
 * Prettify a string read as binary.
 * @param {string} str the string to prettify.
 * @return {string} a pretty string.
 */
exports.pretty = function (str) {
    var res = '',
        code,
        i;
    for (i = 0; i < (str || "").length; i++) {
        code = str.charCodeAt(i);
        res += '\\x' + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
    }
    return res;
};

/**
 * Find a compression registered in JSZip.
 * @param {string} compressionMethod the method magic to find.
 * @return {Object|null} the JSZip compression object, null if none found.
 */
exports.findCompression = function (compressionMethod) {
    for (var method in compressions) {
        if (!compressions.hasOwnProperty(method)) {
            continue;
        }
        if (compressions[method].magic === compressionMethod) {
            return compressions[method];
        }
    }
    return null;
};
/**
* Cross-window, cross-Node-context regular expression detection
* @param  {Object}  object Anything
* @return {Boolean}        true if the object is a regular expression,
* false otherwise
*/
exports.isRegExp = function (object) {
    return Object.prototype.toString.call(object) === "[object RegExp]";
};

/**
 * Merge the objects passed as parameters into a new one.
 * @private
 * @param {...Object} var_args All objects to merge.
 * @return {Object} a new object with the data of the others.
 */
exports.extend = function () {
    var result = {},
        i,
        attr;
    for (i = 0; i < arguments.length; i++) {
        // arguments is not enumerable in some browsers
        for (attr in arguments[i]) {
            if (arguments[i].hasOwnProperty(attr) && typeof result[attr] === "undefined") {
                result[attr] = arguments[i][attr];
            }
        }
    }
    return result;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

var Object3D = function (_THREE$Object3D) {
  _inherits(Object3D, _THREE$Object3D);

  function Object3D(model, canvasSize, visualizer) {
    _classCallCheck(this, Object3D);

    var _this = _possibleConstructorReturn(this, (Object3D.__proto__ || Object.getPrototypeOf(Object3D)).call(this));

    _this._model = model;

    _this._visualizer = visualizer;
    _this._canvasSize = canvasSize;

    _this.createObject();

    _this.setPosition();
    _this.setRotation();
    return _this;
  }

  _createClass(Object3D, [{
    key: "dispose",
    value: function dispose() {
      var _this2 = this;

      this.children.slice().forEach(function (child) {
        if (child.dispose) child.dispose();
        if (child.geometry && child.geometry.dispose) child.geometry.dispose();
        if (child.material && child.material.dispose) child.material.dispose();
        if (child.texture && child.texture.dispose) child.texture.dispose();
        _this2.remove(child);
      });
    }
  }, {
    key: "createObject",
    value: function createObject() {}
  }, {
    key: "setPosition",
    value: function setPosition() {
      this.position.set(this.cx, this.cz, this.cy);
    }
  }, {
    key: "setRotation",
    value: function setRotation() {
      var _model = this.model,
          _model$rotationX = _model.rotationX,
          rotationX = _model$rotationX === undefined ? 0 : _model$rotationX,
          _model$rotationY = _model.rotationY,
          rotationY = _model$rotationY === undefined ? 0 : _model$rotationY,
          _model$rotation = _model.rotation,
          rotation = _model$rotation === undefined ? 0 : _model$rotation;


      this.rotation.x = -rotationX;
      this.rotation.y = -rotation;
      this.rotation.z = -rotationY;
    }
  }, {
    key: "raycast",
    value: function raycast(raycaster, intersects) {}
  }, {
    key: "model",
    get: function get() {
      return this._model;
    }
  }, {
    key: "cx",
    get: function get() {
      if (!this._cx) {
        var _model2 = this.model,
            _model2$left = _model2.left,
            left = _model2$left === undefined ? 0 : _model2$left,
            _model2$width = _model2.width,
            width = _model2$width === undefined ? 0 : _model2$width;

        var canvasSize = this._canvasSize;

        this._cx = left + width / 2 - canvasSize.width / 2;
      }
      return this._cx;
    }
  }, {
    key: "cy",
    get: function get() {
      if (!this._cy) {
        var _model3 = this.model,
            _model3$top = _model3.top,
            top = _model3$top === undefined ? 0 : _model3$top,
            _model3$height = _model3.height,
            height = _model3$height === undefined ? 0 : _model3$height;

        var canvasSize = this._canvasSize;

        this._cy = top + height / 2 - canvasSize.height / 2;
      }
      return this._cy;
    }
  }, {
    key: "cz",
    get: function get() {
      if (!this._cz) {
        var _model4 = this.model,
            _model4$zPos = _model4.zPos,
            zPos = _model4$zPos === undefined ? 0 : _model4$zPos,
            _model4$depth = _model4.depth,
            depth = _model4$depth === undefined ? 1 : _model4$depth;


        this._cz = zPos + depth / 2;
      }

      return this._cz;
    }
  }, {
    key: "type",
    get: function get() {
      return this.model.type || this._type;
    },
    set: function set(type) {
      this._type = type;
    }
  }]);

  return Object3D;
}(THREE.Object3D);

exports.default = Object3D;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var TYPED_OK = typeof Uint8Array !== 'undefined' && typeof Uint16Array !== 'undefined' && typeof Int32Array !== 'undefined';

function _has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) {
      continue;
    }

    if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};

// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) {
    return buf;
  }
  if (buf.subarray) {
    return buf.subarray(0, size);
  }
  buf.length = size;
  return buf;
};

var fnTyped = {
  arraySet: function arraySet(dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function flattenChunks(chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function arraySet(dest, src, src_offs, len, dest_offs) {
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function flattenChunks(chunks) {
    return [].concat.apply([], chunks);
  }
};

// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8 = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8 = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

exports.base64 = true;
exports.array = true;
exports.string = true;
exports.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
// contains true if JSZip can read/generate nodejs Buffer, false otherwise.
// Browserify will provide a Buffer implementation for browsers, which is
// an augmented Uint8Array (i.e., can be used as either Buffer or U8).
exports.nodebuffer = typeof Buffer !== "undefined";
// contains true if JSZip can read/generate Uint8Array, false otherwise.
exports.uint8array = typeof Uint8Array !== "undefined";

if (typeof ArrayBuffer === "undefined") {
    exports.blob = false;
} else {
    var buffer = new ArrayBuffer(0);
    try {
        exports.blob = new Blob([buffer], {
            type: "application/zip"
        }).size === 0;
    } catch (e) {
        try {
            var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            var builder = new Builder();
            builder.append(buffer);
            exports.blob = builder.getBlob('application/zip').size === 0;
        } catch (e) {
            exports.blob = false;
        }
    }
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18).Buffer))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var registry = {};

var Component3d = function () {
  function Component3d() {
    _classCallCheck(this, Component3d);
  }

  _createClass(Component3d, null, [{
    key: "register",
    value: function register(type, clazz) {
      if (!clazz) return registry[type];
      registry[type] = clazz;
    }
  }]);

  return Component3d;
}();

exports.default = Component3d;


scene.Component3d = Component3d;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

var _tinycolor = __webpack_require__(44);

var _tinycolor2 = _interopRequireDefault(_tinycolor);

var _boundingUvGenerator = __webpack_require__(45);

var _boundingUvGenerator2 = _interopRequireDefault(_boundingUvGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Extrude = function (_Object3D) {
  _inherits(Extrude, _Object3D);

  function Extrude() {
    _classCallCheck(this, Extrude);

    return _possibleConstructorReturn(this, (Extrude.__proto__ || Object.getPrototypeOf(Extrude)).apply(this, arguments));
  }

  _createClass(Extrude, [{
    key: 'createObject',
    value: function createObject() {
      var _model = this.model,
          _model$fillStyle = _model.fillStyle,
          fillStyle = _model$fillStyle === undefined ? 0xffffff : _model$fillStyle,
          _model$strokeStyle = _model.strokeStyle,
          strokeStyle = _model$strokeStyle === undefined ? 0x636363 : _model$strokeStyle,
          _model$lineWidth = _model.lineWidth,
          lineWidth = _model$lineWidth === undefined ? 1 : _model$lineWidth,
          _model$alpha = _model.alpha,
          alpha = _model$alpha === undefined ? 1 : _model$alpha;

      // 다각형 그리기

      var shape = this.shape;
      if (!shape) return;

      var extrudeSettings = this.extrudeSettings;
      var boundingUVGenerator = this.boundingUVGenerator;

      if (boundingUVGenerator) {
        boundingUVGenerator.setShape({
          extrudedShape: shape,
          extrudedOptions: extrudeSettings
        });
      }

      var geometry = this.createGeometry(shape, extrudeSettings);
      var material = this.createMaterial();

      if (fillStyle && fillStyle != 'none') {
        var mesh = this.createMesh(geometry, material);
        this.add(mesh);
      }

      if (strokeStyle && strokeStyle != 'transparent' && lineWidth > 0) {
        var sideMesh = this.createSideMesh(geometry, shape, extrudeSettings);
        this.add(sideMesh);
      }
    }
  }, {
    key: 'createGeometry',
    value: function createGeometry(shape, extrudeSettings) {
      var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
      geometry.center();

      return geometry;
    }
  }, {
    key: 'createMaterial',
    value: function createMaterial() {
      var _this2 = this;

      var _model2 = this.model,
          fillStyle = _model2.fillStyle,
          _model2$alpha = _model2.alpha,
          alpha = _model2$alpha === undefined ? 1 : _model2$alpha;


      var material;
      if (fillStyle.type == 'pattern' && fillStyle.image) {
        var texture = this._visualizer._textureLoader.load(this._visualizer.app.url(fillStyle.image), function (texture) {
          texture.minFilter = THREE.LinearFilter;
          _this2._visualizer.render_threed();
        });

        material = [new THREE.MeshLambertMaterial({
          map: texture,
          side: THREE.DoubleSide
        }), new THREE.MeshLambertMaterial({
          color: fillStyle,
          side: THREE.DoubleSide
        })];
      } else {
        material = new THREE.MeshLambertMaterial({
          color: fillStyle
        });
      }

      var tinyFillStyle = (0, _tinycolor2.default)(fillStyle);
      var fillAlpha = tinyFillStyle.getAlpha();
      material.opacity = alpha * fillAlpha;
      material.transparent = alpha < 1 || fillAlpha < 1;

      return material;
    }
  }, {
    key: 'createMesh',
    value: function createMesh(geometry, material) {
      var mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.y = -Math.PI;
      mesh.rotation.z = -Math.PI;

      return mesh;
    }
  }, {
    key: 'createSideMesh',
    value: function createSideMesh(geometry, shape) {
      var _model3 = this.model,
          _model3$strokeStyle = _model3.strokeStyle,
          strokeStyle = _model3$strokeStyle === undefined ? 0x000000 : _model3$strokeStyle,
          _model3$depth = _model3.depth,
          depth = _model3$depth === undefined ? 0 : _model3$depth,
          _model3$lineWidth = _model3.lineWidth,
          lineWidth = _model3$lineWidth === undefined ? 0 : _model3$lineWidth,
          _model3$alpha = _model3.alpha,
          alpha = _model3$alpha === undefined ? 1 : _model3$alpha;


      var hole = new THREE.Path();
      hole.setFromPoints(shape.getPoints());

      var sideMaterial = new THREE.MeshLambertMaterial({
        color: strokeStyle
      });

      var tinyStrokeStyle = (0, _tinycolor2.default)(strokeStyle);
      var strokeAlpha = tinyStrokeStyle.getAlpha();
      sideMaterial.opacity = alpha * strokeAlpha;
      sideMaterial.transparent = alpha < 1 || strokeAlpha < 1;

      // prevent overlapped layers flickering
      sideMaterial.polygonOffset = true;
      sideMaterial.polygonOffsetFactor = -0.1;

      shape = this.sideShape || shape;
      shape.holes.push(hole);

      var sideExtrudeSettings = {
        steps: 1,
        amount: depth,
        bevelEnabled: true,
        bevelThickness: 0,
        bevelSize: lineWidth,
        bevelSizeSegments: 5
      };

      var sideGeometry = new THREE.ExtrudeBufferGeometry(shape, sideExtrudeSettings);
      sideGeometry.center();

      var sideMesh = new THREE.Mesh(sideGeometry, sideMaterial);
      sideMesh.rotation.x = -Math.PI / 2;
      sideMesh.rotation.y = -Math.PI;
      sideMesh.rotation.z = -Math.PI;

      return sideMesh;
    }
  }, {
    key: 'shape',
    get: function get() {
      // console.warn('shape ')
      return null;
    }
  }, {
    key: 'sideShape',
    get: function get() {
      return null;
    }
  }, {
    key: 'extrudeSettings',
    get: function get() {
      var _model$depth = this.model.depth,
          depth = _model$depth === undefined ? 1 : _model$depth;


      return {
        steps: 1,
        amount: depth,
        bevelEnabled: false,
        UVGenerator: this.boundingUVGenerator
      };
    }
  }, {
    key: 'boundingUVGenerator',
    get: function get() {
      if (!this._boundingUVGenerator) this._boundingUVGenerator = new _boundingUvGenerator2.default();

      return this._boundingUVGenerator;
    }
  }]);

  return Extrude;
}(_object3d2.default);

exports.default = Extrude;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// private property

var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

// public method for encoding
exports.encode = function (input, utf8) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = (chr1 & 3) << 4 | chr2 >> 4;
        enc3 = (chr2 & 15) << 2 | chr3 >> 6;
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }

    return output;
};

// public method for decoding
exports.decode = function (input, utf8) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));

        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }

    return output;
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var support = __webpack_require__(3);
var utils = __webpack_require__(0);
var _crc = __webpack_require__(72);
var signature = __webpack_require__(24);
var defaults = __webpack_require__(25);
var base64 = __webpack_require__(6);
var compressions = __webpack_require__(8);
var CompressedObject = __webpack_require__(26);
var nodeBuffer = __webpack_require__(10);
var utf8 = __webpack_require__(27);
var StringWriter = __webpack_require__(73);
var Uint8ArrayWriter = __webpack_require__(74);

/**
 * Returns the raw data of a ZipObject, decompress the content if necessary.
 * @param {ZipObject} file the file to use.
 * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
 */
var getRawData = function getRawData(file) {
    if (file._data instanceof CompressedObject) {
        file._data = file._data.getContent();
        file.options.binary = true;
        file.options.base64 = false;

        if (utils.getTypeOf(file._data) === "uint8array") {
            var copy = file._data;
            // when reading an arraybuffer, the CompressedObject mechanism will keep it and subarray() a Uint8Array.
            // if we request a file in the same format, we might get the same Uint8Array or its ArrayBuffer (the original zip file).
            file._data = new Uint8Array(copy.length);
            // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
            if (copy.length !== 0) {
                file._data.set(copy, 0);
            }
        }
    }
    return file._data;
};

/**
 * Returns the data of a ZipObject in a binary form. If the content is an unicode string, encode it.
 * @param {ZipObject} file the file to use.
 * @return {String|ArrayBuffer|Uint8Array|Buffer} the data.
 */
var getBinaryData = function getBinaryData(file) {
    var result = getRawData(file),
        type = utils.getTypeOf(result);
    if (type === "string") {
        if (!file.options.binary) {
            // unicode text !
            // unicode string => binary string is a painful process, check if we can avoid it.
            if (support.nodebuffer) {
                return nodeBuffer(result, "utf-8");
            }
        }
        return file.asBinary();
    }
    return result;
};

/**
 * Transform this._data into a string.
 * @param {function} filter a function String -> String, applied if not null on the result.
 * @return {String} the string representing this._data.
 */
var dataToString = function dataToString(asUTF8) {
    var result = getRawData(this);
    if (result === null || typeof result === "undefined") {
        return "";
    }
    // if the data is a base64 string, we decode it before checking the encoding !
    if (this.options.base64) {
        result = base64.decode(result);
    }
    if (asUTF8 && this.options.binary) {
        // JSZip.prototype.utf8decode supports arrays as input
        // skip to array => string step, utf8decode will do it.
        result = out.utf8decode(result);
    } else {
        // no utf8 transformation, do the array => string step.
        result = utils.transformTo("string", result);
    }

    if (!asUTF8 && !this.options.binary) {
        result = utils.transformTo("string", out.utf8encode(result));
    }
    return result;
};
/**
 * A simple object representing a file in the zip file.
 * @constructor
 * @param {string} name the name of the file
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
 * @param {Object} options the options of the file
 */
var ZipObject = function ZipObject(name, data, options) {
    this.name = name;
    this.dir = options.dir;
    this.date = options.date;
    this.comment = options.comment;
    this.unixPermissions = options.unixPermissions;
    this.dosPermissions = options.dosPermissions;

    this._data = data;
    this.options = options;

    /*
     * This object contains initial values for dir and date.
     * With them, we can check if the user changed the deprecated metadata in
     * `ZipObject#options` or not.
     */
    this._initialMetadata = {
        dir: options.dir,
        date: options.date
    };
};

ZipObject.prototype = {
    /**
     * Return the content as UTF8 string.
     * @return {string} the UTF8 string.
     */
    asText: function asText() {
        return dataToString.call(this, true);
    },
    /**
     * Returns the binary content.
     * @return {string} the content as binary.
     */
    asBinary: function asBinary() {
        return dataToString.call(this, false);
    },
    /**
     * Returns the content as a nodejs Buffer.
     * @return {Buffer} the content as a Buffer.
     */
    asNodeBuffer: function asNodeBuffer() {
        var result = getBinaryData(this);
        return utils.transformTo("nodebuffer", result);
    },
    /**
     * Returns the content as an Uint8Array.
     * @return {Uint8Array} the content as an Uint8Array.
     */
    asUint8Array: function asUint8Array() {
        var result = getBinaryData(this);
        return utils.transformTo("uint8array", result);
    },
    /**
     * Returns the content as an ArrayBuffer.
     * @return {ArrayBuffer} the content as an ArrayBufer.
     */
    asArrayBuffer: function asArrayBuffer() {
        return this.asUint8Array().buffer;
    }
};

/**
 * Transform an integer into a string in hexadecimal.
 * @private
 * @param {number} dec the number to convert.
 * @param {number} bytes the number of bytes to generate.
 * @returns {string} the result.
 */
var decToHex = function decToHex(dec, bytes) {
    var hex = "",
        i;
    for (i = 0; i < bytes; i++) {
        hex += String.fromCharCode(dec & 0xff);
        dec = dec >>> 8;
    }
    return hex;
};

/**
 * Transforms the (incomplete) options from the user into the complete
 * set of options to create a file.
 * @private
 * @param {Object} o the options from the user.
 * @return {Object} the complete set of options.
 */
var prepareFileAttrs = function prepareFileAttrs(o) {
    o = o || {};
    if (o.base64 === true && (o.binary === null || o.binary === undefined)) {
        o.binary = true;
    }
    o = utils.extend(o, defaults);
    o.date = o.date || new Date();
    if (o.compression !== null) o.compression = o.compression.toUpperCase();

    return o;
};

/**
 * Add a file in the current folder.
 * @private
 * @param {string} name the name of the file
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data of the file
 * @param {Object} o the options of the file
 * @return {Object} the new file.
 */
var fileAdd = function fileAdd(name, data, o) {
    // be sure sub folders exist
    var dataType = utils.getTypeOf(data),
        parent;

    o = prepareFileAttrs(o);

    if (typeof o.unixPermissions === "string") {
        o.unixPermissions = parseInt(o.unixPermissions, 8);
    }

    // UNX_IFDIR  0040000 see zipinfo.c
    if (o.unixPermissions && o.unixPermissions & 0x4000) {
        o.dir = true;
    }
    // Bit 4    Directory
    if (o.dosPermissions && o.dosPermissions & 0x0010) {
        o.dir = true;
    }

    if (o.dir) {
        name = forceTrailingSlash(name);
    }

    if (o.createFolders && (parent = parentFolder(name))) {
        folderAdd.call(this, parent, true);
    }

    if (o.dir || data === null || typeof data === "undefined") {
        o.base64 = false;
        o.binary = false;
        data = null;
        dataType = null;
    } else if (dataType === "string") {
        if (o.binary && !o.base64) {
            // optimizedBinaryString == true means that the file has already been filtered with a 0xFF mask
            if (o.optimizedBinaryString !== true) {
                // this is a string, not in a base64 format.
                // Be sure that this is a correct "binary string"
                data = utils.string2binary(data);
            }
        }
    } else {
        // arraybuffer, uint8array, ...
        o.base64 = false;
        o.binary = true;

        if (!dataType && !(data instanceof CompressedObject)) {
            throw new Error("The data of '" + name + "' is in an unsupported format !");
        }

        // special case : it's way easier to work with Uint8Array than with ArrayBuffer
        if (dataType === "arraybuffer") {
            data = utils.transformTo("uint8array", data);
        }
    }

    var object = new ZipObject(name, data, o);
    this.files[name] = object;
    return object;
};

/**
 * Find the parent folder of the path.
 * @private
 * @param {string} path the path to use
 * @return {string} the parent folder, or ""
 */
var parentFolder = function parentFolder(path) {
    if (path.slice(-1) == '/') {
        path = path.substring(0, path.length - 1);
    }
    var lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash) : "";
};

/**
 * Returns the path with a slash at the end.
 * @private
 * @param {String} path the path to check.
 * @return {String} the path with a trailing slash.
 */
var forceTrailingSlash = function forceTrailingSlash(path) {
    // Check the name ends with a /
    if (path.slice(-1) != "/") {
        path += "/"; // IE doesn't like substr(-1)
    }
    return path;
};
/**
 * Add a (sub) folder in the current folder.
 * @private
 * @param {string} name the folder's name
 * @param {boolean=} [createFolders] If true, automatically create sub
 *  folders. Defaults to false.
 * @return {Object} the new folder.
 */
var folderAdd = function folderAdd(name, createFolders) {
    createFolders = typeof createFolders !== 'undefined' ? createFolders : false;

    name = forceTrailingSlash(name);

    // Does this folder already exist?
    if (!this.files[name]) {
        fileAdd.call(this, name, null, {
            dir: true,
            createFolders: createFolders
        });
    }
    return this.files[name];
};

/**
 * Generate a JSZip.CompressedObject for a given zipOject.
 * @param {ZipObject} file the object to read.
 * @param {JSZip.compression} compression the compression to use.
 * @param {Object} compressionOptions the options to use when compressing.
 * @return {JSZip.CompressedObject} the compressed result.
 */
var generateCompressedObjectFrom = function generateCompressedObjectFrom(file, compression, compressionOptions) {
    var result = new CompressedObject(),
        content;

    // the data has not been decompressed, we might reuse things !
    if (file._data instanceof CompressedObject) {
        result.uncompressedSize = file._data.uncompressedSize;
        result.crc32 = file._data.crc32;

        if (result.uncompressedSize === 0 || file.dir) {
            compression = compressions['STORE'];
            result.compressedContent = "";
            result.crc32 = 0;
        } else if (file._data.compressionMethod === compression.magic) {
            result.compressedContent = file._data.getCompressedContent();
        } else {
            content = file._data.getContent();
            // need to decompress / recompress
            result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content), compressionOptions);
        }
    } else {
        // have uncompressed data
        content = getBinaryData(file);
        if (!content || content.length === 0 || file.dir) {
            compression = compressions['STORE'];
            content = "";
        }
        result.uncompressedSize = content.length;
        result.crc32 = _crc(content);
        result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content), compressionOptions);
    }

    result.compressedSize = result.compressedContent.length;
    result.compressionMethod = compression.magic;

    return result;
};

/**
 * Generate the UNIX part of the external file attributes.
 * @param {Object} unixPermissions the unix permissions or null.
 * @param {Boolean} isDir true if the entry is a directory, false otherwise.
 * @return {Number} a 32 bit integer.
 *
 * adapted from http://unix.stackexchange.com/questions/14705/the-zip-formats-external-file-attribute :
 *
 * TTTTsstrwxrwxrwx0000000000ADVSHR
 * ^^^^____________________________ file type, see zipinfo.c (UNX_*)
 *     ^^^_________________________ setuid, setgid, sticky
 *        ^^^^^^^^^________________ permissions
 *                 ^^^^^^^^^^______ not used ?
 *                           ^^^^^^ DOS attribute bits : Archive, Directory, Volume label, System file, Hidden, Read only
 */
var generateUnixExternalFileAttr = function generateUnixExternalFileAttr(unixPermissions, isDir) {

    var result = unixPermissions;
    if (!unixPermissions) {
        // I can't use octal values in strict mode, hence the hexa.
        //  040775 => 0x41fd
        // 0100664 => 0x81b4
        result = isDir ? 0x41fd : 0x81b4;
    }

    return (result & 0xFFFF) << 16;
};

/**
 * Generate the DOS part of the external file attributes.
 * @param {Object} dosPermissions the dos permissions or null.
 * @param {Boolean} isDir true if the entry is a directory, false otherwise.
 * @return {Number} a 32 bit integer.
 *
 * Bit 0     Read-Only
 * Bit 1     Hidden
 * Bit 2     System
 * Bit 3     Volume Label
 * Bit 4     Directory
 * Bit 5     Archive
 */
var generateDosExternalFileAttr = function generateDosExternalFileAttr(dosPermissions, isDir) {

    // the dir flag is already set for compatibility

    return (dosPermissions || 0) & 0x3F;
};

/**
 * Generate the various parts used in the construction of the final zip file.
 * @param {string} name the file name.
 * @param {ZipObject} file the file content.
 * @param {JSZip.CompressedObject} compressedObject the compressed object.
 * @param {number} offset the current offset from the start of the zip file.
 * @param {String} platform let's pretend we are this platform (change platform dependents fields)
 * @param {Function} encodeFileName the function to encode the file name / comment.
 * @return {object} the zip parts.
 */
var generateZipParts = function generateZipParts(name, file, compressedObject, offset, platform, encodeFileName) {
    var data = compressedObject.compressedContent,
        useCustomEncoding = encodeFileName !== utf8.utf8encode,
        encodedFileName = utils.transformTo("string", encodeFileName(file.name)),
        utfEncodedFileName = utils.transformTo("string", utf8.utf8encode(file.name)),
        comment = file.comment || "",
        encodedComment = utils.transformTo("string", encodeFileName(comment)),
        utfEncodedComment = utils.transformTo("string", utf8.utf8encode(comment)),
        useUTF8ForFileName = utfEncodedFileName.length !== file.name.length,
        useUTF8ForComment = utfEncodedComment.length !== comment.length,
        o = file.options,
        dosTime,
        dosDate,
        extraFields = "",
        unicodePathExtraField = "",
        unicodeCommentExtraField = "",
        dir,
        date;

    // handle the deprecated options.dir
    if (file._initialMetadata.dir !== file.dir) {
        dir = file.dir;
    } else {
        dir = o.dir;
    }

    // handle the deprecated options.date
    if (file._initialMetadata.date !== file.date) {
        date = file.date;
    } else {
        date = o.date;
    }

    var extFileAttr = 0;
    var versionMadeBy = 0;
    if (dir) {
        // dos or unix, we set the dos dir flag
        extFileAttr |= 0x00010;
    }
    if (platform === "UNIX") {
        versionMadeBy = 0x031E; // UNIX, version 3.0
        extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);
    } else {
        // DOS or other, fallback to DOS
        versionMadeBy = 0x0014; // DOS, version 2.0
        extFileAttr |= generateDosExternalFileAttr(file.dosPermissions, dir);
    }

    // date
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/52/13.html
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/65/16.html
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/66/16.html

    dosTime = date.getHours();
    dosTime = dosTime << 6;
    dosTime = dosTime | date.getMinutes();
    dosTime = dosTime << 5;
    dosTime = dosTime | date.getSeconds() / 2;

    dosDate = date.getFullYear() - 1980;
    dosDate = dosDate << 4;
    dosDate = dosDate | date.getMonth() + 1;
    dosDate = dosDate << 5;
    dosDate = dosDate | date.getDate();

    if (useUTF8ForFileName) {
        // set the unicode path extra field. unzip needs at least one extra
        // field to correctly handle unicode path, so using the path is as good
        // as any other information. This could improve the situation with
        // other archive managers too.
        // This field is usually used without the utf8 flag, with a non
        // unicode path in the header (winrar, winzip). This helps (a bit)
        // with the messy Windows' default compressed folders feature but
        // breaks on p7zip which doesn't seek the unicode path extra field.
        // So for now, UTF-8 everywhere !
        unicodePathExtraField =
        // Version
        decToHex(1, 1) +
        // NameCRC32
        decToHex(_crc(encodedFileName), 4) +
        // UnicodeName
        utfEncodedFileName;

        extraFields +=
        // Info-ZIP Unicode Path Extra Field
        "\x75\x70" +
        // size
        decToHex(unicodePathExtraField.length, 2) +
        // content
        unicodePathExtraField;
    }

    if (useUTF8ForComment) {

        unicodeCommentExtraField =
        // Version
        decToHex(1, 1) +
        // CommentCRC32
        decToHex(this.crc32(encodedComment), 4) +
        // UnicodeName
        utfEncodedComment;

        extraFields +=
        // Info-ZIP Unicode Path Extra Field
        "\x75\x63" +
        // size
        decToHex(unicodeCommentExtraField.length, 2) +
        // content
        unicodeCommentExtraField;
    }

    var header = "";

    // version needed to extract
    header += "\x0A\x00";
    // general purpose bit flag
    // set bit 11 if utf8
    header += !useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment) ? "\x00\x08" : "\x00\x00";
    // compression method
    header += compressedObject.compressionMethod;
    // last mod file time
    header += decToHex(dosTime, 2);
    // last mod file date
    header += decToHex(dosDate, 2);
    // crc-32
    header += decToHex(compressedObject.crc32, 4);
    // compressed size
    header += decToHex(compressedObject.compressedSize, 4);
    // uncompressed size
    header += decToHex(compressedObject.uncompressedSize, 4);
    // file name length
    header += decToHex(encodedFileName.length, 2);
    // extra field length
    header += decToHex(extraFields.length, 2);

    var fileRecord = signature.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;

    var dirRecord = signature.CENTRAL_FILE_HEADER +
    // version made by (00: DOS)
    decToHex(versionMadeBy, 2) +
    // file header (common to file and central directory)
    header +
    // file comment length
    decToHex(encodedComment.length, 2) +
    // disk number start
    "\x00\x00" +
    // internal file attributes TODO
    "\x00\x00" +
    // external file attributes
    decToHex(extFileAttr, 4) +
    // relative offset of local header
    decToHex(offset, 4) +
    // file name
    encodedFileName +
    // extra field
    extraFields +
    // file comment
    encodedComment;

    return {
        fileRecord: fileRecord,
        dirRecord: dirRecord,
        compressedObject: compressedObject
    };
};

// return the actual prototype of JSZip
var out = {
    /**
     * Read an existing zip and merge the data in the current JSZip object.
     * The implementation is in jszip-load.js, don't forget to include it.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} stream  The stream to load
     * @param {Object} options Options for loading the stream.
     *  options.base64 : is the stream in base64 ? default : false
     * @return {JSZip} the current JSZip object
     */
    load: function load(stream, options) {
        throw new Error("Load method is not defined. Is the file jszip-load.js included ?");
    },

    /**
     * Filter nested files/folders with the specified function.
     * @param {Function} search the predicate to use :
     * function (relativePath, file) {...}
     * It takes 2 arguments : the relative path and the file.
     * @return {Array} An array of matching elements.
     */
    filter: function filter(search) {
        var result = [],
            filename,
            relativePath,
            file,
            fileClone;
        for (filename in this.files) {
            if (!this.files.hasOwnProperty(filename)) {
                continue;
            }
            file = this.files[filename];
            // return a new object, don't let the user mess with our internal objects :)
            fileClone = new ZipObject(file.name, file._data, utils.extend(file.options));
            relativePath = filename.slice(this.root.length, filename.length);
            if (filename.slice(0, this.root.length) === this.root && // the file is in the current root
            search(relativePath, fileClone)) {
                // and the file matches the function
                result.push(fileClone);
            }
        }
        return result;
    },

    /**
     * Add a file to the zip file, or search a file.
     * @param   {string|RegExp} name The name of the file to add (if data is defined),
     * the name of the file to find (if no data) or a regex to match files.
     * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
     * @param   {Object} o     File options
     * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
     * a file (when searching by string) or an array of files (when searching by regex).
     */
    file: function file(name, data, o) {
        if (arguments.length === 1) {
            if (utils.isRegExp(name)) {
                var regexp = name;
                return this.filter(function (relativePath, file) {
                    return !file.dir && regexp.test(relativePath);
                });
            } else {
                // text
                return this.filter(function (relativePath, file) {
                    return !file.dir && relativePath === name;
                })[0] || null;
            }
        } else {
            // more than one argument : we have data !
            name = this.root + name;
            fileAdd.call(this, name, data, o);
        }
        return this;
    },

    /**
     * Add a directory to the zip file, or search.
     * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
     * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
     */
    folder: function folder(arg) {
        if (!arg) {
            return this;
        }

        if (utils.isRegExp(arg)) {
            return this.filter(function (relativePath, file) {
                return file.dir && arg.test(relativePath);
            });
        }

        // else, name is a new folder
        var name = this.root + arg;
        var newFolder = folderAdd.call(this, name);

        // Allow chaining by returning a new object with this folder as the root
        var ret = this.clone();
        ret.root = newFolder.name;
        return ret;
    },

    /**
     * Delete a file, or a directory and all sub-files, from the zip
     * @param {string} name the name of the file to delete
     * @return {JSZip} this JSZip object
     */
    remove: function remove(name) {
        name = this.root + name;
        var file = this.files[name];
        if (!file) {
            // Look for any folders
            if (name.slice(-1) != "/") {
                name += "/";
            }
            file = this.files[name];
        }

        if (file && !file.dir) {
            // file
            delete this.files[name];
        } else {
            // maybe a folder, delete recursively
            var kids = this.filter(function (relativePath, file) {
                return file.name.slice(0, name.length) === name;
            });
            for (var i = 0; i < kids.length; i++) {
                delete this.files[kids[i].name];
            }
        }

        return this;
    },

    /**
     * Generate the complete zip file
     * @param {Object} options the options to generate the zip file :
     * - base64, (deprecated, use type instead) true to generate base64.
     * - compression, "STORE" by default.
     * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
     * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the zip file
     */
    generate: function generate(options) {
        options = utils.extend(options || {}, {
            base64: true,
            compression: "STORE",
            compressionOptions: null,
            type: "base64",
            platform: "DOS",
            comment: null,
            mimeType: 'application/zip',
            encodeFileName: utf8.utf8encode
        });

        utils.checkSupport(options.type);

        // accept nodejs `process.platform`
        if (options.platform === 'darwin' || options.platform === 'freebsd' || options.platform === 'linux' || options.platform === 'sunos') {
            options.platform = "UNIX";
        }
        if (options.platform === 'win32') {
            options.platform = "DOS";
        }

        var zipData = [],
            localDirLength = 0,
            centralDirLength = 0,
            writer,
            i,
            encodedComment = utils.transformTo("string", options.encodeFileName(options.comment || this.comment || ""));

        // first, generate all the zip parts.
        for (var name in this.files) {
            if (!this.files.hasOwnProperty(name)) {
                continue;
            }
            var file = this.files[name];

            var compressionName = file.options.compression || options.compression.toUpperCase();
            var compression = compressions[compressionName];
            if (!compression) {
                throw new Error(compressionName + " is not a valid compression method !");
            }
            var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};

            var compressedObject = generateCompressedObjectFrom.call(this, file, compression, compressionOptions);

            var zipPart = generateZipParts.call(this, name, file, compressedObject, localDirLength, options.platform, options.encodeFileName);
            localDirLength += zipPart.fileRecord.length + compressedObject.compressedSize;
            centralDirLength += zipPart.dirRecord.length;
            zipData.push(zipPart);
        }

        var dirEnd = "";

        // end of central dir signature
        dirEnd = signature.CENTRAL_DIRECTORY_END +
        // number of this disk
        "\x00\x00" +
        // number of the disk with the start of the central directory
        "\x00\x00" +
        // total number of entries in the central directory on this disk
        decToHex(zipData.length, 2) +
        // total number of entries in the central directory
        decToHex(zipData.length, 2) +
        // size of the central directory   4 bytes
        decToHex(centralDirLength, 4) +
        // offset of start of central directory with respect to the starting disk number
        decToHex(localDirLength, 4) +
        // .ZIP file comment length
        decToHex(encodedComment.length, 2) +
        // .ZIP file comment
        encodedComment;

        // we have all the parts (and the total length)
        // time to create a writer !
        var typeName = options.type.toLowerCase();
        if (typeName === "uint8array" || typeName === "arraybuffer" || typeName === "blob" || typeName === "nodebuffer") {
            writer = new Uint8ArrayWriter(localDirLength + centralDirLength + dirEnd.length);
        } else {
            writer = new StringWriter(localDirLength + centralDirLength + dirEnd.length);
        }

        for (i = 0; i < zipData.length; i++) {
            writer.append(zipData[i].fileRecord);
            writer.append(zipData[i].compressedObject.compressedContent);
        }
        for (i = 0; i < zipData.length; i++) {
            writer.append(zipData[i].dirRecord);
        }

        writer.append(dirEnd);

        var zip = writer.finalize();

        switch (options.type.toLowerCase()) {
            // case "zip is an Uint8Array"
            case "uint8array":
            case "arraybuffer":
            case "nodebuffer":
                return utils.transformTo(options.type.toLowerCase(), zip);
            case "blob":
                return utils.arrayBuffer2Blob(utils.transformTo("arraybuffer", zip), options.mimeType);
            // case "zip is a string"
            case "base64":
                return options.base64 ? base64.encode(zip) : zip;
            default:
                // case "string" :
                return zip;
        }
    },

    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    crc32: function crc32(input, crc) {
        return _crc(input, crc);
    },

    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    utf8encode: function utf8encode(string) {
        return utils.transformTo("string", utf8.utf8encode(string));
    },

    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    utf8decode: function utf8decode(input) {
        return utf8.utf8decode(input);
    }
};
module.exports = out;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.STORE = {
    magic: "\x00\x00",
    compress: function compress(content, compressionOptions) {
        return content; // no compression
    },
    uncompress: function uncompress(content) {
        return content; // no compression
    },
    compressInputType: null,
    uncompressInputType: null
};
exports.DEFLATE = __webpack_require__(62);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {
  2: 'need dictionary', /* Z_NEED_DICT       2  */
  1: 'stream end', /* Z_STREAM_END      1  */
  0: '', /* Z_OK              0  */
  '-1': 'file error', /* Z_ERRNO         (-1) */
  '-2': 'stream error', /* Z_STREAM_ERROR  (-2) */
  '-3': 'data error', /* Z_DATA_ERROR    (-3) */
  '-4': 'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5': 'buffer error', /* Z_BUF_ERROR     (-5) */
  '-6': 'incompatible version' /* Z_VERSION_ERROR (-6) */
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

module.exports = function (data, encoding) {
    return new Buffer(data, encoding);
};
module.exports.test = function (b) {
    return Buffer.isBuffer(b);
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(18).Buffer))

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

var ThreeControls = function ThreeControls(object, component) {

  this.object = object;

  this.component = component;

  // Set to false to disable this control
  this.enabled = true;

  // "target" sets the location of focus, where the object orbits around
  this.target = new THREE.Vector3();

  // How far you can dolly in and out ( PerspectiveCamera only )
  this.minDistance = 0;
  this.maxDistance = Infinity;

  // How far you can zoom in and out ( OrthographicCamera only )
  this.minZoom = 0;
  this.maxZoom = Infinity;

  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  this.minPolarAngle = 0; // radians
  this.maxPolarAngle = Math.PI; // radians

  // How far you can orbit horizontally, upper and lower limits.
  // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
  this.minAzimuthAngle = -Infinity; // radians
  this.maxAzimuthAngle = Infinity; // radians

  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  this.enableDamping = false;
  this.dampingFactor = 0.25;

  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  this.enableZoom = true;
  this.zoomSpeed = 1.0;

  // Set to false to disable rotating
  this.enableRotate = true;
  this.rotateSpeed = 1.0;

  // Set to false to disable panning
  this.enablePan = true;
  this.keyPanSpeed = 7.0; // pixels moved per arrow key push

  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  this.autoRotate = this.component.model.autoRotate || false;
  this.autoRotateSpeed = this.component.model.rotationSpeed || 2.0; // 30 seconds per round when fps is 60

  // Set to false to disable use of the keys
  this.enableKeys = true;

  // The four arrow keys
  this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

  // Mouse buttons
  this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

  // for reset
  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.zoom0 = this.object.zoom;

  // flags
  this.cameraChanged = false;

  //
  // public methods
  //

  this.getPolarAngle = function () {

    return spherical.phi;
  };

  this.getAzimuthalAngle = function () {

    return spherical.theta;
  };

  this.saveState = function () {

    scope.target0.copy(scope.target);
    scope.position0.copy(scope.object.position);
    scope.zoom0 = scope.object.zoom;
  };

  this.reset = function () {

    scope.target.copy(scope.target0);
    scope.object.position.copy(scope.position0);
    scope.object.zoom = scope.zoom0;

    scope.object.updateProjectionMatrix();
    // scope.dispatchEvent( changeEvent );

    scope.update();

    state = STATE.NONE;
  };

  // this method is exposed, but perhaps it would be better if we can make it private...
  this.update = function () {

    var offset = new THREE.Vector3();

    // so camera.up is the orbit axis
    var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
    var quatInverse = quat.clone().inverse();

    var lastPosition = new THREE.Vector3();
    var lastQuaternion = new THREE.Quaternion();

    return function update() {

      // if (!(scope.cameraChanged || scope.autoRotate))
      //   return false;

      var position = scope.object.position;

      offset.copy(position).sub(scope.target);

      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion(quat);

      // angle from z-axis around y-axis
      spherical.setFromVector3(offset);

      if (scope.autoRotate && state === STATE.NONE) {

        // theta = getAutoRotationAngle();
        // thetaDelta = - getAutoRotationAngle();
        // theta = 0;

        rotateLeft(getAutoRotationAngle());
        // spherical.theta = getAutoRotationAngle();
      }

      spherical.theta += sphericalDelta.theta;
      spherical.phi += sphericalDelta.phi;

      // restrict theta to be between desired limits
      spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));

      // restrict phi to be between desired limits
      spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

      spherical.makeSafe();

      spherical.radius *= scale;

      // restrict radius to be between desired limits
      spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

      // move target to panned location
      scope.target.add(panOffset);

      offset.setFromSpherical(spherical);

      // rotate offset back to "camera-up-vector-is-up" space
      offset.applyQuaternion(quatInverse);

      position.copy(scope.target).add(offset);

      scope.object.lookAt(scope.target);

      if (scope.enableDamping === true) {

        sphericalDelta.theta *= 1 - scope.dampingFactor;
        sphericalDelta.phi *= 1 - scope.dampingFactor;
      } else {

        sphericalDelta.set(0, 0, 0);
      }

      scale = 1;
      panOffset.set(0, 0, 0);

      // update condition is:
      // min(camera displacement, camera rotation in radians)^2 > EPS
      // using small-angle approximation cos(x/2) = 1 - x^2 / 8

      // if ((scope.cameraChanged || zoomChanged) && (
      //   lastPosition.distanceToSquared(scope.object.position) > EPS ||
      //   8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS)) {
      if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

        lastPosition.copy(scope.object.position);
        lastQuaternion.copy(scope.object.quaternion);

        scope.component.invalidate();
        scope.cameraChanged = false;
        zoomChanged = false;

        return true;
      }

      scope.component.invalidate();
      return false;
    };
  }();

  this.dispose = function () {};

  //
  // event handlers - FSM: listen for events and reset state
  //

  this.onMouseDown = function (event) {};

  this.onMouseMove = function (event) {};

  this.onMouseUp = function (event) {};

  this.onDragStart = function (event) {
    if (this.enabled === false || this.enableRotate === false) return;

    scope.component.stop();
    this.autoRotate = false;

    if (event.altKey === true) state = STATE.PAN;else state = STATE.ROTATE;

    switch (state) {
      case STATE.ROTATE:
        if (this.enableRotate) handleDragStartRotate(event);
        break;

      case STATE.DOLLY:
        if (this.enableZoom) handleDragStartDolly(event);
        break;

      case STATE.PAN:
        if (this.enablePan) handleDragStartPan(event);
        break;
    }
  };

  this.onDragMove = function (event) {

    if (!this.enabled) return;

    if (event.altKey === true) state = STATE.PAN;else state = STATE.ROTATE;

    switch (state) {
      case STATE.ROTATE:
        if (this.enableRotate) handleDragMoveRotate(event);
        break;

      case STATE.DOLLY:
        if (this.enableZoom) handleDragMoveDolly(event);
        break;

      case STATE.PAN:
        if (this.enablePan) handleDragMovePan(event);
        break;
    }
  };

  this.onDragEnd = function (event) {
    if (this.enabled === false || this.enableRotate === false) return;

    state = STATE.NONE;

    START_TIME = null;
    this.autoRotate = this.component.model.autoRotate || false;

    scope.component.threed_animate();
    // scope.update();
  };

  this.onKeyDown = function (event) {

    if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return;

    handleKeyDown(event);
  };

  this.onTouchStart = function (event) {

    if (this.enabled === false) return;

    switch (event.touches.length) {
      case 1:
        // one-fingered touch: rotate
        if (this.enableRotate === false) return;
        handleTouchStartRotate(event);
        state = STATE.TOUCH_ROTATE;
        break;

      case 2:
        // two-fingered touch: pan
        this.lastScale = event.scale;
        if (this.enablePan === false) return;
        handleTouchStartPan(event);
        state = STATE.TOUCH_PAN;
        break;
      // case 2: // two-fingered touch: dolly
      //   if ( this.enableZoom === false ) return;
      //   handleTouchStartDolly( event );
      //   state = STATE.TOUCH_DOLLY;
      //   break;

      // case 3: // three-fingered touch: pan
      //   if ( this.enablePan === false ) return;
      //   handleTouchStartPan( event );
      //   state = STATE.TOUCH_PAN;
      //   break;

      default:
        state = STATE.NONE;
    }
  };

  this.onTouchMove = function (event) {
    if (this.enabled === false) return;

    switch (event.touches.length) {
      case 1:
        // one-fingered touch: rotate
        if (this.enableRotate === false) return;
        if (state !== STATE.TOUCH_ROTATE) return; // is this needed?...
        handleTouchMoveRotate(event);
        break;
      case 2:
        // two-fingered touch: pan
        if (Math.abs(this.lastScale - event.scale) > 0.05) {
          console.log(event.scale);
          return;
        }
        if (this.enablePan === false) return;
        if (state !== STATE.TOUCH_PAN) return; // is this needed?...
        handleTouchMovePan(event);
        break;
      // case 2: // two-fingered touch: dolly
      //   if ( this.enableZoom === false ) return;
      //   if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...
      //   handleTouchMoveDolly( event );
      //   break;
      // case 3: // three-fingered touch: pan
      //   if ( this.enablePan === false ) return;
      //   if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...
      //   handleTouchMovePan( event );
      //   break;
      default:
        state = STATE.NONE;
    }
  };

  this.onTouchEnd = function (event) {
    if (this.enabled === false) return;
    this.lastScale = 1;

    handleTouchEnd(event);
    // this.dispatchEvent( endEvent );
    state = STATE.NONE;
  };

  this.doAutoRotate = function (autoRotate) {
    START_TIME = null;
    this.cameraChanged = true;
    this.autoRotate = autoRotate;
    this.update();
  };

  //
  // internals
  //

  var scope = this;

  var changeEvent = { type: 'change' };
  var startEvent = { type: 'start' };
  var endEvent = { type: 'end' };

  var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

  var state = STATE.NONE;

  var EPS = 0.000001;

  // current position in spherical coordinates
  var spherical = new THREE.Spherical();
  var sphericalDelta = new THREE.Spherical();

  var scale = 1;
  var panOffset = new THREE.Vector3();
  var zoomChanged = false;

  var rotateStart = new THREE.Vector2();
  var rotateEnd = new THREE.Vector2();
  var rotateDelta = new THREE.Vector2();

  var panStart = new THREE.Vector2();
  var panEnd = new THREE.Vector2();
  var panDelta = new THREE.Vector2();

  var dollyStart = new THREE.Vector2();
  var dollyEnd = new THREE.Vector2();
  var dollyDelta = new THREE.Vector2();

  var START_TIME = null;
  var offsetTheta = 0;

  function getAutoRotationAngle() {
    if (!START_TIME) {
      START_TIME = performance.now();
      offsetTheta = spherical.theta;
      return 0;
    }

    var lastTime = performance.now() - START_TIME;
    var progress = lastTime / (60000 / scope.autoRotateSpeed);

    // return - 2 * Math.PI * progress;
    return 2 * Math.PI * progress + spherical.theta - offsetTheta;
    // return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
  }

  function getZoomScale() {

    return Math.pow(0.95, scope.zoomSpeed);
  }

  function rotateLeft(angle) {

    sphericalDelta.theta -= angle;
  }

  function rotateUp(angle) {

    sphericalDelta.phi -= angle;
  }

  var panLeft = function () {

    var v = new THREE.Vector3();

    return function panLeft(distance, objectMatrix) {

      v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
      v.multiplyScalar(-distance);

      panOffset.add(v);
    };
  }();

  var panUp = function () {

    var v = new THREE.Vector3();

    return function panUp(distance, objectMatrix) {

      v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
      v.multiplyScalar(distance);

      panOffset.add(v);
    };
  }();

  // deltaX and deltaY are in pixels; right and down are positive
  var pan = function () {

    var offset = new THREE.Vector3();

    return function pan(deltaX, deltaY) {

      var element = scope.component === document ? scope.component.body : scope.component;

      if (scope.object.isPerspectiveCamera) {

        // perspective
        var position = scope.object.position;
        offset.copy(position).sub(scope.target);
        var targetDistance = offset.length();

        // half of the fov is center to top of screen
        targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0);

        // we actually don't use screenWidth, since perspective camera is fixed to screen height
        panLeft(2 * deltaX * targetDistance / element.model.height, scope.object.matrix);
        // panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
        panUp(2 * deltaY * targetDistance / element.model.height, scope.object.matrix);
        // panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );
      } else if (scope.object.isOrthographicCamera) {

        // orthographic
        panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.model.width, scope.object.matrix);
        // panLeft( deltaX * ( scope.object.right - scope.object.left ) / element.clientWidth, scope.object.matrix );
        panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.model.height, scope.object.matrix);
        // panUp( deltaY * ( scope.object.top - scope.object.bottom ) / element.clientHeight, scope.object.matrix );
      } else {

        // camera neither orthographic nor perspective
        console.warn('WARNING: ThreeControls.js encountered an unknown camera type - pan disabled.');
        scope.enablePan = false;
      }
    };
  }();

  function dollyIn(dollyScale) {

    if (scope.object.isPerspectiveCamera) {

      scale /= dollyScale;
    } else if (scope.object.isOrthographicCamera) {

      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {

      console.warn('WARNING: ThreeControls.js encountered an unknown camera type - dolly/zoom disabled.');
      scope.enableZoom = false;
    }
  }

  function dollyOut(dollyScale) {

    if (scope.object.isPerspectiveCamera) {

      scale *= dollyScale;
    } else if (scope.object.isOrthographicCamera) {

      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {

      console.warn('WARNING: ThreeControls.js encountered an unknown camera type - dolly/zoom disabled.');
      scope.enableZoom = false;
    }
  }

  //
  // event callbacks - update the object state
  //

  function handleDragStartRotate(event) {

    rotateStart.set(event.offsetX, event.offsetY);
  }

  function handleDragStartDolly(event) {

    dollyStart.set(event.offsetX, event.offsetY);
  }

  function handleDragStartPan(event) {

    panStart.set(event.offsetX, event.offsetY);
  }

  function handleDragMoveRotate(event) {

    rotateEnd.set(event.offsetX, event.offsetY);
    rotateDelta.subVectors(rotateEnd, rotateStart);

    var element = scope.component;

    // rotating across whole screen goes 360 degrees around
    rotateLeft(2 * Math.PI * rotateDelta.x / element.get('width') * scope.rotateSpeed);

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    rotateUp(2 * Math.PI * rotateDelta.y / element.get('height') * scope.rotateSpeed);

    rotateStart.copy(rotateEnd);

    scope.update();
  }

  function handleDragMoveDolly(event) {

    dollyEnd.set(event.offsetX, event.offsetY);

    dollyDelta.subVectors(dollyEnd, dollyStart);

    if (dollyDelta.y > 0) {

      dollyIn(getZoomScale());
    } else if (dollyDelta.y < 0) {

      dollyOut(getZoomScale());
    }

    dollyStart.copy(dollyEnd);

    scope.update();
  }

  function handleDragMovePan(event) {

    panEnd.set(event.offsetX, event.offsetY);

    panDelta.subVectors(panEnd, panStart);

    pan(panDelta.x, panDelta.y);

    panStart.copy(panEnd);

    scope.update();
  }

  function handleMouseUp(event) {}

  function handleKeyDown(event) {

    switch (event.keyCode) {

      case scope.keys.UP:
        pan(0, scope.keyPanSpeed);
        scope.update();
        break;

      case scope.keys.BOTTOM:
        pan(0, -scope.keyPanSpeed);
        scope.update();
        break;

      case scope.keys.LEFT:
        pan(scope.keyPanSpeed, 0);
        scope.update();
        break;

      case scope.keys.RIGHT:
        pan(-scope.keyPanSpeed, 0);
        scope.update();
        break;

    }
  }

  function handleTouchStartRotate(event) {
    var x = event.touches[0].offsetX || event.touches[0].pageX;
    var y = event.touches[0].offsetY || event.touches[0].pageY;

    rotateStart.set(x, y);
  }

  function handleTouchStartDolly(event) {

    var dx = event.touches[0].pageX - event.touches[1].pageX;
    var dy = event.touches[0].pageY - event.touches[1].pageY;

    var distance = Math.sqrt(dx * dx + dy * dy);

    dollyStart.set(0, distance);
  }

  function handleTouchStartPan(event) {
    var x = event.touches[0].offsetX || event.touches[0].pageX;
    var y = event.touches[0].offsetY || event.touches[0].pageY;

    panStart.set(x, y);
  }

  function handleTouchMoveRotate(event) {

    var x = event.touches[0].offsetX || event.touches[0].pageX;
    var y = event.touches[0].offsetY || event.touches[0].pageY;

    rotateEnd.set(x, y);
    rotateDelta.subVectors(rotateEnd, rotateStart);

    var element = scope.component === document ? scope.component.body : scope.component;

    // rotating across whole screen goes 360 degrees around
    rotateLeft(2 * Math.PI * rotateDelta.x / element.model.width * scope.rotateSpeed);
    // rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

    // rotating up and down along whole screen attempts to go 360, but limited to 180
    rotateUp(2 * Math.PI * rotateDelta.y / element.model.height * scope.rotateSpeed);
    // rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

    rotateStart.copy(rotateEnd);

    scope.update();
  }

  function handleTouchMoveDolly(event) {

    var dx = event.touches[0].pageX - event.touches[1].pageX;
    var dy = event.touches[0].pageY - event.touches[1].pageY;

    var distance = Math.sqrt(dx * dx + dy * dy);

    dollyEnd.set(0, distance);

    dollyDelta.subVectors(dollyEnd, dollyStart);

    if (dollyDelta.y > 0) {

      dollyOut(getZoomScale());
    } else if (dollyDelta.y < 0) {

      dollyIn(getZoomScale());
    }

    dollyStart.copy(dollyEnd);

    scope.update();
  }

  function handleTouchMovePan(event) {
    var x = event.touches[0].offsetX || event.touches[0].pageX;
    var y = event.touches[0].offsetY || event.touches[0].pageY;

    panEnd.set(x, y);

    panDelta.subVectors(panEnd, panStart);

    pan(panDelta.x, panDelta.y);

    panStart.copy(panEnd);

    scope.update();
  }

  function handleTouchEnd(event) {}

  this.update();
};

ThreeControls.prototype = {}; //Object.create( THREE.EventDispatcher.prototype );
ThreeControls.prototype.constructor = ThreeControls;
Object.defineProperties(ThreeControls.prototype, {

  center: {

    get: function get() {

      console.warn('THREE.OrbitControls: .center has been renamed to .target');
      return this.target;
    }

  },

  // backward compatibility

  noZoom: {

    get: function get() {

      console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
      return !this.enableZoom;
    },

    set: function set(value) {

      console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
      this.enableZoom = !value;
    }

  },

  noRotate: {

    get: function get() {

      console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
      return !this.enableRotate;
    },

    set: function set(value) {

      console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
      this.enableRotate = !value;
    }

  },

  noPan: {

    get: function get() {

      console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
      return !this.enablePan;
    },

    set: function set(value) {

      console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
      this.enablePan = !value;
    }

  },

  noKeys: {

    get: function get() {

      console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
      return !this.enableKeys;
    },

    set: function set(value) {

      console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
      this.enableKeys = !value;
    }

  },

  staticMoving: {

    get: function get() {

      console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
      return !this.enableDamping;
    },

    set: function set(value) {

      console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
      this.enableDamping = !value;
    }

  },

  dynamicDampingFactor: {

    get: function get() {

      console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
      return this.dampingFactor;
    },

    set: function set(value) {

      console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
      this.dampingFactor = value;
    }

  }

});

exports.default = ThreeControls;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var _scene = scene,
    Component = _scene.Component,
    Component3d = _scene.Component3d,
    Container = _scene.Container,
    RectPath = _scene.RectPath,
    Layout = _scene.Layout,
    TableCell = _scene.TableCell;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'string',
    label: 'section',
    name: 'section'
  }, {
    type: 'string',
    label: 'unit',
    name: 'unit'
  }, {
    type: 'checkbox',
    label: 'is-empty',
    name: 'isEmpty'
  }, {
    type: 'location-increase-pattern',
    label: '',
    name: ''
  }, {
    type: 'editor-table',
    label: '',
    name: '',
    property: {
      merge: false,
      split: false
    }
  }]
};

var EMPTY_BORDER = {};

function isBottomMost(idx, rows, columns) {
  return idx >= (rows - 1) * columns;
}

function isRightMost(idx, rows, columns) {
  return (idx + 1) % columns == 0;
}

function hasAnyProperty(o) {
  for (var _len = arguments.length, properties = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    properties[_key - 1] = arguments[_key];
  }

  for (var p in properties) {
    if (o.hasOwnProperty(properties[p])) return true;
  }
}

var EMPTY_CELL_STROKE_STYLE = '#ccc';
var EMPTY_CELL_LINE_WIDTH = 1;
var EMPTY_CELL_FILL_STYLE = '#efefef';
var HIGHLIGHT_FILL_STYLE = 'rgba(255, 00, 00, 0.7)';
var HIGHLIGHT_TEXT_STYLE = '#fff';

/**
 * 1. 스타일을 상속 받아야 함. (cascade-style)
 * 2. 스타일을 동적처리할 수 있음. (로직처리)
 * 3. 데이타를 받을 수 있음.
 */

var RackTableCell = function (_RectPath) {
  _inherits(RackTableCell, _RectPath);

  function RackTableCell() {
    _classCallCheck(this, RackTableCell);

    return _possibleConstructorReturn(this, (RackTableCell.__proto__ || Object.getPrototypeOf(RackTableCell)).apply(this, arguments));
  }

  _createClass(RackTableCell, [{
    key: '_drawBorder',
    value: function _drawBorder(context, x, y, to_x, to_y, style) {
      if (style && style.strokeStyle && style.lineWidth && style.lineDash) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(to_x, to_y);
        Component.drawStroke(context, style, this);
      }
    }
  }, {
    key: '_draw',
    value: function _draw(context) {
      var _model = this.model,
          left = _model.left,
          top = _model.top,
          width = _model.width,
          height = _model.height;


      var border = this.model.border || {};

      if (!this.model.isEmpty) this._draw_rack_cell(context);

      // Cell 채우기.
      context.beginPath();
      context.lineWidth = 0;
      context.rect(left, top, width, height);

      // Border 그리기
      var parent = this.parent;
      var idx = parent.components.indexOf(this);
      var columns = parent.columns || 1;
      var rows = parent.rows || 1;

      this._drawBorder(context, left, top, left + width, top, border.top);
      this._drawBorder(context, left, top + height, left, top, border.left);
      if (isRightMost(idx, rows, columns)) this._drawBorder(context, left + width, top, left + width, top + height, border.right);
      if (isBottomMost(idx, rows, columns)) this._drawBorder(context, left + width, top + height, left, top + height, border.bottom);
    }
  }, {
    key: '_post_draw',
    value: function _post_draw(context) {
      var _bounds = this.bounds,
          left = _bounds.left,
          top = _bounds.top,
          width = _bounds.width,
          height = _bounds.height;


      _get(RackTableCell.prototype.__proto__ || Object.getPrototypeOf(RackTableCell.prototype), '_post_draw', this).call(this, context);

      if (this._focused) this._draw_location_info(context);
    }
  }, {
    key: '_draw_rack_cell',
    value: function _draw_rack_cell(context) {
      var _model2 = this.model,
          left = _model2.left,
          top = _model2.top,
          width = _model2.width,
          height = _model2.height;


      context.save();
      context.fillStyle = EMPTY_CELL_FILL_STYLE;
      context.fillRect(left, top, width, height);

      context.beginPath();
      context.lineWidth = EMPTY_CELL_LINE_WIDTH;
      context.strokeStyle = EMPTY_CELL_STROKE_STYLE;

      context.moveTo(left, top);
      context.lineTo(left + width, top + height);
      context.moveTo(left + width, top);
      context.lineTo(left, top + height);

      context.stroke();
      context.closePath();
      context.restore();
    }
  }, {
    key: '_draw_location_info',
    value: function _draw_location_info(context) {
      var rackTable = this.parent;
      var _rackTable$model = rackTable.model,
          locPattern = _rackTable$model.locPattern,
          zone = _rackTable$model.zone;


      locPattern = locPattern.substring(0, locPattern.indexOf('{u}') + 3);

      var locationString = '';
      if (this.get('section') && this.get('unit')) locationString = locPattern.replace('{z}', zone).replace('{s}', this.get('section')).replace('{u}', this.get('unit'));

      if (!locationString) return;

      var _bounds2 = this.bounds,
          left = _bounds2.left,
          top = _bounds2.top;


      left = Math.max(left, 0);
      top = top - 18;

      context.font = '12px Arial';
      var metrics = context.measureText(locationString);

      context.fillStyle = "#FF0000";
      context.fillRect(left, top, metrics.width + 6, 16);

      context.fillStyle = 'white';

      context.fillText(locationString, left + 3, top + 13);
    }
  }, {
    key: 'onchange',
    value: function onchange(after, before) {
      if (hasAnyProperty(after, "isEmpty")) {
        delete this.model.unit;
        delete this.model.section;
      }
    }
  }, {
    key: 'onmouseenter',
    value: function onmouseenter() {
      this._focused = true;
      this.invalidate();
    }
  }, {
    key: 'onmouseleave',
    value: function onmouseleave() {
      this._focused = false;
      this.invalidate();
    }
  }, {
    key: 'contains',
    value: function contains(x, y) {
      var contains = _get(RackTableCell.prototype.__proto__ || Object.getPrototypeOf(RackTableCell.prototype), 'contains', this).call(this, x, y);
      if (!contains) {
        this._focused = false;
        this.invalidate();
      }

      return contains;
    }
  }, {
    key: 'hasTextProperty',
    get: function get() {
      return false;
    }
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }, {
    key: 'merged',
    set: function set(merged) {
      this.set('merged', !!merged);
      if (merged) this.set('text', '');
    },
    get: function get() {
      return this.get('merged');
    }
  }, {
    key: 'rowspan',
    set: function set(rowspan) {
      this.set('rowspan', rowspan);
    },
    get: function get() {
      return this.get('rowspan');
    }
  }, {
    key: 'colspan',
    set: function set(colspan) {
      this.set('colspan', colspan);
    },
    get: function get() {
      return this.get('colspan');
    }
  }, {
    key: 'border',
    get: function get() {
      var border = this.model.border || EMPTY_BORDER;
    }
  }, {
    key: 'isEmpty',
    get: function get() {
      return this.get('isEmpty');
    }
  }, {
    key: 'index',
    get: function get() {
      var rackTable = this.parent;
      var index = rackTable.components.indexOf(this);

      var rowIndex = Math.floor(index / rackTable.columns);
      var columnIndex = index % rackTable.columns;

      return {
        row: rowIndex,
        column: columnIndex
      };
    }
  }, {
    key: 'rowIndex',
    get: function get() {
      return this.index.row;
    }
  }, {
    key: 'columnIndex',
    get: function get() {
      return this.index.column;
    }
  }, {
    key: 'leftCell',
    get: function get() {
      var rackTable = this.parent;
      var index = rackTable.components.indexOf(this);

      var rowIndex = this.rowIndex;
      var columnIndex = this.columnIndex;

      if (columnIndex === 0) return null;

      var leftCell = rackTable.components[rowIndex * rackTable.columns + columnIndex - 1];

      return leftCell;
    }
  }, {
    key: 'rightCell',
    get: function get() {
      var rackTable = this.parent;
      var index = rackTable.components.indexOf(this);

      var rowIndex = this.rowIndex;
      var columnIndex = this.columnIndex;

      if (columnIndex === rackTable.columns) return null;

      var rightCell = rackTable.components[rowIndex * rackTable.columns + columnIndex + 1];

      return rightCell;
    }
  }, {
    key: 'aboveCell',
    get: function get() {
      var rackTable = this.parent;
      var index = rackTable.components.indexOf(this);

      var rowIndex = this.rowIndex;
      var columnIndex = this.columnIndex;

      if (rowIndex === 0) return null;

      var aboveCell = rackTable.components[(rowIndex - 1) * rackTable.columns + columnIndex];

      return aboveCell;
    }
  }, {
    key: 'belowCell',
    get: function get() {
      var rackTable = this.parent;
      var index = rackTable.components.indexOf(this);

      var rowIndex = this.rowIndex;
      var columnIndex = this.columnIndex;

      if (rowIndex === rackTable.rows) return null;

      var belowCell = rackTable.components[(rowIndex + 1) * rackTable.columns + columnIndex];

      return belowCell;
    }
  }, {
    key: 'rowCells',
    get: function get() {
      var rackTable = this.parent;
      return rackTable.getCellsByRow(this.rowIndex);
    }
  }, {
    key: 'columnCells',
    get: function get() {
      var rackTable = this.parent;
      return rackTable.getCellsByColumn(this.columnIndex);
    }
  }, {
    key: 'aboveRowCells',
    get: function get() {
      var aboveCell = this.aboveCell;
      while (1) {
        var aboveRowCells = aboveCell.notEmptyRowCells;

        if (aboveRowCells.length > 0) return aboveRowCells;

        aboveCell = aboveCell.aboveCell;
      }
    }
  }, {
    key: 'lastUnit',
    get: function get() {
      var rowCells = this.aboveRowCells;

      for (var i = rowCells.length - 1; i > 0; i--) {
        var cell = rowCells[i];

        var unit = cell.get('unit');

        if (unit) return Number(unit);
      }

      return 0;
    }
  }, {
    key: 'firstUnit',
    get: function get() {
      var rowCells = this.aboveRowCells;

      for (var i = 0; i < rowCells.length; i++) {
        var cell = rowCells[i];

        var unit = cell.get('unit');

        if (unit) return Number(unit);
      }

      return 0;
    }
  }, {
    key: 'notEmptyRowCells',
    get: function get() {
      return this.rowCells.filter(function (c) {
        return !c.get('isEmpty');
      });
    }
  }, {
    key: 'emptyRowCells',
    get: function get() {
      return this.rowCells.filter(function (c) {
        return c.get('isEmpty');
      });
    }
  }, {
    key: 'isAisle',
    get: function get() {
      return this.notEmptyRowCells.length === 0;
    }
  }]);

  return RackTableCell;
}(RectPath(Component));

exports.default = RackTableCell;


["border"].forEach(function (getter) {
  return Component.memoize(RackTableCell.prototype, getter, false);
});

Component.register('rack-table-cell', RackTableCell);

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

var _stock = __webpack_require__(14);

var _stock2 = _interopRequireDefault(_stock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Rack = function (_Object3D) {
  _inherits(Rack, _Object3D);

  function Rack(model, canvasSize, visualizer) {
    _classCallCheck(this, Rack);

    var _this = _possibleConstructorReturn(this, (Rack.__proto__ || Object.getPrototypeOf(Rack)).call(this, model, canvasSize, visualizer));

    _this._frames = [];
    _this._boards = [];
    return _this;
  }

  _createClass(Rack, [{
    key: 'dispose',
    value: function dispose() {
      _get(Rack.prototype.__proto__ || Object.getPrototypeOf(Rack.prototype), 'dispose', this).call(this);

      delete this._visualizer;
    }
  }, {
    key: 'createObject',
    value: function createObject() {
      var _model = this.model,
          type = _model.type,
          width = _model.width,
          height = _model.height,
          depth = _model.depth,
          fillStyle = _model.fillStyle,
          hideRackFrame = _model.hideRackFrame,
          shelves = _model.shelves,
          shelfPattern = _model.shelfPattern,
          _model$stockScale = _model.stockScale,
          stockScale = _model$stockScale === undefined ? 0.7 : _model$stockScale;


      var scale = stockScale;
      this.type = type;

      if (!hideRackFrame) {
        var frame = this.createRackFrame(width, height, depth * shelves);
        // this._frames.push(frame)

        this.add(frame);
      }

      for (var i = 0; i < shelves; i++) {

        var bottom = -depth * shelves * 0.5;
        if (i > 0 && !hideRackFrame) {
          var board = this.createRackBoard(width, height);
          board.position.set(0, bottom + depth * i, 0);
          board.rotation.x = Math.PI / 2;
          board.material.opacity = 0.5;
          board.material.transparent = true;

          this.add(board);
          // frame.geometry.merge(board.geometry, board.matrix)

          // this._boards.push(board)
        }

        var stock = new _stock2.default({
          width: width * scale,
          height: height * scale,
          depth: depth * scale,
          fillStyle: fillStyle
        }, this._visualizer);

        var stockDepth = depth * scale;

        stock.position.set(0, bottom + depth * i + stockDepth * 0.5, 0);
        stock.name = this.makeLocationString(this.makeShelfString(shelfPattern, i + 1, shelves));

        this.add(stock);
        this._visualizer.putObject(stock.name, stock);
      }
    }
  }, {
    key: 'createRackFrame',
    value: function createRackFrame(w, h, d) {

      // this.geometry = this.cube({
      //   width: w,
      //   height : d,
      //   depth : h
      // })

      var frameWeight = Math.round(Math.min(w, h) / 10);

      var frames = new THREE.Group();
      for (var i = 0; i < 4; i++) {
        var geometry = Rack.rackFrameGeometry;
        var material = Rack.frameMaterial;
        var frame = new THREE.Mesh(geometry, material);
        frame.scale.set(frameWeight, d, frameWeight);
        switch (i) {
          case 0:
            frame.position.set(w / 2, 0, h / 2);
            break;
          case 1:
            frame.position.set(w / 2, 0, -h / 2);
            break;
          case 2:
            frame.position.set(-w / 2, 0, h / 2);
            break;
          case 3:
            frame.position.set(-w / 2, 0, -h / 2);
            break;
        }

        frames.add(frame);
      }

      return frames;

      // return new THREE.LineSegments(
      //   this.geometry,
      //   Rack.frameMaterial
      // );
    }
  }, {
    key: 'createRackBoard',
    value: function createRackBoard(w, h) {

      var boardMaterial = Rack.boardMaterial;
      var boardGeometry = Rack.boardGeometry;
      // var boardGeometry = new THREE.PlaneGeometry(w, h, 1, 1);
      var board = new THREE.Mesh(boardGeometry, boardMaterial);

      board.scale.set(w, h, 1);

      return board;
    }
  }, {
    key: 'makeLocationString',
    value: function makeLocationString(shelfString) {
      var _model2 = this._model,
          _model2$locPattern = _model2.locPattern,
          locPattern = _model2$locPattern === undefined ? "{z}{s}-{u}-{sh}" : _model2$locPattern,
          _model2$zone = _model2.zone,
          zone = _model2$zone === undefined ? "" : _model2$zone,
          _model2$section = _model2.section,
          section = _model2$section === undefined ? "" : _model2$section,
          _model2$unit = _model2.unit,
          unit = _model2$unit === undefined ? "" : _model2$unit;


      var locationString = locPattern;

      locationString = locationString.replace(/{z}/i, zone);
      locationString = locationString.replace(/{s}/i, section);
      locationString = locationString.replace(/{u}/i, unit);
      locationString = locationString.replace(/{sh}/i, shelfString);

      return locationString;
    }
  }, {
    key: 'makeShelfString',
    value: function makeShelfString(pattern, shelf, length) {
      /**
       *  pattern #: 숫자
       *  pattern 0: 고정 자리수
       *  pattern -: 역순
       */

      if (!pattern || !shelf || !length) return;

      var isReverse = /^\-/.test(pattern);
      pattern = pattern.replace(/#+/, '#');

      var fixedLength = (pattern.match(/0/g) || []).length || 0;
      var shelfString = String(isReverse ? length - shelf + 1 : shelf);

      if (shelfString.length > fixedLength && fixedLength > 0) {
        shelfString = shelfString.split('').shift(shelfString.length - fixedLength).join('');
      } else {
        var prefix = '';
        for (var i = 0; i < fixedLength - shelfString.length; i++) {
          prefix += '0';
        }
        shelfString = prefix + shelfString;
      }

      return shelfString;
    }
  }, {
    key: 'raycast',
    value: function raycast(raycaster, intersects) {}
  }, {
    key: 'onchange',
    value: function onchange(after, before) {
      if (after.hasOwnProperty("data")) {
        this.data = after.data;
      }
    }
  }, {
    key: 'cz',
    get: function get() {
      if (!this._cz) {
        var _model3 = this.model,
            _model3$shelves = _model3.shelves,
            shelves = _model3$shelves === undefined ? 1 : _model3$shelves,
            _model3$depth = _model3.depth,
            depth = _model3$depth === undefined ? 1 : _model3$depth;


        this._cz = 0.5 * depth * shelves;
      }

      return this._cz;
    }
  }, {
    key: 'frames',
    get: function get() {
      return this._frames;
    }
  }, {
    key: 'boards',
    get: function get() {
      return this._boards;
    }
  }], [{
    key: 'rackFrameGeometry',
    get: function get() {
      if (!Rack._rackFrameGeometry) Rack._rackFrameGeometry = new THREE.BoxBufferGeometry(1, 1, 1);

      return Rack._rackFrameGeometry;
    }
  }, {
    key: 'boardGeometry',
    get: function get() {
      if (!Rack._boardGeometry) Rack._boardGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

      return Rack._boardGeometry;
    }
  }, {
    key: 'boardMaterial',
    get: function get() {
      if (!Rack._boardMaterial) Rack._boardMaterial = new THREE.MeshBasicMaterial({
        color: '#dedede',
        side: THREE.DoubleSide
      });

      Rack._boardMaterial.polygonOffset = true;
      Rack._boardMaterial.polygonOffsetFactor = -0.1;

      return Rack._boardMaterial;
    }
  }, {
    key: 'frameMaterial',
    get: function get() {
      if (!Rack._frameMaterial) Rack._frameMaterial = new THREE.MeshLambertMaterial({
        color: 0xcccccc
      });
      // Rack._frameMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc, linewidth: 3 })

      return Rack._frameMaterial;
    }
  }]);

  return Rack;
}(_object3d2.default);

exports.default = Rack;


scene.Component3d.register('rack', Rack);

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _mesh = __webpack_require__(15);

var _mesh2 = _interopRequireDefault(_mesh);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var STOCK_COLOR = '#ccaa76';
// const STATUS_COLORS = {
//   A: 'black',
//   B: '#ccaa76',
//   C: '#ff1100',
//   D: '#252525',
//   E: '#6ac428'
// }

var Stock = function (_Mesh) {
  _inherits(Stock, _Mesh);

  function Stock(model, visualizer) {
    _classCallCheck(this, Stock);

    var _this = _possibleConstructorReturn(this, (Stock.__proto__ || Object.getPrototypeOf(Stock)).call(this, model));

    _this._visualizer = visualizer;
    _this._hideEmptyStock = visualizer && visualizer.model.hideEmptyStock;

    _this.createObject();

    return _this;
  }

  _createClass(Stock, [{
    key: 'dispose',
    value: function dispose() {
      _get(Stock.prototype.__proto__ || Object.getPrototypeOf(Stock.prototype), 'dispose', this).call(this);

      delete this._visualizer;
    }
  }, {
    key: 'getMaterial',
    value: function getMaterial(index) {
      if (!this.stockMaterials[index]) {
        if (!(this._visualizer && this._visualizer && this._visualizer.legendTarget && this._visualizer.legendTarget.get('status'))) return this.userDefineDefaultMaterial;

        var stockStatus = this._visualizer.legendTarget.get('status');
        var range = stockStatus.ranges[index];

        if (!(range && range.color)) this.stockMaterials[index] = this.userDefineDefaultMaterial;

        this.stockMaterials[index] = new THREE.MeshLambertMaterial({
          color: range.color,
          side: THREE.FrontSide
        });
      }

      return this.stockMaterials[index];
    }
  }, {
    key: 'createObject',
    value: function createObject() {
      var _model = this.model,
          width = _model.width,
          height = _model.height,
          depth = _model.depth;


      this.createStock(width, height, depth);
    }
  }, {
    key: 'createStock',
    value: function createStock(w, h, d) {

      this.geometry = Stock.stockGeometry;
      this.material = this._hideEmptyStock ? this.emptyMaterial : this.userDefineDefaultMaterial;
      this.type = 'stock';

      this.scale.set(w, d, h);

      // this.castShadow = true
    }
  }, {
    key: 'onUserDataChanged',
    value: function onUserDataChanged() {
      var _this2 = this;

      _get(Stock.prototype.__proto__ || Object.getPrototypeOf(Stock.prototype), 'onUserDataChanged', this).call(this);

      if (!(this._visualizer && this._visualizer && this._visualizer.legendTarget && this._visualizer.legendTarget.get('status'))) return;

      var stockStatus = this._visualizer.legendTarget.get('status');
      var statusField = stockStatus.field;
      var ranges = stockStatus.ranges;

      if (!(statusField && ranges)) return;

      var data = this.userData.items ? this.userData.items : [this.userData];

      for (var i in data) {
        var d = data[i];

        var status = d[statusField];

        if (status == undefined) {
          // this.visible = !this._hideEmptyStock;
          this.material = this._hideEmptyStock ? this.emptyMaterial : this.userDefineDefaultMaterial;
          return;
        }

        ranges.some(function (range, index) {
          var min = range.min,
              max = range.max;


          min = Number(min) || min;
          max = Number(max) || max;

          if (max > status) {
            if (min !== undefined) {
              if (min <= status) {
                _this2.material = _this2.getMaterial(index);
              }
            } else _this2.material = _this2.getMaterial(index);

            // this.visible = true;
            return true;
          } else {
            _this2.material = _this2._hideEmptyStock ? _this2.emptyMaterial : _this2.userDefineDefaultMaterial;
          }
        });
      }
    }

    // onmousemove(e, visualizer) {

    //   var tooltip = visualizer.tooltip || visualizer._scene2d.getObjectByName("tooltip")

    //   if (tooltip) {
    //     visualizer._scene2d.remove(tooltip)
    //     visualizer.tooltip = null
    //     visualizer.render_threed()
    //   }

    //   if (!this.visible)
    //     return;

    //   if (!this.userData)
    //     this.userData = {};

    //   var tooltipText = '';

    //   for (let key in this.userData) {
    //     // exclude private data
    //     if (/^__/.test(key))
    //       continue;

    //     if (this.userData[key] && typeof this.userData[key] != 'object') {
    //       tooltipText += key + ": " + this.userData[key] + "\n"
    //     }
    //   }

    //   // tooltipText = 'loc : ' + loc

    //   if (tooltipText.length > 0) {
    //     tooltip = visualizer.tooltip = visualizer.makeTextSprite(tooltipText)

    //     var vector = new THREE.Vector3()
    //     var vector2 = new THREE.Vector3()

    //     vector.set(visualizer._mouse.x, visualizer._mouse.y, 0.5)
    //     vector2.set(tooltip.scale.x / 2, - tooltip.scale.y / 2, 0)
    //     //
    //     // vector2.normalize()
    //     //
    //     // vector2.subScalar(0.5)
    //     //
    //     // vector2.y = -vector2.y
    //     // vector2.z = 0

    //     // vector.add(vector2)

    //     vector.unproject(visualizer._2dCamera)
    //     vector.add(vector2)
    //     tooltip.position.set(vector.x, vector.y, vector.z)
    //     tooltip.name = "tooltip"

    //     visualizer._scene2d.add(tooltip)
    //     visualizer._renderer && visualizer._renderer.render(visualizer._scene2d, visualizer._2dCamera)
    //     visualizer.invalidate()
    //   }

    // }

  }, {
    key: 'onBeforeRender',
    value: function onBeforeRender() {
      // if (!this._originScale)
      //   this._originScale = this.scale.toArray();

      if (this._focused) {
        var lastTime = performance.now() - this._focusedAt;
        var progress = lastTime / 2000;

        // if (progress > 1)
        //   progress %= 1

        // var currScale = new THREE.Vector3().fromArray(this._originScale);
        // var total_scale = 0.5;

        // currScale.multiplyScalar(1 + total_scale * progress)

        // this.scale.copy(currScale);
        this.rotation.y = 2 * Math.PI * progress;
        this._visualizer.invalidate();
      } else {
        if (this._focusedAt) {
          delete this._focusedAt;
          this.rotation.y = 0;
          this._visualizer.invalidate();
        }

        // this.scale.fromArray(this._originScale);
      }
    }
  }, {
    key: 'onmouseup',
    value: function onmouseup(e, visualizer, callback) {

      // var tooltip = visualizer.tooltip || visualizer._scene2d.getObjectByName("tooltip")

      // if (tooltip) {
      //   visualizer._scene2d.remove(tooltip)
      //   visualizer.tooltip = null
      //   visualizer.render_threed()
      // }

      if (!this.visible) return;

      if (!this.userData || Object.keys(this.userData).length === 0) this.userData = {
        loc: this.name,
        items: [{
          loc: this.name
        }]
      };

      if (callback && typeof callback == 'function') {
        var data = Object.assign({
          color: '#' + this.material.color.getHexString()
        }, this.userData);

        callback.call(this, {
          data: data,
          location: 'right-top'
        });
      }

      // var tooltipText = '';

      // for (let key in this.userData) {
      //   // exclude private data
      //   if (/^__/.test(key))
      //     continue;

      //   if (this.userData[key] && typeof this.userData[key] != 'object') {
      //     tooltipText += key + ": " + this.userData[key] + "\n"
      //   }
      // }

      // // tooltipText = 'loc : ' + loc

      // if (tooltipText.length > 0) {
      //   tooltip = visualizer.tooltip = visualizer.makeTextSprite(tooltipText)

      //   var vector = new THREE.Vector3()
      //   var vector2 = new THREE.Vector3()

      //   vector.set(visualizer._mouse.x, visualizer._mouse.y, 0.5)
      //   vector2.set(tooltip.scale.x / 2, - tooltip.scale.y / 2, 0)
      //   //
      //   // vector2.normalize()
      //   //
      //   // vector2.subScalar(0.5)
      //   //
      //   // vector2.y = -vector2.y
      //   // vector2.z = 0

      //   // vector.add(vector2)

      //   vector.unproject(visualizer._2dCamera)
      //   vector.add(vector2)
      //   tooltip.position.set(vector.x, vector.y, vector.z)
      //   tooltip.name = "tooltip"

      //   visualizer._scene2d.add(tooltip)
      //   visualizer._renderer && visualizer._renderer.render(visualizer._scene2d, visualizer._2dCamera)
      //   visualizer.invalidate()
      // }

    }
  }, {
    key: 'stockMaterials',
    get: function get() {
      if (!this._visualizer._stock_materials) this._visualizer._stock_materials = [];

      return this._visualizer._stock_materials;
    }
  }, {
    key: 'userDefineDefaultMaterial',
    get: function get() {
      if (!this._visualizer._default_material) {
        if (!(this._visualizer && this._visualizer && this._visualizer.legendTarget && this._visualizer.legendTarget.get('status'))) return Stock.defaultMaterial;

        var stockStatus = this._visualizer.legendTarget.get('status');
        var defaultColor = stockStatus.defaultColor;

        if (!defaultColor) return Stock.defaultMaterial;

        this._visualizer._default_material = new THREE.MeshLambertMaterial({
          color: defaultColor,
          side: THREE.FrontSide
        });
      }

      return this._visualizer._default_material;
    }
  }, {
    key: 'emptyMaterial',
    get: function get() {
      var defaultColor = STOCK_COLOR;
      if (!this._visualizer._empty_material) {
        if (this._visualizer && this._visualizer && this._visualizer.legendTarget && this._visualizer.legendTarget.get('status')) {
          var stockStatus = this._visualizer.legendTarget.get('status');
          defaultColor = stockStatus.defaultColor || STOCK_COLOR;
        }

        this._visualizer._empty_material = new THREE.MeshBasicMaterial({
          color: defaultColor
        });
        this._visualizer._empty_material.opacity = 0.33;
        this._visualizer._empty_material.transparent = true;
      }

      return this._visualizer._empty_material;
    }
  }], [{
    key: 'stockGeometry',
    get: function get() {
      if (!Stock._geometry) Stock._geometry = new THREE.BoxBufferGeometry(1, 1, 1);

      return Stock._geometry;
    }
  }, {
    key: 'defaultMaterial',
    get: function get() {
      if (!Stock._material_default) Stock._material_default = new THREE.MeshLambertMaterial({
        color: STOCK_COLOR,
        side: THREE.FrontSide
      });

      return Stock._material_default;
    }
  }]);

  return Stock;
}(_mesh2.default);

exports.default = Stock;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

var Mesh = function (_THREE$Mesh) {
  _inherits(Mesh, _THREE$Mesh);

  function Mesh(model) {
    _classCallCheck(this, Mesh);

    var _this = _possibleConstructorReturn(this, (Mesh.__proto__ || Object.getPrototypeOf(Mesh)).call(this));

    _this._model = model;
    return _this;
  }

  _createClass(Mesh, [{
    key: "dispose",
    value: function dispose() {
      var _this2 = this;

      this.children.slice().forEach(function (child) {
        if (child.dispose) child.dispose();
        if (child.geometry && child.geometry.dispose) child.geometry.dispose();
        if (child.material && child.material.dispose) child.material.dispose();
        if (child.texture && child.texture.dispose) child.texture.dispose();
        _this2.remove(child);
      });
    }
  }, {
    key: "model",
    get: function get() {
      return this._model;
    }
  }]);

  return Mesh;
}(THREE.Mesh);

exports.default = Mesh;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jszip = __webpack_require__(17);

var _jszip2 = _interopRequireDefault(_jszip);

var _zipMtlLoader = __webpack_require__(80);

var _zipMtlLoader2 = _interopRequireDefault(_zipMtlLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ZipLoader = function () {
  function ZipLoader(manager) {
    _classCallCheck(this, ZipLoader);

    this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
  }

  _createClass(ZipLoader, [{
    key: 'load',
    value: function load(url, onLoad, onProgress, onError) {
      var scope = this;

      var loader = new THREE.FileLoader(scope.manager);
      loader.setResponseType('arraybuffer');
      loader.load(url, function (text) {

        onLoad(scope.parse(text));
      }, onProgress, onError);
    }
  }, {
    key: 'parse',
    value: function parse(data) {
      var zip = new _jszip2.default(data); // eslint-disable-line no-undef

      // console.log( zip );

      // var xml = new DOMParser().parseFromString( zip.file( 'doc.kml' ).asText(), 'application/xml' );

      function loadImage(image) {

        var path = decodeURI(image.init_from);

        // Hack to support relative paths
        path = path.replace('../', '');

        var regex = new RegExp(path + '$');
        var files = zip.file(regex);

        // console.log( image, files );

        if (files.length) {

          var file = files[0];
          var blob = new Blob([file.asArrayBuffer()], { type: 'application/octet-binary' });
          image.build.src = URL.createObjectURL(blob);
        }
      }

      // load obj
      var files = zip.file(/obj$/i);
      if (files.length) {
        var file = files[0];
        var obj = new THREE.OBJLoader().parse(file.asText());

        // load mtl
        var mtlFiles = zip.file(/mtl$/i);
        if (mtlFiles.length) {
          var mtlFile = mtlFiles[0];
          // var mtl = new THREE.ZipMTLLoader(zip).parse(mtlFile.asText());
          var mtl = new _zipMtlLoader2.default(zip).parse(mtlFile.asText());
          mtl.preload();

          // var images = mtl.library.images;

          // for (var name in images) {

          //   loadImage(images[name]);

          // }
        }

        return obj;
      }

      console.error('KMZLoader: Couldn\'t find .dae file.');

      return {
        scene: new THREE.Group()
      };
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

  }]);

  return ZipLoader;
}();

exports.default = ZipLoader;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var base64 = __webpack_require__(6);

/**
Usage:
   zip = new JSZip();
   zip.file("hello.txt", "Hello, World!").file("tempfile", "nothing");
   zip.folder("images").file("smile.gif", base64Data, {base64: true});
   zip.file("Xmas.txt", "Ho ho ho !", {date : new Date("December 25, 2007 00:00:01")});
   zip.remove("tempfile");

   base64zip = zip.generate();

**/

/**
 * Representation a of zip file in js
 * @constructor
 * @param {String=|ArrayBuffer=|Uint8Array=} data the data to load, if any (optional).
 * @param {Object=} options the options for creating this objects (optional).
 */
function JSZip(data, options) {
    // if this constructor is used without `new`, it adds `new` before itself:
    if (!(this instanceof JSZip)) return new JSZip(data, options);

    // object containing the files :
    // {
    //   "folder/" : {...},
    //   "folder/data.txt" : {...}
    // }
    this.files = {};

    this.comment = null;

    // Where we are in the hierarchy
    this.root = "";
    if (data) {
        this.load(data, options);
    }
    this.clone = function () {
        var newObj = new JSZip();
        for (var i in this) {
            if (typeof this[i] !== "function") {
                newObj[i] = this[i];
            }
        }
        return newObj;
    };
}
JSZip.prototype = __webpack_require__(7);
JSZip.prototype.load = __webpack_require__(75);
JSZip.support = __webpack_require__(3);
JSZip.defaults = __webpack_require__(25);

/**
 * @deprecated
 * This namespace will be removed in a future version without replacement.
 */
JSZip.utils = __webpack_require__(79);

JSZip.base64 = {
    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    encode: function encode(input) {
        return base64.encode(input);
    },
    /**
     * @deprecated
     * This method will be removed in a future version without replacement.
     */
    decode: function decode(input) {
        return base64.decode(input);
    }
};
JSZip.compressions = __webpack_require__(8);
module.exports = JSZip;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(59);
var ieee754 = __webpack_require__(60);
var isArray = __webpack_require__(61);

exports.Buffer = Buffer;
exports.SlowBuffer = SlowBuffer;
exports.INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength();

function typedArraySupport() {
  try {
    var arr = new Uint8Array(1);
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function foo() {
        return 42;
      } };
    return arr.foo() === 42 && // typed array instances can be augmented
    typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
    arr.subarray(1, 1).byteLength === 0; // ie10 has broken `subarray`
  } catch (e) {
    return false;
  }
}

function kMaxLength() {
  return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
}

function createBuffer(that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length');
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that;
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer(arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length);
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error('If encoding is specified then the first argument must be a string');
    }
    return allocUnsafe(this, arg);
  }
  return from(this, arg, encodingOrOffset, length);
}

Buffer.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr;
};

function from(that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length);
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset);
  }

  return fromObject(that, value);
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length);
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
  if (typeof Symbol !== 'undefined' && Symbol.species && Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    });
  }
}

function assertSize(size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number');
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative');
  }
}

function alloc(that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size);
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string' ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
  }
  return createBuffer(that, size);
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding);
};

function allocUnsafe(that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that;
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size);
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size);
};

function fromString(that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding');
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that;
}

function fromArrayLike(that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}

function fromArrayBuffer(that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds');
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds');
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that;
}

function fromObject(that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that;
    }

    obj.copy(that, 0, 0, len);
    return that;
  }

  if (obj) {
    if (typeof ArrayBuffer !== 'undefined' && obj.buffer instanceof ArrayBuffer || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0);
      }
      return fromArrayLike(that, obj);
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
}

function checked(length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
  }
  return length | 0;
}

function SlowBuffer(length) {
  if (+length != length) {
    // eslint-disable-line eqeqeq
    length = 0;
  }
  return Buffer.alloc(+length);
}

Buffer.isBuffer = function isBuffer(b) {
  return !!(b != null && b._isBuffer);
};

Buffer.compare = function compare(a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers');
  }

  if (a === b) return 0;

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

Buffer.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;
    default:
      return false;
  }
};

Buffer.concat = function concat(list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }

  if (list.length === 0) {
    return Buffer.alloc(0);
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

function byteLength(string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length;
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength;
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0;

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len;
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2;
      case 'hex':
        return len >>> 1;
      case 'base64':
        return base64ToBytes(string).length;
      default:
        if (loweredCase) return utf8ToBytes(string).length; // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString(encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return '';
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return '';
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return '';
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end);

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end);

      case 'ascii':
        return asciiSlice(this, start, end);

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end);

      case 'base64':
        return base64Slice(this, start, end);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true;

function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16() {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits');
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this;
};

Buffer.prototype.swap32 = function swap32() {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits');
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this;
};

Buffer.prototype.swap64 = function swap64() {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits');
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this;
};

Buffer.prototype.toString = function toString() {
  var length = this.length | 0;
  if (length === 0) return '';
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};

Buffer.prototype.equals = function equals(b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return true;
  return Buffer.compare(this, b) === 0;
};

Buffer.prototype.inspect = function inspect() {
  var str = '';
  var max = exports.INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>';
};

Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer');
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index');
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }
  if (thisStart >= thisEnd) {
    return -1;
  }
  if (start >= end) {
    return 1;
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0;

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1;

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset; // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : buffer.length - 1;
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1;else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;else return -1;
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }

  throw new TypeError('val must be string, number or Buffer');
}

function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read(buf, i) {
    if (indexSize === 1) {
      return buf[i];
    } else {
      return buf.readUInt16BE(i * indexSize);
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
  }

  return -1;
}

Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};

Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};

Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};

function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }
  return i;
}

function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}

function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}

function latin1Write(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}

function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}

function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}

Buffer.prototype.write = function write(string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
    // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
    // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds');
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length);

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length);

      case 'ascii':
        return asciiWrite(this, string, offset, length);

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length);

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON() {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf);
  } else {
    return base64.fromByteArray(buf.slice(start, end));
  }
}

function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }
  return res;
}

function asciiSlice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret;
}

function latin1Slice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}

function hexSlice(buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out;
}

function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res;
}

Buffer.prototype.slice = function slice(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf;
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}

Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val;
};

Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val;
};

Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};

Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};

Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};

Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};

Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};

Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
};

Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
};

Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return this[offset];
  return (0xff - this[offset] + 1) * -1;
};

Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};

Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};

Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, true, 23, 4);
};

Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, false, 23, 4);
};

Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, true, 52, 8);
};

Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, false, 52, 8);
};

function checkInt(buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
}

Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = value & 0xff;
  return offset + 1;
};

function objectWriteUInt16(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & 0xff << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};

function objectWriteUInt32(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};

Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = value & 0xff;
  return offset + 1;
};

Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};

Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};

Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};

Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};

function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
  if (offset < 0) throw new RangeError('Index out of range');
}

function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}

Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};

Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};

function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0;

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
  if (end < 0) throw new RangeError('sourceEnd out of bounds');

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
  }

  return len;
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill(val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string');
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding);
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index');
  }

  if (end <= start) {
    return this;
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this;
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean(str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return '';
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str;
}

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        }

        // valid lead
        leadSurrogate = codePoint;

        continue;
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue;
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else {
      throw new Error('Invalid code point');
    }
  }

  return bytes;
}

function asciiToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray;
}

function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break;

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray;
}

function base64ToBytes(str) {
  return base64.toByteArray(base64clean(str));
}

function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }
  return i;
}

function isnan(val) {
  return val !== val; // eslint-disable-line no-self-compare
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(58)))

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function adler32(adler, buf, len, pos) {
  var s1 = adler & 0xffff | 0,
      s2 = adler >>> 16 & 0xffff | 0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = s1 + buf[pos++] | 0;
      s2 = s2 + s1 | 0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return s1 | s2 << 16 | 0;
}

module.exports = adler32;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here

function makeTable() {
  var c,
      table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();

function crc32(crc, buf, len, pos) {
  var t = crcTable,
      end = pos + len;

  crc ^= -1;

  for (var i = pos; i < end; i++) {
    crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return crc ^ -1; // >>> 0;
}

module.exports = crc32;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// String encode/decode helpers


var utils = __webpack_require__(2);

// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safari
//
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;

try {
  String.fromCharCode.apply(null, [0]);
} catch (__) {
  STR_APPLY_OK = false;
}
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (__) {
  STR_APPLY_UIA_OK = false;
}

// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new utils.Buf8(256);
for (var q = 0; q < 256; q++) {
  _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
exports.string2buf = function (str) {
  var buf,
      c,
      c2,
      m_pos,
      i,
      str_len = str.length,
      buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + (c - 0xd800 << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new utils.Buf8(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && m_pos + 1 < str_len) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + (c - 0xd800 << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | c >>> 6;
      buf[i++] = 0x80 | c & 0x3f;
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | c >>> 12;
      buf[i++] = 0x80 | c >>> 6 & 0x3f;
      buf[i++] = 0x80 | c & 0x3f;
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | c >>> 18;
      buf[i++] = 0x80 | c >>> 12 & 0x3f;
      buf[i++] = 0x80 | c >>> 6 & 0x3f;
      buf[i++] = 0x80 | c & 0x3f;
    }
  }

  return buf;
};

// Helper (used in 2 places)
function buf2binstring(buf, len) {
  // use fallback for big arrays to avoid stack overflow
  if (len < 65537) {
    if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
      return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
    }
  }

  var result = '';
  for (var i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}

// Convert byte array to binary string
exports.buf2binstring = function (buf) {
  return buf2binstring(buf, buf.length);
};

// Convert binary string (typed, when possible)
exports.binstring2buf = function (str) {
  var buf = new utils.Buf8(str.length);
  for (var i = 0, len = buf.length; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};

// convert array to string
exports.buf2string = function (buf, max) {
  var i, out, c, c_len;
  var len = max || buf.length;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  var utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    c = buf[i++];
    // quick process ascii
    if (c < 0x80) {
      utf16buf[out++] = c;continue;
    }

    c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) {
      utf16buf[out++] = 0xfffd;i += c_len - 1;continue;
    }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = c << 6 | buf[i++] & 0x3f;
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) {
      utf16buf[out++] = 0xfffd;continue;
    }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | c >> 10 & 0x3ff;
      utf16buf[out++] = 0xdc00 | c & 0x3ff;
    }
  }

  return buf2binstring(utf16buf, out);
};

// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
exports.utf8border = function (buf, max) {
  var pos;

  max = max || buf.length;
  if (max > buf.length) {
    max = buf.length;
  }

  // go back from last position, until start of sequence found
  pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) {
    pos--;
  }

  // Very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) {
    return max;
  }

  // If we came to start of buffer - that means buffer is too small,
  // return max too.
  if (pos === 0) {
    return max;
  }

  return pos + _utf8len[buf[pos]] > max ? pos : max;
};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = '' /*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2 /*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

module.exports = ZStream;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR: -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,

  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY: 0,
  Z_TEXT: 1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN: 2,

  /* The deflate compression method */
  Z_DEFLATED: 8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.LOCAL_FILE_HEADER = "PK\x03\x04";
exports.CENTRAL_FILE_HEADER = "PK\x01\x02";
exports.CENTRAL_DIRECTORY_END = "PK\x05\x06";
exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x06\x07";
exports.ZIP64_CENTRAL_DIRECTORY_END = "PK\x06\x06";
exports.DATA_DESCRIPTOR = "PK\x07\x08";

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.base64 = false;
exports.binary = false;
exports.dir = false;
exports.createFolders = false;
exports.date = null;
exports.compression = null;
exports.compressionOptions = null;
exports.comment = null;
exports.unixPermissions = null;
exports.dosPermissions = null;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function CompressedObject() {
    this.compressedSize = 0;
    this.uncompressedSize = 0;
    this.crc32 = 0;
    this.compressionMethod = null;
    this.compressedContent = null;
}

CompressedObject.prototype = {
    /**
     * Return the decompressed content in an unspecified format.
     * The format will depend on the decompressor.
     * @return {Object} the decompressed content.
     */
    getContent: function getContent() {
        return null; // see implementation
    },
    /**
     * Return the compressed content in an unspecified format.
     * The format will depend on the compressed conten source.
     * @return {Object} the compressed content.
     */
    getCompressedContent: function getCompressedContent() {
        return null; // see implementation
    }
};
module.exports = CompressedObject;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);
var support = __webpack_require__(3);
var nodeBuffer = __webpack_require__(10);

/**
 * The following functions come from pako, from pako/lib/utils/strings
 * released under the MIT license, see pako https://github.com/nodeca/pako/
 */

// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new Array(256);
for (var i = 0; i < 256; i++) {
    _utf8len[i] = i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1;
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start

// convert string to array (typed, when possible)
var string2buf = function string2buf(str) {
    var buf,
        c,
        c2,
        m_pos,
        i,
        str_len = str.length,
        buf_len = 0;

    // count binary size
    for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 0xfc00) === 0xd800 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + (c - 0xd800 << 10) + (c2 - 0xdc00);
                m_pos++;
            }
        }
        buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
    }

    // allocate buffer
    if (support.uint8array) {
        buf = new Uint8Array(buf_len);
    } else {
        buf = new Array(buf_len);
    }

    // convert
    for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 0xfc00) === 0xd800 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + (c - 0xd800 << 10) + (c2 - 0xdc00);
                m_pos++;
            }
        }
        if (c < 0x80) {
            /* one byte */
            buf[i++] = c;
        } else if (c < 0x800) {
            /* two bytes */
            buf[i++] = 0xC0 | c >>> 6;
            buf[i++] = 0x80 | c & 0x3f;
        } else if (c < 0x10000) {
            /* three bytes */
            buf[i++] = 0xE0 | c >>> 12;
            buf[i++] = 0x80 | c >>> 6 & 0x3f;
            buf[i++] = 0x80 | c & 0x3f;
        } else {
            /* four bytes */
            buf[i++] = 0xf0 | c >>> 18;
            buf[i++] = 0x80 | c >>> 12 & 0x3f;
            buf[i++] = 0x80 | c >>> 6 & 0x3f;
            buf[i++] = 0x80 | c & 0x3f;
        }
    }

    return buf;
};

// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
var utf8border = function utf8border(buf, max) {
    var pos;

    max = max || buf.length;
    if (max > buf.length) {
        max = buf.length;
    }

    // go back from last position, until start of sequence found
    pos = max - 1;
    while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) {
        pos--;
    }

    // Fuckup - very small and broken sequence,
    // return max, because we should return something anyway.
    if (pos < 0) {
        return max;
    }

    // If we came to start of buffer - that means vuffer is too small,
    // return max too.
    if (pos === 0) {
        return max;
    }

    return pos + _utf8len[buf[pos]] > max ? pos : max;
};

// convert array to string
var buf2string = function buf2string(buf) {
    var str, i, out, c, c_len;
    var len = buf.length;

    // Reserve max possible length (2 words per char)
    // NB: by unknown reasons, Array is significantly faster for
    //     String.fromCharCode.apply than Uint16Array.
    var utf16buf = new Array(len * 2);

    for (out = 0, i = 0; i < len;) {
        c = buf[i++];
        // quick process ascii
        if (c < 0x80) {
            utf16buf[out++] = c;continue;
        }

        c_len = _utf8len[c];
        // skip 5 & 6 byte codes
        if (c_len > 4) {
            utf16buf[out++] = 0xfffd;i += c_len - 1;continue;
        }

        // apply mask on first byte
        c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
        // join the rest
        while (c_len > 1 && i < len) {
            c = c << 6 | buf[i++] & 0x3f;
            c_len--;
        }

        // terminated by end of string?
        if (c_len > 1) {
            utf16buf[out++] = 0xfffd;continue;
        }

        if (c < 0x10000) {
            utf16buf[out++] = c;
        } else {
            c -= 0x10000;
            utf16buf[out++] = 0xd800 | c >> 10 & 0x3ff;
            utf16buf[out++] = 0xdc00 | c & 0x3ff;
        }
    }

    // shrinkBuf(utf16buf, out)
    if (utf16buf.length !== out) {
        if (utf16buf.subarray) {
            utf16buf = utf16buf.subarray(0, out);
        } else {
            utf16buf.length = out;
        }
    }

    // return String.fromCharCode.apply(null, utf16buf);
    return utils.applyFromCharCode(utf16buf);
};

// That's all for the pako functions.


/**
 * Transform a javascript string into an array (typed if possible) of bytes,
 * UTF-8 encoded.
 * @param {String} str the string to encode
 * @return {Array|Uint8Array|Buffer} the UTF-8 encoded string.
 */
exports.utf8encode = function utf8encode(str) {
    if (support.nodebuffer) {
        return nodeBuffer(str, "utf-8");
    }

    return string2buf(str);
};

/**
 * Transform a bytes array (or a representation) representing an UTF-8 encoded
 * string into a javascript string.
 * @param {Array|Uint8Array|Buffer} buf the data de decode
 * @return {String} the decoded string.
 */
exports.utf8decode = function utf8decode(buf) {
    if (support.nodebuffer) {
        return utils.transformTo("nodebuffer", buf).toString("utf-8");
    }

    buf = utils.transformTo(support.uint8array ? "uint8array" : "array", buf);

    // return buf2string(buf);
    // Chrome prefers to work with "small" chunks of data
    // for the method buf2string.
    // Firefox and Chrome has their own shortcut, IE doesn't seem to really care.
    var result = [],
        k = 0,
        len = buf.length,
        chunk = 65536;
    while (k < len) {
        var nextBoundary = utf8border(buf, Math.min(k + chunk, len));
        if (support.uint8array) {
            result.push(buf2string(buf.subarray(k, nextBoundary)));
        } else {
            result.push(buf2string(buf.slice(k, nextBoundary)));
        }
        k = nextBoundary;
    }
    return result.join("");
};
// vim: set shiftwidth=4 softtabstop=4:

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DataReader = __webpack_require__(29);
var utils = __webpack_require__(0);

function StringReader(data, optimizedBinaryString) {
    this.data = data;
    if (!optimizedBinaryString) {
        this.data = utils.string2binary(this.data);
    }
    this.length = this.data.length;
    this.index = 0;
    this.zero = 0;
}
StringReader.prototype = new DataReader();
/**
 * @see DataReader.byteAt
 */
StringReader.prototype.byteAt = function (i) {
    return this.data.charCodeAt(this.zero + i);
};
/**
 * @see DataReader.lastIndexOfSignature
 */
StringReader.prototype.lastIndexOfSignature = function (sig) {
    return this.data.lastIndexOf(sig) - this.zero;
};
/**
 * @see DataReader.readData
 */
StringReader.prototype.readData = function (size) {
    this.checkOffset(size);
    // this will work because the constructor applied the "& 0xff" mask.
    var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
    this.index += size;
    return result;
};
module.exports = StringReader;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

function DataReader(data) {
    this.data = null; // type : see implementation
    this.length = 0;
    this.index = 0;
    this.zero = 0;
}
DataReader.prototype = {
    /**
     * Check that the offset will not go too far.
     * @param {string} offset the additional offset to check.
     * @throws {Error} an Error if the offset is out of bounds.
     */
    checkOffset: function checkOffset(offset) {
        this.checkIndex(this.index + offset);
    },
    /**
     * Check that the specifed index will not be too far.
     * @param {string} newIndex the index to check.
     * @throws {Error} an Error if the index is out of bounds.
     */
    checkIndex: function checkIndex(newIndex) {
        if (this.length < this.zero + newIndex || newIndex < 0) {
            throw new Error("End of data reached (data length = " + this.length + ", asked index = " + newIndex + "). Corrupted zip ?");
        }
    },
    /**
     * Change the index.
     * @param {number} newIndex The new index.
     * @throws {Error} if the new index is out of the data.
     */
    setIndex: function setIndex(newIndex) {
        this.checkIndex(newIndex);
        this.index = newIndex;
    },
    /**
     * Skip the next n bytes.
     * @param {number} n the number of bytes to skip.
     * @throws {Error} if the new index is out of the data.
     */
    skip: function skip(n) {
        this.setIndex(this.index + n);
    },
    /**
     * Get the byte at the specified index.
     * @param {number} i the index to use.
     * @return {number} a byte.
     */
    byteAt: function byteAt(i) {
        // see implementations
    },
    /**
     * Get the next number with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {number} the corresponding number.
     */
    readInt: function readInt(size) {
        var result = 0,
            i;
        this.checkOffset(size);
        for (i = this.index + size - 1; i >= this.index; i--) {
            result = (result << 8) + this.byteAt(i);
        }
        this.index += size;
        return result;
    },
    /**
     * Get the next string with a given byte size.
     * @param {number} size the number of bytes to read.
     * @return {string} the corresponding string.
     */
    readString: function readString(size) {
        return utils.transformTo("string", this.readData(size));
    },
    /**
     * Get raw data without conversion, <size> bytes.
     * @param {number} size the number of bytes to read.
     * @return {Object} the raw data, implementation specific.
     */
    readData: function readData(size) {
        // see implementations
    },
    /**
     * Find the last occurence of a zip signature (4 bytes).
     * @param {string} sig the signature to find.
     * @return {number} the index of the last occurence, -1 if not found.
     */
    lastIndexOfSignature: function lastIndexOfSignature(sig) {
        // see implementations
    },
    /**
     * Get the next date.
     * @return {Date} the date.
     */
    readDate: function readDate() {
        var dostime = this.readInt(4);
        return new Date((dostime >> 25 & 0x7f) + 1980, // year
        (dostime >> 21 & 0x0f) - 1, // month
        dostime >> 16 & 0x1f, // day
        dostime >> 11 & 0x1f, // hour
        dostime >> 5 & 0x3f, // minute
        (dostime & 0x1f) << 1); // second
    }
};
module.exports = DataReader;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ArrayReader = __webpack_require__(31);

function Uint8ArrayReader(data) {
    if (data) {
        this.data = data;
        this.length = this.data.length;
        this.index = 0;
        this.zero = 0;
    }
}
Uint8ArrayReader.prototype = new ArrayReader();
/**
 * @see DataReader.readData
 */
Uint8ArrayReader.prototype.readData = function (size) {
    this.checkOffset(size);
    if (size === 0) {
        // in IE10, when using subarray(idx, idx), we get the array [0x00] instead of [].
        return new Uint8Array(0);
    }
    var result = this.data.subarray(this.zero + this.index, this.zero + this.index + size);
    this.index += size;
    return result;
};
module.exports = Uint8ArrayReader;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DataReader = __webpack_require__(29);

function ArrayReader(data) {
    if (data) {
        this.data = data;
        this.length = this.data.length;
        this.index = 0;
        this.zero = 0;

        for (var i = 0; i < this.data.length; i++) {
            data[i] = data[i] & 0xFF;
        }
    }
}
ArrayReader.prototype = new DataReader();
/**
 * @see DataReader.byteAt
 */
ArrayReader.prototype.byteAt = function (i) {
    return this.data[this.zero + i];
};
/**
 * @see DataReader.lastIndexOfSignature
 */
ArrayReader.prototype.lastIndexOfSignature = function (sig) {
    var sig0 = sig.charCodeAt(0),
        sig1 = sig.charCodeAt(1),
        sig2 = sig.charCodeAt(2),
        sig3 = sig.charCodeAt(3);
    for (var i = this.length - 4; i >= 0; --i) {
        if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
            return i - this.zero;
        }
    }

    return -1;
};
/**
 * @see DataReader.readData
 */
ArrayReader.prototype.readData = function (size) {
    this.checkOffset(size);
    if (size === 0) {
        return [];
    }
    var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
    this.index += size;
    return result;
};
module.exports = ArrayReader;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _object3dOverload = __webpack_require__(33);

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_object3dOverload).default;
  }
});

var _component3d = __webpack_require__(4);

Object.defineProperty(exports, 'Component3d', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_component3d).default;
  }
});

var _visualizer = __webpack_require__(34);

Object.defineProperty(exports, 'Visualizer', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_visualizer).default;
  }
});

var _videoPlayer = __webpack_require__(36);

Object.defineProperty(exports, 'VideoPlayer360', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_videoPlayer).default;
  }
});

var _rackTable = __webpack_require__(37);

Object.defineProperty(exports, 'RackTable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_rackTable).default;
  }
});

var _rackTableCell = __webpack_require__(12);

Object.defineProperty(exports, 'RackTableCell', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_rackTableCell).default;
  }
});

var _door = __webpack_require__(39);

Object.defineProperty(exports, 'Door', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_door).default;
  }
});

var _forkLift = __webpack_require__(40);

Object.defineProperty(exports, 'ForkLift', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_forkLift).default;
  }
});

var _humiditySensor = __webpack_require__(41);

Object.defineProperty(exports, 'HumiditySensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_humiditySensor).default;
  }
});

var _person = __webpack_require__(42);

Object.defineProperty(exports, 'Person', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_person).default;
  }
});

var _rectExtrude = __webpack_require__(43);

Object.defineProperty(exports, 'RectExtrude', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_rectExtrude).default;
  }
});

var _rack = __webpack_require__(13);

Object.defineProperty(exports, 'Rack', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_rack).default;
  }
});

var _stock = __webpack_require__(14);

Object.defineProperty(exports, 'Stock', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_stock).default;
  }
});

var _wall = __webpack_require__(46);

Object.defineProperty(exports, 'Wall', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_wall).default;
  }
});

var _cube = __webpack_require__(47);

Object.defineProperty(exports, 'Cube', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_cube).default;
  }
});

var _cylinder = __webpack_require__(48);

Object.defineProperty(exports, 'Cylinder', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_cylinder).default;
  }
});

var _sphere = __webpack_require__(49);

Object.defineProperty(exports, 'Sphere', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_sphere).default;
  }
});

var _cone = __webpack_require__(50);

Object.defineProperty(exports, 'Cone', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_cone).default;
  }
});

var _banner = __webpack_require__(51);

Object.defineProperty(exports, 'Banner', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_banner).default;
  }
});

var _desk = __webpack_require__(52);

Object.defineProperty(exports, 'Desk', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_desk).default;
  }
});

var _beacon3d = __webpack_require__(53);

Object.defineProperty(exports, 'Beacon3D', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_beacon3d).default;
  }
});

var _pallet = __webpack_require__(54);

Object.defineProperty(exports, 'Pallet', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_pallet).default;
  }
});

var _polygonExtrude = __webpack_require__(55);

Object.defineProperty(exports, 'PolygonExtrude', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_polygonExtrude).default;
  }
});

var _ellipseExtrude = __webpack_require__(56);

Object.defineProperty(exports, 'EllipseExtrude', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ellipseExtrude).default;
  }
});

var _cjTruck = __webpack_require__(57);

Object.defineProperty(exports, 'CJTruck', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_cjTruck).default;
  }
});

var _transPallet = __webpack_require__(81);

Object.defineProperty(exports, 'TransPallet', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_transPallet).default;
  }
});

var _zipLoader = __webpack_require__(16);

Object.defineProperty(exports, 'ZipLoader', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_zipLoader).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (THREE && THREE.Object3D) {
  THREE.Object3D.prototype.onUserDataChanged = function () {
    if (!this.userData) return;

    if (this.userData.hasOwnProperty('position')) {
      if (!this._visualizer) return;

      this._setPosition(this._visualizer.transcoord2dTo3d(this.userData.position));
    }

    if (this.userData.hasOwnProperty('euler')) {
      this._setEuler({
        yaw: this.userData.euler.yaw,
        pitch: this.userData.euler.pitch,
        roll: this.userData.euler.roll
      });
    }

    if (this.userData.hasOwnProperty('quaternion')) {
      this._setQuaternion({
        x: this.userData.quaternion.qx,
        y: this.userData.quaternion.qy,
        z: this.userData.quaternion.qz,
        w: this.userData.quaternion.qw
      });
    }
  };

  THREE.Object3D.prototype._setPosition = function (location) {
    var x = location.x,
        y = location.y;


    var index = this._visualizer.mixers.indexOf(this._mixer);
    if (index >= 0) {
      this._visualizer.mixers.splice(index, 1);
    }

    this._mixer = new THREE.AnimationMixer(this);
    this._visualizer.mixers.push(this._mixer);

    var positionKF = new THREE.VectorKeyframeTrack('.position', [0, 1], [this.position.x, this.position.y, this.position.z, x, this.position.y, y]);
    var clip = new THREE.AnimationClip('Move', 2, [positionKF]);

    // create a ClipAction and set it to play
    var clipAction = this._mixer.clipAction(clip);
    clipAction.clampWhenFinished = true;
    clipAction.loop = THREE.LoopOnce;
    clipAction.play();
  };

  THREE.Object3D.prototype._setQuaternion = function (quaternion) {
    var x = quaternion.x,
        y = quaternion.y,
        z = quaternion.z,
        w = quaternion.w;

    // var euler = new THREE.Euler();

    // // var currentRotation = this.rotation;

    // // console.log(currentRotation)

    var q = new THREE.Quaternion();

    q.set(x, y, z, w);

    // euler.setFromQuaternion(q, 'ZYX');

    // // euler.z -= Math.PI / 2;
    // euler.z -= Math.PI / 2;

    // var mat = new THREE.Matrix4();
    // mat.makeRotationFromQuaternion(q);
    // mat.transpose();

    // q.setFromRotationMatrix(mat);

    // this.setRotationFromEuler(euler);

    this.setRotationFromQuaternion(q);
    this.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI);
    this.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
    this.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
    // this.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI);
    // this.updateMatrix()
  };

  THREE.Object3D.prototype._setEuler = function (euler) {
    var yaw = euler.yaw,
        pitch = euler.pitch,
        roll = euler.roll;

    var e = new THREE.Euler();

    e.set(yaw, pitch, roll, 'ZYX');

    this.setRotationFromEuler(e);
  };
}

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _threeLayout = __webpack_require__(35);

var _threeLayout2 = _interopRequireDefault(_threeLayout);

var _threeControls = __webpack_require__(11);

var _threeControls2 = _interopRequireDefault(_threeControls);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


THREE.Cache.enabled = true;

var _scene = scene,
    Component = _scene.Component,
    Container = _scene.Container,
    Layout = _scene.Layout,
    Layer = _scene.Layer;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'fov',
    name: 'fov',
    property: 'fov'
  }, {
    type: 'number',
    label: 'near',
    name: 'near',
    property: 'near'
  }, {
    type: 'number',
    label: 'far',
    name: 'far',
    property: 'far'
  }, {
    type: 'number',
    label: 'zoom',
    name: 'zoom',
    property: 'zoom'
  }, {
    type: 'select',
    label: 'precision',
    name: 'precision',
    property: {
      options: [{
        display: 'High',
        value: 'highp'
      }, {
        display: 'Medium',
        value: 'mediump'
      }, {
        display: 'Low',
        value: 'lowp'
      }]
    }
  }, {
    type: 'checkbox',
    label: 'anti-alias',
    name: 'antialias',
    property: 'antialias'
  }, {
    type: 'checkbox',
    label: 'auto-rotate',
    name: 'autoRotate',
    property: 'autoRotate'
  }, {
    type: 'checkbox',
    label: 'show-axis',
    name: 'showAxis',
    property: 'showAxis'
  }, {
    type: 'checkbox',
    label: '3dmode',
    name: 'threed',
    property: 'threed'
  }, {
    type: 'checkbox',
    label: 'debug',
    name: 'debug',
    property: 'threed'
  }, {
    type: 'string',
    label: 'location-field',
    name: 'locationField'
  }, {
    type: 'string',
    label: 'popup-scene',
    name: 'popupScene'
  }, {
    type: 'string',
    label: 'legend-target',
    name: 'legendTarget'
  }, {
    type: 'number',
    label: 'rotation-speed',
    name: 'rotationSpeed'
  }, {
    type: 'checkbox',
    label: 'hide-empty-stock',
    name: 'hideEmptyStock'
  }]
};

var WEBGL_NO_SUPPORT_TEXT = 'WebGL no support';

function registerLoaders() {
  if (!registerLoaders.done) {
    THREE.Loader.Handlers.add(/\.tga$/i, new THREE.TGALoader());
    registerLoaders.done = true;
  }
}

var progress;

function createProgressbar(targetEl) {
  if (progress) return;

  progress = document.createElement('div');

  targetEl = targetEl || document.body;

  progress.style.width = '200px';
  progress.style.height = '20px';
  progress.style.border = '2px solid #000';
  progress.style.position = 'absolute';
  progress.style.marginLeft = '-100px';
  progress.style.left = '50%';
  progress.style.marginTop = '-10px';
  progress.style.top = '50%';
  progress.style.fontSize = '12px';
  progress.style.color = '#ccc';
  progress.style.textAlign = 'center';
  progress.style.lineHeight = '20px';
  progress.innerText = 'Loading ...';

  progress.style.background = 'linear-gradient(90deg, #000 0%, transparent)';

  targetEl.appendChild(progress);

  progress.hidden = targetEl.clientWidth <= 200 || targetEl.clientHeight <= 20;
}

function showProgressbar(targetEl, loaded, total) {
  if (!progress) createProgressbar(targetEl);

  progress.style.background = 'linear-gradient(90deg, #000 ' + loaded / total * 100 + '%, transparent)';
}

function removeProgressBar(targetEl) {
  targetEl = targetEl || document.body;

  targetEl.removeChild(progress);

  progress.remove();

  progress = null;
}

var Visualizer = function (_Container) {
  _inherits(Visualizer, _Container);

  function Visualizer() {
    _classCallCheck(this, Visualizer);

    return _possibleConstructorReturn(this, (Visualizer.__proto__ || Object.getPrototypeOf(Visualizer)).apply(this, arguments));
  }

  _createClass(Visualizer, [{
    key: 'containable',
    value: function containable(component) {
      return component.is3dish();
    }
  }, {
    key: 'putObject',
    value: function putObject(id, object) {
      if (!this._objects) this._objects = {};

      this._objects[id] = object;
    }
  }, {
    key: 'getObject',
    value: function getObject(id) {
      if (!this._objects) this._objects = {};

      return this._objects[id];
    }

    /* THREE Object related .. */

  }, {
    key: 'createFloor',
    value: function createFloor(color, width, height) {

      var fillStyle = this.model.fillStyle;

      var floorMaterial;

      var self = this;

      if (fillStyle.type == 'pattern' && fillStyle.image) {

        var floorTexture = this.textureLoader.load(this.app.url(fillStyle.image), function (texture) {
          texture.minFilter = THREE.LinearFilter;
          self.render_threed();
        });

        var floorMaterial = [floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        }), floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        }), floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        }), floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        }), new THREE.MeshLambertMaterial({
          map: floorTexture
        }), floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        })];
      } else {
        floorMaterial = new THREE.MeshLambertMaterial({
          color: color
        });
      }

      var floorGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
      var floor = new THREE.Mesh(floorGeometry, floorMaterial);

      floor.scale.set(width, height, 5);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -2;

      floor.name = 'floor';

      this.scene3d.add(floor);
    }
  }, {
    key: 'createObjects',
    value: function createObjects(components, canvasSize) {
      var _this2 = this;

      components.forEach(function (component) {
        var clazz = scene.Component3d.register(component.model.type);
        if (!clazz) {
          console.warn("Class not found : 3d class is not exist");
          return;
        }

        var item = new clazz(component.hierarchy, canvasSize, _this2, component);
        if (item) {
          item.name = component.model.id;
          _this2.scene3d.add(item);
          _this2.putObject(component.model.id, item);
        }
      });
    }
  }, {
    key: 'destroy_scene3d',
    value: function destroy_scene3d() {
      this.stop();

      window.removeEventListener('focus', this._onFocus);
      delete this._onFocus;

      if (this._renderer) this._renderer.clear();
      delete this._renderer;
      delete this._camera;
      delete this._2dCamera;
      delete this._keyboard;
      delete this._controls;
      delete this._projector;
      delete this._load_manager;
      delete this._objects;
      delete this._legendTarget;
      delete this._textureLoader;
      delete this._exporter;
      delete this._noSupportWebgl;
      delete this._mousePosition;

      if (this._scene3d) {
        var children = this._scene3d.children.slice();
        for (var i in children) {
          var child = children[i];
          if (child.dispose) child.dispose();
          if (child.geometry && child.geometry.dispose) child.geometry.dispose();
          if (child.material && child.material.dispose) child.material.dispose();
          if (child.texture && child.texture.dispose) child.texture.dispose();
          this._scene3d.remove(child);
        }
      }

      delete this._scene3d;
    }
  }, {
    key: 'init_scene3d',
    value: function init_scene3d() {
      var _this3 = this;

      this.trigger("visualizer-initialized", this);

      this.root.on('redraw', this.onredraw, this);

      if (this.scene3d) this.destroy_scene3d();

      // var self = this;

      // THREE.DefaultLoadingManager.onStart = function (item, loaded, total) {
      //   createProgressbar(self.root.target_element);
      //   self._loadComplete = false;
      // }

      // THREE.DefaultLoadingManager.onProgress = function (item, loaded, total) {
      //   var a = this;
      //   showProgressbar(self.root.target_element, loaded, total)
      // }
      // THREE.DefaultLoadingManager.onLoad = function (item, loaded, total) {
      //   removeProgressBar(self.root.target_element)
      //   self._loadComplete = true;
      // }

      // THREE.DefaultLoadingManager.onError = function (url) {
      //   console.warn('There was an error loading ' + url);
      // }

      registerLoaders();

      var _bounds = this.bounds,
          width = _bounds.width,
          height = _bounds.height;
      var _model = this.model,
          _model$fov = _model.fov,
          fov = _model$fov === undefined ? 45 : _model$fov,
          _model$near = _model.near,
          near = _model$near === undefined ? 0.1 : _model$near,
          _model$far = _model.far,
          far = _model$far === undefined ? 20000 : _model$far,
          _model$fillStyle = _model.fillStyle,
          fillStyle = _model$fillStyle === undefined ? '#424b57' : _model$fillStyle,
          _model$lightColor = _model.lightColor,
          lightColor = _model$lightColor === undefined ? 0xffffff : _model$lightColor,
          _model$antialias = _model.antialias,
          antialias = _model$antialias === undefined ? true : _model$antialias,
          _model$precision = _model.precision,
          precision = _model$precision === undefined ? 'highp' : _model$precision,
          legendTarget = _model.legendTarget,
          _model$zoom = _model.zoom,
          zoom = _model$zoom === undefined ? 100 : _model$zoom,
          _model$showAxis = _model.showAxis,
          showAxis = _model$showAxis === undefined ? false : _model$showAxis;


      var components = this.components || [];

      // CAMERA
      this.scene3d.add(this.camera);
      this.camera.position.set(height * 0.8, Math.floor(Math.min(width, height)), width * 0.8);
      this.camera.lookAt(this.scene3d.position);
      this.camera.zoom = zoom * 0.01;

      if (showAxis) {
        var axisHelper = new THREE.AxesHelper(width);
        this.scene3d.add(axisHelper);
      }

      if (this._noSupportWebgl) return;

      this.renderer.autoClear = true;
      this.renderer.setClearColor(0xffffff, 0); // transparent
      this.renderer.setSize(Math.min(width, window.innerWidth), Math.min(height, window.innerHeight));
      // this._renderer.setPixelRatio(window.devicePixelRatio)

      // CONTROLS
      this.controls.cameraChanged = true;

      // LIGHT
      var light = new THREE.HemisphereLight(lightColor, 0x000000, 1);
      light.position.set(-this.camera.position.x, this.camera.position.y, -this.camera.position.z);
      this.camera.add(light);

      this.createFloor(fillStyle, width, height);
      this.createObjects(components, {
        width: width,
        height: height
      });

      this.camera.updateProjectionMatrix();

      this._onFocus = function () {
        _this3.render_threed();
      };

      window.addEventListener('focus', this._onFocus);

      this.invalidate();
    }
  }, {
    key: 'threed_animate',
    value: function threed_animate() {
      if (!this.controls) return;

      this.controls.update();
      this.render_threed();
    }
  }, {
    key: 'stop',
    value: function stop() {}
  }, {
    key: 'render_threed',
    value: function render_threed() {
      if (this.renderer) {
        this.renderer.render(this.scene3d, this.camera);
      }
    }

    /* Container Overides .. */

  }, {
    key: 'render',
    value: function render(ctx) {
      if (this.app.isViewMode) {
        if (!this.model.threed) this.model.threed = true;
      }

      if (this.model.threed && !this._noSupportWebgl) {
        return;
      }

      _get(Visualizer.prototype.__proto__ || Object.getPrototypeOf(Visualizer.prototype), 'render', this).call(this, ctx);
    }
  }, {
    key: 'postrender',
    value: function postrender(ctx) {
      var _model2 = this.model,
          left = _model2.left,
          top = _model2.top,
          debug = _model2.debug,
          threed = _model2.threed;
      var _bounds2 = this.bounds,
          width = _bounds2.width,
          height = _bounds2.height;

      // ios에서 width, height에 소수점이 있으면 3d를 표현하지 못하는 문제가 있어 정수화

      width = Math.floor(width);
      height = Math.floor(height);

      if (threed) {
        if (!this._scene3d) {
          this.init_scene3d();
          this.render_threed();
        }

        if (this._noSupportWebgl) {
          this._showWebglNoSupportText(ctx);
          return;
        }

        if (this._dataChanged) {
          this._onDataChanged();
        }

        if (this._loadComplete === false) return;

        var rendererSize = this.renderer.getSize();
        var rendererWidth = rendererSize.width,
            rendererHeight = rendererSize.height;


        ctx.drawImage(this.renderer.domElement, 0, 0, rendererWidth, rendererHeight, left, top, width, height);

        if (debug) {
          ctx.font = 100 + 'px Arial';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'black';
          ctx.globalAlpha = 0.5;
          ctx.fillText(scene.FPS(), 100, 100);
          this.invalidate();
        }
      } else {
        _get(Visualizer.prototype.__proto__ || Object.getPrototypeOf(Visualizer.prototype), 'postrender', this).call(this, ctx);
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {

      this.legendTarget && this.legendTarget.off('change', this.onLegendTargetChanged, this);
      delete this._legendTarget;

      this.root.off('redraw', this.onredraw, this);

      this.destroy_scene3d();

      _get(Visualizer.prototype.__proto__ || Object.getPrototypeOf(Visualizer.prototype), 'dispose', this).call(this);
    }
  }, {
    key: 'getObjectByRaycast',
    value: function getObjectByRaycast() {

      var intersects = this.getObjectsByRaycast();
      var intersected;

      if (intersects.length > 0) {
        intersected = intersects[0].object;
      }

      return intersected;
    }
  }, {
    key: 'getObjectsByRaycast',
    value: function getObjectsByRaycast() {
      // find intersections

      // create a Ray with origin at the mouse position
      //   and direction into the scene (camera direction)

      var vector = this.mousePosition;
      if (!this.camera) return;

      this.raycaster.setFromCamera(vector, this.camera);

      // create an array containing all objects in the scene with which the ray intersects
      var intersects = this.raycaster.intersectObjects(this.scene3d.children, true);

      return intersects;
    }
  }, {
    key: 'exportModel',
    value: function exportModel() {
      var exported = this.exporter.parse(this.scene3d);
      var blob = new Blob([exported], { type: "text/plain;charset=utf-8" });
      console.log(exported);
      // saveAs(blob, "exported.txt");
    }
  }, {
    key: '_showWebglNoSupportText',
    value: function _showWebglNoSupportText(context) {
      context.save();

      var _model3 = this.model,
          width = _model3.width,
          height = _model3.height;


      context.font = width / 20 + 'px Arial';
      context.textAlign = 'center';
      context.fillText(WEBGL_NO_SUPPORT_TEXT, width / 2 - width / 40, height / 2);

      context.restore();
    }
  }, {
    key: 'resetMaterials',
    value: function resetMaterials() {
      if (!this._stock_materials) return;

      this._stock_materials.forEach(function (m) {
        if (m.dispose) m.dispose();
      });

      delete this._stock_materials;
    }
  }, {
    key: '_onDataChanged',
    value: function _onDataChanged() {

      var locationField = this.getState('locationField') || 'location';

      if (this._data) {
        if (this._data instanceof Array) {
          /**
           *  Array type data
           *  (e.g. data: [{
           *    'loc' : 'location1',
           *    'description': 'description1'
           *  },
           *  ...
           *  ])
           */

          this._data = this._data.reduce(function (acc, value, i, arr) {
            var val = JSON.parse(JSON.stringify(value));
            if (acc[value[locationField]]) {

              if (!acc[value[locationField]]["items"]) {
                var clone = JSON.parse(JSON.stringify(acc[value[locationField]]));
                acc[value[locationField]] = { items: [] };
                acc[value[locationField]]["items"].push(clone);
              }
            } else {
              acc[value[locationField]] = { items: [] };
            }

            acc[value[locationField]]["items"].push(val);

            return acc;
          }, {});

          return this._onDataChanged();

          // this._data.forEach(d => {
          //   let data = d

          //   let loc = data[locationField];
          //   let object = this.getObject(loc)
          //   if (object) {
          //     object.userData = data;
          //     object.onUserDataChanged()
          //   }
          // })
        } else {
          /**
           *  Object type data
           *  (e.g. data: {
           *    'location1': {description: 'description'},
           *    ...
           *  })
           */
          for (var loc in this._data) {
            var location = loc;
            if (this._data.hasOwnProperty(location)) {
              var d = this._data[location];
              var object = this.getObject(location);
              if (object) {
                object.userData = d;
                object.onUserDataChanged();
              }
            }
          }
        }
      }

      this._dataChanged = false;

      this.invalidate();
    }

    /**
     * Getters / Setters
     */

  }, {
    key: 'onLegendTargetChanged',


    /* Event Handlers */

    value: function onLegendTargetChanged(after, before) {
      if (after.hasOwnProperty('status') && before.hasOwnProperty('status')) this.resetMaterials();
    }
  }, {
    key: 'onchange',
    value: function onchange(after, before) {

      if (before.hasOwnProperty('legendTarget') || after.hasOwnProperty('legendTarget')) {
        this._legendTarget && this._legendTarget.off('change', this.onLegendTargetChanged, this);
        delete this._legendTarget;
        this.resetMaterials();
        this._onDataChanged();
      }

      if (after.hasOwnProperty('width') || after.hasOwnProperty('height') || after.hasOwnProperty('threed')) this.destroy_scene3d();

      if (after.hasOwnProperty('autoRotate')) {
        if (this.controls) {
          this.controls.doAutoRotate(after.autoRotate);
        }
      }

      if (after.hasOwnProperty('fov') || after.hasOwnProperty('near') || after.hasOwnProperty('far') || after.hasOwnProperty('zoom')) {

        if (this.camera) {
          this.camera.near = this.model.near;
          this.camera.far = this.model.far;
          this.camera.zoom = this.model.zoom * 0.01;
          this.camera.fov = this.model.fov;
          this.camera.updateProjectionMatrix();

          this.controls.cameraChanged = true;
        }
      }

      if (after.hasOwnProperty("data")) {
        if (this._data !== after.data) {
          this._data = after.data;
          this._dataChanged = true;
        }
      }

      this.invalidate();
    }
  }, {
    key: 'onmousedown',
    value: function onmousedown(e) {
      if (this.controls) {
        this.controls.onMouseDown(e);
      }
    }
  }, {
    key: 'onmouseup',
    value: function onmouseup(e) {
      if (this.controls) {
        if (this._lastFocused) this._lastFocused._focused = false;

        var modelLayer = Layer.register('model-layer');
        var popup = modelLayer.Popup;
        var ref = this.model.popupScene;

        var pointer = this.transcoordC2S(e.offsetX, e.offsetY);

        this.mousePosition.x = (pointer.x - this.model.left) / this.model.width * 2 - 1;
        this.mousePosition.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

        var object = this.getObjectByRaycast();

        if (object && object.onmouseup) {
          if (ref) object.onmouseup(e, this, function () {
            popup.hide(this, ref);
            popup.show(this, ref);
          }.bind(this));

          object._focused = true;
          object._focusedAt = performance.now();
          this._lastFocused = object;
        } else {
          popup.hide(this.root);
        }

        this.invalidate();
        e.stopPropagation();
      }
    }
  }, {
    key: 'onmousemove',
    value: function onmousemove(e) {
      if (this.controls) {
        var pointer = this.transcoordC2S(e.offsetX, e.offsetY);

        this.mousePosition.x = (pointer.x - this.model.left) / this.model.width * 2 - 1;
        this.mousePosition.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

        this.controls.onMouseMove(e);

        e.stopPropagation();
      }
    }
  }, {
    key: 'onmouseleave',
    value: function onmouseleave(e) {
      if (!this._scene2d) return;

      var tooltip = this._scene2d.getObjectByName('tooltip');
      if (tooltip) {
        this._scene2d.remove(tooltip);
      }
    }
  }, {
    key: 'onwheel',
    value: function onwheel(e) {
      if (this.controls) {
        this.handleMouseWheel(e);
        e.stopPropagation();
      }
    }
  }, {
    key: 'ondblclick',
    value: function ondblclick(e) {
      if (this.controls) {
        this.controls.reset();
        e.stopPropagation();
      }
    }
  }, {
    key: 'ondragstart',
    value: function ondragstart(e) {
      if (this.controls) {
        var pointer = this.transcoordC2S(e.offsetX, e.offsetY);

        this.mousePosition.x = (pointer.x - this.model.left) / this.model.width * 2 - 1;
        this.mousePosition.y = -((pointer.y - this.model.top) / this.model.height) * 2 + 1;

        this.controls.onDragStart(e);
        e.stopPropagation();
      }
    }
  }, {
    key: 'ondragmove',
    value: function ondragmove(e) {
      if (this.controls) {
        this.controls.cameraChanged = true;
        this.controls.onDragMove(e);
        e.stopPropagation();
      }
    }
  }, {
    key: 'ondragend',
    value: function ondragend(e) {
      if (this.controls) {
        this.controls.cameraChanged = true;
        this.controls.onDragEnd(e);
        e.stopPropagation();
      }
    }
  }, {
    key: 'ontouchstart',
    value: function ontouchstart(e) {
      if (this.controls) {
        this.controls.onTouchStart(e);
        e.stopPropagation();
      }
    }
  }, {
    key: 'onpan',
    value: function onpan(e) {
      if (this.controls) {
        this.controls.cameraChanged = true;
        this.controls.onTouchMove(e);
        e.stopPropagation();
      }
    }
  }, {
    key: 'ontouchend',
    value: function ontouchend(e) {
      if (this.controls) {
        this.controls.onTouchEnd(e);
        this.onmouseup(e);
        e.stopPropagation();
      }
    }
  }, {
    key: 'onkeydown',
    value: function onkeydown(e) {
      if (this.controls) {
        this.controls.onKeyDown(e);
        e.stopPropagation();
      }
    }
  }, {
    key: 'onpinch',
    value: function onpinch(e) {
      if (this.controls) {
        var zoom = this.model.zoom;
        zoom *= e.scale;

        if (zoom < 100) zoom = 100;

        this.set('zoom', zoom);
        e.stopPropagation();
      }
    }
  }, {
    key: 'ondoubletap',
    value: function ondoubletap() {
      this.controls.reset();
    }
  }, {
    key: 'handleMouseWheel',
    value: function handleMouseWheel(event) {
      var delta = 0;
      var zoom = this.model.zoom;

      delta = -event.deltaY;
      zoom += delta * 0.1;
      if (zoom < 100) zoom = 100;

      this.set('zoom', zoom);
    }
  }, {
    key: 'onredraw',
    value: function onredraw() {
      this.threed_animate();
    }
  }, {
    key: 'layout',
    get: function get() {
      return Layout.get('three');
    }
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }, {
    key: 'legendTarget',
    get: function get() {
      var legendTarget = this.model.legendTarget;


      if (!this._legendTarget && legendTarget) {
        this._legendTarget = this.root.findById(legendTarget);
        this._legendTarget && this._legendTarget.on('change', this.onLegendTargetChanged, this);
      }

      return this._legendTarget;
    }
  }, {
    key: 'textureLoader',
    get: function get() {
      if (!this._textureLoader) {
        this._textureLoader = new THREE.TextureLoader(THREE.DefaultLoadingManager);
        this._textureLoader.withCredential = true;
        this._textureLoader.crossOrigin = 'use-credentials';
      }

      return this._textureLoader;
    }
  }, {
    key: 'exporter',
    get: function get() {
      if (!this._exporter) this._exporter = new THREE.OBJExporter();

      return this._exporter;
    }
  }, {
    key: 'scene3d',
    get: function get() {
      if (!this._scene3d) this._scene3d = new THREE.Scene();

      return this._scene3d;
    }
  }, {
    key: 'camera',
    get: function get() {
      if (!this._camera) {
        var _bounds3 = this.bounds,
            width = _bounds3.width,
            height = _bounds3.height;
        var _model4 = this.model,
            _model4$fov = _model4.fov,
            fov = _model4$fov === undefined ? 45 : _model4$fov,
            _model4$near = _model4.near,
            near = _model4$near === undefined ? 0.1 : _model4$near,
            _model4$far = _model4.far,
            far = _model4$far === undefined ? 20000 : _model4$far;


        var aspect = width / height;

        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      }

      return this._camera;
    }
  }, {
    key: 'renderer',
    get: function get() {
      if (!this._renderer) {
        var _model5 = this.model,
            _model5$antialias = _model5.antialias,
            antialias = _model5$antialias === undefined ? true : _model5$antialias,
            _model5$precision = _model5.precision,
            precision = _model5$precision === undefined ? 'highp' : _model5$precision;


        try {
          // RENDERER
          this._renderer = new THREE.WebGLRenderer({
            precision: precision,
            alpha: true,
            antialias: antialias
          });
        } catch (e) {
          this._noSupportWebgl = true;
        }
      }

      return this._renderer;
    }
  }, {
    key: 'controls',
    get: function get() {
      if (!this.model.threed) return _get(Visualizer.prototype.__proto__ || Object.getPrototypeOf(Visualizer.prototype), 'controls', this);

      if (!this._controls) this._controls = new _threeControls2.default(this.camera, this);

      return this._controls;
    }
  }, {
    key: 'raycaster',
    get: function get() {
      if (!this._raycaster) this._raycaster = new THREE.Raycaster();

      return this._raycaster;
    }
  }, {
    key: 'mousePosition',
    get: function get() {
      if (!this._mousePosition) this._mousePosition = new THREE.Vector2();

      return this._mousePosition;
    }
  }]);

  return Visualizer;
}(Container);

exports.default = Visualizer;


Component.register('visualizer', Visualizer);

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var _scene = scene,
    Layout = _scene.Layout;

/* 대상 컴포넌트의 bounds를 계산한다. */

var ThreeLayout = {
  reflow: function reflow(container, component) {},

  capturables: function capturables(container) {
    return container.get('threed') ? [] : container.components;
  },

  drawables: function drawables(container) {
    return container.get('threed') ? [] : container.components;
  },

  isStuck: function isStuck(component) {
    return false;
  }
};

Layout.register('three', ThreeLayout);

exports.default = ThreeLayout;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var _scene = scene,
    RectPath = _scene.RectPath,
    Component = _scene.Component;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'string',
    label: 'src',
    name: 'src',
    property: 'src'
  }, {
    type: 'checkbox',
    label: 'autoplay',
    name: 'autoplay',
    property: 'autoplay'
  }]
};

var VideoPlayer360 = function (_RectPath) {
  _inherits(VideoPlayer360, _RectPath);

  function VideoPlayer360() {
    _classCallCheck(this, VideoPlayer360);

    return _possibleConstructorReturn(this, (VideoPlayer360.__proto__ || Object.getPrototypeOf(VideoPlayer360)).apply(this, arguments));
  }

  _createClass(VideoPlayer360, [{
    key: 'init_scene',
    value: function init_scene(width, height) {
      var _model = this.model,
          mute = _model.mute,
          loop = _model.loop,
          autoplay = _model.autoplay,
          src = _model.src,
          fov = _model.fov,
          clickAndDrag = _model.clickAndDrag,
          wheelEnabled = _model.wheelEnabled;


      this._dragStart = {};
      this._lon = 0;
      this._lat = 0;
      this._clickAndDrag = clickAndDrag;
      this._isPlaying = false;
      this._wheelEnabled = wheelEnabled;

      this._fov = fov || 35;
      this._fovMin = 3;
      this._fovMax = 100;

      this._time = new Date().getTime();

      // create a local THREE.js scene
      this._scene = new THREE.Scene();

      // create ThreeJS camera
      this._camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
      this._camera.setFocalLength(fov);

      // create ThreeJS renderer and append it to our object
      this._renderer = new THREE.WebGLRenderer();
      this._renderer.setSize(width, height);
      this._renderer.autoClear = false;
      this._renderer.setClearColor(0x333333, 1);

      // create off-dom video player
      this._video = document.createElement('video');
      this._video.setAttribute('crossorigin', 'anonymous');
      this._video.loop = loop;
      this._video.muted = mute;
      this._texture = new THREE.Texture(this._video);

      // make a self reference we can pass to our callbacks
      var self = this;

      // attach video player event listeners
      this._video.addEventListener("ended", function () {
        this._isPlaying = false;
      });

      // Progress Meter
      this._video.addEventListener("progress", function () {

        var percent = null;
        if (self._video && self._video.buffered && self._video.buffered.length > 0 && self._video.buffered.end && self._video.duration) {
          percent = self._video.buffered.end(0) / self._video.duration;
        }
        // Some browsers (e.g., FF3.6 and Safari 5) cannot calculate target.bufferered.end()
        // to be anything other than 0. If the byte count is available we use this instead.
        // Browsers that support the else if do not seem to have the bufferedBytes value and
        // should skip to there. Tested in Safari 5, Webkit head, FF3.6, Chrome 6, IE 7/8.
        else if (self._video && self._video.bytesTotal !== undefined && self._video.bytesTotal > 0 && self._video.bufferedBytes !== undefined) {
            percent = self._video.bufferedBytes / self._video.bytesTotal;
          }

        // Someday we can have a loading animation for videos
        var cpct = Math.round(percent * 100);
        if (cpct === 100) {
          // do something now that we are done
        } else {
            // do something with this percentage info (cpct)
          }
      });

      // Video Play Listener, fires after video loads
      // this._video.addEventListener("canplaythrough", function() {
      this._video.addEventListener("canplay", function () {

        if (autoplay === true) {
          self.play();
          self._videoReady = true;
        }
      });

      // set the video src and begin loading
      this._video.src = this.app.url(src);

      this._texture.generateMipmaps = false;
      this._texture.minFilter = THREE.LinearFilter;
      this._texture.magFilter = THREE.LinearFilter;
      this._texture.format = THREE.RGBFormat;

      // create ThreeJS mesh sphere onto which our texture will be drawn
      this._mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(500, 80, 50), new THREE.MeshBasicMaterial({ map: this._texture }));
      this._mesh.scale.x = -1; // mirror the texture, since we're looking from the inside out
      this._scene.add(this._mesh);

      // this.createControls()

      this.animate();
    }
  }, {
    key: 'destroy_scene',
    value: function destroy_scene() {
      cancelAnimationFrame(this._requestAnimationId);
      this._requestAnimationId = undefined;
      this._texture.dispose();
      this._scene.remove(this._mesh);
      this.unloadVideo();

      this._renderer = undefined;
      this._camera = undefined;
      this._keyboard = undefined;
      this._controls = undefined;
      this._projector = undefined;
      this._load_manager = undefined;

      this._scene = undefined;
      this._video = undefined;
    }
  }, {
    key: 'loadVideo',
    value: function loadVideo(videoFile) {
      this._video.src = videoFile;
    }
  }, {
    key: 'unloadVideo',
    value: function unloadVideo() {
      // overkill unloading to avoid dreaded video 'pending' bug in Chrome. See https://code.google.com/p/chromium/issues/detail?id=234779
      this.pause();
      this._video.src = '';
      this._video.removeAttribute('src');
    }
  }, {
    key: 'play',
    value: function play() {
      this._isPlaying = true;
      this._video.play();
    }
  }, {
    key: 'pause',
    value: function pause() {
      this._isPlaying = false;
      this._video.pause();
    }
  }, {
    key: 'resize',
    value: function resize(w, h) {
      if (!this._renderer) return;
      this._renderer.setSize(w, h);
      this._camera.aspect = w / h;
      this._camera.updateProjectionMatrix();
    }
  }, {
    key: 'animate',
    value: function animate() {

      this._requestAnimationId = requestAnimationFrame(this.animate.bind(this));

      if (this._video.readyState === this._video.HAVE_ENOUGH_DATA) {
        if (typeof this._texture !== "undefined") {
          var ct = new Date().getTime();
          if (ct - this._time >= 30) {
            this._texture.needsUpdate = true;
            this._time = ct;
          }
        }
      }

      this.render();
      this.invalidate();
    }
  }, {
    key: 'render',
    value: function render() {
      this._lat = Math.max(-85, Math.min(85, this._lat || 0));
      this._phi = (90 - this._lat) * Math.PI / 180;
      this._theta = (this._lon || 0) * Math.PI / 180;

      var cx = 500 * Math.sin(this._phi) * Math.cos(this._theta);
      var cy = 500 * Math.cos(this._phi);
      var cz = 500 * Math.sin(this._phi) * Math.sin(this._theta);

      this._camera.lookAt(new THREE.Vector3(cx, cy, cz));

      // distortion
      if (this.model.flatProjection) {
        this._camera.position.x = 0;
        this._camera.position.y = 0;
        this._camera.position.z = 0;
      } else {
        this._camera.position.x = -cx;
        this._camera.position.y = -cy;
        this._camera.position.z = -cz;
      }

      this._renderer.clear();
      this._renderer.render(this._scene, this._camera);
    }

    // creates div and buttons for onscreen video controls

  }, {
    key: 'createControls',
    value: function createControls() {

      var muteControl = this.options.muted ? 'fa-volume-off' : 'fa-volume-up';
      var playPauseControl = this.options.autoplay ? 'fa-pause' : 'fa-play';

      var controlsHTML = ' \
          <div class="controls"> \
              <a href="#" class="playButton button fa ' + playPauseControl + '"></a> \
              <a href="#" class="muteButton button fa ' + muteControl + '"></a> \
              <a href="#" class="fullscreenButton button fa fa-expand"></a> \
          </div> \
      ';

      $(this.element).append(controlsHTML, true);

      // hide controls if option is set
      if (this.options.hideControls) {
        $(this.element).find('.controls').hide();
      }

      // wire up controller events to dom elements
      // this.attachControlEvents();
    }
  }, {
    key: 'attachControlEvents',
    value: function attachControlEvents() {

      // create a self var to pass to our controller functions
      var self = this;

      this.element.addEventListener('mousemove', this.onMouseMove.bind(this), false);
      this.element.addEventListener('touchmove', this.onMouseMove.bind(this), false);
      this.element.addEventListener('mousewheel', this.onMouseWheel.bind(this), false);
      this.element.addEventListener('DOMMouseScroll', this.onMouseWheel.bind(this), false);
      this.element.addEventListener('mousedown', this.onMouseDown.bind(this), false);
      this.element.addEventListener('touchstart', this.onMouseDown.bind(this), false);
      this.element.addEventListener('mouseup', this.onMouseUp.bind(this), false);
      this.element.addEventListener('touchend', this.onMouseUp.bind(this), false);

      $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', this.fullscreen.bind(this));

      $(window).resize(function () {
        self.resizeGL($(self.element).width(), $(self.element).height());
      });

      // Player Controls
      $(this.element).find('.playButton').click(function (e) {
        e.preventDefault();
        if ($(this).hasClass('fa-pause')) {
          $(this).removeClass('fa-pause').addClass('fa-play');
          self.pause();
        } else {
          $(this).removeClass('fa-play').addClass('fa-pause');
          self.play();
        }
      });

      $(this.element).find(".fullscreenButton").click(function (e) {
        e.preventDefault();
        var elem = $(self.element)[0];
        if ($(this).hasClass('fa-expand')) {
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
          } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
          }
        } else {
          if (elem.requestFullscreen) {
            document.exitFullscreen();
          } else if (elem.msRequestFullscreen) {
            document.msExitFullscreen();
          } else if (elem.mozRequestFullScreen) {
            document.mozCancelFullScreen();
          } else if (elem.webkitRequestFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      });

      $(this.element).find(".muteButton").click(function (e) {
        e.preventDefault();
        if ($(this).hasClass('fa-volume-off')) {
          $(this).removeClass('fa-volume-off').addClass('fa-volume-up');
          self._video.muted = false;
        } else {
          $(this).removeClass('fa-volume-up').addClass('fa-volume-off');
          self._video.muted = true;
        }
      });
    }

    /* Component Overides .. */

  }, {
    key: '_draw',
    value: function _draw(ctx) {
      var _model2 = this.model,
          left = _model2.left,
          top = _model2.top,
          width = _model2.width,
          height = _model2.height,
          src = _model2.src;


      ctx.beginPath();
      ctx.rect(left, top, width, height);
    }
  }, {
    key: '_post_draw',
    value: function _post_draw(ctx) {
      var _model3 = this.model,
          left = _model3.left,
          top = _model3.top,
          width = _model3.width,
          height = _model3.height,
          src = _model3.src;


      if (src) {

        if (!this._scene) {
          this.init_scene(width, height);
          this.render();
        }

        ctx.drawImage(this._renderer.domElement, 0, 0, width, height, left, top, width, height);
      } else {
        this.drawFill(ctx);
      }

      this.drawStroke(ctx);
    }
  }, {
    key: 'onchange',
    value: function onchange(after, before) {

      if (after.hasOwnProperty('width') || after.hasOwnProperty('height')) {
        this.resize(this.model.width, this.model.height);
      }

      if (after.hasOwnProperty('src') || after.hasOwnProperty('autoplay')) {

        this.destroy_scene();
      }

      this.invalidate();
    }
  }, {
    key: 'ondblclick',
    value: function ondblclick(e) {
      if (this._isPlaying) this.pause();else this.play();

      e.stopPropagation();
    }
  }, {
    key: 'onmousedown',
    value: function onmousedown(e) {}
  }, {
    key: 'onmousemove',
    value: function onmousemove(e) {

      if (this._clickAndDrag === false) {

        var x, y;

        this._onPointerDownPointerX = e.offsetX;
        this._onPointerDownPointerY = -e.offsetY;

        this._onPointerDownLon = this._lon;
        this._onPointerDownLat = this._lat;

        x = e.offsetX - this._renderer.getContext().canvas.offsetLeft;
        y = e.offsetY - this._renderer.getContext().canvas.offsetTop;
        this._lon = x / this._renderer.getContext().canvas.width * 430 - 225;
        this._lat = y / this._renderer.getContext().canvas.height * -180 + 90;
      }
    }
  }, {
    key: 'onwheel',
    value: function onwheel(e) {
      if (this._wheelEnabled === false) return;

      var wheelSpeed = 0.01;

      this._fov -= e.deltaY * wheelSpeed;

      if (this._fov < this._fovMin) {
        this._fov = this._fovMin;
      } else if (this._fov > this._fovMax) {
        this._fov = this._fovMax;
      }

      this._camera.setFocalLength(this._fov);
      this._camera.updateProjectionMatrix();
      e.stopPropagation();
    }
  }, {
    key: 'ondragstart',
    value: function ondragstart(e) {
      // this._dragStart.x = e.pageX;
      // this._dragStart.y = e.pageY;
      this._dragStart.x = e.offsetX;
      this._dragStart.y = e.offsetY;
    }
  }, {
    key: 'ondragmove',
    value: function ondragmove(e) {

      if (this._isPlaying === false) {
        return;
      }

      if (this._clickAndDrag !== false) {
        // this._onPointerDownPointerX = e.clientX;
        // this._onPointerDownPointerY = -e.clientY;
        this._onPointerDownPointerX = e.offsetX;
        this._onPointerDownPointerY = -e.offsetY;

        this._onPointerDownLon = this._lon;
        this._onPointerDownLat = this._lat;

        var x, y;

        x = e.offsetX - this._dragStart.x;
        y = e.offsetY - this._dragStart.y;
        this._dragStart.x = e.offsetX;
        this._dragStart.y = e.offsetY;
        this._lon += x;
        this._lat -= y;
      }

      e.stopPropagation();
    }
  }, {
    key: 'ondragend',
    value: function ondragend(e) {}
  }, {
    key: 'ontouchstart',
    value: function ontouchstart(e) {}
  }, {
    key: 'ontouchmove',
    value: function ontouchmove(e) {}
  }, {
    key: 'ontouchend',
    value: function ontouchend(e) {}
  }, {
    key: 'onkeydown',
    value: function onkeydown(e) {}
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return VideoPlayer360;
}(RectPath(Component));

exports.default = VideoPlayer360;


Component.register('video-player-360', VideoPlayer360);

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RackTable = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _group3d = __webpack_require__(38);

var _group3d2 = _interopRequireDefault(_group3d);

var _rackTableCell = __webpack_require__(12);

var _rackTableCell2 = _interopRequireDefault(_rackTableCell);

var _rack = __webpack_require__(13);

var _rack2 = _interopRequireDefault(_rack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var LABEL_WIDTH = 25;
var LABEL_HEIGHT = 25;

function rgba(r, g, b, a) {
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

var _scene = scene,
    Table = _scene.Table,
    Component = _scene.Component,
    Component3d = _scene.Component3d,
    Container = _scene.Container,
    Layout = _scene.Layout,
    Model = _scene.Model;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'rows',
    name: 'rows',
    property: 'rows'
  }, {
    type: 'number',
    label: 'columns',
    name: 'columns',
    property: 'columns'
  }, {
    type: 'string',
    label: 'zone',
    name: 'zone',
    property: 'zone'
  }, {
    type: 'number',
    label: 'shelves',
    name: 'shelves',
    property: 'shelves'
  }, {
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }, {
    type: 'string',
    label: 'location-pattern',
    name: 'locPattern',
    property: {
      placeholder: '{z}{s}-{u}-{sh}'
    }
  }, {
    type: 'number',
    label: 'section-digits',
    name: 'sectionDigits',
    property: {
      placeholder: '1, 2, 3, ...'
    }
  }, {
    type: 'number',
    label: 'unit-digits',
    name: 'unitDigits',
    property: {
      placeholder: '1, 2, 3, ...'
    }
  }, {
    type: 'string',
    label: 'shelf-pattern',
    name: 'shelfPattern',
    property: {
      placeholder: '#, 00, 000'
    }
  }, {
    type: 'number',
    label: 'stock-scale',
    name: 'stockScale'
  }, {
    type: 'checkbox',
    label: 'hide-rack-frame',
    name: 'hideRackFrame'
  }]
};

var SIDES = {
  all: ['top', 'left', 'bottom', 'right'],
  out: ['top', 'left', 'bottom', 'right'],
  left: ['left'],
  right: ['right'],
  top: ['top'],
  bottom: ['bottom'],
  leftright: ['left', 'right'],
  topbottom: ['top', 'bottom']
};

var CLEAR_STYLE = {
  strokeStyle: '',
  lineDash: 'solid',
  lineWidth: 0
};

var DEFAULT_STYLE = {
  strokeStyle: '#999',
  lineDash: 'solid',
  lineWidth: 1
};

var TABLE_LAYOUT = Layout.get('table');

function hasAnyProperty(o) {
  for (var _len = arguments.length, properties = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    properties[_key - 1] = arguments[_key];
  }

  for (var p in properties) {
    if (o.hasOwnProperty(properties[p])) return true;
  }
}

function buildNewCell(app) {
  return Model.compile({
    type: 'rack-table-cell',
    strokeStyle: 'black',
    fillStyle: 'transparent',
    left: 0,
    top: 0,
    width: 1,
    height: 1,
    textWrap: true,
    isEmpty: false,
    border: buildBorderStyle(DEFAULT_STYLE, 'all')
  }, app);
}

function buildCopiedCell(copy, app) {
  var obj = JSON.parse(JSON.stringify(copy));
  delete obj.text;
  return Model.compile(obj, app);
}

function buildBorderStyle(style, where) {
  return (SIDES[where] || []).reduce(function (border, side) {
    border[side] = style;
    return border;
  }, {});
}

function setCellBorder(cell, style, where) {
  if (!cell) return;
  cell.set('border', Object.assign({}, cell.get('border') || {}, buildBorderStyle(style, where)));
}

function isLeftMost(total, columns, indices, i) {
  return i == 0 || !(i % columns) || indices.indexOf(i - 1) == -1;
}

function isRightMost(total, columns, indices, i) {
  return i == total - 1 || i % columns == columns - 1 || indices.indexOf(i + 1) == -1;
}

function isTopMost(total, columns, indices, i) {
  return i < columns || indices.indexOf(i - columns) == -1;
}

function isBottomMost(total, columns, indices, i) {
  return i > total - columns - 1 || indices.indexOf(i + columns) == -1;
}

function above(columns, i) {
  return i - columns;
}

function below(columns, i) {
  return i + columns;
}

function before(columns, i) {
  return !(i % columns) ? -1 : i - 1;
}

function after(columns, i) {
  return !((i + 1) % columns) ? -1 : i + 1;
}

function array(value, size) {
  var arr = [];
  for (var i = 0; i < size; i++) {
    arr.push(1);
  }return arr;
}

var columnControlHandler = {
  ondragmove: function ondragmove(point, index, component) {
    var _component$textBounds = component.textBounds,
        left = _component$textBounds.left,
        top = _component$textBounds.top,
        width = _component$textBounds.width,
        height = _component$textBounds.height;

    var widths_sum = component.widths_sum;

    var widths = component.widths.slice();

    /* 컨트롤의 원래 위치를 구한다. */
    var origin_pos_unit = widths.slice(0, index + 1).reduce(function (sum, width) {
      return sum + width;
    }, 0);
    var origin_offset = left + origin_pos_unit / widths_sum * width;

    /*
     * point의 좌표는 부모 레이어 기준의 x, y 값이다.
     * 따라서, 도형의 회전을 감안한 좌표로의 변환이 필요하다.
     * Transcoord시에는 point좌표가 부모까지 transcoord되어있는 상태이므로,
     * 컴포넌트자신에 대한 transcoord만 필요하다.(마지막 파라미터를 false로).
     */
    var transcoorded = component.transcoordP2S(point.x, point.y);
    var diff = transcoorded.x - origin_offset;

    var diff_unit = diff / width * widths_sum;

    var min_width_unit = widths_sum / width * 5; // 5픽셀정도를 최소로

    if (diff_unit < 0) diff_unit = -Math.min(widths[index] - min_width_unit, -diff_unit);else diff_unit = Math.min(widths[index + 1] - min_width_unit, diff_unit);

    widths[index] = Math.round((widths[index] + diff_unit) * 100) / 100;
    widths[index + 1] = Math.round((widths[index + 1] - diff_unit) * 100) / 100;

    component.set('widths', widths);
  }
};

var rowControlHandler = {
  ondragmove: function ondragmove(point, index, component) {
    var _component$textBounds2 = component.textBounds,
        left = _component$textBounds2.left,
        top = _component$textBounds2.top,
        width = _component$textBounds2.width,
        height = _component$textBounds2.height;

    var heights_sum = component.heights_sum;

    var heights = component.heights.slice();

    /* 컨트롤의 원래 위치를 구한다. */
    index -= component.columns - 1;
    var origin_pos_unit = heights.slice(0, index + 1).reduce(function (sum, height) {
      return sum + height;
    }, 0);
    var origin_offset = top + origin_pos_unit / heights_sum * height;

    /*
     * point의 좌표는 부모 레이어 기준의 x, y 값이다.
     * 따라서, 도형의 회전을 감안한 좌표로의 변환이 필요하다.
     * Transcoord시에는 point좌표가 부모까지 transcoord되어있는 상태이므로,
     * 컴포넌트자신에 대한 transcoord만 필요하다.(마지막 파라미터를 false로).
     */
    var transcoorded = component.transcoordP2S(point.x, point.y);
    var diff = transcoorded.y - origin_offset;

    var diff_unit = diff / height * heights_sum;

    var min_height_unit = heights_sum / height * 5; // 5픽셀정도를 최소로

    if (diff_unit < 0) diff_unit = -Math.min(heights[index] - min_height_unit, -diff_unit);else diff_unit = Math.min(heights[index + 1] - min_height_unit, diff_unit);

    heights[index] = Math.round((heights[index] + diff_unit) * 100) / 100;
    heights[index + 1] = Math.round((heights[index + 1] - diff_unit) * 100) / 100;

    component.set('heights', heights);
  }
};

var LOCATION_HEADER_SIZE = 50;
var LOCATION_HEADER_LINE_WIDTH = 1;
var LOCATION_HEADER_STROKE_STYLE = '#ccc';
var LOCATION_HEADER_FILL_STYLE = 'rgba(230, 230, 230, 0.5)';
var LOCATION_HEADER_HIGHLIGHT_STROKE_STYLE = 'rgba(0, 0, 99, 0.9)';
var LOCATION_HEADER_HIGHLIGHT_FILL_STYLE = 'rgba(0, 0, 255, 0.5)';

var RackTable3d = function (_Group3D) {
  _inherits(RackTable3d, _Group3D);

  function RackTable3d(model, canvasSize, visualizer, sceneComponent) {
    _classCallCheck(this, RackTable3d);

    var _this = _possibleConstructorReturn(this, (RackTable3d.__proto__ || Object.getPrototypeOf(RackTable3d)).call(this, model));

    _this._visualizer = visualizer;
    _this._sceneComponent = sceneComponent;

    _this.createRacks(canvasSize);
    // this.mergeObjects()

    return _this;
  }

  _createClass(RackTable3d, [{
    key: 'dispose',
    value: function dispose() {
      _get(RackTable3d.prototype.__proto__ || Object.getPrototypeOf(RackTable3d.prototype), 'dispose', this).call(this);

      delete this._visualizer;
    }
  }, {
    key: 'createRacks',
    value: function createRacks(canvasSize) {
      var _this2 = this;

      var _model = this.model,
          _model$components = _model.components,
          components = _model$components === undefined ? [] : _model$components,
          left = _model.left,
          top = _model.top,
          width = _model.width,
          height = _model.height,
          _model$rotation = _model.rotation,
          rotation = _model$rotation === undefined ? 0 : _model$rotation,
          zone = _model.zone,
          _model$locPattern = _model.locPattern,
          locPattern = _model$locPattern === undefined ? '{z}{s}-{u}{sh}' : _model$locPattern,
          _model$shelfPattern = _model.shelfPattern,
          shelfPattern = _model$shelfPattern === undefined ? '00' : _model$shelfPattern,
          _model$shelves = _model.shelves,
          shelves = _model$shelves === undefined ? 1 : _model$shelves,
          _model$depth = _model.depth,
          depth = _model$depth === undefined ? 1 : _model$depth,
          columns = _model.columns,
          rows = _model.rows,
          _model$minUnit = _model.minUnit,
          minUnit = _model$minUnit === undefined ? 1 : _model$minUnit,
          _model$minSection = _model.minSection,
          minSection = _model$minSection === undefined ? 1 : _model$minSection,
          _model$stockScale = _model.stockScale,
          stockScale = _model$stockScale === undefined ? 0.7 : _model$stockScale,
          hideRackFrame = _model.hideRackFrame;


      var cx = left + width / 2 - canvasSize.width / 2;
      var cy = top + height / 2 - canvasSize.height / 2;
      var cz = 0;

      this.position.set(cx, cz, cy);
      this.rotation.y = -rotation;

      components.forEach(function (rack) {

        var rackModel = {
          left: rack.left,
          top: rack.top,
          width: rack.width,
          height: rack.height,
          depth: depth,
          shelves: shelves,
          unit: rack.unit,
          section: rack.section,
          zone: zone,
          locPattern: locPattern,
          shelfPattern: shelfPattern,
          isEmpty: rack.isEmpty,
          hideRackFrame: hideRackFrame,
          stockScale: stockScale
        };

        if (!rackModel.isEmpty) {
          var rack = new _rack2.default(rackModel, _this2.model, _this2._visualizer);
          _this2.add(rack);
        }
      });
    }
  }, {
    key: 'mergeObjects',
    value: function mergeObjects() {
      var frames = [];
      var boards = [];
      this.children.forEach(function (rack) {
        frames = frames.concat(rack.frames);
        boards = boards.concat(rack.boards);
      });

      var targetFrame;
      frames.forEach(function (frameGroup) {
        frameGroup.children.forEach(function (f) {
          if (!targetFrame) {
            targetFrame = f;
            return;
          }

          targetFrame.geometry.merge(f.geometry);
        });
      });
      var targetBoard;
      boards.forEach(function (b) {
        if (!targetBoard) {
          targetBoard = b;
          return;
        }

        targetBoard.geometry.merge(b.geometry);
      });
    }
  }, {
    key: 'raycast',
    value: function raycast(raycaster, intersects) {}
  }, {
    key: 'onchange',
    value: function onchange(after, before) {
      if (after.hasOwnProperty("data")) {
        this.data = after.data;
      }
    }
  }]);

  return RackTable3d;
}(_group3d2.default);

exports.default = RackTable3d;

var RackTable = exports.RackTable = function (_Container) {
  _inherits(RackTable, _Container);

  function RackTable() {
    _classCallCheck(this, RackTable);

    return _possibleConstructorReturn(this, (RackTable.__proto__ || Object.getPrototypeOf(RackTable)).apply(this, arguments));
  }

  _createClass(RackTable, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      _get(RackTable.prototype.__proto__ || Object.getPrototypeOf(RackTable.prototype), 'dispose', this).call(this);
      delete this._focused_cell;
    }
  }, {
    key: 'created',
    value: function created() {
      var tobeSize = this.rows * this.columns;
      var gap = this.size() - tobeSize;

      if (gap == 0) {
        return;
      } else if (gap > 0) {
        var removals = this._components.slice(gap);
        this.remove(removals);
      } else {
        var newbies = [];

        for (var i = 0; i < -gap; i++) {
          newbies.push(buildNewCell(this.app));
        }this.add(newbies);
      }

      var widths = this.get('widths');
      var heights = this.get('heights');

      if (!widths || widths.length < this.columns) this.set('widths', this.widths);
      if (!heights || heights.length < this.rows) this.set('heights', this.heights);
    }

    // 컴포넌트를 임의로 추가 및 삭제할 수 있는 지를 지정하는 속성임.

  }, {
    key: 'buildCells',
    value: function buildCells(newrows, newcolumns, oldrows, oldcolumns) {
      if (newrows < oldrows) {
        var removals = this._components.slice(oldcolumns * newrows);
        this.remove(removals);
      }

      var minrows = Math.min(newrows, oldrows);

      if (newcolumns > oldcolumns) {
        for (var r = 0; r < minrows; r++) {
          for (var c = oldcolumns; c < newcolumns; c++) {
            this.insertComponentAt(buildNewCell(this.app), r * newcolumns + c);
          }
        }
      } else if (newcolumns < oldcolumns) {
        var _removals = [];

        for (var _r = 0; _r < minrows; _r++) {
          for (var _c = newcolumns; _c < oldcolumns; _c++) {
            _removals.push(this.components[_r * oldcolumns + _c]);
          }
        }
        this.remove(_removals);
      }

      if (newrows > oldrows) {
        var newbies = [];

        for (var _r2 = oldrows; _r2 < newrows; _r2++) {
          for (var i = 0; i < newcolumns; i++) {
            newbies.push(buildNewCell(this.app));
          }
        }
        this.add(newbies);
      }

      this.set({
        widths: this.widths,
        heights: this.heights
      });
    }
  }, {
    key: 'setCellsStyle',
    value: function setCellsStyle(cells, style, where) {
      var _this4 = this;

      var components = this.components;
      var total = components.length;
      var columns = this.get('columns');

      // 병합된 셀도 포함시킨다.
      var _cells = [];
      cells.forEach(function (c) {
        _cells.push(c);
        if (c.colspan || c.rowspan) {
          var col = _this4.getRowColumn(c).column;
          var row = _this4.getRowColumn(c).row;
          for (var i = row; i < row + c.rowspan; i++) {
            for (var j = col; j < col + c.colspan; j++) {
              if (i != row || j != col) _cells.push(_this4.components[i * _this4.columns + j]);
            }
          }
        }
      });
      var indices = _cells.map(function (cell) {
        return components.indexOf(cell);
      });
      indices.forEach(function (i) {
        var cell = components[i];

        switch (where) {
          case 'all':
            setCellBorder(cell, style, where);

            if (isLeftMost(total, columns, indices, i)) setCellBorder(components[before(columns, i)], style, 'right');
            if (isRightMost(total, columns, indices, i)) setCellBorder(components[after(columns, i)], style, 'left');
            if (isTopMost(total, columns, indices, i)) setCellBorder(components[above(columns, i)], style, 'bottom');
            if (isBottomMost(total, columns, indices, i)) setCellBorder(components[below(columns, i)], style, 'top');
            break;
          case 'in':
            if (!isLeftMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'left');
            }
            if (!isRightMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'right');
            }
            if (!isTopMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'top');
            }
            if (!isBottomMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'bottom');
            }
            break;
          case 'out':
            if (isLeftMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'left');
              setCellBorder(components[before(columns, i)], style, 'right');
            }
            if (isRightMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'right');
              setCellBorder(components[after(columns, i)], style, 'left');
            }
            if (isTopMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'top');
              setCellBorder(components[above(columns, i)], style, 'bottom');
            }
            if (isBottomMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'bottom');
              setCellBorder(components[below(columns, i)], style, 'top');
            }
            break;
          case 'left':
            if (isLeftMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'left');
              setCellBorder(components[before(columns, i)], style, 'right');
            }
            break;
          case 'right':
            if (isRightMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'right');
              setCellBorder(components[after(columns, i)], style, 'left');
            }
            break;
          case 'center':
            if (!isLeftMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'left');
            }
            if (!isRightMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'right');
            }
            break;
          case 'middle':
            if (!isTopMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'top');
            }
            if (!isBottomMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'bottom');
            }
            break;
          case 'top':
            if (isTopMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'top');
              setCellBorder(components[above(columns, i)], style, 'bottom');
            }
            break;
          case 'bottom':
            if (isBottomMost(total, columns, indices, i)) {
              setCellBorder(cell, style, 'bottom');
              setCellBorder(components[below(columns, i)], style, 'top');
            }
            break;
          case 'clear':
            setCellBorder(cell, CLEAR_STYLE, 'all');

            if (isLeftMost(total, columns, indices, i)) setCellBorder(components[before(columns, i)], CLEAR_STYLE, 'right');
            if (isRightMost(total, columns, indices, i)) setCellBorder(components[after(columns, i)], CLEAR_STYLE, 'left');
            if (isTopMost(total, columns, indices, i)) setCellBorder(components[above(columns, i)], CLEAR_STYLE, 'bottom');
            if (isBottomMost(total, columns, indices, i)) setCellBorder(components[below(columns, i)], CLEAR_STYLE, 'top');
        }
      });
    }
  }, {
    key: 'getRowColumn',
    value: function getRowColumn(cell) {
      var idx = this.components.indexOf(cell);
      var length = this.components.length;

      return {
        column: idx % this.columns,
        row: Math.floor(idx / this.columns)
      };
    }
  }, {
    key: 'getCellsByRow',
    value: function getCellsByRow(row) {
      return this.components.slice(row * this.columns, (row + 1) * this.columns);
    }
  }, {
    key: 'getCellsByColumn',
    value: function getCellsByColumn(column) {
      var cells = [];
      for (var i = 0; i < this.rows; i++) {
        cells.push(this.components[this.columns * i + column]);
      }return cells;
    }
  }, {
    key: 'deleteRows',
    value: function deleteRows(cells) {
      var _this5 = this;

      // 먼저 cells 위치의 행을 구한다.
      var rows = [];
      cells.forEach(function (cell) {
        var row = _this5.getRowColumn(cell).row;
        if (-1 == rows.indexOf(row)) rows.push(row);
      });
      rows.sort(function (a, b) {
        return a - b;
      });
      rows.reverse();
      var heights = this.heights.slice();
      rows.forEach(function (row) {
        _this5.remove(_this5.getCellsByRow(row));
      });
      heights.splice(rows, 1);
      this.model.rows -= rows.length; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.
      this.set('heights', heights);
    }
  }, {
    key: 'deleteColumns',
    value: function deleteColumns(cells) {
      var _this6 = this;

      // 먼저 cells 위치의 열을 구한다.
      var columns = [];
      cells.forEach(function (cell) {
        var column = _this6.getRowColumn(cell).column;
        if (-1 == columns.indexOf(column)) columns.push(column);
      });
      columns.sort(function (a, b) {
        return a - b;
      });
      columns.reverse();

      columns.forEach(function (column) {
        var widths = _this6.widths.slice();
        _this6.remove(_this6.getCellsByColumn(column));
        widths.splice(column, 1);
        _this6.model.columns -= 1; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.
        _this6.set('widths', widths);
      });
    }
  }, {
    key: 'insertCellsAbove',
    value: function insertCellsAbove(cells) {
      var _this7 = this;

      // 먼저 cells 위치의 행을 구한다.
      var rows = [];
      cells.forEach(function (cell) {
        var row = _this7.getRowColumn(cell).row;
        if (-1 == rows.indexOf(row)) rows.push(row);
      });
      rows.sort(function (a, b) {
        return a - b;
      });
      rows.reverse();
      // 행 2개 이상은 추가 안함. 임시로 막아놓음
      if (rows.length >= 2) return false;
      var insertionRowPosition = rows[0];
      var newbieRowHeights = [];
      var newbieCells = [];
      rows.forEach(function (row) {
        for (var i = 0; i < _this7.columns; i++) {
          newbieCells.push(buildCopiedCell(_this7.components[row * _this7.columns + i].model, _this7.app));
        }newbieRowHeights.push(_this7.heights[row]);

        newbieCells.reverse().forEach(function (cell) {
          _this7.insertComponentAt(cell, insertionRowPosition * _this7.columns);
        });

        var heights = _this7.heights.slice();
        heights.splice.apply(heights, [insertionRowPosition, 0].concat(newbieRowHeights));
        _this7.set('heights', heights);

        _this7.model.rows += rows.length;

        _this7.clearCache();
      });
    }
  }, {
    key: 'insertCellsBelow',
    value: function insertCellsBelow(cells) {
      var _this8 = this;

      // 먼저 cells 위치의 행을 구한다.
      var rows = [];
      cells.forEach(function (cell) {
        var row = _this8.getRowColumn(cell).row;
        if (-1 == rows.indexOf(row)) rows.push(row);
      });
      rows.sort(function (a, b) {
        return a - b;
      });
      rows.reverse();
      // 행 2개 이상은 추가 안함. 임시로 막아놓음
      if (rows.length >= 2) return false;
      var insertionRowPosition = rows[rows.length - 1] + 1;
      var newbieRowHeights = [];
      var newbieCells = [];
      rows.forEach(function (row) {
        for (var i = 0; i < _this8.columns; i++) {
          newbieCells.push(buildCopiedCell(_this8.components[row * _this8.columns + i].model, _this8.app));
        }newbieRowHeights.push(_this8.heights[row]);

        newbieCells.reverse().forEach(function (cell) {
          _this8.insertComponentAt(cell, insertionRowPosition * _this8.columns);
        });

        var heights = _this8.heights.slice();
        heights.splice.apply(heights, [insertionRowPosition, 0].concat(newbieRowHeights));
        _this8.set('heights', heights);

        _this8.model.rows += 1;

        _this8.clearCache();
      });
    }
  }, {
    key: 'insertCellsLeft',
    value: function insertCellsLeft(cells) {
      var _this9 = this;

      // 먼저 cells 위치의 열을 구한다.
      var columns = [];
      cells.forEach(function (cell) {
        var column = _this9.getRowColumn(cell).column;
        if (-1 == columns.indexOf(column)) columns.push(column);
      });
      columns.sort(function (a, b) {
        return a - b;
      });
      columns.reverse();
      // 열 2개 이상은 추가 안함. 임시로 막아놓음
      if (columns.length >= 2) return false;
      var insertionColumnPosition = columns[0];
      var newbieColumnWidths = [];
      var newbieCells = [];
      columns.forEach(function (column) {
        for (var i = 0; i < _this9.rows; i++) {
          newbieCells.push(buildCopiedCell(_this9.components[column + _this9.columns * i].model, _this9.app));
        }newbieColumnWidths.push(_this9.widths[column]);

        var increasedColumns = _this9.columns;
        var index = _this9.rows;
        newbieCells.reverse().forEach(function (cell) {
          if (index == 0) {
            index = _this9.rows;
            increasedColumns++;
          }

          index--;
          _this9.insertComponentAt(cell, insertionColumnPosition + index * increasedColumns);
        });

        var widths = _this9.widths.slice();
        _this9.model.columns += columns.length; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.

        widths.splice.apply(widths, [insertionColumnPosition, 0].concat(newbieColumnWidths));

        _this9.set('widths', widths);
      });
    }
  }, {
    key: 'insertCellsRight',
    value: function insertCellsRight(cells) {
      var _this10 = this;

      // 먼저 cells 위치의 열을 구한다.
      var columns = [];
      cells.forEach(function (cell) {
        var column = _this10.getRowColumn(cell).column;
        if (-1 == columns.indexOf(column)) columns.push(column);
      });
      columns.sort(function (a, b) {
        return a - b;
      });
      columns.reverse();
      // 열 2개 이상은 추가 안함. 임시로 막아놓음
      if (columns.length >= 2) return false;
      var insertionColumnPosition = columns[columns.length - 1] + 1;
      var newbieColumnWidths = [];
      var newbieCells = [];
      columns.forEach(function (column) {
        for (var i = 0; i < _this10.rows; i++) {
          newbieCells.push(buildCopiedCell(_this10.components[column + _this10.columns * i].model, _this10.app));
        }newbieColumnWidths.push(_this10.widths[column]);

        var increasedColumns = _this10.columns;
        var index = _this10.rows;
        newbieCells.reverse().forEach(function (cell) {
          if (index == 0) {
            index = _this10.rows;
            increasedColumns++;
          }

          index--;
          _this10.insertComponentAt(cell, insertionColumnPosition + index * increasedColumns);
        });

        var widths = _this10.widths.slice();
        _this10.model.columns += columns.length; // 고의적으로, change 이벤트가 발생하지 않도록 set(..)을 사용하지 않음.

        widths.splice.apply(widths, [insertionColumnPosition, 0].concat(newbieColumnWidths));

        _this10.set('widths', widths);
      });
    }
  }, {
    key: 'distributeHorizontal',
    value: function distributeHorizontal(cells) {
      var _this11 = this;

      var columns = [];

      cells.forEach(function (cell) {
        var rowcolumn = _this11.getRowColumn(cell);

        if (-1 == columns.indexOf(rowcolumn.column)) columns.push(rowcolumn.column);
      });

      var sum = columns.reduce(function (sum, column) {
        return sum + _this11.widths[column];
      }, 0);

      var newval = Math.round(sum / columns.length * 100) / 100;
      var widths = this.widths.slice();
      columns.forEach(function (column) {
        widths[column] = newval;
      });

      this.set('widths', widths);
    }
  }, {
    key: 'distributeVertical',
    value: function distributeVertical(cells) {
      var _this12 = this;

      var rows = [];

      cells.forEach(function (cell) {
        var rowcolumn = _this12.getRowColumn(cell);

        if (-1 == rows.indexOf(rowcolumn.row)) rows.push(rowcolumn.row);
      });

      var sum = rows.reduce(function (sum, row) {
        return sum + _this12.heights[row];
      }, 0);

      var newval = Math.round(sum / rows.length * 100) / 100;
      var heights = this.heights.slice();
      rows.forEach(function (row) {
        heights[row] = newval;
      });

      this.set('heights', heights);
    }

    /**
     * visualizer location setting functions
     */

  }, {
    key: 'increaseLocation',
    value: function increaseLocation(type, skipNumbering, startSection, startUnit) {
      /**
       * step 1
       *
       * selected collect rack-cell
       */
      var selectedCells = this.root.selected;

      /**
       * step 2
       *
       * classify cells by row
       */
      var classified = this.classifyByRow(selectedCells);

      /**
       * step 3
       *
       * find aisle
       */
      var aisleRowIndices = this.getAisleRowIndices(classified);

      /**
       * step 4
       *
       * classify cells by section
       */
      var sections = this.classifyCellsBySection(classified, aisleRowIndices);

      /**
       * step 5
       *
       * rearrange by aisle
       */
      var rearranged = this.rearrangeByAisle(type, sections, aisleRowIndices);

      /**
       * step 6
       *
       * if skip numbering, remove empty cells
       */
      if (skipNumbering) rearranged = this.removeEmptyCells(rearranged);

      /**
       * step 7
       *
       * merge rows
       */
      var merged = this.mergeRows(rearranged);

      /**
       * step 8
       *
       * set location
       */
      this.setLocations(merged, startSection, startUnit);
    }
  }, {
    key: 'classifyByRow',
    value: function classifyByRow(cells) {
      var classified = [];
      cells.forEach(function (c) {
        var index = c.index;
        var row = index.row,
            column = index.column;


        if (!classified[row]) classified[row] = [];

        classified[row][column] = c;
      });

      return classified;
    }
  }, {
    key: 'findAisle',
    value: function findAisle(rows) {
      if (!rows) return [];

      return rows.filter(function (r) {
        return r[0].isAisle;
      });
    }
  }, {
    key: 'getAisleRowIndices',
    value: function getAisleRowIndices(rows) {
      var aisles = this.findAisle(rows);
      var aisleRowIndices = [];
      aisles.forEach(function (aisle) {
        aisleRowIndices.push(rows.indexOf(aisle));
      });

      return aisleRowIndices;
    }
  }, {
    key: 'classifyCellsBySection',
    value: function classifyCellsBySection(rows, aisleRowIndices) {
      var sections = [];
      var wasAisle = false;
      var section;
      rows.forEach(function (row, i) {
        var isAisle = aisleRowIndices.indexOf(i) > -1;
        if (!(wasAisle || isAisle)) {
          section = [];
          sections.push(section);
        }

        wasAisle = isAisle;

        section.push(row);
      });

      return sections;
    }
  }, {
    key: 'rearrangeByAisle',
    value: function rearrangeByAisle(type, sections) {
      var rearranged = [];
      switch (type.toLowerCase()) {
        case 'cw':
          var reverse = false;
          sections.forEach(function (rows, i) {
            var section = [];
            rearranged.push(section);
            rows.forEach(function (r, i) {
              if (reverse) r.reverse();

              if (i % 2 === 0) {
                section.push(r);
                reverse = !reverse;
              }
            });
          });
          break;
        case 'ccw':
          var reverse = true;
          sections.forEach(function (rows, i) {
            var section = [];
            rearranged.push(section);
            rows.forEach(function (r, i) {
              if (reverse) r.reverse();

              if (i % 2 === 0) {
                section.push(r);
                reverse = !reverse;
              }
            });
          });
          break;
        case 'zigzag':
          sections.forEach(function (rows, i) {
            var section = [];

            rows.forEach(function (r, i) {

              if (i % 2 === 0) {
                section.push(r);
              }
            });

            var sectionLength = section.length;
            var tempRow = [];
            var tempSection = [];

            section.forEach(function (row, rowIdx) {
              row.forEach(function (cell, idx) {
                tempRow[rowIdx + idx * section.length] = cell;
              });
            });

            var chunkSize = tempRow.length / sectionLength;
            for (var idx = 0; idx < sectionLength; idx++) {
              tempSection.push(tempRow.slice(idx * chunkSize, (idx + 1) * chunkSize));
            }

            rearranged.push(tempSection);
          });
          break;
        case 'zigzag-reverse':
          sections.forEach(function (rows, i) {
            var section = [];

            rows.forEach(function (r, i) {

              if (i % 2 === 0) {
                r.reverse();
                section.push(r);
              }
            });

            var sectionLength = section.length;
            var tempRow = [];
            var tempSection = [];

            section.forEach(function (row, rowIdx) {
              row.forEach(function (cell, idx) {
                tempRow[rowIdx + idx * section.length] = cell;
              });
            });

            var chunkSize = tempRow.length / sectionLength;
            for (var idx = 0; idx < sectionLength; idx++) {
              tempSection.push(tempRow.slice(idx * chunkSize, (idx + 1) * chunkSize));
            }

            rearranged.push(tempSection);
          });
          break;
      }

      return rearranged;
    }
  }, {
    key: 'removeEmptyCells',
    value: function removeEmptyCells(sections) {
      var newSections = [];
      sections.forEach(function (rows) {
        var newRows = [];
        newSections.push(newRows);
        rows.forEach(function (row) {
          var newRow = [];
          newRows.push(newRow);
          row.forEach(function (c, i) {
            if (!c.isEmpty) newRow.push(c);
          });
        });
      });

      return newSections;
    }
  }, {
    key: 'mergeRows',
    value: function mergeRows(sections) {
      var merged = [];
      sections.forEach(function (section) {
        var newSection = [];
        section.forEach(function (rows) {
          var mergedRow = [];
          rows.forEach(function (row) {
            mergedRow = mergedRow.concat(row);
          });
          newSection = newSection.concat(mergedRow);
        });
        merged.push(newSection);
      });
      return merged;
    }
  }, {
    key: 'setLocations',
    value: function setLocations(sections, startSection, startUnit) {
      var _model2 = this.model,
          _model2$sectionDigits = _model2.sectionDigits,
          sectionDigits = _model2$sectionDigits === undefined ? 2 : _model2$sectionDigits,
          _model2$unitDigits = _model2.unitDigits,
          unitDigits = _model2$unitDigits === undefined ? 2 : _model2$unitDigits;


      var sectionNumber = Number(startSection) || 1;

      sections.forEach(function (section) {
        var unitNumber = Number(startUnit) || 1;
        section.forEach(function (c) {
          if (!c.isEmpty) {
            c.set('section', String(sectionNumber).padStart(sectionDigits, 0));
            c.set('unit', String(unitNumber).padStart(unitDigits, 0));
          } else {
            c.set('section', null);
            c.set('unit', null);
          }
          unitNumber++;
        });
        sectionNumber++;
      });
    }
  }, {
    key: 'onchange',
    value: function onchange(after, before) {
      if (hasAnyProperty(after, "rows", "columns")) {
        this.buildCells(this.get('rows'), this.get('columns'), before.hasOwnProperty('rows') ? before.rows : this.get('rows'), before.hasOwnProperty('columns') ? before.columns : this.get('columns'));
      }

      this.invalidate();
    }
  }, {
    key: 'oncellchanged',
    value: function oncellchanged(after, before) {
      this.invalidate();
    }
  }, {
    key: 'focusible',
    get: function get() {
      return false;
    }
  }, {
    key: 'widths',
    get: function get() {
      var widths = this.get('widths');

      if (!widths) return array(1, this.columns);

      if (widths.length < this.columns) return widths.concat(array(1, this.columns - widths.length));else if (widths.length > this.columns) return widths.slice(0, this.columns);

      return widths;
    }
  }, {
    key: 'heights',
    get: function get() {
      var heights = this.get('heights');

      if (!heights) return array(1, this.rows);

      if (heights.length < this.rows) return heights.concat(array(1, this.rows - heights.length));else if (heights.length > this.rows) return heights.slice(0, this.rows);

      return heights;
    }
  }, {
    key: 'layout',
    get: function get() {
      return TABLE_LAYOUT;
    }
  }, {
    key: 'rows',
    get: function get() {
      return this.get('rows');
    }
  }, {
    key: 'columns',
    get: function get() {
      return this.get('columns');
    }
  }, {
    key: 'lefts',
    get: function get() {
      var _this13 = this;

      return this.components.filter(function (c, i) {
        return !(i % _this13.columns);
      });
    }
  }, {
    key: 'centers',
    get: function get() {
      var _this14 = this;

      return this.components.filter(function (c, i) {
        return i % _this14.columns && (i + 1) % _this14.columns;
      });
    }
  }, {
    key: 'rights',
    get: function get() {
      var _this15 = this;

      return this.components.filter(function (c, i) {
        return !((i + 1) % _this15.columns);
      });
    }
  }, {
    key: 'tops',
    get: function get() {
      return this.components.slice(0, this.columns);
    }
  }, {
    key: 'middles',
    get: function get() {
      return this.components.slice(this.columns, this.columns * (this.rows - 1));
    }
  }, {
    key: 'bottoms',
    get: function get() {
      return this.components.slice(this.columns * (this.rows - 1));
    }
  }, {
    key: 'all',
    get: function get() {
      return this.components;
    }
  }, {
    key: 'widths_sum',
    get: function get() {
      var _this16 = this;

      var widths = this.widths;
      return widths ? widths.filter(function (width, i) {
        return i < _this16.columns;
      }).reduce(function (sum, width) {
        return sum + width;
      }, 0) : this.columns;
    }
  }, {
    key: 'heights_sum',
    get: function get() {
      var _this17 = this;

      var heights = this.heights;
      return heights ? heights.filter(function (height, i) {
        return i < _this17.rows;
      }).reduce(function (sum, height) {
        return sum + height;
      }, 0) : this.rows;
    }
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }, {
    key: 'controls',
    get: function get() {
      var widths = this.widths;
      var heights = this.heights;
      var inside = this.textBounds;

      var width_unit = inside.width / this.widths_sum;
      var height_unit = inside.height / this.heights_sum;

      var x = inside.left;
      var y = inside.top;

      var controls = [];

      widths.slice(0, this.columns - 1).forEach(function (width) {
        x += width * width_unit;
        controls.push({
          x: x,
          y: inside.top,
          handler: columnControlHandler
        });
      });

      heights.slice(0, this.rows - 1).forEach(function (height) {
        y += height * height_unit;
        controls.push({
          x: inside.left,
          y: y,
          handler: rowControlHandler
        });
      });

      return controls;
    }
  }, {
    key: 'eventMap',
    get: function get() {
      return {
        '(self)': {
          '(descendant)': {
            change: this.oncellchanged
          }
        }
      };
    }
  }]);

  return RackTable;
}(Container);

["rows", "columns", "widths", "heights", "widths_sum", "heights_sum", "controls"].forEach(function (getter) {
  return Component.memoize(RackTable.prototype, getter, false);
});

Component.register('rack-table', RackTable);
Component3d.register('rack-table', RackTable3d);

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var _scene = scene,
    Component3d = _scene.Component3d;

var Group3D = function (_THREE$Group) {
  _inherits(Group3D, _THREE$Group);

  function Group3D(model, canvasSize, visualizer) {
    _classCallCheck(this, Group3D);

    var _this = _possibleConstructorReturn(this, (Group3D.__proto__ || Object.getPrototypeOf(Group3D)).call(this));

    _this._model = model;
    _this._visualizer = visualizer;
    // this.createObject(canvasSize);
    // this.createChildrenObject(canvasSize);
    // this.createObject(canvasSize);
    return _this;
  }

  _createClass(Group3D, [{
    key: "dispose",
    value: function dispose() {
      var _this2 = this;

      this.children.slice().forEach(function (child) {
        if (child.dispose) child.dispose();
        if (child.geometry && child.geometry.dispose) child.geometry.dispose();
        if (child.material && child.material.dispose) child.material.dispose();
        if (child.texture && child.texture.dispose) child.texture.dispose();
        _this2.remove(child);
      });
    }
  }, {
    key: "createObject",
    value: function createObject(canvasSize) {
      var _model = this.model,
          _model$left = _model.left,
          left = _model$left === undefined ? 0 : _model$left,
          _model$top = _model.top,
          top = _model$top === undefined ? 0 : _model$top,
          _model$width = _model.width,
          width = _model$width === undefined ? 0 : _model$width,
          _model$height = _model.height,
          height = _model$height === undefined ? 0 : _model$height;


      var cx = left + width / 2 - canvasSize.width / 2;
      var cy = top + height / 2 - canvasSize.height / 2;
      // let cz = this.model.rx

      this.position.x = cx;
      this.position.z = cy;
    }
  }, {
    key: "createChildrenObject",
    value: function createChildrenObject(canvasSize) {
      var _this3 = this;

      var components = this._model.components;


      components.forEach(function (component) {
        var clazz = Component3d.register(component.type);
        if (!clazz) {
          console.warn("Class not found : 3d class is not exist");
          return;
        }

        var item = new clazz(component, canvasSize, _this3._visualizer);
        if (item) {
          item.name = component.id;
          _this3.add(item);
          // this.putObject(component.model.id, item);
        }
      });
    }
  }, {
    key: "model",
    get: function get() {
      return this._model;
    }
  }]);

  return Group3D;
}(THREE.Group);

exports.default = Group3D;


Component3d.register('group', Group3D);

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var _scene = scene,
    Component = _scene.Component,
    Rect = _scene.Rect;

var Door = function (_THREE$Mesh) {
  _inherits(Door, _THREE$Mesh);

  function Door(model, canvasSize) {
    _classCallCheck(this, Door);

    var _this = _possibleConstructorReturn(this, (Door.__proto__ || Object.getPrototypeOf(Door)).call(this));

    _this._model = model;

    _this.createObject(model, canvasSize);

    return _this;
  }

  _createClass(Door, [{
    key: 'createObject',
    value: function createObject(model, canvasSize) {

      var cx = model.left + model.width / 2 - canvasSize.width / 2;
      var cy = model.top + model.height / 2 - canvasSize.height / 2;
      var cz = 0.5 * model.depth;

      var rotation = model.rotation;
      this.type = model.type;

      this.createDoor(model.width, model.height, model.depth);

      this.position.set(cx, cz, cy);
      this.rotation.y = rotation || 0;
    }
  }, {
    key: 'createDoor',
    value: function createDoor(w, h, d) {
      var _model$fillStyle = this.model.fillStyle,
          fillStyle = _model$fillStyle === undefined ? 'saddlebrown' : _model$fillStyle;


      this.geometry = new THREE.BoxBufferGeometry(w, d, h);
      this.material = new THREE.MeshLambertMaterial({ color: fillStyle, side: THREE.FrontSide });

      // this.castShadow = true
    }
  }, {
    key: 'model',
    get: function get() {
      return this._model;
    }
  }]);

  return Door;
}(THREE.Mesh);

exports.default = Door;

var Door2d = exports.Door2d = function (_Rect) {
  _inherits(Door2d, _Rect);

  function Door2d() {
    _classCallCheck(this, Door2d);

    return _possibleConstructorReturn(this, (Door2d.__proto__ || Object.getPrototypeOf(Door2d)).apply(this, arguments));
  }

  _createClass(Door2d, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }]);

  return Door2d;
}(Rect);

Component.register('door', Door2d);
scene.Component3d.register('door', Door);

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var _scene = scene,
    Component3d = _scene.Component3d;

var ForkLift = function (_Object3D) {
  _inherits(ForkLift, _Object3D);

  function ForkLift() {
    _classCallCheck(this, ForkLift);

    return _possibleConstructorReturn(this, (ForkLift.__proto__ || Object.getPrototypeOf(ForkLift)).apply(this, arguments));
  }

  _createClass(ForkLift, [{
    key: 'createObject',
    value: function createObject() {
      ForkLift.threedObjectLoader.then(this.addObject.bind(this));
    }
  }, {
    key: 'addObject',
    value: function addObject(extObject) {
      var _model = this.model,
          width = _model.width,
          height = _model.height,
          depth = _model.depth,
          _model$rotation = _model.rotation,
          rotation = _model$rotation === undefined ? 0 : _model$rotation;


      this.type = 'forklift';

      var object = extObject.clone();

      this.add(object);

      this.scale.set(width, depth, height);
    }
  }], [{
    key: 'threedObjectLoader',
    get: function get() {
      if (!ForkLift._threedObjectLoader) {
        ForkLift._threedObjectLoader = new Promise(function (resolve, reject) {
          var objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
          var mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

          objLoader.setPath('/obj/Fork_lift/');
          mtlLoader.setPath('/obj/Fork_lift/');

          mtlLoader.load('fork_lift.mtl', function (materials) {
            materials.preload();
            objLoader.setMaterials(materials);
            materials.side = THREE.frontSide;

            objLoader.load('fork_lift.obj', function (obj) {
              var extObj = obj;
              if (extObj && extObj.children && extObj.children.length > 0) {
                extObj = extObj.children[0];
              }

              extObj.geometry.center();
              resolve(extObj);
            });
          });
        });
      }

      return ForkLift._threedObjectLoader;
    }
  }]);

  return ForkLift;
}(_object3d2.default);

exports.default = ForkLift;


Component3d.register('forklift', ForkLift);

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sensor = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var STATUS_COLORS = ['#6666ff', '#ccccff', '#ffcccc', '#cc3300'];

var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'z-pos',
    name: 'zPos',
    property: 'zPos'
  }, {
    type: 'string',
    label: 'location',
    name: 'location',
    property: 'location'
  }]
};

var HumiditySensor = function (_Object3D) {
  _inherits(HumiditySensor, _Object3D);

  function HumiditySensor(model, canvasSize, visualizer) {
    _classCallCheck(this, HumiditySensor);

    var _this = _possibleConstructorReturn(this, (HumiditySensor.__proto__ || Object.getPrototypeOf(HumiditySensor)).call(this, model, canvasSize, visualizer));

    _this.userData.temperature = model.humidity ? model.humidity[0] : 0;
    _this.userData.humidity = model.humidity ? model.humidity[1] : 0;
    return _this;
  }

  _createClass(HumiditySensor, [{
    key: 'createObject',
    value: function createObject() {
      var _model = this.model,
          depth = _model.depth,
          rx = _model.rx,
          ry = _model.ry,
          location = _model.location;


      this.type = 'humidity-sensor';

      if (location) this.name = location;

      for (var i = 0; i < 3; i++) {
        var mesh = this.createSensor(rx * (1 + 0.5 * i), ry * (1 + 0.5 * i), depth * (1 + 0.5 * i), i);
        mesh.material.opacity = 0.5 - i * 0.15;
      }

      if (this._visualizer._heatmap) {
        this._visualizer._heatmap.addData({
          x: Math.floor(this.cx),
          y: Math.floor(this.cy),
          value: this.userData.temperature
        });

        this._visualizer.updateHeatmapTexture();
      }

      // var self = this
      //
      // setInterval(function(){
      //
      //   var data = self._visualizer._heatmap._store._data
      //
      //   // var value = self._visualizer._heatmap.getValueAt({x:model.cx, y: model.cy})
      //   var value = data[model.cx][model.cy]
      //
      //   self._visualizer._heatmap.addData({
      //     x: model.cx,
      //     y: model.cy,
      //     // min: -100,
      //     // value: -1
      //     value: (Math.random() * 40 - 10) - value
      //   })
      //   self._visualizer._heatmap.repaint()
      //
      //   self._visualizer.render_threed()
      // }, 1000)
    }
  }, {
    key: 'createSensor',
    value: function createSensor(w, h, d, i) {

      var isFirst = i === 0;

      var geometry = new THREE.SphereBufferGeometry(w, 32, 32);
      // let geometry = new THREE.SphereGeometry(w, d, h);
      var material;
      if (isFirst) {
        // var texture = new THREE.TextureLoader().load('./images/drop-34055_1280.png')
        // texture.repeat.set(1,1)
        // // texture.premultiplyAlpha = true
        //  material = new THREE.MeshBasicMaterial( { color : '#cc3300', side: THREE.FrontSide, wireframe: true, wireframeLinewidth : 1} );
        material = new THREE.MeshLambertMaterial({ color: '#cc3300', side: THREE.FrontSide });
        // material = new THREE.MeshLambertMaterial( { color : '#74e98a', side: THREE.FrontSide} );
      } else {
        material = new THREE.MeshBasicMaterial({ color: '#cc3300', side: THREE.FrontSide, wireframe: true, wireframeLinewidth: 1 });
        // material = new THREE.MeshBasicMaterial( { color : '#74e98a', side: THREE.FrontSide, wireframe: true, wireframeLinewidth : 1} );
      }

      // let material = new THREE.MeshBasicMaterial( { color : '#ff3300', side: THREE.DoubleSide, wireframe: true, wireframeLinewidth : 1} );

      var mesh = new THREE.Mesh(geometry, material);
      mesh.material.transparent = true;

      if (isFirst) mesh.onmousemove = this.onmousemove;else mesh.raycast = function () {};

      this.add(mesh);

      return mesh;
    }
  }, {
    key: 'onUserDataChanged',
    value: function onUserDataChanged() {

      _get(HumiditySensor.prototype.__proto__ || Object.getPrototypeOf(HumiditySensor.prototype), 'onUserDataChanged', this).call(this);

      var _model2 = this._model,
          cx = _model2.cx,
          cy = _model2.cy;

      cx = Math.floor(cx);
      cy = Math.floor(cy);

      var temperature = this.userData.temperature;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var sphere = _step.value;

          var colorIndex = 0;
          if (temperature < 0) {
            colorIndex = 0;
          } else if (temperature < 10) {
            colorIndex = 1;
          } else if (temperature < 20) {
            colorIndex = 2;
          } else {
            colorIndex = 3;
          }

          sphere.material.color.set(STATUS_COLORS[colorIndex]);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (!this._visualizer._heatmap) return;

      var data = this._visualizer._heatmap._store._data;

      // var value = self._visualizer._heatmap.getValueAt({x:model.cx, y: model.cy})
      var value = data[cx][cy];

      this._visualizer._heatmap.addData({
        x: cx,
        y: cy,
        // min: -100,
        // value: -1
        value: temperature - value
      });
      this._visualizer._heatmap.repaint();

      // this._visualizer.render_threed()
      this._visualizer.updateHeatmapTexture();
    }
  }, {
    key: 'onmousemove',
    value: function onmousemove(e, visualizer) {

      var tooltip = visualizer.tooltip || visualizer._scene2d.getObjectByName("tooltip");

      if (tooltip) {
        visualizer._scene2d.remove(tooltip);
        visualizer.tooltip = null;
        visualizer.render_threed();
      }

      if (!this.parent.visible) return;

      if (!this.parent.userData) this.parent.userData = {};

      var tooltipText = '';

      for (var key in this.parent.userData) {
        if (this.parent.userData[key]) tooltipText += key + ": " + this.parent.userData[key] + "\n";
      }

      // tooltipText = 'loc : ' + loc

      // currentLabel.lookAt( camera.position );

      if (tooltipText.length > 0) {
        tooltip = visualizer.tooltip = visualizer.makeTextSprite(tooltipText);

        var vector = new THREE.Vector3();
        var vector2 = tooltip.getWorldScale().clone();

        var widthMultiplier = vector2.x / visualizer.model.width;
        var heightMultiplier = vector2.y / visualizer.model.height;

        vector.set(visualizer._mouse.x, visualizer._mouse.y, 0.5);
        vector2.normalize();

        vector2.x = vector2.x / 2 * widthMultiplier;
        vector2.y = -vector2.y / 2 * heightMultiplier;
        vector2.z = 0;

        vector.add(vector2);

        vector.unproject(visualizer._2dCamera);
        tooltip.position.set(vector.x, vector.y, vector.z);
        tooltip.name = "tooltip";

        tooltip.scale.x = tooltip.scale.x * widthMultiplier;
        tooltip.scale.y = tooltip.scale.y * heightMultiplier;

        // tooltip.position.set(this.getWorldPosition().x, this.getWorldPosition().y, this.getWorldPosition().z)
        // visualizer._scene3d.add(tooltip)


        visualizer._scene2d.add(tooltip);
        visualizer._renderer && visualizer._renderer.render(visualizer._scene2d, visualizer._2dCamera);
        visualizer.invalidate();
      }
    }
  }, {
    key: 'cx',
    get: function get() {
      var _model$cx = this.model.cx,
          cx = _model$cx === undefined ? 0 : _model$cx;

      if (!this._cx) this._cx = cx - this._canvasSize.width / 2;

      return this._cx;
    }
  }, {
    key: 'cy',
    get: function get() {
      var _model$cy = this.model.cy,
          cy = _model$cy === undefined ? 0 : _model$cy;

      if (!this._cy) this._cy = cy - this._canvasSize.height / 2;

      return this._cy;
    }
  }, {
    key: 'cz',
    get: function get() {
      var _model3 = this.model,
          _model3$zPos = _model3.zPos,
          zPos = _model3$zPos === undefined ? 0 : _model3$zPos,
          _model3$rx = _model3.rx,
          rx = _model3$rx === undefined ? 0 : _model3$rx;


      if (!this._cz) this._cz = zPos + rx;

      return this._cz;
    }
  }]);

  return HumiditySensor;
}(_object3d2.default);

exports.default = HumiditySensor;
var _scene = scene,
    Component = _scene.Component,
    Ellipse = _scene.Ellipse;

var Sensor = exports.Sensor = function (_Ellipse) {
  _inherits(Sensor, _Ellipse);

  function Sensor() {
    _classCallCheck(this, Sensor);

    return _possibleConstructorReturn(this, (Sensor.__proto__ || Object.getPrototypeOf(Sensor)).apply(this, arguments));
  }

  _createClass(Sensor, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: '_draw',
    value: function _draw(context) {
      var _bounds = this.bounds,
          left = _bounds.left,
          top = _bounds.top,
          width = _bounds.width,
          height = _bounds.height;


      context.beginPath();
      context.rect(left, top, width, height);

      this.model.fillStyle = {
        type: 'pattern',
        fitPattern: true,
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAABBCAYAAACTiffeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDQ0E1QkUzRTRDMDcxMUU2QkMyRDk3MzlGN0EzMTI2NSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDQ0E1QkUzRjRDMDcxMUU2QkMyRDk3MzlGN0EzMTI2NSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjJFQ0Q4QzE5NEI1MjExRTZCQzJEOTczOUY3QTMxMjY1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjJFQ0Q4QzFBNEI1MjExRTZCQzJEOTczOUY3QTMxMjY1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+tgU1kQAAB4pJREFUeNrcWktMVFcYPgPIVHxTERpsq4XaBwZbjRIjaUO0qbGuWDQQFnZhgkuty7qUhMQYTdqFGl10YcSYUBfWkEjCxtREClEDJkZgbAsWxYIIKjPCTP/v8p3xOtyZe+4dRtA/+XIv957H/53zv+4ZArFYTL0NEvBCJBAIzHhWsmZNllwWChYJ3iGCaC7IEWQLooJJXsNERPBc8LT33r0XbnO76WlEJJGAKA9F8wUrSGBBQpcsKm3vGCOmbM+m2GZC8ETwWDAuxKJeSaUkYifAlX9X8J5gqU1hRWWwuuO8QrEXVFQrm00EiTzuZA7bxEge/UYEQ0LouSkZRyIOBIqJXCqfxQkfCh4JRmXSSa92jblL164FoWXc3eUkFSXGBPdl7HE3Mq8QcSBQJFhjs3ms6KCgvycUGnHymXRE5sTurBIU0tc0IZjcgBB6loxMnEgCicVy+YwmpM3nH0FIBgtnOgJxp7BD7wuW2ILFABbS7kOORDjAh/LnOq4+SPwruOO0Gq+JUIHcrqUvgQD0uKv9ZwYR6QDFy+nMWQyPN6XDAw+mEaStL6Uz59peRxh2x+hTYx7GhW4lNHUdEEBm2IkIJv+Kk0P5dmkYcZkgi8Q/EqxmSI7aIlnUFoq1M0bp0GH6W4j2HzYgtFIuZbaxe8RX789wdiGzkop1ycCxFANitddzB/M4cMCWK5ATRhmGdd4IMucsseWdSZtD93HeRy5kMN9GjnEDQccx/KaKRDIIdqtC8CUH0spbfkRnfOiW0GScZbad/IC7ppPlPcGfMBsXPYJCYsw4j9g6l8rlW65qNlf7Jid9kmbI/VTwBU1zkrgh6JCxp3wnRDsZOto3gk1cOQx8TfDHbIZimQcTfkI/zeM8/wkuJS6U5xJFfAaK1wo+5iOYULMMPJSpkEuz+VqwgeaGcPubzDmYqnh0LRqFDDL7Hm7176alCE1mKTM0Vve5FxOU/kjIu+mHfwkuiE9E06p+hcxyUeKxy8QLGBoRUZBUC7iiAVtIjtCZewSdepVTjIn6rhI7IiQis/I9kiyayWQL6UNVgsVUPjF3BGylfNR2f1dwWQjdSeU7QsJVybQ+rGQShOEfWL3qRNfNaBais46zvNAhdx13bZUt5HYKmpyyvfFCe/3UBRlGmO8F3zEUI3q10odGDSMUfKCauQSLgLzxi/T/2ysJX0ToMyizG/lhhJX/WRS47zPkwixruCDYkUNiSo8z+s2eQAZJbBdXMeJlFR1M9HO5/IjQLiQu+y6V/YJFo+9xEsjkp6NLIN3jIP0ds3fvXjjzVlYAKChLbRWxog/0M/R2ofxAhXDmzJlRr/4wq6alRQhsZeLayWjkRRCtWlCGnD59+tqcEBECWPk6ljBFaVYmSIznBGeFUMdrISIE4Kn7BPWshxwlJydH1dTUqC1btlh/X79+XTU1NanJyZQVDvLPScEJIRTLGBEhgZLhoOCAW9u6ujpVVVX1yrMrV66o8+fPm0x1THBUyAyY6pblgQSct8GEBKSiosK6NjQ0qCNHjlj327ZtM50OczRwTiPJ8bATh1gFG0leXp51DYVCM55BZLXt4zsNsYfvfjLZmRxDnzjohYTh4pg0w5zD0vagm8+YmNY+U3PKkBygDv59hCG2Xs291FMX36ZVlyrEpiMGPmKXDdSlwzMRZuzaTC2xoY/YpVb6XEhWAaQyrd2zkLFnU4qok7mPsADcqeaf7KRuxqa11UcBmEkf0bKRurWYEtmU6aX14SN23VpMfWS9mr+y3ouzl85jIqVefGR1prXx6SNJdUtGJH8e+0h+WmX8fJdkRIbTGbS8vNy69vX1xZ/pe/0uDRn2QqTfzwwFBQWqtrZW1ddP15m3b9+Ov9P3eIc2aOtT+r0Q6fFDorq6Wm3fvl0Fg0HrG/3ixYvx97jHM7xDG7T1SabHC5Eur6Pv2LFDbd68WU1MTKjGxkZ16tSpGW3wDO/QBm3Rx4d0eSHS4dUnKisrrfvjx4+rnp7kG4p3aANBHx8+0+GFCErlTtORy8rK4uakSayIxVR1JKwOP3tqAfcreGKDNtrM0NeDdFI3MyKSrEad6plkUlJSYl3b2triz6peRNSucEQVTUUt4B7PtOi2uq+htFA3T3nkkpo+AXSVwsJC6zow8PKwY6PDQZz9mW6r+xrIIHXy9s3OL7Fz8yjnnUt1PuyW2c+q6WPMlPLgwfT/3RQXF7805pyZ1Y/9mW6r+7rITeri7xSFB8on3Wbp7e2d9gvbEWnbglx1OZirBrOzLOAez+I+xLa6r4ucdDvcNqm1Tqjps9ik0t3drcLhsHVgXVo6XWWPBAKqOTeoDuUtsoD7Ef5ShTZoiz7o6yLHqINKiwhP+I4Kfk3W5tatW+rq1avW/f79++NkHD8m5B3aQNAHfVMI5jxqcjJvfBrPA+Wk57+6REHGhiBPIMTq6ASfgDnpnxna29tVc3OzGhoaSkXisJAwKpdm9WcFkEHZgYyNZOckMCfsRGtrayoSnn9WyMgPPSg7kLGR7HSeQHSCY8MnUpjT6/mhJ4HQm/3TmwOhN/vHUAdCvn6eTlY7zRmRuZa3hsj/AgwA2qER3p3SY8gAAAAASUVORK5CYII="
      };
      this.drawFill(context);
    }
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return Sensor;
}(Ellipse);

Component.register('humidity-sensor', Sensor);
scene.Component3d.register('humidity-sensor', HumiditySensor);

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Person = function (_Object3D) {
  _inherits(Person, _Object3D);

  function Person() {
    _classCallCheck(this, Person);

    return _possibleConstructorReturn(this, (Person.__proto__ || Object.getPrototypeOf(Person)).apply(this, arguments));
  }

  _createClass(Person, [{
    key: 'createObject',
    value: function createObject() {
      Person.threedObjectLoader.then(this.addObject.bind(this));
    }
  }, {
    key: 'addObject',
    value: function addObject(extObject) {
      var _model = this.model,
          width = _model.width,
          height = _model.height,
          depth = _model.depth,
          _model$rotation = _model.rotation,
          rotation = _model$rotation === undefined ? 0 : _model$rotation;


      width /= 3.7;
      height /= 3.7;
      depth /= 3.7;

      this.type = 'person';
      var object = extObject.clone();
      this.add(object);
      this.scale.set(width, depth, height);
    }
  }], [{
    key: 'threedObjectLoader',
    get: function get() {
      if (!Person._threedObjectLoader) {
        Person._threedObjectLoader = new Promise(function (resolve, reject) {
          var tgaLoader = new THREE.TGALoader();

          THREE.Loader.Handlers.add(/\.tga$/i, tgaLoader);

          var objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
          var mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

          objLoader.setPath('/obj/Casual_Man_02/');
          mtlLoader.setPath('/obj/Casual_Man_02/');

          mtlLoader.load('Casual_Man.mtl', function (materials) {
            materials.preload();
            objLoader.setMaterials(materials);
            materials.side = THREE.frontSide;

            objLoader.load('Casual_Man.obj', function (obj) {
              var extObj = obj;
              if (extObj && extObj.children && extObj.children.length > 0) {
                extObj = extObj.children[0];
              }

              extObj.geometry.center();
              resolve(extObj);
            });
          });
        });
      }

      return Person._threedObjectLoader;
    }
  }]);

  return Person;
}(_object3d2.default);

exports.default = Person;


scene.Component3d.register('person', Person);

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extrude = __webpack_require__(5);

var _extrude2 = _interopRequireDefault(_extrude);

var _component3d = __webpack_require__(4);

var _component3d2 = _interopRequireDefault(_component3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var RectExtrude = function (_Extrude) {
  _inherits(RectExtrude, _Extrude);

  function RectExtrude() {
    _classCallCheck(this, RectExtrude);

    return _possibleConstructorReturn(this, (RectExtrude.__proto__ || Object.getPrototypeOf(RectExtrude)).apply(this, arguments));
  }

  _createClass(RectExtrude, [{
    key: 'shape',
    get: function get() {
      var _model = this.model,
          width = _model.width,
          height = _model.height,
          round = _model.round;

      var shape = new THREE.Shape();

      if (round > 0) {
        var radius = round / 100 * (width / 2);

        shape.moveTo(radius, 0);
        shape.lineTo(width - radius, 0);
        shape.quadraticCurveTo(width, 0, width, radius);
        shape.lineTo(width, height - radius);
        shape.quadraticCurveTo(width, height, width - radius, height);
        shape.lineTo(radius, height);
        shape.quadraticCurveTo(0, height, 0, height - radius);
        shape.lineTo(0, radius);
        shape.quadraticCurveTo(0, 0, radius, 0);
      } else {
        shape.moveTo(0, 0);
        shape.lineTo(width, 0);
        shape.lineTo(width, height);
        shape.lineTo(0, height);
        shape.lineTo(0, 0);
      }

      return shape;
    }
  }]);

  return RectExtrude;
}(_extrude2.default);

exports.default = RectExtrude;


_component3d2.default.register('rect', RectExtrude);

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// TinyColor v1.4.1
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

(function (Math) {

    var trimLeft = /^\s+/,
        trimRight = /\s+$/,
        tinyCounter = 0,
        mathRound = Math.round,
        mathMin = Math.min,
        mathMax = Math.max,
        mathRandom = Math.random;

    function tinycolor(color, opts) {

        color = color ? color : '';
        opts = opts || {};

        // If input is already a tinycolor, return itself
        if (color instanceof tinycolor) {
            return color;
        }
        // If we are called as a function, call using new instead
        if (!(this instanceof tinycolor)) {
            return new tinycolor(color, opts);
        }

        var rgb = inputToRGB(color);
        this._originalInput = color, this._r = rgb.r, this._g = rgb.g, this._b = rgb.b, this._a = rgb.a, this._roundA = mathRound(100 * this._a) / 100, this._format = opts.format || rgb.format;
        this._gradientType = opts.gradientType;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (this._r < 1) {
            this._r = mathRound(this._r);
        }
        if (this._g < 1) {
            this._g = mathRound(this._g);
        }
        if (this._b < 1) {
            this._b = mathRound(this._b);
        }

        this._ok = rgb.ok;
        this._tc_id = tinyCounter++;
    }

    tinycolor.prototype = {
        isDark: function isDark() {
            return this.getBrightness() < 128;
        },
        isLight: function isLight() {
            return !this.isDark();
        },
        isValid: function isValid() {
            return this._ok;
        },
        getOriginalInput: function getOriginalInput() {
            return this._originalInput;
        },
        getFormat: function getFormat() {
            return this._format;
        },
        getAlpha: function getAlpha() {
            return this._a;
        },
        getBrightness: function getBrightness() {
            //http://www.w3.org/TR/AERT#color-contrast
            var rgb = this.toRgb();
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        },
        getLuminance: function getLuminance() {
            //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
            var rgb = this.toRgb();
            var RsRGB, GsRGB, BsRGB, R, G, B;
            RsRGB = rgb.r / 255;
            GsRGB = rgb.g / 255;
            BsRGB = rgb.b / 255;

            if (RsRGB <= 0.03928) {
                R = RsRGB / 12.92;
            } else {
                R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
            }
            if (GsRGB <= 0.03928) {
                G = GsRGB / 12.92;
            } else {
                G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
            }
            if (BsRGB <= 0.03928) {
                B = BsRGB / 12.92;
            } else {
                B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
            }
            return 0.2126 * R + 0.7152 * G + 0.0722 * B;
        },
        setAlpha: function setAlpha(value) {
            this._a = boundAlpha(value);
            this._roundA = mathRound(100 * this._a) / 100;
            return this;
        },
        toHsv: function toHsv() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
        },
        toHsvString: function toHsvString() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            var h = mathRound(hsv.h * 360),
                s = mathRound(hsv.s * 100),
                v = mathRound(hsv.v * 100);
            return this._a == 1 ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
        },
        toHsl: function toHsl() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
        },
        toHslString: function toHslString() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            var h = mathRound(hsl.h * 360),
                s = mathRound(hsl.s * 100),
                l = mathRound(hsl.l * 100);
            return this._a == 1 ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
        },
        toHex: function toHex(allow3Char) {
            return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function toHexString(allow3Char) {
            return '#' + this.toHex(allow3Char);
        },
        toHex8: function toHex8(allow4Char) {
            return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
        },
        toHex8String: function toHex8String(allow4Char) {
            return '#' + this.toHex8(allow4Char);
        },
        toRgb: function toRgb() {
            return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
        },
        toRgbString: function toRgbString() {
            return this._a == 1 ? "rgb(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" : "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function toPercentageRgb() {
            return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
        },
        toPercentageRgbString: function toPercentageRgbString() {
            return this._a == 1 ? "rgb(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" : "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function toName() {
            if (this._a === 0) {
                return "transparent";
            }

            if (this._a < 1) {
                return false;
            }

            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function toFilter(secondColor) {
            var hex8String = '#' + rgbaToArgbHex(this._r, this._g, this._b, this._a);
            var secondHex8String = hex8String;
            var gradientType = this._gradientType ? "GradientType = 1, " : "";

            if (secondColor) {
                var s = tinycolor(secondColor);
                secondHex8String = '#' + rgbaToArgbHex(s._r, s._g, s._b, s._a);
            }

            return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=" + hex8String + ",endColorstr=" + secondHex8String + ")";
        },
        toString: function toString(format) {
            var formatSet = !!format;
            format = format || this._format;

            var formattedString = false;
            var hasAlpha = this._a < 1 && this._a >= 0;
            var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");

            if (needsAlphaFormat) {
                // Special case for "transparent", all other non-alpha formats
                // will return rgba when there is transparency.
                if (format === "name" && this._a === 0) {
                    return this.toName();
                }
                return this.toRgbString();
            }
            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "prgb") {
                formattedString = this.toPercentageRgbString();
            }
            if (format === "hex" || format === "hex6") {
                formattedString = this.toHexString();
            }
            if (format === "hex3") {
                formattedString = this.toHexString(true);
            }
            if (format === "hex4") {
                formattedString = this.toHex8String(true);
            }
            if (format === "hex8") {
                formattedString = this.toHex8String();
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }

            return formattedString || this.toHexString();
        },
        clone: function clone() {
            return tinycolor(this.toString());
        },

        _applyModification: function _applyModification(fn, args) {
            var color = fn.apply(null, [this].concat([].slice.call(args)));
            this._r = color._r;
            this._g = color._g;
            this._b = color._b;
            this.setAlpha(color._a);
            return this;
        },
        lighten: function lighten() {
            return this._applyModification(_lighten, arguments);
        },
        brighten: function brighten() {
            return this._applyModification(_brighten, arguments);
        },
        darken: function darken() {
            return this._applyModification(_darken, arguments);
        },
        desaturate: function desaturate() {
            return this._applyModification(_desaturate, arguments);
        },
        saturate: function saturate() {
            return this._applyModification(_saturate, arguments);
        },
        greyscale: function greyscale() {
            return this._applyModification(_greyscale, arguments);
        },
        spin: function spin() {
            return this._applyModification(_spin, arguments);
        },

        _applyCombination: function _applyCombination(fn, args) {
            return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function analogous() {
            return this._applyCombination(_analogous, arguments);
        },
        complement: function complement() {
            return this._applyCombination(_complement, arguments);
        },
        monochromatic: function monochromatic() {
            return this._applyCombination(_monochromatic, arguments);
        },
        splitcomplement: function splitcomplement() {
            return this._applyCombination(_splitcomplement, arguments);
        },
        triad: function triad() {
            return this._applyCombination(_triad, arguments);
        },
        tetrad: function tetrad() {
            return this._applyCombination(_tetrad, arguments);
        }
    };

    // If input is an object, force 1 into "1.0" to handle ratios properly
    // String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function (color, opts) {
        if ((typeof color === "undefined" ? "undefined" : _typeof(color)) == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) {
                    if (i === "a") {
                        newColor[i] = color[i];
                    } else {
                        newColor[i] = convertToPercentage(color[i]);
                    }
                }
            }
            color = newColor;
        }

        return tinycolor(color, opts);
    };

    // Given a string or object, convert that input to RGB
    // Possible string inputs:
    //
    //     "red"
    //     "#f00" or "f00"
    //     "#ff0000" or "ff0000"
    //     "#ff000000" or "ff000000"
    //     "rgb 255 0 0" or "rgb (255, 0, 0)"
    //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
    //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
    //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
    //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
    //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
    //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
    //
    function inputToRGB(color) {

        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var s = null;
        var v = null;
        var l = null;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if ((typeof color === "undefined" ? "undefined" : _typeof(color)) == "object") {
            if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
                s = convertToPercentage(color.s);
                v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, s, v);
                ok = true;
                format = "hsv";
            } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
                s = convertToPercentage(color.s);
                l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, s, l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }

    // Conversion Functions
    // --------------------

    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

    // `rgbToRgb`
    // Handle bounds / percentage checking to conform to CSS color spec
    // <http://www.w3.org/TR/css3-color/>
    // *Assumes:* r, g, b in [0, 255] or [0, 1]
    // *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b) {
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b),
            min = mathMin(r, g, b);
        var h,
            s,
            l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);break;
                case g:
                    h = (b - r) / d + 2;break;
                case b:
                    h = (r - g) / d + 4;break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    // `hslToRgb`
    // Converts an HSL color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b),
            min = mathMin(r, g, b);
        var h,
            s,
            v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);break;
                case g:
                    h = (b - r) / d + 2;break;
                case b:
                    h = (r - g) / d + 4;break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }

    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hsvToRgb(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = Math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHex`
    // Converts an RGB color to hex
    // Assumes r, g, and b are contained in the set [0, 255]
    // Returns a 3 or 6 character hex
    function rgbToHex(r, g, b, allow3Char) {

        var hex = [pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16))];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }

    // `rgbaToHex`
    // Converts an RGBA color plus alpha transparency to hex
    // Assumes r, g, b are contained in the set [0, 255] and
    // a in [0, 1]. Returns a 4 or 8 character rgba hex
    function rgbaToHex(r, g, b, a, allow4Char) {

        var hex = [pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16)), pad2(convertDecimalToHex(a))];

        // Return a 4 character hex if possible
        if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
        }

        return hex.join("");
    }

    // `rgbaToArgbHex`
    // Converts an RGBA color to an ARGB Hex8 string
    // Rarely used, but required for "toFilter()"
    function rgbaToArgbHex(r, g, b, a) {

        var hex = [pad2(convertDecimalToHex(a)), pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16))];

        return hex.join("");
    }

    // `equals`
    // Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) {
            return false;
        }
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
    };

    tinycolor.random = function () {
        return tinycolor.fromRatio({
            r: mathRandom(),
            g: mathRandom(),
            b: mathRandom()
        });
    };

    // Modification Functions
    // ----------------------
    // Thanks to less.js for some of the basics here
    // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

    function _desaturate(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function _saturate(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function _greyscale(color) {
        return tinycolor(color).desaturate(100);
    }

    function _lighten(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    function _brighten(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var rgb = tinycolor(color).toRgb();
        rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * -(amount / 100))));
        rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * -(amount / 100))));
        rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * -(amount / 100))));
        return tinycolor(rgb);
    }

    function _darken(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
    // Values outside of this range will be wrapped into this range.
    function _spin(color, amount) {
        var hsl = tinycolor(color).toHsl();
        var hue = (hsl.h + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return tinycolor(hsl);
    }

    // Combination Functions
    // ---------------------
    // Thanks to jQuery xColor for some of the ideas behind these
    // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

    function _complement(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
    }

    function _triad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [tinycolor(color), tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })];
    }

    function _tetrad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [tinycolor(color), tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })];
    }

    function _splitcomplement(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [tinycolor(color), tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l })];
    }

    function _analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;

        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];

        for (hsl.h = (hsl.h - (part * results >> 1) + 720) % 360; --results;) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(tinycolor(hsl));
        }
        return ret;
    }

    function _monochromatic(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h,
            s = hsv.s,
            v = hsv.v;
        var ret = [];
        var modification = 1 / results;

        while (results--) {
            ret.push(tinycolor({ h: h, s: s, v: v }));
            v = (v + modification) % 1;
        }

        return ret;
    }

    // Utility Functions
    // ---------------------

    tinycolor.mix = function (color1, color2, amount) {
        amount = amount === 0 ? 0 : amount || 50;

        var rgb1 = tinycolor(color1).toRgb();
        var rgb2 = tinycolor(color2).toRgb();

        var p = amount / 100;

        var rgba = {
            r: (rgb2.r - rgb1.r) * p + rgb1.r,
            g: (rgb2.g - rgb1.g) * p + rgb1.g,
            b: (rgb2.b - rgb1.b) * p + rgb1.b,
            a: (rgb2.a - rgb1.a) * p + rgb1.a
        };

        return tinycolor(rgba);
    };

    // Readability Functions
    // ---------------------
    // <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

    // `contrast`
    // Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
    tinycolor.readability = function (color1, color2) {
        var c1 = tinycolor(color1);
        var c2 = tinycolor(color2);
        return (Math.max(c1.getLuminance(), c2.getLuminance()) + 0.05) / (Math.min(c1.getLuminance(), c2.getLuminance()) + 0.05);
    };

    // `isReadable`
    // Ensure that foreground and background color combinations meet WCAG2 guidelines.
    // The third argument is an optional Object.
    //      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
    //      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
    // If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

    // *Example*
    //    tinycolor.isReadable("#000", "#111") => false
    //    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
    tinycolor.isReadable = function (color1, color2, wcag2) {
        var readability = tinycolor.readability(color1, color2);
        var wcag2Parms, out;

        out = false;

        wcag2Parms = validateWCAG2Parms(wcag2);
        switch (wcag2Parms.level + wcag2Parms.size) {
            case "AAsmall":
            case "AAAlarge":
                out = readability >= 4.5;
                break;
            case "AAlarge":
                out = readability >= 3;
                break;
            case "AAAsmall":
                out = readability >= 7;
                break;
        }
        return out;
    };

    // `mostReadable`
    // Given a base color and a list of possible foreground or background
    // colors for that base, returns the most readable color.
    // Optionally returns Black or White if the most readable color is unreadable.
    // *Example*
    //    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
    //    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
    //    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
    //    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
    tinycolor.mostReadable = function (baseColor, colorList, args) {
        var bestColor = null;
        var bestScore = 0;
        var readability;
        var includeFallbackColors, level, size;
        args = args || {};
        includeFallbackColors = args.includeFallbackColors;
        level = args.level;
        size = args.size;

        for (var i = 0; i < colorList.length; i++) {
            readability = tinycolor.readability(baseColor, colorList[i]);
            if (readability > bestScore) {
                bestScore = readability;
                bestColor = tinycolor(colorList[i]);
            }
        }

        if (tinycolor.isReadable(baseColor, bestColor, { "level": level, "size": size }) || !includeFallbackColors) {
            return bestColor;
        } else {
            args.includeFallbackColors = false;
            return tinycolor.mostReadable(baseColor, ["#fff", "#000"], args);
        }
    };

    // Big List of Colors
    // ------------------
    // <http://www.w3.org/TR/css3-color/#svg-color>
    var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

    // Make it easy to access colors via `hexNames[hex]`
    var hexNames = tinycolor.hexNames = flip(names);

    // Utilities
    // ---------

    // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
    function flip(o) {
        var flipped = {};
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

    // Return a valid alpha value [0,1] with all invalid values being set to 1
    function boundAlpha(a) {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

    // Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        if (isOnePointZero(n)) {
            n = "100%";
        }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if (Math.abs(n - max) < 0.000001) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return n % max / parseFloat(max);
    }

    // Force a number between 0 and 1
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

    // Parse a base-16 hex value into a base-10 integer
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

    // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
    // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    // Check to see if string passed in is a percentage
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

    // Force a hex value to have 2 characters
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

    // Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        if (n <= 1) {
            n = n * 100 + "%";
        }

        return n;
    }

    // Converts a decimal to a hex value
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
    // Converts a hex value to a decimal
    function convertHexToDecimal(h) {
        return parseIntFromHex(h) / 255;
    }

    var matchers = function () {

        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            CSS_UNIT: new RegExp(CSS_UNIT),
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
            hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    }();

    // `isValidCSSUnit`
    // Take in a single string / number and check to see if it looks like a CSS unit
    // (see `matchers` above for definition).
    function isValidCSSUnit(color) {
        return !!matchers.CSS_UNIT.exec(color);
    }

    // `stringInputToObject`
    // Permissive string parsing.  Take in a number of formats, and output an object
    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {

        color = color.replace(trimLeft, '').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        } else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if (match = matchers.rgb.exec(color)) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if (match = matchers.rgba.exec(color)) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if (match = matchers.hsl.exec(color)) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if (match = matchers.hsla.exec(color)) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if (match = matchers.hsv.exec(color)) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if (match = matchers.hsva.exec(color)) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        if (match = matchers.hex8.exec(color)) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                a: convertHexToDecimal(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if (match = matchers.hex6.exec(color)) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if (match = matchers.hex4.exec(color)) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                a: convertHexToDecimal(match[4] + '' + match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if (match = matchers.hex3.exec(color)) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    function validateWCAG2Parms(parms) {
        // return valid WCAG2 parms for isReadable.
        // If input parms are invalid, return {"level":"AA", "size":"small"}
        var level, size;
        parms = parms || { "level": "AA", "size": "small" };
        level = (parms.level || "AA").toUpperCase();
        size = (parms.size || "small").toLowerCase();
        if (level !== "AA" && level !== "AAA") {
            level = "AA";
        }
        if (size !== "small" && size !== "large") {
            size = "small";
        }
        return { "level": level, "size": size };
    }

    // Node: Export function
    if (typeof module !== "undefined" && module.exports) {
        module.exports = tinycolor;
    }
    // AMD/requirejs: Define the module
    else if (true) {
            !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
                return tinycolor;
            }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        }
        // Browser: Expose to window
        else {
                window.tinycolor = tinycolor;
            }
})(Math);

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* from https://bl.ocks.org/sfpgmr/61fe805bb2a72bda86eff955838fda94 */

var BoundUVGenerator = function () {
  function BoundUVGenerator() {
    _classCallCheck(this, BoundUVGenerator);
  }

  _createClass(BoundUVGenerator, [{
    key: "setShape",
    value: function setShape(_ref) {
      var extrudedShape = _ref.extrudedShape,
          extrudedOptions = _ref.extrudedOptions;

      this.extrudedShape = extrudedShape;
      this.bb = new THREE.Box2();

      this.bb.setFromPoints(this.extrudedShape.extractPoints().shape);
      this.extrudedOptions = extrudedOptions;
    }
  }, {
    key: "generateTopUV",
    value: function generateTopUV(geometry, vertices, indexA, indexB, indexC) {
      var ax = vertices[indexA * 3],
          ay = vertices[indexA * 3 + 1],
          bx = vertices[indexB * 3],
          by = vertices[indexB * 3 + 1],
          cx = vertices[indexC * 3],
          cy = vertices[indexC * 3 + 1],
          bb = this.bb,
          //extrudedShape.getBoundingBox(),
      bbx = bb.max.x - bb.min.x,
          bby = bb.max.y - bb.min.y;

      return [new THREE.Vector2((ax - bb.min.x) / bbx, 1.0 - (ay - bb.min.y) / bby), new THREE.Vector2((bx - bb.min.x) / bbx, 1.0 - (by - bb.min.y) / bby), new THREE.Vector2((cx - bb.min.x) / bbx, 1.0 - (cy - bb.min.y) / bby)];
    }
  }, {
    key: "generateSideWallUV",
    value: function generateSideWallUV(geometry, vertices, indexA, indexB, indexC, indexD) {
      var ax = vertices[indexA * 3],
          ay = vertices[indexA * 3 + 1],
          az = vertices[indexA * 3 + 2],
          bx = vertices[indexB * 3],
          by = vertices[indexB * 3 + 1],
          bz = vertices[indexB * 3 + 2],
          cx = vertices[indexC * 3],
          cy = vertices[indexC * 3 + 1],
          cz = vertices[indexC * 3 + 2],
          dx = vertices[indexD * 3],
          dy = vertices[indexD * 3 + 1],
          dz = vertices[indexD * 3 + 2];

      var amt = this.extrudedOptions.amount,
          bb = this.bb,
          //extrudedShape.getBoundingBox(),
      bbx = bb.max.x - bb.min.x,
          bby = bb.max.y - bb.min.y;

      if (Math.abs(ay - by) < 0.01) {
        return [new THREE.Vector2(ax / bbx, 1.0 - az / amt), new THREE.Vector2(bx / bbx, 1.0 - bz / amt), new THREE.Vector2(cx / bbx, 1.0 - cz / amt), new THREE.Vector2(dx / bbx, 1.0 - dz / amt)];
      } else {
        return [new THREE.Vector2(ay / bby, 1.0 - az / amt), new THREE.Vector2(by / bby, 1.0 - bz / amt), new THREE.Vector2(cy / bby, 1.0 - cz / amt), new THREE.Vector2(dy / bby, 1.0 - dz / amt)];
      }
    }
  }]);

  return BoundUVGenerator;
}();

exports.default = BoundUVGenerator;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Wall2d = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mesh = __webpack_require__(15);

var _mesh2 = _interopRequireDefault(_mesh);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var _scene = scene,
    Component = _scene.Component,
    Rect = _scene.Rect;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]
};

var Wall = function (_Mesh) {
  _inherits(Wall, _Mesh);

  function Wall(model, canvasSize) {
    _classCallCheck(this, Wall);

    var _this = _possibleConstructorReturn(this, (Wall.__proto__ || Object.getPrototypeOf(Wall)).call(this, model));

    _this.createObject(canvasSize);
    return _this;
  }

  _createClass(Wall, [{
    key: 'createObject',
    value: function createObject(canvasSize) {
      var _model = this.model,
          type = _model.type,
          left = _model.left,
          top = _model.top,
          width = _model.width,
          height = _model.height,
          _model$depth = _model.depth,
          depth = _model$depth === undefined ? 1 : _model$depth,
          _model$rotation = _model.rotation,
          rotation = _model$rotation === undefined ? 0 : _model$rotation,
          _model$zPos = _model.zPos,
          zPos = _model$zPos === undefined ? 0 : _model$zPos,
          _model$alpha = _model.alpha,
          alpha = _model$alpha === undefined ? 1 : _model$alpha;


      var cx = left + width / 2 - canvasSize.width / 2;
      var cy = top + height / 2 - canvasSize.height / 2;
      var cz = zPos + 0.5 * depth;

      this.type = type;

      this.createWall(width, height, depth);

      this.position.set(cx, cz, cy);
      this.rotation.y = rotation;

      this.material.opacity = alpha;
      this.material.transparent = alpha < 1;
    }
  }, {
    key: 'createWall',
    value: function createWall(w, h, d) {
      var _model$fillStyle = this.model.fillStyle,
          fillStyle = _model$fillStyle === undefined ? 'gray' : _model$fillStyle;


      this.geometry = new THREE.BoxBufferGeometry(w, d, h);
      this.material = new THREE.MeshLambertMaterial({ color: fillStyle, side: THREE.FrontSide });

      // this.castShadow = true
    }
  }, {
    key: 'raycast',
    value: function raycast(raycaster, intersects) {}
  }]);

  return Wall;
}(_mesh2.default);

exports.default = Wall;

var Wall2d = exports.Wall2d = function (_Rect) {
  _inherits(Wall2d, _Rect);

  function Wall2d() {
    _classCallCheck(this, Wall2d);

    return _possibleConstructorReturn(this, (Wall2d.__proto__ || Object.getPrototypeOf(Wall2d)).apply(this, arguments));
  }

  _createClass(Wall2d, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }, {
    key: 'controls',
    get: function get() {}
  }]);

  return Wall2d;
}(Rect);

Component.register('wall', Wall2d);
scene.Component3d.register('wall', Wall);

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var _scene = scene,
    Component = _scene.Component,
    Rect = _scene.Rect;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }, {
    type: 'checkbox',
    label: 'show-axis',
    name: 'showAxis',
    property: 'showAxis'
  }]
};

var Cube = function (_THREE$Mesh) {
  _inherits(Cube, _THREE$Mesh);

  function Cube(model, canvasSize, visualizer) {
    _classCallCheck(this, Cube);

    var _this = _possibleConstructorReturn(this, (Cube.__proto__ || Object.getPrototypeOf(Cube)).call(this));

    _this._model = model;
    _this._visualizer = visualizer;

    _this.createObject(model, canvasSize);

    _this.updateMatrixWorld();

    if (model.showAxis) {
      var axisHelper = new THREE.AxesHelper(100);
      _this.add(axisHelper);
    }

    return _this;
  }

  _createClass(Cube, [{
    key: 'createObject',
    value: function createObject(model, canvasSize) {

      var cx = model.left + model.width / 2 - canvasSize.width / 2;
      var cy = model.top + model.height / 2 - canvasSize.height / 2;
      var cz = model.zPos || 0.5 * model.depth;

      var rotation = model.rotation;
      this.type = model.type;

      this.createCube(model.width, model.height, model.depth);

      this.position.set(cx, cz, cy);
      this.rotation.y = rotation || 0;
    }
  }, {
    key: 'createCube',
    value: function createCube(w, h, d) {
      var _model$fillStyle = this.model.fillStyle,
          fillStyle = _model$fillStyle === undefined ? 'lightgray' : _model$fillStyle;


      this.geometry = new THREE.BoxBufferGeometry(w, d, h);
      this.material = new THREE.MeshLambertMaterial({ color: fillStyle, side: THREE.FrontSide });
    }
  }, {
    key: 'model',
    get: function get() {
      return this._model;
    }
  }, {
    key: 'mixer',
    get: function get() {
      if (!this._mixer) {
        this._mixer = new THREE.AnimationMixer(this);
        this._visualizer.mixers.push(this._mixer);
      }

      return this._mixer;
    }
  }]);

  return Cube;
}(THREE.Mesh);

exports.default = Cube;

var Cube2d = exports.Cube2d = function (_Rect) {
  _inherits(Cube2d, _Rect);

  function Cube2d() {
    _classCallCheck(this, Cube2d);

    return _possibleConstructorReturn(this, (Cube2d.__proto__ || Object.getPrototypeOf(Cube2d)).apply(this, arguments));
  }

  _createClass(Cube2d, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'controls',
    get: function get() {}
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return Cube2d;
}(Rect);

Component.register('cube', Cube2d);
scene.Component3d.register('cube', Cube);

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var _scene = scene,
    Component = _scene.Component,
    Ellipse = _scene.Ellipse;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'rz',
    property: 'rz'
  }]
};

var Cylinder = function (_THREE$Mesh) {
  _inherits(Cylinder, _THREE$Mesh);

  function Cylinder(model, canvasSize) {
    _classCallCheck(this, Cylinder);

    var _this = _possibleConstructorReturn(this, (Cylinder.__proto__ || Object.getPrototypeOf(Cylinder)).call(this));

    _this._model = model;

    _this.createObject(model, canvasSize);

    return _this;
  }

  _createClass(Cylinder, [{
    key: 'createObject',
    value: function createObject(model, canvasSize) {

      var cx = model.cx - canvasSize.width / 2;
      var cy = model.cy - canvasSize.height / 2;
      var cz = this.model.rz / 2;

      var rotation = model.rotation;
      this.type = model.type;

      this.createCylinder(this.model.rx, this.model.rz);

      this.position.set(cx, cz, cy); // z좌표는 땅에 붙어있게 함
      this.rotation.y = rotation || 0;
    }
  }, {
    key: 'createCylinder',
    value: function createCylinder(rx, rz) {
      var _model$fillStyle = this.model.fillStyle,
          fillStyle = _model$fillStyle === undefined ? 'lightgray' : _model$fillStyle;


      this.geometry = new THREE.CylinderBufferGeometry(rx, rx, rz, 25);
      this.material = new THREE.MeshLambertMaterial({ color: fillStyle, side: THREE.FrontSide });

      // this.castShadow = true
    }
  }, {
    key: 'model',
    get: function get() {
      return this._model;
    }
  }]);

  return Cylinder;
}(THREE.Mesh);

exports.default = Cylinder;

var Cylinder2d = exports.Cylinder2d = function (_Ellipse) {
  _inherits(Cylinder2d, _Ellipse);

  function Cylinder2d() {
    _classCallCheck(this, Cylinder2d);

    return _possibleConstructorReturn(this, (Cylinder2d.__proto__ || Object.getPrototypeOf(Cylinder2d)).apply(this, arguments));
  }

  _createClass(Cylinder2d, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'controls',
    get: function get() {}
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return Cylinder2d;
}(Ellipse);

Component.register('cylinder', Cylinder2d);
scene.Component3d.register('cylinder', Cylinder);

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var _scene = scene,
    Component = _scene.Component,
    Ellipse = _scene.Ellipse;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'rz',
    property: 'rz'
  }]
};

var Sphere = function (_THREE$Mesh) {
  _inherits(Sphere, _THREE$Mesh);

  function Sphere(model, canvasSize, visualizer) {
    _classCallCheck(this, Sphere);

    var _this = _possibleConstructorReturn(this, (Sphere.__proto__ || Object.getPrototypeOf(Sphere)).call(this));

    _this._model = model;
    _this._visualizer = visualizer;

    _this.createObject(model, canvasSize);

    return _this;
  }

  _createClass(Sphere, [{
    key: 'createObject',
    value: function createObject(model, canvasSize) {
      var _model = this.model,
          _model$cx = _model.cx,
          cx = _model$cx === undefined ? 0 : _model$cx,
          _model$cy = _model.cy,
          cy = _model$cy === undefined ? 0 : _model$cy,
          _model$zPos = _model.zPos,
          zPos = _model$zPos === undefined ? 0 : _model$zPos,
          _model$rx = _model.rx,
          rx = _model$rx === undefined ? 0 : _model$rx;


      cx -= canvasSize.width / 2;
      cy -= canvasSize.height / 2;
      var cz = zPos + rx;

      var rotation = model.rotation;
      this.type = model.type;

      this.createSphere(rx);

      this.position.set(cx, cz, cy); // z좌표는 땅에 붙어있게 함
      this.rotation.y = -rotation || 0;
    }
  }, {
    key: 'createSphere',
    value: function createSphere(rx) {
      var _model$fillStyle = this.model.fillStyle,
          fillStyle = _model$fillStyle === undefined ? 'lightgray' : _model$fillStyle;


      this.geometry = new THREE.SphereBufferGeometry(rx, 20, 20);
      this.material = new THREE.MeshLambertMaterial({
        color: fillStyle,
        side: THREE.FrontSide
      });

      // this.castShadow = true
    }
  }, {
    key: 'model',
    get: function get() {
      return this._model;
    }
  }]);

  return Sphere;
}(THREE.Mesh);

exports.default = Sphere;

var Sphere2d = exports.Sphere2d = function (_Ellipse) {
  _inherits(Sphere2d, _Ellipse);

  function Sphere2d() {
    _classCallCheck(this, Sphere2d);

    return _possibleConstructorReturn(this, (Sphere2d.__proto__ || Object.getPrototypeOf(Sphere2d)).apply(this, arguments));
  }

  _createClass(Sphere2d, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'controls',
    get: function get() {}
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return Sphere2d;
}(Ellipse);

Component.register('sphere', Sphere2d);
scene.Component3d.register('sphere', Sphere);

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var _scene = scene,
    Component = _scene.Component,
    Ellipse = _scene.Ellipse;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'rz',
    property: 'rz'
  }]
};

var Cone = function (_THREE$Mesh) {
  _inherits(Cone, _THREE$Mesh);

  function Cone(model, canvasSize) {
    _classCallCheck(this, Cone);

    var _this = _possibleConstructorReturn(this, (Cone.__proto__ || Object.getPrototypeOf(Cone)).call(this));

    _this._model = model;

    _this.createObject(model, canvasSize);

    return _this;
  }

  _createClass(Cone, [{
    key: 'createObject',
    value: function createObject(model, canvasSize) {

      var cx = model.cx - canvasSize.width / 2;
      var cy = model.cy - canvasSize.height / 2;
      var cz = this.model.rx;

      var rotation = model.rotation;
      this.type = model.type;

      this.createCone(this.model.rx, this.model.rz);

      this.position.set(cx, cz, cy); // z좌표는 땅에 붙어있게 함
      this.rotation.y = rotation || 0;
    }
  }, {
    key: 'createCone',
    value: function createCone(rx, rz) {
      var _model$fillStyle = this.model.fillStyle,
          fillStyle = _model$fillStyle === undefined ? 'lightgray' : _model$fillStyle;


      this.geometry = new THREE.ConeBufferGeometry(rx, rz, 20);
      this.material = new THREE.MeshLambertMaterial({
        color: fillStyle,
        side: THREE.FrontSide
      });

      // this.castShadow = true
    }
  }, {
    key: 'setEuler',
    value: function setEuler(euler) {
      var yaw = euler.yaw,
          pitch = euler.pitch,
          roll = euler.roll;


      this.setRotationFromEuler(new THREE.Vector3(roll, pitch, yaw));
    }
  }, {
    key: 'setQuaternion',
    value: function setQuaternion(quaternion) {
      var x = quaternion.x,
          y = quaternion.y,
          z = quaternion.z,
          w = quaternion.w;


      this.setRotationFromQuaternion(new THREE.Quaternion(x, y, z, w));
    }
  }, {
    key: 'model',
    get: function get() {
      return this._model;
    }
  }]);

  return Cone;
}(THREE.Mesh);

exports.default = Cone;

var Cone2d = exports.Cone2d = function (_Ellipse) {
  _inherits(Cone2d, _Ellipse);

  function Cone2d() {
    _classCallCheck(this, Cone2d);

    return _possibleConstructorReturn(this, (Cone2d.__proto__ || Object.getPrototypeOf(Cone2d)).apply(this, arguments));
  }

  _createClass(Cone2d, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'controls',
    get: function get() {}
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return Cone2d;
}(Ellipse);

Component.register('cone', Cone2d);
scene.Component3d.register('cone', Cone);

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Banner2d = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var _scene = scene,
    Component = _scene.Component,
    ImageView = _scene.ImageView,
    Component3d = _scene.Component3d;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'z-pos',
    name: 'zPos',
    property: 'zPos'
  }, {
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }, {
    type: 'number',
    label: 'rotation',
    name: 'rotation',
    property: 'rotation'
  }, {
    type: 'color',
    label: 'box-color',
    name: 'boxColor',
    property: 'boxColor'
  }]
};

var Banner = function (_Object3D) {
  _inherits(Banner, _Object3D);

  function Banner() {
    _classCallCheck(this, Banner);

    return _possibleConstructorReturn(this, (Banner.__proto__ || Object.getPrototypeOf(Banner)).apply(this, arguments));
  }

  _createClass(Banner, [{
    key: 'createObject',
    value: function createObject(canvasSize) {
      var _model = this.model,
          type = _model.type,
          _model$width = _model.width,
          width = _model$width === undefined ? 1 : _model$width,
          _model$height = _model.height,
          height = _model$height === undefined ? 1 : _model$height,
          _model$depth = _model.depth,
          depth = _model$depth === undefined ? 1 : _model$depth;


      this.add(this.createCube(width, height, depth));
      var textureBoard = this.createTextureBoard(width, depth);
      this.add(textureBoard);
      textureBoard.position.set(0, 0, 0.5 * height);

      this.type = type;
    }
  }, {
    key: 'createCube',
    value: function createCube(w, h, d) {
      var _model$boxColor = this.model.boxColor,
          boxColor = _model$boxColor === undefined ? '#ccaa76' : _model$boxColor;


      var geometry = new THREE.BoxBufferGeometry(w, d, h);
      var material = new THREE.MeshLambertMaterial({ color: boxColor, side: THREE.FrontSide });

      var cube = new THREE.Mesh(geometry, material);

      return cube;
    }
  }, {
    key: 'createTextureBoard',
    value: function createTextureBoard(w, h) {

      var boardMaterial;
      var self = this;

      var _model$fillStyle = this.model.fillStyle,
          fillStyle = _model$fillStyle === undefined ? '#ccaa76' : _model$fillStyle;


      if (fillStyle && fillStyle.type == 'pattern' && fillStyle.image) {

        var texture = this._visualizer._textureLoader.load(this._visualizer.app.url(fillStyle.image), function () {
          self._visualizer.render_threed();
        });
        // texture.wrapS = THREE.RepeatWrapping
        // texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(1, 1);
        texture.minFilter = THREE.LinearFilter;

        boardMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
      } else {
        boardMaterial = new THREE.MeshLambertMaterial({ color: fillStyle || '#ccaa76', side: THREE.FrontSide });
      }

      var boardGeometry = new THREE.PlaneBufferGeometry(w, h, 1, 1);
      var board = new THREE.Mesh(boardGeometry, boardMaterial);

      return board;
    }
  }]);

  return Banner;
}(_object3d2.default);

exports.default = Banner;

var Banner2d = exports.Banner2d = function (_ImageView) {
  _inherits(Banner2d, _ImageView);

  function Banner2d() {
    _classCallCheck(this, Banner2d);

    return _possibleConstructorReturn(this, (Banner2d.__proto__ || Object.getPrototypeOf(Banner2d)).apply(this, arguments));
  }

  _createClass(Banner2d, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return Banner2d;
}(ImageView);

Component.register('banner', Banner2d);
Component3d.register('banner', Banner);

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Desk2d = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var _scene = scene,
    Component = _scene.Component,
    Rect = _scene.Rect;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }, {
    type: 'color',
    label: 'leg-color',
    name: 'legColor',
    property: 'legColor'
  }]
};

var Desk = function (_Object3D) {
  _inherits(Desk, _Object3D);

  function Desk() {
    _classCallCheck(this, Desk);

    return _possibleConstructorReturn(this, (Desk.__proto__ || Object.getPrototypeOf(Desk)).apply(this, arguments));
  }

  _createClass(Desk, [{
    key: 'createObject',
    value: function createObject() {
      var _model = this.model,
          left = _model.left,
          top = _model.top,
          width = _model.width,
          height = _model.height,
          depth = _model.depth;


      var legs = this.createDeskLegs(width, height, depth);
      this.add(legs);

      top = depth / 2 - this.boardThickness;
      var board = this.createDeskBoard(width, height);
      board.position.set(0, top, 0);
      board.rotation.x = Math.PI / 2;

      this.add(board);
    }
  }, {
    key: 'createDeskLegs',
    value: function createDeskLegs(w, h, d) {

      var legThickness = this.legThickness;
      var margin = this.margin;
      d = d - this.boardThickness;

      var legs = new THREE.Group();
      var posX = w / 2 - legThickness / 2 - margin;
      var posY = h / 2 - legThickness / 2 - margin;
      var posZ = -1;

      for (var i = 0; i < 4; i++) {
        var geometry = new THREE.BoxBufferGeometry(legThickness, d, legThickness);
        var material = new THREE.MeshLambertMaterial({
          color: this.model.legColor || '#252525'
        });
        var leg = new THREE.Mesh(geometry, material);
        switch (i) {
          case 0:
            leg.position.set(posX, posZ, posY);
            break;
          case 1:
            leg.position.set(posX, posZ, -posY);
            break;
          case 2:
            leg.position.set(-posX, posZ, posY);
            break;
          case 3:
            leg.position.set(-posX, posZ, -posY);
            break;
        }

        legs.add(leg);
      }

      return legs;
    }
  }, {
    key: 'createDeskBoard',
    value: function createDeskBoard(w, h) {

      var d = 10;

      var boardMaterial = new THREE.MeshLambertMaterial({
        color: this.model.fillStyle || '#ccaa76'
      });
      var boardGeometry = new THREE.BoxBufferGeometry(w, h, d, 1, 1);
      var board = new THREE.Mesh(boardGeometry, boardMaterial);

      return board;
    }
  }, {
    key: 'onchange',
    value: function onchange(after, before) {
      if (after.hasOwnProperty("data")) {
        this.data = after.data;
      }
    }
  }, {
    key: 'boardThickness',
    get: function get() {
      var depth = this.model.depth;


      return Math.min(10, depth / 10);
    }
  }, {
    key: 'legThickness',
    get: function get() {
      var _model2 = this.model,
          width = _model2.width,
          height = _model2.height;


      var min = Math.min(width, height);

      return Math.min(10, min / 10);
    }
  }, {
    key: 'margin',
    get: function get() {
      return Math.min(this.legThickness / 5, 2);
    }
  }]);

  return Desk;
}(_object3d2.default);

exports.default = Desk;

var Desk2d = exports.Desk2d = function (_Rect) {
  _inherits(Desk2d, _Rect);

  function Desk2d() {
    _classCallCheck(this, Desk2d);

    return _possibleConstructorReturn(this, (Desk2d.__proto__ || Object.getPrototypeOf(Desk2d)).apply(this, arguments));
  }

  _createClass(Desk2d, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'controls',
    get: function get() {}
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return Desk2d;
}(Rect);

Component.register('desk', Desk2d);
scene.Component3d.register('desk', Desk);

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var _scene = scene,
    Component3d = _scene.Component3d;


var STATUS_COLORS = ['#6666ff', '#ccccff', '#ffcccc', '#cc3300'];

var Beacon3D = function (_Object3D) {
  _inherits(Beacon3D, _Object3D);

  function Beacon3D() {
    _classCallCheck(this, Beacon3D);

    return _possibleConstructorReturn(this, (Beacon3D.__proto__ || Object.getPrototypeOf(Beacon3D)).apply(this, arguments));
  }

  _createClass(Beacon3D, [{
    key: 'createObject',
    value: function createObject() {
      var _model = this.model,
          width = _model.width,
          height = _model.height,
          location = _model.location;


      var rx = Math.min(width, height);

      this.type = 'beacon';

      if (location) this.name = location;

      for (var i = 0; i < 3; i++) {
        var mesh = this.createSensor(rx * (1 + 0.5 * i) / 2, i);
        mesh.material.opacity = 0.5 - i * 0.15;
      }
    }
  }, {
    key: 'createSensor',
    value: function createSensor(w, i) {

      var isFirst = i === 0;

      var geometry = new THREE.SphereBufferGeometry(w, 32, 32);
      var material;
      if (isFirst) {
        material = new THREE.MeshLambertMaterial({ color: '#57a1d6', side: THREE.FrontSide });
      } else {
        material = new THREE.MeshBasicMaterial({ color: '#57a1d6', side: THREE.FrontSide, wireframe: true, wireframeLinewidth: 1 });
      }

      var mesh = new THREE.Mesh(geometry, material);
      mesh.material.transparent = true;

      this.add(mesh);

      return mesh;
    }
  }, {
    key: 'cz',
    get: function get() {
      var _model2 = this.model,
          _model2$width = _model2.width,
          width = _model2$width === undefined ? 0 : _model2$width,
          _model2$height = _model2.height,
          height = _model2$height === undefined ? 0 : _model2$height,
          _model2$zPos = _model2.zPos,
          zPos = _model2$zPos === undefined ? 0 : _model2$zPos;


      var rx = Math.min(width, height);

      if (!this._cz) this._cz = zPos + rx;

      return this._cz;
    }
  }]);

  return Beacon3D;
}(_object3d2.default);

exports.default = Beacon3D;


Component3d.register('beacon', Beacon3D);

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pallet2d = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var extObj;
var initDone = false;

var _scene = scene,
    RectPath = _scene.RectPath,
    Shape = _scene.Shape,
    Component = _scene.Component,
    Component3d = _scene.Component3d;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]
};

var Pallet = function (_Object3D) {
  _inherits(Pallet, _Object3D);

  function Pallet() {
    _classCallCheck(this, Pallet);

    return _possibleConstructorReturn(this, (Pallet.__proto__ || Object.getPrototypeOf(Pallet)).apply(this, arguments));
  }

  _createClass(Pallet, [{
    key: 'createObject',
    value: function createObject() {
      Pallet.threedObjectLoader.then(this.addObject.bind(this));
    }
  }, {
    key: 'addObject',
    value: function addObject(extObject) {
      var _model = this.model,
          width = _model.width,
          height = _model.height,
          depth = _model.depth,
          _model$rotation = _model.rotation,
          rotation = _model$rotation === undefined ? 0 : _model$rotation;


      this.type = 'pallet';

      width /= 63.173;
      height /= 72.1887;
      depth /= 9.0388;

      var object = extObject.clone();
      this.add(object);

      this.scale.set(width, depth, height);
    }
  }], [{
    key: 'threedObjectLoader',
    get: function get() {
      if (!Pallet._threedObjectLoader) {
        Pallet._threedObjectLoader = new Promise(function (resolve, reject) {
          var objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
          var mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

          mtlLoader.setPath('obj/pallet/');
          objLoader.setPath('obj/pallet/');

          mtlLoader.load('new_pallet.mtl', function (materials) {
            materials.preload();
            objLoader.setMaterials(materials);
            materials.side = THREE.frontSide;

            objLoader.load('new_pallet.obj', function (obj) {
              var extObj = obj;
              if (extObj && extObj.children && extObj.children.length > 0) {
                extObj = extObj.children[0];
              }

              extObj.geometry.center();
              resolve(extObj);
            });
          });
        });
      }

      return Pallet._threedObjectLoader;
    }
  }]);

  return Pallet;
}(_object3d2.default);

exports.default = Pallet;

var Pallet2d = exports.Pallet2d = function (_RectPath) {
  _inherits(Pallet2d, _RectPath);

  function Pallet2d() {
    _classCallCheck(this, Pallet2d);

    return _possibleConstructorReturn(this, (Pallet2d.__proto__ || Object.getPrototypeOf(Pallet2d)).apply(this, arguments));
  }

  _createClass(Pallet2d, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'controls',
    get: function get() {}
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return Pallet2d;
}(RectPath(Shape));

Component.register('pallet', Pallet2d);
Component3d.register('pallet', Pallet);

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extrude = __webpack_require__(5);

var _extrude2 = _interopRequireDefault(_extrude);

var _component3d = __webpack_require__(4);

var _component3d2 = _interopRequireDefault(_component3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var PolygonExtrude = function (_Extrude) {
  _inherits(PolygonExtrude, _Extrude);

  function PolygonExtrude() {
    _classCallCheck(this, PolygonExtrude);

    return _possibleConstructorReturn(this, (PolygonExtrude.__proto__ || Object.getPrototypeOf(PolygonExtrude)).apply(this, arguments));
  }

  _createClass(PolygonExtrude, [{
    key: 'raycast',
    value: function raycast(raycaster, intersects) {}
  }, {
    key: 'shape',
    get: function get() {
      var _model$path = this.model.path,
          path = _model$path === undefined ? [] : _model$path;


      var shape = new THREE.Shape();
      shape.moveTo(path[0].x, path[0].y);
      for (var i = 1; i < path.length; i++) {
        shape.lineTo(path[i].x, path[i].y);
      }return shape;
    }
  }, {
    key: 'minMax',
    get: function get() {
      if (!this._minMax) {
        var path = this.model.path;


        var minX;
        var minY;
        var maxX;
        var maxY;

        path.forEach(function (p, i) {
          if (i == 0) {
            minX = maxX = p.x;
            minY = maxY = p.y;
            return;
          }

          minX = Math.min(minX, p.x);
          maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y);
          maxY = Math.max(maxY, p.y);
        });

        this._minMax = {
          minX: minX,
          minY: minY,
          maxX: maxX,
          maxY: maxY
        };
      }

      return this._minMax;
    }
  }, {
    key: 'cx',
    get: function get() {
      if (!this._cx) {
        var _minMax = this.minMax,
            minX = _minMax.minX,
            maxX = _minMax.maxX;


        var left = minX;
        var width = maxX - minX;

        var canvasSize = this._canvasSize;

        this._cx = left + width / 2 - canvasSize.width / 2;
      }
      return this._cx;
    }
  }, {
    key: 'cy',
    get: function get() {
      if (!this._cy) {
        var _minMax2 = this.minMax,
            minY = _minMax2.minY,
            maxY = _minMax2.maxY;


        var top = minY;
        var height = maxY - minY;
        var canvasSize = this._canvasSize;

        this._cy = top + height / 2 - canvasSize.height / 2;
      }
      return this._cy;
    }
  }]);

  return PolygonExtrude;
}(_extrude2.default);

exports.default = PolygonExtrude;


_component3d2.default.register('polygon', PolygonExtrude);

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extrude = __webpack_require__(5);

var _extrude2 = _interopRequireDefault(_extrude);

var _component3d = __webpack_require__(4);

var _component3d2 = _interopRequireDefault(_component3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var EllipseExtrude = function (_Extrude) {
  _inherits(EllipseExtrude, _Extrude);

  function EllipseExtrude() {
    _classCallCheck(this, EllipseExtrude);

    return _possibleConstructorReturn(this, (EllipseExtrude.__proto__ || Object.getPrototypeOf(EllipseExtrude)).apply(this, arguments));
  }

  _createClass(EllipseExtrude, [{
    key: 'cx',
    get: function get() {
      if (!this._cx) {
        var _model$cx = this.model.cx,
            cx = _model$cx === undefined ? 0 : _model$cx;


        var canvasSize = this._canvasSize;

        this._cx = cx - canvasSize.width / 2;
      }

      return this._cx;
    }
  }, {
    key: 'cy',
    get: function get() {
      if (!this._cy) {
        var _model$cy = this.model.cy,
            cy = _model$cy === undefined ? 0 : _model$cy;


        var canvasSize = this._canvasSize;

        this._cy = cy - canvasSize.height / 2;
      }

      return this._cy;
    }
  }, {
    key: 'shape',
    get: function get() {
      var _model = this.model,
          _model$cx2 = _model.cx,
          cx = _model$cx2 === undefined ? 0 : _model$cx2,
          _model$cy2 = _model.cy,
          cy = _model$cy2 === undefined ? 0 : _model$cy2,
          _model$rx = _model.rx,
          rx = _model$rx === undefined ? 1 : _model$rx,
          _model$ry = _model.ry,
          ry = _model$ry === undefined ? 1 : _model$ry,
          _model$startAngle = _model.startAngle,
          startAngle = _model$startAngle === undefined ? 0 : _model$startAngle,
          _model$endAngle = _model.endAngle,
          endAngle = _model$endAngle === undefined ? 2 * Math.PI : _model$endAngle,
          _model$anticlockwise = _model.anticlockwise,
          anticlockwise = _model$anticlockwise === undefined ? false : _model$anticlockwise;

      var shape = new THREE.Shape();

      shape.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, startAngle, endAngle, anticlockwise);

      return shape;
    }
  }]);

  return EllipseExtrude;
}(_extrude2.default);

exports.default = EllipseExtrude;


_component3d2.default.register('ellipse', EllipseExtrude);

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CJTruck2D = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

var _threeControls = __webpack_require__(11);

var _threeControls2 = _interopRequireDefault(_threeControls);

var _zipLoader = __webpack_require__(16);

var _zipLoader2 = _interopRequireDefault(_zipLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var _scene = scene,
    RectPath = _scene.RectPath,
    Shape = _scene.Shape,
    Component = _scene.Component,
    Component3d = _scene.Component3d;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]

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

};
var CJTruck = function (_Object3D) {
  _inherits(CJTruck, _Object3D);

  function CJTruck() {
    _classCallCheck(this, CJTruck);

    return _possibleConstructorReturn(this, (CJTruck.__proto__ || Object.getPrototypeOf(CJTruck)).apply(this, arguments));
  }

  _createClass(CJTruck, [{
    key: 'createObject',
    value: function createObject() {
      CJTruck.threedObjectLoader.then(this.addObject.bind(this));
    }
  }, {
    key: 'addObject',
    value: function addObject(extObject) {
      var _model = this.model,
          width = _model.width,
          height = _model.height,
          depth = _model.depth,
          _model$rotation = _model.rotation,
          rotation = _model$rotation === undefined ? 0 : _model$rotation;


      this.type = 'cj-truck';

      this.scale.set(width, depth, height);

      width /= 63.173;
      height /= 72.1887;
      depth /= 9.0388;

      var object = extObject.clone();
      this.add(object);

      this.scale.set(width, depth, height);
    }
  }], [{
    key: 'threedObjectLoader',
    get: function get() {
      if (!CJTruck._threedObjectLoader) {
        CJTruck._threedObjectLoader = new Promise(function (resolve, reject) {
          var colladaLoader = new THREE.ColladaLoader(THREE.DefaultLoadingManager);
          colladaLoader.load('obj/CJ_Truck/Commercial_Truck_Transfer.dae', function (collada) {
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
          });
        });
      }

      return CJTruck._threedObjectLoader;
    }
  }]);

  return CJTruck;
}(_object3d2.default);

exports.default = CJTruck;

var CJTruck2D = exports.CJTruck2D = function (_RectPath) {
  _inherits(CJTruck2D, _RectPath);

  function CJTruck2D() {
    _classCallCheck(this, CJTruck2D);

    return _possibleConstructorReturn(this, (CJTruck2D.__proto__ || Object.getPrototypeOf(CJTruck2D)).apply(this, arguments));
  }

  _createClass(CJTruck2D, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'controls',
    get: function get() {}
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return CJTruck2D;
}(RectPath(Shape));

Component.register('cj-truck', CJTruck2D);
Component3d.register('cj-truck', CJTruck);

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

function placeHoldersCount(b64) {
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;
}

function byteLength(b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64);
}

function toByteArray(b64) {
  var i, l, tmp, placeHolders, arr;
  var len = b64.length;
  placeHolders = placeHoldersCount(b64);

  arr = new Arr(len * 3 / 4 - placeHolders);

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0; i < l; i += 4) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = tmp >> 16 & 0xFF;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr;
}

function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
    output.push(tripletToBase64(tmp));
  }
  return output.join('');
}

function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[tmp << 4 & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    output += lookup[tmp >> 10];
    output += lookup[tmp >> 4 & 0x3F];
    output += lookup[tmp << 2 & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('');
}

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
};

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var USE_TYPEDARRAY = typeof Uint8Array !== 'undefined' && typeof Uint16Array !== 'undefined' && typeof Uint32Array !== 'undefined';

var pako = __webpack_require__(63);
exports.uncompressInputType = USE_TYPEDARRAY ? "uint8array" : "array";
exports.compressInputType = USE_TYPEDARRAY ? "uint8array" : "array";

exports.magic = "\x08\x00";
exports.compress = function (input, compressionOptions) {
    return pako.deflateRaw(input, {
        level: compressionOptions.level || -1 // default compression
    });
};
exports.uncompress = function (input) {
    return pako.inflateRaw(input);
};

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Top level file is just a mixin of submodules & constants


var assign = __webpack_require__(2).assign;

var deflate = __webpack_require__(64);
var inflate = __webpack_require__(67);
var constants = __webpack_require__(23);

var pako = {};

assign(pako, deflate, inflate, constants);

module.exports = pako;

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var zlib_deflate = __webpack_require__(65);
var utils = __webpack_require__(2);
var strings = __webpack_require__(21);
var msg = __webpack_require__(9);
var ZStream = __webpack_require__(22);

var toString = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

var Z_NO_FLUSH = 0;
var Z_FINISH = 4;

var Z_OK = 0;
var Z_STREAM_END = 1;
var Z_SYNC_FLUSH = 2;

var Z_DEFAULT_COMPRESSION = -1;

var Z_DEFAULT_STRATEGY = 0;

var Z_DEFLATED = 8;

/* ===========================================================================*/

/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overridden.
 **/

/**
 * Deflate.result -> Uint8Array|Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param)  or if you
 * push a chunk with explicit flush (call [[Deflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/

/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
function Deflate(options) {
  if (!(this instanceof Deflate)) return new Deflate(options);

  this.options = utils.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY,
    to: ''
  }, options || {});

  var opt = this.options;

  if (opt.raw && opt.windowBits > 0) {
    opt.windowBits = -opt.windowBits;
  } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
    opt.windowBits += 16;
  }

  this.err = 0; // error code, if happens (0 = Z_OK)
  this.msg = ''; // error message
  this.ended = false; // used to avoid multiple onEnd() calls
  this.chunks = []; // chunks of compressed data

  this.strm = new ZStream();
  this.strm.avail_out = 0;

  var status = zlib_deflate.deflateInit2(this.strm, opt.level, opt.method, opt.windowBits, opt.memLevel, opt.strategy);

  if (status !== Z_OK) {
    throw new Error(msg[status]);
  }

  if (opt.header) {
    zlib_deflate.deflateSetHeader(this.strm, opt.header);
  }

  if (opt.dictionary) {
    var dict;
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      // If we need to compress text, change encoding to utf8.
      dict = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }

    status = zlib_deflate.deflateSetDictionary(this.strm, dict);

    if (status !== Z_OK) {
      throw new Error(msg[status]);
    }

    this._dict_set = true;
  }
}

/**
 * Deflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data. Strings will be
 *   converted to utf8 byte sequence.
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Deflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the compression context.
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * array format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;

  if (this.ended) {
    return false;
  }

  _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = zlib_deflate.deflate(strm, _mode); /* no bad return value */

    if (status !== Z_STREAM_END && status !== Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }
    if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH)) {
      if (this.options.to === 'string') {
        this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
      } else {
        this.onData(utils.shrinkBuf(strm.output, strm.next_out));
      }
    }
  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);

  // Finalize on the last chunk.
  if (_mode === Z_FINISH) {
    status = zlib_deflate.deflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === Z_SYNC_FLUSH) {
    this.onEnd(Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};

/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): output data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};

/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};

/**
 * deflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate(input, options) {
  var deflator = new Deflate(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) {
    throw deflator.msg || msg[deflator.err];
  }

  return deflator.result;
}

/**
 * deflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return deflate(input, options);
}

/**
 * gzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate(input, options);
}

exports.Deflate = Deflate;
exports.deflate = deflate;
exports.deflateRaw = deflateRaw;
exports.gzip = gzip;

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = __webpack_require__(2);
var trees = __webpack_require__(66);
var adler32 = __webpack_require__(19);
var crc32 = __webpack_require__(20);
var msg = __webpack_require__(9);

/* Public constants ==========================================================*/
/* ===========================================================================*/

/* Allowed flush values; see deflate() and inflate() below for details */
var Z_NO_FLUSH = 0;
var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH = 3;
var Z_FINISH = 4;
var Z_BLOCK = 5;
//var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK = 0;
var Z_STREAM_END = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR = -2;
var Z_DATA_ERROR = -3;
//var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR = -5;
//var Z_VERSION_ERROR = -6;


/* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION = -1;

var Z_FILTERED = 1;
var Z_HUFFMAN_ONLY = 2;
var Z_RLE = 3;
var Z_FIXED = 4;
var Z_DEFAULT_STRATEGY = 0;

/* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN = 2;

/* The deflate compression method */
var Z_DEFLATED = 8;

/*============================================================================*/

var MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_MEM_LEVEL = 8;

var LENGTH_CODES = 29;
/* number of length codes, not counting the special END_BLOCK code */
var LITERALS = 256;
/* number of literal bytes 0..255 */
var L_CODES = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
var D_CODES = 30;
/* number of distance codes */
var BL_CODES = 19;
/* number of codes used to transfer the bit lengths */
var HEAP_SIZE = 2 * L_CODES + 1;
/* maximum heap size */
var MAX_BITS = 15;
/* All codes must not exceed MAX_BITS bits */

var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;

var PRESET_DICT = 0x20;

var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;

var BS_NEED_MORE = 1; /* block not completed, need more input or more output */
var BS_BLOCK_DONE = 2; /* block flush performed */
var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
var BS_FINISH_DONE = 4; /* finish done, accept no more input or output */

var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

function err(strm, errorCode) {
  strm.msg = msg[errorCode];
  return errorCode;
}

function rank(f) {
  return (f << 1) - (f > 4 ? 9 : 0);
}

function zero(buf) {
  var len = buf.length;while (--len >= 0) {
    buf[len] = 0;
  }
}

/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
function flush_pending(strm) {
  var s = strm.state;

  //_tr_flush_bits(s);
  var len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) {
    return;
  }

  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
}

function flush_block_only(s, last) {
  trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
}

function put_byte(s, b) {
  s.pending_buf[s.pending++] = b;
}

/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
function putShortMSB(s, b) {
  //  put_byte(s, (Byte)(b >> 8));
  //  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = b >>> 8 & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
}

/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
function read_buf(strm, buf, start, size) {
  var len = strm.avail_in;

  if (len > size) {
    len = size;
  }
  if (len === 0) {
    return 0;
  }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  utils.arraySet(buf, strm.input, strm.next_in, len, start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32(strm.adler, buf, len, start);
  } else if (strm.state.wrap === 2) {
    strm.adler = crc32(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
}

/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
function longest_match(s, cur_match) {
  var chain_length = s.max_chain_length; /* max hash chain length */
  var scan = s.strstart; /* current string */
  var match; /* matched string */
  var len; /* length of current match */
  var best_len = s.prev_length; /* best match length so far */
  var nice_match = s.nice_match; /* stop if match long enough */
  var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0 /*NIL*/;

  var _win = s.window; // shortcut

  var wmask = s.w_mask;
  var prev = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  var strend = s.strstart + MAX_MATCH;
  var scan_end1 = _win[scan + best_len - 1];
  var scan_end = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) {
    nice_match = s.lookahead;
  }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1 = _win[scan + best_len - 1];
      scan_end = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
}

/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
function fill_window(s) {
  var _w_size = s.w_size;
  var p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = m >= _w_size ? m - _w_size : 0;
      } while (--n);

      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = m >= _w_size ? m - _w_size : 0;
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
      //#if MIN_MATCH != 3
      //        Call update_hash() MIN_MATCH-3 more times
      //#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */
  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
  //  if (s.high_water < s.window_size) {
  //    var curr = s.strstart + s.lookahead;
  //    var init = 0;
  //
  //    if (s.high_water < curr) {
  //      /* Previous high water mark below current data -- zero WIN_INIT
  //       * bytes or up to end of window, whichever is less.
  //       */
  //      init = s.window_size - curr;
  //      if (init > WIN_INIT)
  //        init = WIN_INIT;
  //      zmemzero(s->window + curr, (unsigned)init);
  //      s->high_water = curr + init;
  //    }
  //    else if (s->high_water < (ulg)curr + WIN_INIT) {
  //      /* High water mark at or above current data, but below current data
  //       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
  //       * to end of window, whichever is less.
  //       */
  //      init = (ulg)curr + WIN_INIT - s->high_water;
  //      if (init > s->window_size - s->high_water)
  //        init = s->window_size - s->high_water;
  //      zmemzero(s->window + s->high_water, (unsigned)init);
  //      s->high_water += init;
  //    }
  //  }
  //
  //  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
  //    "not enough room for search");
}

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
function deflate_stored(s, flush) {
  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  var max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
      //      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
      //        s.block_start >= s.w_size)) {
      //        throw  new Error("slide too late");
      //      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
    //    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    var max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
}

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
function deflate_fast(s, flush) {
  var hash_head; /* head of the hash chain */
  var bflush; /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0 /*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0 /*NIL*/ && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match /*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;

        //#if MIN_MATCH != 3
        //                Call UPDATE_HASH() MIN_MATCH-3 more times
        //#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
function deflate_slow(s, flush) {
  var hash_head; /* head of hash chain */
  var bflush; /* set if current block must be flushed */

  var max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0 /*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0 /*NIL*/ && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD /*MAX_DIST(s)*/) {
        /* To simplify the code, we prevent matches with the string
         * of window index 0 (in particular we have to avoid a match
         * of the string with itself at the start of the input file).
         */
        s.match_length = longest_match(s, hash_head);
        /* longest_match() sets match_start */

        if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096 /*TOO_FAR*/)) {

          /* If prev_match is also MIN_MATCH, match_start is garbage
           * but we will ignore the current match anyway.
           */
          s.match_length = MIN_MATCH - 1;
        }
      }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
function deflate_rle(s, flush) {
  var bflush; /* set if current block must be flushed */
  var prev; /* byte at distance one to match */
  var scan, strend; /* scan goes up to strend for length of run */

  var _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break;
      } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
function deflate_huff(s, flush) {
  var bflush; /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break; /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

var configuration_table;

configuration_table = [
/*      good lazy nice chain */
new Config(0, 0, 0, 0, deflate_stored), /* 0 store only */
new Config(4, 4, 8, 4, deflate_fast), /* 1 max speed, no lazy matches */
new Config(4, 5, 16, 8, deflate_fast), /* 2 */
new Config(4, 6, 32, 32, deflate_fast), /* 3 */

new Config(4, 4, 16, 16, deflate_slow), /* 4 lazy matches */
new Config(8, 16, 32, 32, deflate_slow), /* 5 */
new Config(8, 16, 128, 128, deflate_slow), /* 6 */
new Config(8, 32, 128, 256, deflate_slow), /* 7 */
new Config(32, 128, 258, 1024, deflate_slow), /* 8 */
new Config(32, 258, 258, 4096, deflate_slow) /* 9 max compression */
];

/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
function lm_init(s) {
  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
}

function DeflateState() {
  this.strm = null; /* pointer back to this zlib stream */
  this.status = 0; /* as the name implies */
  this.pending_buf = null; /* output still pending */
  this.pending_buf_size = 0; /* size of pending_buf */
  this.pending_out = 0; /* next pending byte to output to the stream */
  this.pending = 0; /* nb of bytes in the pending buffer */
  this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null; /* gzip header information to write */
  this.gzindex = 0; /* where in extra, name, or comment */
  this.method = Z_DEFLATED; /* can only be DEFLATED */
  this.last_flush = -1; /* value of flush param for previous deflate call */

  this.w_size = 0; /* LZ77 window size (32K by default) */
  this.w_bits = 0; /* log2(w_size)  (8..16) */
  this.w_mask = 0; /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null; /* Heads of the hash chains or NIL. */

  this.ins_h = 0; /* hash index of string to be inserted */
  this.hash_size = 0; /* number of elements in hash table */
  this.hash_bits = 0; /* log2(hash_size) */
  this.hash_mask = 0; /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0; /* length of best match */
  this.prev_match = 0; /* previous match */
  this.match_available = 0; /* set if previous match exists */
  this.strstart = 0; /* start of string to insert */
  this.match_start = 0; /* start of matching string */
  this.lookahead = 0; /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0; /* compression level (1..9) */
  this.strategy = 0; /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

  /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
  this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
  this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc = null; /* desc. for literal tree */
  this.d_desc = null; /* desc. for distance tree */
  this.bl_desc = null; /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new utils.Buf16(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new utils.Buf16(2 * L_CODES + 1); /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0; /* number of elements in the heap */
  this.heap_max = 0; /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0; /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0; /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0; /* bit length of current block with optimal trees */
  this.static_len = 0; /* bit length of current block with static trees */
  this.matches = 0; /* number of string matches in current block */
  this.insert = 0; /* bytes at end of window left to insert */

  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}

function deflateResetKeep(strm) {
  var s;

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = s.wrap ? INIT_STATE : BUSY_STATE;
  strm.adler = s.wrap === 2 ? 0 // crc32(0, Z_NULL, 0)
  : 1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH;
  trees._tr_init(s);
  return Z_OK;
}

function deflateReset(strm) {
  var ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
}

function deflateSetHeader(strm, head) {
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR;
  }
  if (strm.state.wrap !== 2) {
    return Z_STREAM_ERROR;
  }
  strm.state.gzhead = head;
  return Z_OK;
}

function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
  if (!strm) {
    // === Z_NULL
    return Z_STREAM_ERROR;
  }
  var wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }

  if (windowBits < 0) {
    /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  } else if (windowBits > 15) {
    wrap = 2; /* write gzip wrapper instead */
    windowBits -= 16;
  }

  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR);
  }

  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  var s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new utils.Buf8(s.w_size * 2);
  s.head = new utils.Buf16(s.hash_size);
  s.prev = new utils.Buf16(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << memLevel + 6; /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;

  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
  //s->pending_buf = (uchf *) overlay;
  s.pending_buf = new utils.Buf8(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
  s.d_buf = 1 * s.lit_bufsize;

  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
}

function deflateInit(strm, level) {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}

function deflate(strm, flush) {
  var old_flush, s;
  var beg, val; // for gzip header write only

  if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }

  s = strm.state;

  if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
    return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }

  s.strm = strm; /* just in case */
  old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) {
      // GZIP header
      strm.adler = 0; //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) {
        // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      } else {
        put_byte(s, (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16));
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, s.gzhead.time >> 8 & 0xff);
        put_byte(s, s.gzhead.time >> 16 & 0xff);
        put_byte(s, s.gzhead.time >> 24 & 0xff);
        put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, s.gzhead.extra.length >> 8 & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    } else // DEFLATE header
      {
        var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
        var level_flags = -1;

        if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
          level_flags = 0;
        } else if (s.level < 6) {
          level_flags = 1;
        } else if (s.level === 6) {
          level_flags = 2;
        } else {
          level_flags = 3;
        }
        header |= level_flags << 6;
        if (s.strstart !== 0) {
          header |= PRESET_DICT;
        }
        header += 31 - header % 31;

        s.status = BUSY_STATE;
        putShortMSB(s, header);

        /* Save the adler32 of the preset dictionary: */
        if (s.strstart !== 0) {
          putShortMSB(s, strm.adler >>> 16);
          putShortMSB(s, strm.adler & 0xffff);
        }
        strm.adler = 1; // adler32(0L, Z_NULL, 0);
      }
  }

  //#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra /* != Z_NULL*/) {
        beg = s.pending; /* start of bytes to update crc */

        while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              break;
            }
          }
          put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
          s.gzindex++;
        }
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (s.gzindex === s.gzhead.extra.length) {
          s.gzindex = 0;
          s.status = NAME_STATE;
        }
      } else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name /* != Z_NULL*/) {
        beg = s.pending; /* start of bytes to update crc */
        //int val;

        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              val = 1;
              break;
            }
          }
          // JS specific: little magic to add zero terminator to end of string
          if (s.gzindex < s.gzhead.name.length) {
            val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);

        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (val === 0) {
          s.gzindex = 0;
          s.status = COMMENT_STATE;
        }
      } else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment /* != Z_NULL*/) {
        beg = s.pending; /* start of bytes to update crc */
        //int val;

        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              val = 1;
              break;
            }
          }
          // JS specific: little magic to add zero terminator to end of string
          if (s.gzindex < s.gzhead.comment.length) {
            val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);

        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (val === 0) {
          s.status = HCRC_STATE;
        }
      } else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, strm.adler >> 8 & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    } else {
      s.status = BUSY_STATE;
    }
  }
  //#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
    var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        trees._tr_align(s);
      } else if (flush !== Z_BLOCK) {
        /* FULL_FLUSH or SYNC_FLUSH */

        trees._tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH) {
          /*** CLEAR_HASH(s); ***/ /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH) {
    return Z_OK;
  }
  if (s.wrap <= 0) {
    return Z_STREAM_END;
  }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, strm.adler >> 8 & 0xff);
    put_byte(s, strm.adler >> 16 & 0xff);
    put_byte(s, strm.adler >> 24 & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, strm.total_in >> 8 & 0xff);
    put_byte(s, strm.total_in >> 16 & 0xff);
    put_byte(s, strm.total_in >> 24 & 0xff);
  } else {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) {
    s.wrap = -s.wrap;
  }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}

function deflateEnd(strm) {
  var status;

  if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/) {
      return Z_STREAM_ERROR;
    }

  status = strm.state.status;
  if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}

/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
function deflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var s;
  var str, n;
  var wrap;
  var avail;
  var next;
  var input;
  var tmpDict;

  if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/) {
      return Z_STREAM_ERROR;
    }

  s = strm.state;
  wrap = s.wrap;

  if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
    return Z_STREAM_ERROR;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0; /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {
      /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    tmpDict = new utils.Buf8(s.w_size);
    utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  avail = strm.avail_in;
  next = strm.next_in;
  input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    str = s.strstart;
    n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK;
}

exports.deflateInit = deflateInit;
exports.deflateInit2 = deflateInit2;
exports.deflateReset = deflateReset;
exports.deflateResetKeep = deflateResetKeep;
exports.deflateSetHeader = deflateSetHeader;
exports.deflate = deflate;
exports.deflateEnd = deflateEnd;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = __webpack_require__(2);

/* Public constants ==========================================================*/
/* ===========================================================================*/

//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED = 4;
//var Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
var Z_BINARY = 0;
var Z_TEXT = 1;
//var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN = 2;

/*============================================================================*/

function zero(buf) {
  var len = buf.length;while (--len >= 0) {
    buf[len] = 0;
  }
}

// From zutil.h

var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES = 2;
/* The three kinds of block type */

var MIN_MATCH = 3;
var MAX_MATCH = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

var LENGTH_CODES = 29;
/* number of length codes, not counting the special END_BLOCK code */

var LITERALS = 256;
/* number of literal bytes 0..255 */

var L_CODES = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */

var D_CODES = 30;
/* number of distance codes */

var BL_CODES = 19;
/* number of codes used to transfer the bit lengths */

var HEAP_SIZE = 2 * L_CODES + 1;
/* maximum heap size */

var MAX_BITS = 15;
/* All codes must not exceed MAX_BITS bits */

var Buf_size = 16;
/* size of bit buffer in bi_buf */

/* ===========================================================================
 * Constants
 */

var MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

var END_BLOCK = 256;
/* end of block literal code */

var REP_3_6 = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

var REPZ_3_10 = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

var REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
var extra_lbits = /* extra bits for each length code */
[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];

var extra_dbits = /* extra bits for each distance code */
[0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

var extra_blbits = /* extra bits for each bit length code */
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];

var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
var static_ltree = new Array((L_CODES + 2) * 2);
zero(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

var static_dtree = new Array(D_CODES * 2);
zero(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

var _dist_code = new Array(DIST_CODE_LEN);
zero(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
zero(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

var base_length = new Array(LENGTH_CODES);
zero(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

var base_dist = new Array(D_CODES);
zero(base_dist);
/* First normalized distance for each code (0 = distance of 1) */

function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree = static_tree; /* static tree or NULL */
  this.extra_bits = extra_bits; /* extra bits for each code or NULL */
  this.extra_base = extra_base; /* base index for extra_bits */
  this.elems = elems; /* max number of elements in the tree */
  this.max_length = max_length; /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree = static_tree && static_tree.length;
}

var static_l_desc;
var static_d_desc;
var static_bl_desc;

function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree; /* the dynamic tree */
  this.max_code = 0; /* largest code with non zero frequency */
  this.stat_desc = stat_desc; /* the corresponding static tree */
}

function d_code(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}

/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
function put_short(s, w) {
  //    put_byte(s, (uch)((w) & 0xff));
  //    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = w & 0xff;
  s.pending_buf[s.pending++] = w >>> 8 & 0xff;
}

/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
function send_bits(s, value, length) {
  if (s.bi_valid > Buf_size - length) {
    s.bi_buf |= value << s.bi_valid & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> Buf_size - s.bi_valid;
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= value << s.bi_valid & 0xffff;
    s.bi_valid += length;
  }
}

function send_code(s, c, tree) {
  send_bits(s, tree[c * 2] /*.Code*/, tree[c * 2 + 1] /*.Len*/);
}

/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
function bi_reverse(code, len) {
  var res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
}

/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
function bi_flush(s) {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;
  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
}

/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  var tree = desc.dyn_tree;
  var max_code = desc.max_code;
  var stree = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var extra = desc.stat_desc.extra_bits;
  var base = desc.stat_desc.extra_base;
  var max_length = desc.stat_desc.max_length;
  var h; /* heap index */
  var n, m; /* iterate over the tree elements */
  var bits; /* bit length */
  var xbits; /* extra bits */
  var f; /* frequency */
  var overflow = 0; /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1] /*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1] /*.Dad*/ * 2 + 1] /*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1] /*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) {
      continue;
    } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2] /*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1] /*.Len*/ + xbits);
    }
  }
  if (overflow === 0) {
    return;
  }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) {
      bits--;
    }
    s.bl_count[bits]--; /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) {
        continue;
      }
      if (tree[m * 2 + 1] /*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1] /*.Len*/) * tree[m * 2] /*.Freq*/;
        tree[m * 2 + 1] /*.Len*/ = bits;
      }
      n--;
    }
  }
}

/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
  var code = 0; /* running code value */
  var bits; /* bit index */
  var n; /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = code + bl_count[bits - 1] << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0; n <= max_code; n++) {
    var len = tree[n * 2 + 1] /*.Len*/;
    if (len === 0) {
      continue;
    }
    /* Now reverse the bits */
    tree[n * 2] /*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
}

/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
function tr_static_init() {
  var n; /* iterates over tree elements */
  var bits; /* bit counter */
  var length; /* length value */
  var code; /* code value */
  var dist; /* distance index */
  var bl_count = new Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
  /*#ifdef NO_INIT_GLOBAL_POINTERS
    static_l_desc.static_tree = static_ltree;
    static_l_desc.extra_bits = extra_lbits;
    static_d_desc.static_tree = static_dtree;
    static_d_desc.extra_bits = extra_dbits;
    static_bl_desc.extra_bits = extra_blbits;
  #endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < 1 << extra_lbits[code]; n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < 1 << extra_dbits[code]; n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1] /*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1] /*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1] /*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1] /*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES; n++) {
    static_dtree[n * 2 + 1] /*.Len*/ = 5;
    static_dtree[n * 2] /*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);

  //static_init_done = true;
}

/* ===========================================================================
 * Initialize a new block.
 */
function init_block(s) {
  var n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES; n++) {
    s.dyn_ltree[n * 2] /*.Freq*/ = 0;
  }
  for (n = 0; n < D_CODES; n++) {
    s.dyn_dtree[n * 2] /*.Freq*/ = 0;
  }
  for (n = 0; n < BL_CODES; n++) {
    s.bl_tree[n * 2] /*.Freq*/ = 0;
  }

  s.dyn_ltree[END_BLOCK * 2] /*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
}

/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
function bi_windup(s) {
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
}

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s); /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
  //  while (len--) {
  //    put_byte(s, *buf++);
  //  }
  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
  s.pending += len;
}

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
function smaller(tree, n, m, depth) {
  var _n2 = n * 2;
  var _m2 = m * 2;
  return tree[_n2] /*.Freq*/ < tree[_m2] /*.Freq*/ || tree[_n2] /*.Freq*/ === tree[_m2] /*.Freq*/ && depth[n] <= depth[m];
}

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  var v = s.heap[k];
  var j = k << 1; /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) {
      break;
    }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
}

// inlined manually
// var SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  var dist; /* distance of matched string */
  var lc; /* match length or unmatched char (if dist == 0) */
  var lx = 0; /* running index in l_buf */
  var code; /* the code to send */
  var extra; /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra); /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree); /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra); /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");
    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
}

/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  var tree = desc.dyn_tree;
  var stree = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var elems = desc.stat_desc.elems;
  var n, m; /* iterate over heap elements */
  var max_code = -1; /* largest code with non zero frequency */
  var node; /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2] /*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;
    } else {
      tree[n * 2 + 1] /*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
    tree[node * 2] /*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1] /*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = s.heap_len >> 1 /*int /2*/; n >= 1; n--) {
    pqdownheap(s, tree, n);
  }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems; /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1 /*SMALLEST*/];
    s.heap[1 /*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1 /*SMALLEST*/);
    /***/

    m = s.heap[1 /*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2] /*.Freq*/ = tree[n * 2] /*.Freq*/ + tree[m * 2] /*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1] /*.Dad*/ = tree[m * 2 + 1] /*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1 /*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1 /*SMALLEST*/);
  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1 /*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
}

/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  var n; /* iterates over all tree elements */
  var prevlen = -1; /* last emitted length */
  var curlen; /* length of current code */

  var nextlen = tree[0 * 2 + 1] /*.Len*/; /* length of next code */

  var count = 0; /* repeat count of the current code */
  var max_count = 7; /* max repeat count */
  var min_count = 4; /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1] /*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1] /*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      s.bl_tree[curlen * 2] /*.Freq*/ += count;
    } else if (curlen !== 0) {

      if (curlen !== prevlen) {
        s.bl_tree[curlen * 2] /*.Freq*/++;
      }
      s.bl_tree[REP_3_6 * 2] /*.Freq*/++;
    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2] /*.Freq*/++;
    } else {
      s.bl_tree[REPZ_11_138 * 2] /*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}

/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  var n; /* iterates over all tree elements */
  var prevlen = -1; /* last emitted length */
  var curlen; /* length of current code */

  var nextlen = tree[0 * 2 + 1] /*.Len*/; /* length of next code */

  var count = 0; /* repeat count of the current code */
  var max_count = 7; /* max repeat count */
  var min_count = 4; /* min repeat count */

  /* tree[max_code+1].Len = -1; */ /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1] /*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;
    } else if (count < min_count) {
      do {
        send_code(s, curlen, s.bl_tree);
      } while (--count !== 0);
    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);
    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);
    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;
    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}

/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
function build_bl_tree(s) {
  var max_blindex; /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1] /*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
}

/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  var rank; /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1, 5);
  send_bits(s, blcodes - 4, 4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1] /*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
}

/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
function detect_data_type(s) {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  var black_mask = 0xf3ffc07f;
  var n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if (black_mask & 1 && s.dyn_ltree[n * 2] /*.Freq*/ !== 0) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2] /*.Freq*/ !== 0 || s.dyn_ltree[10 * 2] /*.Freq*/ !== 0 || s.dyn_ltree[13 * 2] /*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS; n++) {
    if (s.dyn_ltree[n * 2] /*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
}

var static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
function _tr_init(s) {

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
}

/* ===========================================================================
 * Send a stored block
 */
function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3); /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
}

/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
function _tr_align(s) {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
}

/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  var opt_lenb, static_lenb; /* opt_len and static_len in bytes */
  var max_blindex = 0; /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = s.opt_len + 3 + 7 >>> 3;
    static_lenb = s.static_len + 3 + 7 >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) {
      opt_lenb = static_lenb;
    }
  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if (stored_len + 4 <= opt_lenb && buf !== -1) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block(s, buf, stored_len, last);
  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);
  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
}

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //var out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2] /*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--; /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2] /*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2] /*.Freq*/++;
  }

  // (!) This block is disabled in zlib defaults,
  // don't enable it for binary compatibility

  //#ifdef TRUNCATE_BLOCK
  //  /* Try to guess if it is profitable to stop the current block here */
  //  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
  //    /* Compute an upper bound for the compressed length */
  //    out_length = s.last_lit*8;
  //    in_length = s.strstart - s.block_start;
  //
  //    for (dcode = 0; dcode < D_CODES; dcode++) {
  //      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
  //    }
  //    out_length >>>= 3;
  //    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
  //    //       s->last_lit, in_length, out_length,
  //    //       100L - out_length*100L/in_length));
  //    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
  //      return true;
  //    }
  //  }
  //#endif

  return s.last_lit === s.lit_bufsize - 1;
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
}

exports._tr_init = _tr_init;
exports._tr_stored_block = _tr_stored_block;
exports._tr_flush_block = _tr_flush_block;
exports._tr_tally = _tr_tally;
exports._tr_align = _tr_align;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var zlib_inflate = __webpack_require__(68);
var utils = __webpack_require__(2);
var strings = __webpack_require__(21);
var c = __webpack_require__(23);
var msg = __webpack_require__(9);
var ZStream = __webpack_require__(22);
var GZheader = __webpack_require__(71);

var toString = Object.prototype.toString;

/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overridden.
 **/

/**
 * Inflate.result -> Uint8Array|Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param) or if you
 * push a chunk with explicit flush (call [[Inflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/

/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate(options) {
  if (!(this instanceof Inflate)) return new Inflate(options);

  this.options = utils.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ''
  }, options || {});

  var opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) {
      opt.windowBits = -15;
    }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if (opt.windowBits > 15 && opt.windowBits < 48) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err = 0; // error code, if happens (0 = Z_OK)
  this.msg = ''; // error message
  this.ended = false; // used to avoid multiple onEnd() calls
  this.chunks = []; // chunks of compressed data

  this.strm = new ZStream();
  this.strm.avail_out = 0;

  var status = zlib_inflate.inflateInit2(this.strm, opt.windowBits);

  if (status !== c.Z_OK) {
    throw new Error(msg[status]);
  }

  this.header = new GZheader();

  zlib_inflate.inflateGetHeader(this.strm, this.header);
}

/**
 * Inflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Inflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the decompression context.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var dictionary = this.options.dictionary;
  var status, _mode;
  var next_out_utf8, tail, utf8str;
  var dict;

  // Flag to properly process Z_BUF_ERROR on testing inflate call
  // when we check that all output data was flushed.
  var allowBufError = false;

  if (this.ended) {
    return false;
  }
  _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;

  // Convert data if needed
  if (typeof data === 'string') {
    // Only binary strings can be decompressed on practice
    strm.input = strings.binstring2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new utils.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH); /* no bad return value */

    if (status === c.Z_NEED_DICT && dictionary) {
      // Convert data if needed
      if (typeof dictionary === 'string') {
        dict = strings.string2buf(dictionary);
      } else if (toString.call(dictionary) === '[object ArrayBuffer]') {
        dict = new Uint8Array(dictionary);
      } else {
        dict = dictionary;
      }

      status = zlib_inflate.inflateSetDictionary(this.strm, dict);
    }

    if (status === c.Z_BUF_ERROR && allowBufError === true) {
      status = c.Z_OK;
      allowBufError = false;
    }

    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {

        if (this.options.to === 'string') {

          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          tail = strm.next_out - next_out_utf8;
          utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) {
            utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
          }

          this.onData(utf8str);
        } else {
          this.onData(utils.shrinkBuf(strm.output, strm.next_out));
        }
      }
    }

    // When no more input data, we should check that internal inflate buffers
    // are flushed. The only way to do it when avail_out = 0 - run one more
    // inflate pass. But if output data not exists, inflate return Z_BUF_ERROR.
    // Here we set flag to process this error properly.
    //
    // NOTE. Deflate does not return error in this case and does not needs such
    // logic.
    if (strm.avail_in === 0 && strm.avail_out === 0) {
      allowBufError = true;
    }
  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);

  if (status === c.Z_STREAM_END) {
    _mode = c.Z_FINISH;
  }

  // Finalize on the last chunk.
  if (_mode === c.Z_FINISH) {
    status = zlib_inflate.inflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === c.Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === c.Z_SYNC_FLUSH) {
    this.onEnd(c.Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};

/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): output data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};

/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === c.Z_OK) {
    if (this.options.to === 'string') {
      // Glue & convert here, until we teach pako to send
      // utf8 aligned strings to onData
      this.result = this.chunks.join('');
    } else {
      this.result = utils.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};

/**
 * inflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
 *   , output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err)
 *   console.log(err);
 * }
 * ```
 **/
function inflate(input, options) {
  var inflator = new Inflate(options);

  inflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) {
    throw inflator.msg || msg[inflator.err];
  }

  return inflator.result;
}

/**
 * inflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate(input, options);
}

/**
 * ungzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/

exports.Inflate = Inflate;
exports.inflate = inflate;
exports.inflateRaw = inflateRaw;
exports.ungzip = inflate;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = __webpack_require__(2);
var adler32 = __webpack_require__(19);
var crc32 = __webpack_require__(20);
var inflate_fast = __webpack_require__(69);
var inflate_table = __webpack_require__(70);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/

/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH = 4;
var Z_BLOCK = 5;
var Z_TREES = 6;

/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK = 0;
var Z_STREAM_END = 1;
var Z_NEED_DICT = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR = -2;
var Z_DATA_ERROR = -3;
var Z_MEM_ERROR = -4;
var Z_BUF_ERROR = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED = 8;

/* STATES ====================================================================*/
/* ===========================================================================*/

var HEAD = 1; /* i: waiting for magic header */
var FLAGS = 2; /* i: waiting for method and flags (gzip) */
var TIME = 3; /* i: waiting for modification time (gzip) */
var OS = 4; /* i: waiting for extra flags and operating system (gzip) */
var EXLEN = 5; /* i: waiting for extra length (gzip) */
var EXTRA = 6; /* i: waiting for extra bytes (gzip) */
var NAME = 7; /* i: waiting for end of file name (gzip) */
var COMMENT = 8; /* i: waiting for end of comment (gzip) */
var HCRC = 9; /* i: waiting for header crc (gzip) */
var DICTID = 10; /* i: waiting for dictionary check value */
var DICT = 11; /* waiting for inflateSetDictionary() call */
var TYPE = 12; /* i: waiting for type bits, including last-flag bit */
var TYPEDO = 13; /* i: same, but skip check to exit inflate on new block */
var STORED = 14; /* i: waiting for stored size (length and complement) */
var COPY_ = 15; /* i/o: same as COPY below, but only first time in */
var COPY = 16; /* i/o: waiting for input or output to copy stored block */
var TABLE = 17; /* i: waiting for dynamic block table lengths */
var LENLENS = 18; /* i: waiting for code length code lengths */
var CODELENS = 19; /* i: waiting for length/lit and distance code lengths */
var LEN_ = 20; /* i: same as LEN below, but only first time in */
var LEN = 21; /* i: waiting for length/lit/eob code */
var LENEXT = 22; /* i: waiting for length extra bits */
var DIST = 23; /* i: waiting for distance code */
var DISTEXT = 24; /* i: waiting for distance extra bits */
var MATCH = 25; /* o: waiting for output space to copy string */
var LIT = 26; /* o: waiting for output space to write literal */
var CHECK = 27; /* i: waiting for 32-bit check value */
var LENGTH = 28; /* i: waiting for 32-bit length (gzip) */
var DONE = 29; /* finished check, done -- remain here until reset */
var BAD = 30; /* got a data error -- remain here until reset */
var MEM = 31; /* got an inflate() memory error -- remain here until reset */
var SYNC = 32; /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/

var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;

function zswap32(q) {
  return (q >>> 24 & 0xff) + (q >>> 8 & 0xff00) + ((q & 0xff00) << 8) + ((q & 0xff) << 24);
}

function InflateState() {
  this.mode = 0; /* current inflate mode */
  this.last = false; /* true if processing last block */
  this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false; /* true if dictionary provided */
  this.flags = 0; /* gzip header method and flags (0 if zlib) */
  this.dmax = 0; /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0; /* protected copy of check value */
  this.total = 0; /* protected copy of output count */
  // TODO: may be {}
  this.head = null; /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0; /* log base 2 of requested window size */
  this.wsize = 0; /* window size or zero if not using window */
  this.whave = 0; /* valid bytes in the window */
  this.wnext = 0; /* window write index */
  this.window = null; /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0; /* input bit accumulator */
  this.bits = 0; /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0; /* literal or length of data to copy */
  this.offset = 0; /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0; /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null; /* starting table for length/literal codes */
  this.distcode = null; /* starting table for distance codes */
  this.lenbits = 0; /* index bits for lencode */
  this.distbits = 0; /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0; /* number of code length code lengths */
  this.nlen = 0; /* number of length code lengths */
  this.ndist = 0; /* number of distance code lengths */
  this.have = 0; /* number of code lengths in lens[] */
  this.next = null; /* next available space in codes[] */

  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
  this.work = new utils.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null; /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null; /* dynamic table for distance codes (JS specific) */
  this.sane = 0; /* if false, allow invalid distance too far */
  this.back = 0; /* bits back of last unprocessed length/lit */
  this.was = 0; /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) {
    return Z_STREAM_ERROR;
  }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {
    /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null /*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) {
    return Z_STREAM_ERROR;
  }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);
}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR;
  }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  } else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) {
    return Z_STREAM_ERROR;
  }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null /*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null /*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}

/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new utils.Buf32(512);
    distfix = new utils.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) {
      state.lens[sym++] = 8;
    }
    while (sym < 256) {
      state.lens[sym++] = 9;
    }
    while (sym < 280) {
      state.lens[sym++] = 7;
    }
    while (sym < 288) {
      state.lens[sym++] = 8;
    }

    inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) {
      state.lens[sym++] = 5;
    }

    inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}

/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new utils.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  } else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    utils.arraySet(state.window, src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      utils.arraySet(state.window, src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    } else {
      state.wnext += dist;
      if (state.wnext === state.wsize) {
        state.wnext = 0;
      }
      if (state.whave < state.wsize) {
        state.whave += dist;
      }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output; // input/output buffers
  var next; /* next input INDEX */
  var put; /* next output INDEX */
  var have, left; /* available input and output */
  var hold; /* bit buffer */
  var bits; /* bits in bit buffer */
  var _in, _out; /* save starting available input and output */
  var copy; /* number of stored or match bytes to copy */
  var from; /* where to copy match bytes from */
  var from_source;
  var here = 0; /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len; /* length to copy for repeats, bits to drop */
  var ret; /* return code */
  var hbuf = new utils.Buf8(4); /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
  [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

  if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE) {
    state.mode = TYPEDO;
  } /* skip check */

  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.wrap & 2 && hold === 0x8b1f) {
          /* gzip header */
          state.check = 0 /*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = hold >>> 8 & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        state.flags = 0; /* expect zlib header */
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) || /* check if zlib header allowed */
        (((hold & 0xff) << /*BITS(8)*/8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD;
          break;
        }
        if ((hold & 0x0f) !== /*BITS(4)*/Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f) + /*BITS(4)*/8;
        if (state.wbits === 0) {
          state.wbits = len;
        } else if (len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD;
          break;
        }
        state.dmax = 1 << len;
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD;
          break;
        }
        if (state.head) {
          state.head.text = hold >> 8 & 1;
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = hold >>> 8 & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
      /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = hold >>> 8 & 0xff;
          hbuf[2] = hold >>> 16 & 0xff;
          hbuf[3] = hold >>> 24 & 0xff;
          state.check = crc32(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
      /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = hold & 0xff;
          state.head.os = hold >> 8;
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = hold >>> 8 & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
      /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = hold >>> 8 & 0xff;
            state.check = crc32(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        } else if (state.head) {
          state.head.extra = null /*Z_NULL*/;
        }
        state.mode = EXTRA;
      /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) {
            copy = have;
          }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Array(state.head.extra_len);
              }
              utils.arraySet(state.head.extra, input, next,
              // extra field is limited to 65536 bytes
              // - no need for additional size check
              copy,
              /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
              len);
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if (state.flags & 0x0200) {
              state.check = crc32(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) {
            break inf_leave;
          }
        }
        state.length = 0;
        state.mode = NAME;
      /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) {
            break inf_leave;
          }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len && state.length < 65536 /*state.head.name_max*/) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) {
            break inf_leave;
          }
        } else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
      /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) {
            break inf_leave;
          }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len && state.length < 65536 /*state.head.comm_max*/) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) {
            break inf_leave;
          }
        } else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
      /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = state.flags >> 9 & 1;
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
      /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT;
        }
        strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE;
      /* falls through */
      case TYPE:
        if (flush === Z_BLOCK || flush === Z_TREES) {
          break inf_leave;
        }
      /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = hold & 0x01 /*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch (hold & 0x03) {/*BITS(2)*/case 0:
            /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:
            /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_; /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:
            /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== (hold >>> 16 ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) {
          break inf_leave;
        }
      /* falls through */
      case COPY_:
        state.mode = COPY;
      /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) {
            copy = have;
          }
          if (copy > left) {
            copy = left;
          }
          if (copy === 0) {
            break inf_leave;
          }
          //--- zmemcpy(put, next, copy); ---
          utils.arraySet(output, input, next, copy, put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f) + /*BITS(5)*/257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f) + /*BITS(5)*/1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f) + /*BITS(4)*/4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        //#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD;
          break;
        }
        //#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
      /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = hold & 0x07; //BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
      /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & (1 << state.lenbits) - 1]; /*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = here >>> 16 & 0xff;
            here_val = here & 0xffff;

            if (here_bits <= bits) {
              break;
            }
            //--- PULLBYTE() ---//
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          } else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03); //BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            } else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07); //BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            } else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f); //BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD) {
          break;
        }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) {
          break inf_leave;
        }
      /* falls through */
      case LEN_:
        state.mode = LEN;
      /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inflate_fast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & (1 << state.lenbits) - 1]; /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = here >>> 16 & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) {
            break;
          }
          //--- PULLBYTE() ---//
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> /*BITS(last.bits + last.op)*/last_bits)];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 0xff;
            here_val = here & 0xffff;

            if (last_bits + here_bits <= bits) {
              break;
            }
            //--- PULLBYTE() ---//
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
      /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & (1 << state.extra) - 1 /*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
      /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & (1 << state.distbits) - 1]; /*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = here >>> 16 & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) {
            break;
          }
          //--- PULLBYTE() ---//
          if (have === 0) {
            break inf_leave;
          }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> /*BITS(last.bits + last.op)*/last_bits)];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 0xff;
            here_val = here & 0xffff;

            if (last_bits + here_bits <= bits) {
              break;
            }
            //--- PULLBYTE() ---//
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = here_op & 15;
        state.mode = DISTEXT;
      /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & (1 << state.extra) - 1 /*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD;
          break;
        }
        //#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
      /* falls through */
      case MATCH:
        if (left === 0) {
          break inf_leave;
        }
        copy = _out - left;
        if (state.offset > copy) {
          /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
            // (!) This block is disabled in zlib defaults,
            // don't enable it for binary compatibility
            //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
            //          Trace((stderr, "inflate.c too far\n"));
            //          copy -= state.whave;
            //          if (copy > state.length) { copy = state.length; }
            //          if (copy > left) { copy = left; }
            //          left -= copy;
            //          state.length -= copy;
            //          do {
            //            output[put++] = 0;
            //          } while (--copy);
            //          if (state.length === 0) { state.mode = LEN; }
            //          break;
            //#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          } else {
            from = state.wnext - copy;
          }
          if (copy > state.length) {
            copy = state.length;
          }
          from_source = state.window;
        } else {
          /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) {
          copy = left;
        }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) {
          state.mode = LEN;
        }
        break;
      case LIT:
        if (left === 0) {
          break inf_leave;
        }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if (_out) {
            strm.adler = state.check =
            /*UPDATE(state.check, put - _out, _out);*/
            state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
      /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) {
              break inf_leave;
            }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
      /* falls through */
      case DONE:
        ret = Z_STREAM_END;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR;
      case SYNC:
      /* falls through */
      default:
        return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
    state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
      return Z_STREAM_ERROR;
    }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) {
    return Z_STREAM_ERROR;
  }
  state = strm.state;
  if ((state.wrap & 2) === 0) {
    return Z_STREAM_ERROR;
  }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}

function inflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var state;
  var dictid;
  var ret;

  /* check state */
  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) {
      return Z_STREAM_ERROR;
    }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK;
}

exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js

var BAD = 30; /* got a data error -- remain here until reset */
var TYPE = 12; /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
module.exports = function inflate_fast(strm, start) {
  var state;
  var _in; /* local strm.input */
  var last; /* have enough input while in < last */
  var _out; /* local strm.output */
  var beg; /* inflate()'s initial strm.output */
  var end; /* while out < end, enough space available */
  //#ifdef INFLATE_STRICT
  var dmax; /* maximum distance from zlib header */
  //#endif
  var wsize; /* window size or zero if not using window */
  var whave; /* valid bytes in the window */
  var wnext; /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  var s_window; /* allocated sliding window, if wsize != 0 */
  var hold; /* local strm.hold */
  var bits; /* local strm.bits */
  var lcode; /* local strm.lencode */
  var dcode; /* local strm.distcode */
  var lmask; /* mask for first level of length codes */
  var dmask; /* mask for first level of distance codes */
  var here; /* retrieved table entry */
  var op; /* code bits, operation, extra bits, or */
  /*  window position, window bytes to copy */
  var len; /* match length, unused bytes */
  var dist; /* match distance */
  var from; /* where to copy match from */
  var from_source;

  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
  //#ifdef INFLATE_STRICT
  dmax = state.dmax;
  //#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;

  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top: do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen: for (;;) {
      // Goto emulation
      op = here >>> 24 /*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = here >>> 16 & 0xff /*here.op*/;
      if (op === 0) {
        /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff /*here.val*/;
      } else if (op & 16) {
        /* length base */
        len = here & 0xffff /*here.val*/;
        op &= 15; /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & (1 << op) - 1;
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist: for (;;) {
          // goto emulation
          op = here >>> 24 /*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = here >>> 16 & 0xff /*here.op*/;

          if (op & 16) {
            /* distance base */
            dist = here & 0xffff /*here.val*/;
            op &= 15; /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & (1 << op) - 1;
            //#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
            //#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg; /* max distance in output */
            if (dist > op) {
              /* see if copy from window */
              op = dist - op; /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

                // (!) This block is disabled in zlib defaults,
                // don't enable it for binary compatibility
                //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
                //                if (len <= op - whave) {
                //                  do {
                //                    output[_out++] = 0;
                //                  } while (--len);
                //                  continue top;
                //                }
                //                len -= op - whave;
                //                do {
                //                  output[_out++] = 0;
                //                } while (--op > whave);
                //                if (op === 0) {
                //                  from = _out - dist;
                //                  do {
                //                    output[_out++] = output[from++];
                //                  } while (--len);
                //                  continue top;
                //                }
                //#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {
                /* very common case */
                from += wsize - op;
                if (op < len) {
                  /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist; /* rest from output */
                  from_source = output;
                }
              } else if (wnext < op) {
                /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {
                  /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {
                    /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist; /* rest from output */
                    from_source = output;
                  }
                }
              } else {
                /* contiguous in window */
                from += wnext - op;
                if (op < len) {
                  /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist; /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            } else {
              from = _out - dist; /* copy direct from output */
              do {
                /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          } else if ((op & 64) === 0) {
            /* 2nd level distance code */
            here = dcode[(here & 0xffff) + ( /*here.val*/hold & (1 << op) - 1)];
            continue dodist;
          } else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      } else if ((op & 64) === 0) {
        /* 2nd level length code */
        here = lcode[(here & 0xffff) + ( /*here.val*/hold & (1 << op) - 1)];
        continue dolen;
      } else if (op & 32) {
        /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      } else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
  strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
  state.hold = hold;
  state.bits = bits;
  return;
};

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = __webpack_require__(2);

var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [/* Length codes 257..285 base */
3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0];

var lext = [/* Length codes 257..285 extra */
16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78];

var dbase = [/* Distance codes 0..29 base */
1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0];

var dext = [/* Distance codes 0..29 extra */
16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];

module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
  var bits = opts.bits;
  //here = opts.here; /* table entry for duplication */

  var len = 0; /* a code's length in bits */
  var sym = 0; /* index of code symbols */
  var min = 0,
      max = 0; /* minimum and maximum code lengths */
  var root = 0; /* number of index bits for root table */
  var curr = 0; /* number of index bits for current table */
  var drop = 0; /* code bits to drop for sub-table */
  var left = 0; /* number of prefix codes available */
  var used = 0; /* code entries in table used */
  var huff = 0; /* Huffman code */
  var incr; /* for incrementing code, index */
  var fill; /* index for replicating entries */
  var low; /* low bits for current root entry */
  var mask; /* mask for low root bits */
  var next; /* next available space in table */
  var base = null; /* base value table to use */
  var base_index = 0;
  //  var shoextra;    /* extra bits table to use */
  var end; /* use base and extra for symbol > end */
  var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.
    This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.
    The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.
    The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) {
      break;
    }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {
    /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = 1 << 24 | 64 << 16 | 0;

    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = 1 << 24 | 64 << 16 | 0;

    opts.bits = 1;
    return 0; /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) {
      break;
    }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    } /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1; /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.
    root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.
    When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.
    used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.
    sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
    base = extra = work; /* dummy value--not used */
    end = 19;
  } else if (type === LENS) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;
  } else {
    /* DISTS */
    base = dbase;
    extra = dext;
    end = -1;
  }

  /* initialize opts for loop */
  huff = 0; /* starting code */
  sym = 0; /* starting code symbol */
  len = min; /* starting code length */
  next = table_index; /* current table to fill in */
  curr = root; /* current table index bits */
  drop = 0; /* current bits to drop from code for index */
  low = -1; /* trigger new sub-table when len > root */
  used = 1 << root; /* use root table entries */
  mask = used - 1; /* mask for comparing low */

  /* check available table space */
  if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    } else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    } else {
      here_op = 32 + 64; /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << len - drop;
    fill = 1 << curr;
    min = fill; /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << len - 1;
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) {
        break;
      }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min; /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) {
          break;
        }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = root << 24 | curr << 16 | next - table_index | 0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = len - drop << 24 | 64 << 16 | 0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function GZheader() {
  /* true if compressed data believed to be text */
  this.text = 0;
  /* modification time */
  this.time = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags = 0;
  /* operating system */
  this.os = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len = 0; // Actually, we don't need it in JS,
  // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done = false;
}

module.exports = GZheader;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

var table = [0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3, 0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91, 0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7, 0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5, 0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B, 0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59, 0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F, 0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D, 0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433, 0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01, 0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457, 0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65, 0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9, 0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F, 0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD, 0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683, 0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1, 0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7, 0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5, 0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B, 0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79, 0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D, 0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713, 0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21, 0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777, 0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45, 0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB, 0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9, 0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF, 0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D];

/**
 *
 *  Javascript crc32
 *  http://www.webtoolkit.info/
 *
 */
module.exports = function crc32(input, crc) {
    if (typeof input === "undefined" || !input.length) {
        return 0;
    }

    var isArray = utils.getTypeOf(input) !== "string";

    if (typeof crc == "undefined") {
        crc = 0;
    }
    var x = 0;
    var y = 0;
    var b = 0;

    crc = crc ^ -1;
    for (var i = 0, iTop = input.length; i < iTop; i++) {
        b = isArray ? input[i] : input.charCodeAt(i);
        y = (crc ^ b) & 0xFF;
        x = table[y];
        crc = crc >>> 8 ^ x;
    }

    return crc ^ -1;
};
// vim: set shiftwidth=4 softtabstop=4:

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

/**
 * An object to write any content to a string.
 * @constructor
 */
var StringWriter = function StringWriter() {
    this.data = [];
};
StringWriter.prototype = {
    /**
     * Append any content to the current string.
     * @param {Object} input the content to add.
     */
    append: function append(input) {
        input = utils.transformTo("string", input);
        this.data.push(input);
    },
    /**
     * Finalize the construction an return the result.
     * @return {string} the generated string.
     */
    finalize: function finalize() {
        return this.data.join("");
    }
};

module.exports = StringWriter;

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

/**
 * An object to write any content to an Uint8Array.
 * @constructor
 * @param {number} length The length of the array.
 */
var Uint8ArrayWriter = function Uint8ArrayWriter(length) {
    this.data = new Uint8Array(length);
    this.index = 0;
};
Uint8ArrayWriter.prototype = {
    /**
     * Append any content to the current array.
     * @param {Object} input the content to add.
     */
    append: function append(input) {
        if (input.length !== 0) {
            // with an empty Uint8Array, Opera fails with a "Offset larger than array size"
            input = utils.transformTo("uint8array", input);
            this.data.set(input, this.index);
            this.index += input.length;
        }
    },
    /**
     * Finalize the construction an return the result.
     * @return {Uint8Array} the generated array.
     */
    finalize: function finalize() {
        return this.data;
    }
};

module.exports = Uint8ArrayWriter;

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var base64 = __webpack_require__(6);
var utf8 = __webpack_require__(27);
var utils = __webpack_require__(0);
var ZipEntries = __webpack_require__(76);
module.exports = function (data, options) {
    var files, zipEntries, i, input;
    options = utils.extend(options || {}, {
        base64: false,
        checkCRC32: false,
        optimizedBinaryString: false,
        createFolders: false,
        decodeFileName: utf8.utf8decode
    });
    if (options.base64) {
        data = base64.decode(data);
    }

    zipEntries = new ZipEntries(data, options);
    files = zipEntries.files;
    for (i = 0; i < files.length; i++) {
        input = files[i];
        this.file(input.fileNameStr, input.decompressed, {
            binary: true,
            optimizedBinaryString: true,
            date: input.date,
            dir: input.dir,
            comment: input.fileCommentStr.length ? input.fileCommentStr : null,
            unixPermissions: input.unixPermissions,
            dosPermissions: input.dosPermissions,
            createFolders: options.createFolders
        });
    }
    if (zipEntries.zipComment.length) {
        this.comment = zipEntries.zipComment;
    }

    return this;
};

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var StringReader = __webpack_require__(28);
var NodeBufferReader = __webpack_require__(77);
var Uint8ArrayReader = __webpack_require__(30);
var ArrayReader = __webpack_require__(31);
var utils = __webpack_require__(0);
var sig = __webpack_require__(24);
var ZipEntry = __webpack_require__(78);
var support = __webpack_require__(3);
var jszipProto = __webpack_require__(7);
//  class ZipEntries {{{
/**
 * All the entries in the zip file.
 * @constructor
 * @param {String|ArrayBuffer|Uint8Array} data the binary stream to load.
 * @param {Object} loadOptions Options for loading the stream.
 */
function ZipEntries(data, loadOptions) {
    this.files = [];
    this.loadOptions = loadOptions;
    if (data) {
        this.load(data);
    }
}
ZipEntries.prototype = {
    /**
     * Check that the reader is on the speficied signature.
     * @param {string} expectedSignature the expected signature.
     * @throws {Error} if it is an other signature.
     */
    checkSignature: function checkSignature(expectedSignature) {
        var signature = this.reader.readString(4);
        if (signature !== expectedSignature) {
            throw new Error("Corrupted zip or bug : unexpected signature " + "(" + utils.pretty(signature) + ", expected " + utils.pretty(expectedSignature) + ")");
        }
    },
    /**
     * Check if the given signature is at the given index.
     * @param {number} askedIndex the index to check.
     * @param {string} expectedSignature the signature to expect.
     * @return {boolean} true if the signature is here, false otherwise.
     */
    isSignature: function isSignature(askedIndex, expectedSignature) {
        var currentIndex = this.reader.index;
        this.reader.setIndex(askedIndex);
        var signature = this.reader.readString(4);
        var result = signature === expectedSignature;
        this.reader.setIndex(currentIndex);
        return result;
    },
    /**
     * Read the end of the central directory.
     */
    readBlockEndOfCentral: function readBlockEndOfCentral() {
        this.diskNumber = this.reader.readInt(2);
        this.diskWithCentralDirStart = this.reader.readInt(2);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
        this.centralDirRecords = this.reader.readInt(2);
        this.centralDirSize = this.reader.readInt(4);
        this.centralDirOffset = this.reader.readInt(4);

        this.zipCommentLength = this.reader.readInt(2);
        // warning : the encoding depends of the system locale
        // On a linux machine with LANG=en_US.utf8, this field is utf8 encoded.
        // On a windows machine, this field is encoded with the localized windows code page.
        var zipComment = this.reader.readData(this.zipCommentLength);
        var decodeParamType = support.uint8array ? "uint8array" : "array";
        // To get consistent behavior with the generation part, we will assume that
        // this is utf8 encoded unless specified otherwise.
        var decodeContent = utils.transformTo(decodeParamType, zipComment);
        this.zipComment = this.loadOptions.decodeFileName(decodeContent);
    },
    /**
     * Read the end of the Zip 64 central directory.
     * Not merged with the method readEndOfCentral :
     * The end of central can coexist with its Zip64 brother,
     * I don't want to read the wrong number of bytes !
     */
    readBlockZip64EndOfCentral: function readBlockZip64EndOfCentral() {
        this.zip64EndOfCentralSize = this.reader.readInt(8);
        this.versionMadeBy = this.reader.readString(2);
        this.versionNeeded = this.reader.readInt(2);
        this.diskNumber = this.reader.readInt(4);
        this.diskWithCentralDirStart = this.reader.readInt(4);
        this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
        this.centralDirRecords = this.reader.readInt(8);
        this.centralDirSize = this.reader.readInt(8);
        this.centralDirOffset = this.reader.readInt(8);

        this.zip64ExtensibleData = {};
        var extraDataSize = this.zip64EndOfCentralSize - 44,
            index = 0,
            extraFieldId,
            extraFieldLength,
            extraFieldValue;
        while (index < extraDataSize) {
            extraFieldId = this.reader.readInt(2);
            extraFieldLength = this.reader.readInt(4);
            extraFieldValue = this.reader.readString(extraFieldLength);
            this.zip64ExtensibleData[extraFieldId] = {
                id: extraFieldId,
                length: extraFieldLength,
                value: extraFieldValue
            };
        }
    },
    /**
     * Read the end of the Zip 64 central directory locator.
     */
    readBlockZip64EndOfCentralLocator: function readBlockZip64EndOfCentralLocator() {
        this.diskWithZip64CentralDirStart = this.reader.readInt(4);
        this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
        this.disksCount = this.reader.readInt(4);
        if (this.disksCount > 1) {
            throw new Error("Multi-volumes zip are not supported");
        }
    },
    /**
     * Read the local files, based on the offset read in the central part.
     */
    readLocalFiles: function readLocalFiles() {
        var i, file;
        for (i = 0; i < this.files.length; i++) {
            file = this.files[i];
            this.reader.setIndex(file.localHeaderOffset);
            this.checkSignature(sig.LOCAL_FILE_HEADER);
            file.readLocalPart(this.reader);
            file.handleUTF8();
            file.processAttributes();
        }
    },
    /**
     * Read the central directory.
     */
    readCentralDir: function readCentralDir() {
        var file;

        this.reader.setIndex(this.centralDirOffset);
        while (this.reader.readString(4) === sig.CENTRAL_FILE_HEADER) {
            file = new ZipEntry({
                zip64: this.zip64
            }, this.loadOptions);
            file.readCentralPart(this.reader);
            this.files.push(file);
        }

        if (this.centralDirRecords !== this.files.length) {
            if (this.centralDirRecords !== 0 && this.files.length === 0) {
                // We expected some records but couldn't find ANY.
                // This is really suspicious, as if something went wrong.
                throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
            } else {
                // We found some records but not all.
                // Something is wrong but we got something for the user: no error here.
                // console.warn("expected", this.centralDirRecords, "records in central dir, got", this.files.length);
            }
        }
    },
    /**
     * Read the end of central directory.
     */
    readEndOfCentral: function readEndOfCentral() {
        var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
        if (offset < 0) {
            // Check if the content is a truncated zip or complete garbage.
            // A "LOCAL_FILE_HEADER" is not required at the beginning (auto
            // extractible zip for example) but it can give a good hint.
            // If an ajax request was used without responseType, we will also
            // get unreadable data.
            var isGarbage = !this.isSignature(0, sig.LOCAL_FILE_HEADER);

            if (isGarbage) {
                throw new Error("Can't find end of central directory : is this a zip file ? " + "If it is, see http://stuk.github.io/jszip/documentation/howto/read_zip.html");
            } else {
                throw new Error("Corrupted zip : can't find end of central directory");
            }
        }
        this.reader.setIndex(offset);
        var endOfCentralDirOffset = offset;
        this.checkSignature(sig.CENTRAL_DIRECTORY_END);
        this.readBlockEndOfCentral();

        /* extract from the zip spec :
            4)  If one of the fields in the end of central directory
                record is too small to hold required data, the field
                should be set to -1 (0xFFFF or 0xFFFFFFFF) and the
                ZIP64 format record should be created.
            5)  The end of central directory record and the
                Zip64 end of central directory locator record must
                reside on the same disk when splitting or spanning
                an archive.
         */
        if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {
            this.zip64 = true;

            /*
            Warning : the zip64 extension is supported, but ONLY if the 64bits integer read from
            the zip file can fit into a 32bits integer. This cannot be solved : Javascript represents
            all numbers as 64-bit double precision IEEE 754 floating point numbers.
            So, we have 53bits for integers and bitwise operations treat everything as 32bits.
            see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Bitwise_Operators
            and http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf section 8.5
            */

            // should look for a zip64 EOCD locator
            offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
            if (offset < 0) {
                throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");
            }
            this.reader.setIndex(offset);
            this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
            this.readBlockZip64EndOfCentralLocator();

            // now the zip64 EOCD record
            if (!this.isSignature(this.relativeOffsetEndOfZip64CentralDir, sig.ZIP64_CENTRAL_DIRECTORY_END)) {
                // console.warn("ZIP64 end of central directory not where expected.");
                this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
                if (this.relativeOffsetEndOfZip64CentralDir < 0) {
                    throw new Error("Corrupted zip : can't find the ZIP64 end of central directory");
                }
            }
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
            this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
            this.readBlockZip64EndOfCentral();
        }

        var expectedEndOfCentralDirOffset = this.centralDirOffset + this.centralDirSize;
        if (this.zip64) {
            expectedEndOfCentralDirOffset += 20; // end of central dir 64 locator
            expectedEndOfCentralDirOffset += 12 /* should not include the leading 12 bytes */ + this.zip64EndOfCentralSize;
        }

        var extraBytes = endOfCentralDirOffset - expectedEndOfCentralDirOffset;

        if (extraBytes > 0) {
            // console.warn(extraBytes, "extra bytes at beginning or within zipfile");
            if (this.isSignature(endOfCentralDirOffset, sig.CENTRAL_FILE_HEADER)) {
                // The offsets seem wrong, but we have something at the specified offset.
                // So… we keep it.
            } else {
                // the offset is wrong, update the "zero" of the reader
                // this happens if data has been prepended (crx files for example)
                this.reader.zero = extraBytes;
            }
        } else if (extraBytes < 0) {
            throw new Error("Corrupted zip: missing " + Math.abs(extraBytes) + " bytes.");
        }
    },
    prepareReader: function prepareReader(data) {
        var type = utils.getTypeOf(data);
        utils.checkSupport(type);
        if (type === "string" && !support.uint8array) {
            this.reader = new StringReader(data, this.loadOptions.optimizedBinaryString);
        } else if (type === "nodebuffer") {
            this.reader = new NodeBufferReader(data);
        } else if (support.uint8array) {
            this.reader = new Uint8ArrayReader(utils.transformTo("uint8array", data));
        } else if (support.array) {
            this.reader = new ArrayReader(utils.transformTo("array", data));
        } else {
            throw new Error("Unexpected error: unsupported type '" + type + "'");
        }
    },
    /**
     * Read a zip file and create ZipEntries.
     * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
     */
    load: function load(data) {
        this.prepareReader(data);
        this.readEndOfCentral();
        this.readCentralDir();
        this.readLocalFiles();
    }
};
// }}} end of ZipEntries
module.exports = ZipEntries;

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Uint8ArrayReader = __webpack_require__(30);

function NodeBufferReader(data) {
    this.data = data;
    this.length = this.data.length;
    this.index = 0;
    this.zero = 0;
}
NodeBufferReader.prototype = new Uint8ArrayReader();

/**
 * @see DataReader.readData
 */
NodeBufferReader.prototype.readData = function (size) {
    this.checkOffset(size);
    var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
    this.index += size;
    return result;
};
module.exports = NodeBufferReader;

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var StringReader = __webpack_require__(28);
var utils = __webpack_require__(0);
var CompressedObject = __webpack_require__(26);
var jszipProto = __webpack_require__(7);
var support = __webpack_require__(3);

var MADE_BY_DOS = 0x00;
var MADE_BY_UNIX = 0x03;

// class ZipEntry {{{
/**
 * An entry in the zip file.
 * @constructor
 * @param {Object} options Options of the current file.
 * @param {Object} loadOptions Options for loading the stream.
 */
function ZipEntry(options, loadOptions) {
    this.options = options;
    this.loadOptions = loadOptions;
}
ZipEntry.prototype = {
    /**
     * say if the file is encrypted.
     * @return {boolean} true if the file is encrypted, false otherwise.
     */
    isEncrypted: function isEncrypted() {
        // bit 1 is set
        return (this.bitFlag & 0x0001) === 0x0001;
    },
    /**
     * say if the file has utf-8 filename/comment.
     * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
     */
    useUTF8: function useUTF8() {
        // bit 11 is set
        return (this.bitFlag & 0x0800) === 0x0800;
    },
    /**
     * Prepare the function used to generate the compressed content from this ZipFile.
     * @param {DataReader} reader the reader to use.
     * @param {number} from the offset from where we should read the data.
     * @param {number} length the length of the data to read.
     * @return {Function} the callback to get the compressed content (the type depends of the DataReader class).
     */
    prepareCompressedContent: function prepareCompressedContent(reader, from, length) {
        return function () {
            var previousIndex = reader.index;
            reader.setIndex(from);
            var compressedFileData = reader.readData(length);
            reader.setIndex(previousIndex);

            return compressedFileData;
        };
    },
    /**
     * Prepare the function used to generate the uncompressed content from this ZipFile.
     * @param {DataReader} reader the reader to use.
     * @param {number} from the offset from where we should read the data.
     * @param {number} length the length of the data to read.
     * @param {JSZip.compression} compression the compression used on this file.
     * @param {number} uncompressedSize the uncompressed size to expect.
     * @return {Function} the callback to get the uncompressed content (the type depends of the DataReader class).
     */
    prepareContent: function prepareContent(reader, from, length, compression, uncompressedSize) {
        return function () {

            var compressedFileData = utils.transformTo(compression.uncompressInputType, this.getCompressedContent());
            var uncompressedFileData = compression.uncompress(compressedFileData);

            if (uncompressedFileData.length !== uncompressedSize) {
                throw new Error("Bug : uncompressed data size mismatch");
            }

            return uncompressedFileData;
        };
    },
    /**
     * Read the local part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readLocalPart: function readLocalPart(reader) {
        var compression, localExtraFieldsLength;

        // we already know everything from the central dir !
        // If the central dir data are false, we are doomed.
        // On the bright side, the local part is scary  : zip64, data descriptors, both, etc.
        // The less data we get here, the more reliable this should be.
        // Let's skip the whole header and dash to the data !
        reader.skip(22);
        // in some zip created on windows, the filename stored in the central dir contains \ instead of /.
        // Strangely, the filename here is OK.
        // I would love to treat these zip files as corrupted (see http://www.info-zip.org/FAQ.html#backslashes
        // or APPNOTE#4.4.17.1, "All slashes MUST be forward slashes '/'") but there are a lot of bad zip generators...
        // Search "unzip mismatching "local" filename continuing with "central" filename version" on
        // the internet.
        //
        // I think I see the logic here : the central directory is used to display
        // content and the local directory is used to extract the files. Mixing / and \
        // may be used to display \ to windows users and use / when extracting the files.
        // Unfortunately, this lead also to some issues : http://seclists.org/fulldisclosure/2009/Sep/394
        this.fileNameLength = reader.readInt(2);
        localExtraFieldsLength = reader.readInt(2); // can't be sure this will be the same as the central dir
        this.fileName = reader.readData(this.fileNameLength);
        reader.skip(localExtraFieldsLength);

        if (this.compressedSize == -1 || this.uncompressedSize == -1) {
            throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory " + "(compressedSize == -1 || uncompressedSize == -1)");
        }

        compression = utils.findCompression(this.compressionMethod);
        if (compression === null) {
            // no compression found
            throw new Error("Corrupted zip : compression " + utils.pretty(this.compressionMethod) + " unknown (inner file : " + utils.transformTo("string", this.fileName) + ")");
        }
        this.decompressed = new CompressedObject();
        this.decompressed.compressedSize = this.compressedSize;
        this.decompressed.uncompressedSize = this.uncompressedSize;
        this.decompressed.crc32 = this.crc32;
        this.decompressed.compressionMethod = this.compressionMethod;
        this.decompressed.getCompressedContent = this.prepareCompressedContent(reader, reader.index, this.compressedSize, compression);
        this.decompressed.getContent = this.prepareContent(reader, reader.index, this.compressedSize, compression, this.uncompressedSize);

        // we need to compute the crc32...
        if (this.loadOptions.checkCRC32) {
            this.decompressed = utils.transformTo("string", this.decompressed.getContent());
            if (jszipProto.crc32(this.decompressed) !== this.crc32) {
                throw new Error("Corrupted zip : CRC32 mismatch");
            }
        }
    },

    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readCentralPart: function readCentralPart(reader) {
        this.versionMadeBy = reader.readInt(2);
        this.versionNeeded = reader.readInt(2);
        this.bitFlag = reader.readInt(2);
        this.compressionMethod = reader.readString(2);
        this.date = reader.readDate();
        this.crc32 = reader.readInt(4);
        this.compressedSize = reader.readInt(4);
        this.uncompressedSize = reader.readInt(4);
        this.fileNameLength = reader.readInt(2);
        this.extraFieldsLength = reader.readInt(2);
        this.fileCommentLength = reader.readInt(2);
        this.diskNumberStart = reader.readInt(2);
        this.internalFileAttributes = reader.readInt(2);
        this.externalFileAttributes = reader.readInt(4);
        this.localHeaderOffset = reader.readInt(4);

        if (this.isEncrypted()) {
            throw new Error("Encrypted zip are not supported");
        }

        this.fileName = reader.readData(this.fileNameLength);
        this.readExtraFields(reader);
        this.parseZIP64ExtraField(reader);
        this.fileComment = reader.readData(this.fileCommentLength);
    },

    /**
     * Parse the external file attributes and get the unix/dos permissions.
     */
    processAttributes: function processAttributes() {
        this.unixPermissions = null;
        this.dosPermissions = null;
        var madeBy = this.versionMadeBy >> 8;

        // Check if we have the DOS directory flag set.
        // We look for it in the DOS and UNIX permissions
        // but some unknown platform could set it as a compatibility flag.
        this.dir = this.externalFileAttributes & 0x0010 ? true : false;

        if (madeBy === MADE_BY_DOS) {
            // first 6 bits (0 to 5)
            this.dosPermissions = this.externalFileAttributes & 0x3F;
        }

        if (madeBy === MADE_BY_UNIX) {
            this.unixPermissions = this.externalFileAttributes >> 16 & 0xFFFF;
            // the octal permissions are in (this.unixPermissions & 0x01FF).toString(8);
        }

        // fail safe : if the name ends with a / it probably means a folder
        if (!this.dir && this.fileNameStr.slice(-1) === '/') {
            this.dir = true;
        }
    },

    /**
     * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
     * @param {DataReader} reader the reader to use.
     */
    parseZIP64ExtraField: function parseZIP64ExtraField(reader) {

        if (!this.extraFields[0x0001]) {
            return;
        }

        // should be something, preparing the extra reader
        var extraReader = new StringReader(this.extraFields[0x0001].value);

        // I really hope that these 64bits integer can fit in 32 bits integer, because js
        // won't let us have more.
        if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
            this.uncompressedSize = extraReader.readInt(8);
        }
        if (this.compressedSize === utils.MAX_VALUE_32BITS) {
            this.compressedSize = extraReader.readInt(8);
        }
        if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
            this.localHeaderOffset = extraReader.readInt(8);
        }
        if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
            this.diskNumberStart = extraReader.readInt(4);
        }
    },
    /**
     * Read the central part of a zip file and add the info in this object.
     * @param {DataReader} reader the reader to use.
     */
    readExtraFields: function readExtraFields(reader) {
        var start = reader.index,
            extraFieldId,
            extraFieldLength,
            extraFieldValue;

        this.extraFields = this.extraFields || {};

        while (reader.index < start + this.extraFieldsLength) {
            extraFieldId = reader.readInt(2);
            extraFieldLength = reader.readInt(2);
            extraFieldValue = reader.readString(extraFieldLength);

            this.extraFields[extraFieldId] = {
                id: extraFieldId,
                length: extraFieldLength,
                value: extraFieldValue
            };
        }
    },
    /**
     * Apply an UTF8 transformation if needed.
     */
    handleUTF8: function handleUTF8() {
        var decodeParamType = support.uint8array ? "uint8array" : "array";
        if (this.useUTF8()) {
            this.fileNameStr = jszipProto.utf8decode(this.fileName);
            this.fileCommentStr = jszipProto.utf8decode(this.fileComment);
        } else {
            var upath = this.findExtraFieldUnicodePath();
            if (upath !== null) {
                this.fileNameStr = upath;
            } else {
                var fileNameByteArray = utils.transformTo(decodeParamType, this.fileName);
                this.fileNameStr = this.loadOptions.decodeFileName(fileNameByteArray);
            }

            var ucomment = this.findExtraFieldUnicodeComment();
            if (ucomment !== null) {
                this.fileCommentStr = ucomment;
            } else {
                var commentByteArray = utils.transformTo(decodeParamType, this.fileComment);
                this.fileCommentStr = this.loadOptions.decodeFileName(commentByteArray);
            }
        }
    },

    /**
     * Find the unicode path declared in the extra field, if any.
     * @return {String} the unicode path, null otherwise.
     */
    findExtraFieldUnicodePath: function findExtraFieldUnicodePath() {
        var upathField = this.extraFields[0x7075];
        if (upathField) {
            var extraReader = new StringReader(upathField.value);

            // wrong version
            if (extraReader.readInt(1) !== 1) {
                return null;
            }

            // the crc of the filename changed, this field is out of date.
            if (jszipProto.crc32(this.fileName) !== extraReader.readInt(4)) {
                return null;
            }

            return jszipProto.utf8decode(extraReader.readString(upathField.length - 5));
        }
        return null;
    },

    /**
     * Find the unicode comment declared in the extra field, if any.
     * @return {String} the unicode comment, null otherwise.
     */
    findExtraFieldUnicodeComment: function findExtraFieldUnicodeComment() {
        var ucommentField = this.extraFields[0x6375];
        if (ucommentField) {
            var extraReader = new StringReader(ucommentField.value);

            // wrong version
            if (extraReader.readInt(1) !== 1) {
                return null;
            }

            // the crc of the comment changed, this field is out of date.
            if (jszipProto.crc32(this.fileComment) !== extraReader.readInt(4)) {
                return null;
            }

            return jszipProto.utf8decode(extraReader.readString(ucommentField.length - 5));
        }
        return null;
    }
};
module.exports = ZipEntry;

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.string2binary = function (str) {
  return utils.string2binary(str);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.string2Uint8Array = function (str) {
  return utils.transformTo("uint8array", str);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.uint8Array2String = function (array) {
  return utils.transformTo("string", array);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.string2Blob = function (str) {
  var buffer = utils.transformTo("arraybuffer", str);
  return utils.arrayBuffer2Blob(buffer);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.arrayBuffer2Blob = function (buffer) {
  return utils.arrayBuffer2Blob(buffer);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.transformTo = function (outputType, input) {
  return utils.transformTo(outputType, input);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.getTypeOf = function (input) {
  return utils.getTypeOf(input);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.checkSupport = function (type) {
  return utils.checkSupport(type);
};

/**
 * @deprecated
 * This value will be removed in a future version without replacement.
 */
exports.MAX_VALUE_16BITS = utils.MAX_VALUE_16BITS;

/**
 * @deprecated
 * This value will be removed in a future version without replacement.
 */
exports.MAX_VALUE_32BITS = utils.MAX_VALUE_32BITS;

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.pretty = function (str) {
  return utils.pretty(str);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.findCompression = function (compressionMethod) {
  return utils.findCompression(compressionMethod);
};

/**
 * @deprecated
 * This function will be removed in a future version without replacement.
 */
exports.isRegExp = function (object) {
  return utils.isRegExp(object);
};

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MaterialCreator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _jszip = __webpack_require__(17);

var _jszip2 = _interopRequireDefault(_jszip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RGBFormat = 1022;
var RGBAFormat = 1023;

var ZipMTLLoader = function (_THREE$MTLLoader) {
  _inherits(ZipMTLLoader, _THREE$MTLLoader);

  function ZipMTLLoader(zip, manager) {
    _classCallCheck(this, ZipMTLLoader);

    var _this = _possibleConstructorReturn(this, (ZipMTLLoader.__proto__ || Object.getPrototypeOf(ZipMTLLoader)).call(this, manager));

    _this.zip = zip;
    return _this;
  }

  _createClass(ZipMTLLoader, [{
    key: 'parse',
    value: function parse(text) {
      var parsed = _get(ZipMTLLoader.prototype.__proto__ || Object.getPrototypeOf(ZipMTLLoader.prototype), 'parse', this).call(this, text);

      var materialCreator = new MaterialCreator(this.texturePath || this.path, this.materialOptions, this.zip);
      materialCreator.setCrossOrigin(this.crossOrigin);
      materialCreator.setManager(this.manager);
      materialCreator.setMaterials(parsed.materialsInfo);
      return materialCreator;
    }
  }]);

  return ZipMTLLoader;
}(THREE.MTLLoader);

exports.default = ZipMTLLoader;

var MaterialCreator = exports.MaterialCreator = function (_THREE$MTLLoader$Mate) {
  _inherits(MaterialCreator, _THREE$MTLLoader$Mate);

  function MaterialCreator(baseUrl, options, zip) {
    _classCallCheck(this, MaterialCreator);

    var _this2 = _possibleConstructorReturn(this, (MaterialCreator.__proto__ || Object.getPrototypeOf(MaterialCreator)).call(this, baseUrl, options));

    _this2.zip = zip;
    return _this2;
  }

  _createClass(MaterialCreator, [{
    key: 'loadImage',
    value: function loadImage(image) {
      var path = decodeURI(image);

      // Hack to support relative paths
      path = path.replace('../', '');

      var regex = new RegExp(path + '$');
      var files = this.zip.file(regex);

      // console.log( image, files );
      var img = new Image();
      var imgData;

      if (files.length) {
        var file = files[0];

        if (_jszip2.default.support.blob) {
          var imgBlob = new Blob([file.asArrayBuffer()]);
          imgData = URL.createObjectURL(imgBlob);
        } else {
          // if you don't need old browser support, please remove this branch !
          // /!\ warning, file.asBase64() doesn't exist so I use here the
          // DEPRECATED JSZip.base64 object.
          // It will be removed in JSZip v3: you should then use file.async("base64").
          var base64 = _jszip2.default.base64.encode(file.asBinary());
          // TODO: handle other mime types
          imgData = "data:image/png;base64," + base64;
        }

        // var blob = new Blob([file.asArrayBuffer()], { type: 'application/octet-binary' });
        img.src = imgData;
      }

      return img;
    }
  }, {
    key: 'loadTexture',
    value: function loadTexture(url, mapping, onLoad, onProgress, onError) {

      var texture = new THREE.Texture();

      var image = this.loadImage(url);

      texture.image = image;

      // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
      var isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:image\/jpeg/) === 0;

      texture.format = isJPEG ? RGBFormat : RGBAFormat;
      texture.needsUpdate = true;

      return texture;
    }
  }]);

  return MaterialCreator;
}(THREE.MTLLoader.MaterialCreator);

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransPallet2D = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _object3d = __webpack_require__(1);

var _object3d2 = _interopRequireDefault(_object3d);

var _threeControls = __webpack_require__(11);

var _threeControls2 = _interopRequireDefault(_threeControls);

var _zipLoader = __webpack_require__(16);

var _zipLoader2 = _interopRequireDefault(_zipLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var _scene = scene,
    RectPath = _scene.RectPath,
    Shape = _scene.Shape,
    Component = _scene.Component,
    Component3d = _scene.Component3d;


var NATURE = {
  mutable: false,
  resizable: true,
  rotatable: true,
  properties: [{
    type: 'number',
    label: 'depth',
    name: 'depth',
    property: 'depth'
  }]

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

};
var TransPallet = function (_Object3D) {
  _inherits(TransPallet, _Object3D);

  function TransPallet() {
    _classCallCheck(this, TransPallet);

    return _possibleConstructorReturn(this, (TransPallet.__proto__ || Object.getPrototypeOf(TransPallet)).apply(this, arguments));
  }

  _createClass(TransPallet, [{
    key: 'createObject',
    value: function createObject() {
      TransPallet.threedObjectLoader.then(this.addObject.bind(this));
    }
  }, {
    key: 'addObject',
    value: function addObject(extObject) {
      var _model = this.model,
          width = _model.width,
          height = _model.height,
          depth = _model.depth,
          _model$rotation = _model.rotation,
          rotation = _model$rotation === undefined ? 0 : _model$rotation;


      this.type = 'cj-truck';

      this.scale.set(width, depth, height);

      width /= 63.173;
      height /= 72.1887;
      depth /= 9.0388;

      var object = extObject.clone();
      this.add(object);

      this.scale.set(width, depth, height);
    }
  }], [{
    key: 'threedObjectLoader',
    get: function get() {
      if (!TransPallet._threedObjectLoader) {
        TransPallet._threedObjectLoader = new Promise(function (resolve, reject) {
          var objLoader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
          var mtlLoader = new THREE.MTLLoader(THREE.DefaultLoadingManager);

          objLoader.setPath('/obj/TransPallet/');
          mtlLoader.setPath('/obj/TransPallet/');

          mtlLoader.load('TransPallet.mtl', function (materials) {
            materials.preload();
            objLoader.setMaterials(materials);
            materials.side = THREE.frontSide;

            objLoader.load('TransPallet.obj', function (obj) {
              var extObj = obj;
              // if (extObj && extObj.children && extObj.children.length > 0) {
              //   extObj = extObj.children[0];
              // }

              // extObj.geometry.center();
              resolve(extObj);
            });
          });
        });
      }

      return TransPallet._threedObjectLoader;
    }
  }]);

  return TransPallet;
}(_object3d2.default);

exports.default = TransPallet;

var TransPallet2D = exports.TransPallet2D = function (_RectPath) {
  _inherits(TransPallet2D, _RectPath);

  function TransPallet2D() {
    _classCallCheck(this, TransPallet2D);

    return _possibleConstructorReturn(this, (TransPallet2D.__proto__ || Object.getPrototypeOf(TransPallet2D)).apply(this, arguments));
  }

  _createClass(TransPallet2D, [{
    key: 'is3dish',
    value: function is3dish() {
      return true;
    }
  }, {
    key: 'controls',
    get: function get() {}
  }, {
    key: 'nature',
    get: function get() {
      return NATURE;
    }
  }]);

  return TransPallet2D;
}(RectPath(Shape));

Component.register('trans-pallet', TransPallet2D);
Component3d.register('trans-pallet', TransPallet);

/***/ })
/******/ ]);