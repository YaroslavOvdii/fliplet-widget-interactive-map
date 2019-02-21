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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/interface/marker-panel.js":
/*!**************************************!*\
  !*** ./js/interface/marker-panel.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("Fliplet.InteractiveMap.component('marker-panel', {\n  componentName: 'Marker Panel',\n  props: {\n    id: {\n      type: String,\n      default: ''\n    },\n    name: {\n      type: String,\n      default: ''\n    },\n    icon: {\n      type: String,\n      default: 'fa fa-circle'\n    },\n    color: {\n      type: String,\n      default: '#337ab7'\n    },\n    size: {\n      type: String,\n      default: '24px'\n    },\n    type: {\n      type: String,\n      default: 'marker-panel'\n    },\n    isFromNew: {\n      type: Boolean,\n      default: true\n    }\n  },\n  methods: {\n    onInputData: function onInputData() {\n      var componentData = _.pick(this, ['id', 'name', 'icon', 'color', 'size', 'type', 'isFromNew']);\n\n      Fliplet.InteractiveMap.emit('marker-panel-settings-changed', componentData);\n    },\n    openIconPicker: function openIconPicker() {\n      var _this = this;\n\n      this.icon = this.icon || '';\n      window.iconPickerProvider = Fliplet.Widget.open('com.fliplet.icon-selector', {\n        // Also send the data I have locally, so that\n        // the interface gets repopulated with the same stuff\n        data: this.icon,\n        // Events fired from the provider\n        onEvent: function onEvent(event, data) {\n          if (event === 'interface-validate') {\n            Fliplet.Widget.toggleSaveButton(data.isValid === true);\n          }\n        }\n      });\n      window.addEventListener('message', function (event) {\n        if (event.data === 'cancel-button-pressed') {\n          window.iconPickerProvider.close();\n          window.iconPickerProvider = null;\n          Fliplet.Studio.emit('widget-save-label-update', {\n            text: 'Save'\n          });\n        }\n      });\n      Fliplet.Studio.emit('widget-save-label-update', {\n        text: 'Select & Save'\n      });\n      window.iconPickerProvider.then(function (data) {\n        if (data.data) {\n          _this.icon = data.data.icon;\n        }\n\n        _this.onInputData();\n\n        window.iconPickerProvider = null;\n        Fliplet.Studio.emit('widget-save-label-reset');\n        return Promise.resolve();\n      });\n    }\n  },\n  created: function created() {\n    Fliplet.InteractiveMap.on('markers-save', this.onInputData);\n  },\n  destroyed: function destroyed() {\n    Fliplet.InteractiveMap.off('markers-save', this.onInputData);\n  },\n  mounted: function mounted() {\n    var _this2 = this;\n\n    var $vm = this;\n    var $colorpickerElement = $('#list-item-color-' + $vm.id).parents('[colorpicker-component]');\n    $colorpickerElement.colorpicker({\n      container: true,\n      customClass: 'colorpicker-2x',\n      sliders: {\n        saturation: {\n          maxLeft: 235,\n          maxTop: 235\n        },\n        hue: {\n          maxTop: 235\n        },\n        alpha: {\n          maxTop: 235\n        }\n      }\n    });\n    $colorpickerElement.on('changeColor', function (e) {\n      $vm.color = e.value;\n      $vm.onInputData();\n    });\n    $('#list-item-color-' + $vm.id).on('click', function () {\n      $(_this2).prev('.input-group-addon').find('i').trigger('click');\n    });\n    $('.input-group-addon i').on('click', function () {\n      $(_this2).parents('.input-group-addon').next('#list-item-color-' + $vm.id).trigger('focus');\n    });\n  }\n});\n\n//# sourceURL=webpack:///./js/interface/marker-panel.js?");

/***/ }),

/***/ 5:
/*!********************************************!*\
  !*** multi ./js/interface/marker-panel.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! /Users/hcarneiro/Repos/Fliplet/fliplet-widget-interactive-floorplan/js/interface/marker-panel.js */\"./js/interface/marker-panel.js\");\n\n\n//# sourceURL=webpack:///multi_./js/interface/marker-panel.js?");

/***/ })

/******/ });