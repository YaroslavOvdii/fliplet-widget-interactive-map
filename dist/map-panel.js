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
/*! no static exports found */
/***/ (function(module, exports) {

eval("Fliplet.InteractiveMap.component('map-panel', {\n  componentName: 'Map Panel',\n  props: {\n    id: {\n      type: String,\n      default: ''\n    },\n    name: {\n      type: String,\n      default: ''\n    },\n    image: {\n      type: Object,\n      default: undefined\n    },\n    type: {\n      type: String,\n      default: 'map-panel'\n    },\n    isFromNew: {\n      type: Boolean,\n      default: true\n    }\n  },\n  methods: {\n    onInputData: function onInputData(imageSaved) {\n      var componentData = _.pick(this, ['id', 'name', 'image', 'type', 'isFromNew']);\n\n      Fliplet.InteractiveMap.emit('map-panel-settings-changed', componentData);\n\n      if (imageSaved) {\n        Fliplet.InteractiveMap.emit('new-map-added');\n      }\n    },\n    openMapPicker: function openMapPicker() {\n      var _this = this;\n\n      var filePickerData = {\n        selectFiles: this.image ? [this.image] : [],\n        selectMultiple: false,\n        type: 'image',\n        fileExtension: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIFF', 'SVG'],\n        autoSelectOnUpload: true\n      };\n      window.filePickerProvider = Fliplet.Widget.open('com.fliplet.file-picker', {\n        data: filePickerData,\n        onEvent: function onEvent(e, data) {\n          switch (e) {\n            case 'widget-set-info':\n              Fliplet.Studio.emit('widget-save-label-reset');\n              Fliplet.Studio.emit('widget-save-label-update', {\n                text: 'Select'\n              });\n              Fliplet.Widget.toggleSaveButton(!!data.length);\n              break;\n          }\n        }\n      });\n      window.filePickerProvider.then(function (result) {\n        _this.image = result.data[0];\n\n        _this.onInputData(true);\n\n        window.filePickerProvider = null;\n        Fliplet.Studio.emit('widget-save-label-reset');\n        return Promise.resolve();\n      });\n    }\n  },\n  created: function created() {\n    Fliplet.InteractiveMap.on('maps-save', this.onInputData);\n  },\n  destroyed: function destroyed() {\n    Fliplet.InteractiveMap.off('maps-save', this.onInputData);\n  }\n});\n\n//# sourceURL=webpack:///./js/interface/map-panel.js?");

/***/ }),

/***/ 4:
/*!*****************************************!*\
  !*** multi ./js/interface/map-panel.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! /Users/hcarneiro/Repos/Fliplet/fliplet-widget-interactive-floorplan/js/interface/map-panel.js */\"./js/interface/map-panel.js\");\n\n\n//# sourceURL=webpack:///multi_./js/interface/map-panel.js?");

/***/ })

/******/ });