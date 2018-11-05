(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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

var SceneProvider = function () {
  function SceneProvider(options) {
    _classCallCheck(this, SceneProvider);

    this.options = Object.assign({}, options);
  }

  _createClass(SceneProvider, [{
    key: 'creator',
    value: function creator(boardName, resolve, reject) {
      reject(Error('not implemented yet'));
    }
  }, {
    key: 'disposer',
    value: function disposer(id, ref) {}
  }, {
    key: 'provider',
    get: function get() {
      if (!this._provider) this._provider = new scene.ReferenceMap(this.creator.bind(this), this.disposer.bind(this));
      return this._provider;
    }
  }, {
    key: 'modelAccessor',
    get: function get() {
      return this.options.modelAccessor == undefined ? 'model' : this.options.modelAccessor;
    }
  }]);

  return SceneProvider;
}();

exports.default = SceneProvider;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sceneIntegrator = __webpack_require__(3);

var _sceneIntegrator2 = _interopRequireDefault(_sceneIntegrator);

var _sceneProvider = __webpack_require__(0);

var _sceneProvider2 = _interopRequireDefault(_sceneProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
module.exports = {
  SceneIntegrator: _sceneIntegrator2.default,
  SceneProvider: _sceneProvider2.default
};

exports.default = module.exports;


if (typeof window !== 'undefined') {
  window.SceneIntegrator = _sceneIntegrator2.default;
  window.SceneProvider = _sceneProvider2.default;
}

if (typeof global !== 'undefined') {
  global.SceneIntegrator = _sceneIntegrator2.default;
  global.SceneProvider = _sceneProvider2.default;
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _sceneProvider = __webpack_require__(0);

var _sceneProvider2 = _interopRequireDefault(_sceneProvider);

var _thingsBoardServerProvider = __webpack_require__(4);

var _thingsBoardServerProvider2 = _interopRequireDefault(_thingsBoardServerProvider);

var _localProvider = __webpack_require__(5);

var _localProvider2 = _interopRequireDefault(_localProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createSceneWrapper() {
  var wrapper = document.createElement('div');

  wrapper.style.width = wrapper.style.height = '100%';
  wrapper.style.position = 'relative';
  wrapper.setAttribute('class', 'scene-wrapper');

  return wrapper;
}

function toElement(targetEl) {
  var _targetEl;

  if (typeof targetEl == 'string') _targetEl = document.getElementById(targetEl);else _targetEl = targetEl;

  var wrapper;

  if (_targetEl.children && _targetEl.children.length > 0) {
    for (var i in _targetEl.children) {
      var child = _targetEl.children[i];
      if (child.getAttribute('class') == 'scene-wrapper') {
        wrapper = child;
        break;
      }
    }
  }
  if (!wrapper) {
    wrapper = createSceneWrapper();
    _targetEl.appendChild(wrapper);
  }

  _targetEl = wrapper;

  return _targetEl;
}

var providers = {
  'local': _localProvider2.default,
  'things-board-server': _thingsBoardServerProvider2.default
};

var SceneIntegrator = function () {
  _createClass(SceneIntegrator, null, [{
    key: 'instance',
    value: function instance(options) {
      if (!this._instance) this._instance = new SceneIntegrator(options);

      return this._instance;
    }
  }, {
    key: 'help',
    value: function help(functionName) {
      if (!functionName) {
        console.info('\n      ');
      }
    }
  }, {
    key: 'registerProvider',
    value: function registerProvider(name, clazz) {
      if (!providers[name]) providers[name] = clazz;else console.error('scene provider (' + name + ') already registered.');
    }
  }, {
    key: 'getProvider',
    value: function getProvider(name) {
      return providers[name];
    }
  }]);

  function SceneIntegrator(options) {
    _classCallCheck(this, SceneIntegrator);

    this.options = Object.assign({}, options);

    var fit = options.fit,
        license = options.license,
        _options$sceneProvide = options.sceneProvider,
        sceneProvider = _options$sceneProvide === undefined ? 'things-board-server' : _options$sceneProvide;


    if (typeof sceneProvider == 'string') {

      var registeredProvider = SceneIntegrator.getProvider(sceneProvider);
      this.sceneProvider = registeredProvider && new registeredProvider(options).provider;
    } else if (sceneProvider instanceof _sceneProvider2.default) {

      this.sceneProvider = sceneProvider;
    } else {
      console.error('Improper sceneProvider : ', sceneProvider);
      return;
    }

    this.fitMode = fit;

    if (scene) {
      scene.license(license);
    }
  }

  _createClass(SceneIntegrator, [{
    key: 'integrate',
    value: function integrate(options) {
      var target = options.target,
          sceneName = options.sceneName,
          callback = options.callback;


      this.show(sceneName, target, callback);
    }
  }, {
    key: 'fit',
    value: function fit(mode, scene) {
      scene.fit(mode || this.fitMode);
    }
  }, {
    key: 'show',
    value: function show(sceneName, targetEl, callback) {
      if (targetEl) {
        targetEl = toElement(targetEl);
        this._releaseRef(targetEl);
      }

      if (!sceneName) return;

      var self = this;

      this.sceneProvider.get(sceneName, true).then(function (scene) {

        if (scene.target && scene.target === targetEl) {
          scene.release();
          return;
        }

        if (targetEl) {
          scene.target = targetEl;
          self._bindAllEvents(scene._container, self);
          self.fit(self.fitMode, scene);
        }

        callback && callback.call(null, scene);
      }, function (e) {
        callback && callback.call(null, scene, e);
      });
    }
  }, {
    key: '_releaseRef',
    value: function _releaseRef(target) {
      if (target && target.scene) {
        this._unbindAllEvents(target.scene._container, this);

        // scene의 target을 어디론가 바꾸어주어야 한다.
        target.scene.release();
        target.scene.target = null;
        target.scene.dispose();

        delete target.scene;
      }
    }
  }, {
    key: '_bindAllEvents',
    value: function _bindAllEvents(container, scope) {
      for (var eventName in this.eventMap) {
        if (this.eventMap.hasOwnProperty(eventName)) {
          var handler = this[this.eventMap[eventName]];
          container.on(eventName, handler, scope);
        }
      }
    }
  }, {
    key: '_unbindAllEvents',
    value: function _unbindAllEvents(container, scope) {
      for (var eventName in this.eventMap) {
        if (this.eventMap.hasOwnProperty(eventName)) {
          var handler = this[this.eventMap[eventName]];
          container.off(eventName, handler, scope);
        }
      }
    }
  }, {
    key: 'fitMode',
    get: function get() {
      return this._fitMode || 'both';
    },
    set: function set(mode) {
      this._fitMode = mode;
    }
  }]);

  return SceneIntegrator;
}();

exports.default = SceneIntegrator;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sceneProvider = __webpack_require__(0);

var _sceneProvider2 = _interopRequireDefault(_sceneProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


function defaultBuilder(baseURL, boardName) {
  return baseURL + '/scenes/' + boardName;
}

var ThingsBoardServerProvider = function (_SceneProvider) {
  _inherits(ThingsBoardServerProvider, _SceneProvider);

  function ThingsBoardServerProvider() {
    _classCallCheck(this, ThingsBoardServerProvider);

    return _possibleConstructorReturn(this, (ThingsBoardServerProvider.__proto__ || Object.getPrototypeOf(ThingsBoardServerProvider)).apply(this, arguments));
  }

  _createClass(ThingsBoardServerProvider, [{
    key: 'creator',
    value: function creator(boardName, resolve, reject) {
      var _options = this.options,
          _options$baseURL = _options.baseURL,
          baseURL = _options$baseURL === undefined ? 'http://localhost/rest' : _options$baseURL,
          withCredentials = _options.withCredentials,
          authorizationKey = _options.authorizationKey,
          _options$authorizatio = _options.authorizationType,
          authorizationType = _options$authorizatio === undefined ? "token" : _options$authorizatio,
          _options$urlBuilder = _options.urlBuilder,
          urlBuilder = _options$urlBuilder === undefined ? defaultBuilder : _options$urlBuilder;


      var xhr = new XMLHttpRequest();

      var headers = {
        "Content-Type": 'application/json',
        "Authorization-Type": authorizationType,
        "Authorization-Key": authorizationKey
      };

      xhr.open('GET', urlBuilder(baseURL, boardName), true);
      xhr.onloadend = callback;
      xhr.ontimeout = timeout;
      xhr.withCredentials = true;
      xhr.responseType = 'json';
      xhr.timeout = 30000;

      for (var header in headers) {
        xhr.setRequestHeader(header, headers[header]);
      }xhr.send();

      var self = this;

      function callback(e) {
        var xhr = e.srcElement;

        if (xhr.status !== 200) {
          if (xhr.status == 401) self.handleUnauthorized();else self.openResponseError(xhr.response);

          reject('cannot fetch resource: ' + boardName + ', status: ' + xhr.status);
          return;
        }

        var info = e.target.response;

        if (!info) {
          reject('cannot fetch resource: ' + boardName + ', status: ' + xhr.status);
          return;
        }

        self.provider.get(boardName).then(function (s) {
          resolve(s);
          console.warn("Board fetched more than twice.", boardName);
        }, function (e) {

          try {
            var model = self.computeModel(info);

            var s = scene.create({
              model: model,
              mode: 0,
              refProvider: self.provider
            });

            s.app.baseUrl = baseURL;

            resolve(s);
          } catch (e) {
            reject({
              message: 'cannot create board: ' + boardName,
              detail: e
            });
          }
        });
      }

      function timeout() {
        reject('Timeout occured while fetching board: ' + boardName);
      }
    }
  }, {
    key: 'computeModel',
    value: function computeModel(info) {
      var _options$modelAccesso = this.options.modelAccessor,
          modelAccessor = _options$modelAccesso === undefined ? 'model' : _options$modelAccesso;


      var objectInfo = info;
      if (typeof info === 'string') {
        objectInfo = JSON.parse(info);
      }

      if (!modelAccessor) return objectInfo;else return JSON.parse(eval('objectInfo.' + modelAccessor));
    }
  }]);

  return ThingsBoardServerProvider;
}(_sceneProvider2.default);

exports.default = ThingsBoardServerProvider;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sceneProvider = __webpack_require__(0);

var _sceneProvider2 = _interopRequireDefault(_sceneProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright © HatioLab Inc. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var LocalProvider = function (_SceneProvider) {
  _inherits(LocalProvider, _SceneProvider);

  function LocalProvider() {
    _classCallCheck(this, LocalProvider);

    return _possibleConstructorReturn(this, (LocalProvider.__proto__ || Object.getPrototypeOf(LocalProvider)).apply(this, arguments));
  }

  _createClass(LocalProvider, [{
    key: 'creator',
    value: function creator(sceneName, resolve, reject) {
      var models = this.options.models;


      var model = models[sceneName];
      if (!model) {
        reject('cannot find model: ' + sceneName);
        return;
      }

      var self = this;

      var s = scene.create({
        model: model,
        mode: 0,
        refProvider: self.provider
      });

      resolve(s);
    }
  }]);

  return LocalProvider;
}(_sceneProvider2.default);

exports.default = LocalProvider;

/***/ })
/******/ ]);
});