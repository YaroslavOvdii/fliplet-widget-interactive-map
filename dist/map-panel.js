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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/interface/map-panel.js":
/*!***********************************!*\
  !*** ./js/interface/map-panel.js ***!
  \***********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);

Fliplet.InteractiveMap.component('map-panel', {
  componentName: 'Map Panel',
  props: {
    id: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    image: {
      type: Object,
      default: undefined
    },
    error: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'map-panel'
    },
    isFromNew: {
      type: Boolean,
      default: true
    }
  },
  data: function data() {
    return {
      updateDebounced: _.debounce(this.updateDataSource, 1000),
      widgetInstanceId: Fliplet.Widget.getDefaultId(),
      dataSourceId: Fliplet.Widget.getData().markersDataSourceId,
      entries: undefined,
      columns: undefined,
      dataSourceConnection: undefined,
      shouldKeepMarkers: false,
      imageWidth: undefined,
      imageHeight: undefined,
      oldMapName: ''
    };
  },
  methods: {
    saveToDataSource: function saveToDataSource() {
      this.dataSourceConnection.commit(this.entries, this.columns);
      this.oldMapName = this.name;
      Fliplet.Studio.emit('reload-widget-instance', this.widgetInstanceId);
    },
    getMapName: function getMapName() {
      this.oldMapName = this.name;
    },
    updateDataSource: function updateDataSource() {
      var _this = this;

      Fliplet.DataSources.connect(this.dataSourceId).then(function (connection) {
        _this.dataSourceConnection = connection;
        connection.find({
          where: _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()({}, 'Map name', _this.oldMapName)
        }).then(function (records) {
          if (!records.length) {
            return;
          }

          _this.dataSourceConnection.find().then(function (records) {
            records.forEach(function (elem, index, array) {
              if (elem.data['Map name'] === _this.oldMapName) {
                array[index].data['Map name'] = _this.name;
              }
            });
            _this.entries = records;
            _this.columns = _.keys(records[0].data);

            _this.saveToDataSource();
          });
        });
      });
    },
    onInputData: function onInputData(imageSaved) {
      var componentData = _.pick(this, ['id', 'name', 'image', 'type', 'isFromNew']);

      Fliplet.InteractiveMap.emit('map-panel-settings-changed', componentData);

      if (imageSaved) {
        Fliplet.InteractiveMap.emit('new-map-added');
      }
    },
    openMapPicker: function openMapPicker() {
      var _this2 = this;

      Fliplet.DataSources.connect(this.dataSourceId).then(function (connection) {
        _this2.dataSourceConnection = connection;
        connection.find({
          where: _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()({}, 'Map name', _this2.name)
        }).then(function (records) {
          if (!records.length) {
            return;
          }

          Fliplet.Modal.confirm({
            title: 'Change image',
            message: 'Do you want to keep the existing markers?',
            buttons: {
              confirm: {
                label: 'Keep the markers',
                className: 'btn-success'
              },
              cancel: {
                label: 'Delete the markers',
                className: 'btn-danger'
              }
            }
          }).then(function (result) {
            if (result) {
              _this2.imageWidth = _this2.image.size[0];
              _this2.imageHeight = _this2.image.size[1];
              _this2.shouldKeepMarkers = true;
              return;
            }

            records.forEach(function (elem) {
              _this2.dataSourceConnection.removeById(elem.id);
            });
            Fliplet.Studio.emit('reload-widget-instance', _this2.widgetInstanceId);
          });
        });
      });
      Fliplet.Widget.toggleCancelButton(false);
      var filePickerData = {
        selectFiles: this.image ? [this.image] : [],
        selectMultiple: false,
        type: 'image',
        fileExtension: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIFF', 'SVG'],
        autoSelectOnUpload: true
      };
      window.filePickerProvider = Fliplet.Widget.open('com.fliplet.file-picker', {
        data: filePickerData,
        onEvent: function onEvent(e, data) {
          switch (e) {
            case 'widget-set-info':
              Fliplet.Studio.emit('widget-save-label-reset');
              Fliplet.Studio.emit('widget-save-label-update', {
                text: 'Select'
              });
              Fliplet.Widget.toggleSaveButton(!!data.length);
              break;
          }
        }
      });
      window.filePickerProvider.then(function (result) {
        if (_this2.shouldKeepMarkers) {
          var newImageWidth = result.data[0].size[0];
          var newImageHeight = result.data[0].size[1];

          if (newImageWidth !== _this2.imageWidth && newImageHeight !== _this2.imageHeight) {
            var widthRatioDifference = newImageWidth / _this2.imageWidth;
            var heightRatioDifference = newImageHeight / _this2.imageHeight;

            _this2.dataSourceConnection.find().then(function (records) {
              records.forEach(function (elem, index, array) {
                if (elem.data['Map name'] === _this2.name) {
                  array[index].data['Position X'] *= widthRatioDifference;
                  array[index].data['Position Y'] *= heightRatioDifference;
                }
              });
              _this2.entries = records;
              _this2.columns = _.keys(records[0].data);

              _this2.saveToDataSource();
            });
          }
        }

        Fliplet.Widget.toggleCancelButton(true);
        var imageUrl = result.data[0].url;
        var pattern = /[?&]size=/;

        if (!pattern.test(imageUrl)) {
          var params = imageUrl.substring(1).split('?');
          imageUrl += (params.length > 1 ? '&' : '?') + 'size=large';
        }

        result.data[0].url = imageUrl;
        _this2.image = result.data[0];

        _this2.onInputData(true);

        window.filePickerProvider = null;
        Fliplet.Studio.emit('widget-save-label-reset');
        return Promise.resolve();
      });
    }
  },
  created: function created() {
    Fliplet.InteractiveMap.on('maps-save', this.onInputData);
  },
  destroyed: function destroyed() {
    Fliplet.InteractiveMap.off('maps-save', this.onInputData);
  }
});
Fliplet.Widget.onCancelRequest(function () {
  var providersNames = ['filePickerProvider', 'iconPickerProvider'];

  _.each(providersNames, function (providerName) {
    if (window[providerName]) {
      window[providerName].close();
      window[providerName] = null;
    }
  });

  Fliplet.Widget.toggleSaveButton(true);
  Fliplet.Widget.toggleCancelButton(true);
  Fliplet.Studio.emit('widget-save-label-reset');
});

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/defineProperty.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/defineProperty.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;

/***/ }),

/***/ 4:
/*!*****************************************!*\
  !*** multi ./js/interface/map-panel.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


module.exports = __webpack_require__(/*! /Users/twu/Sites/fliplet/widgets/fliplet-widget-interactive-map/js/interface/map-panel.js */"./js/interface/map-panel.js");



/***/ })

/******/ });