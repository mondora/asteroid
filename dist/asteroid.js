(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["Asteroid"] = factory();
	else
		root["Asteroid"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _wolfy87Eventemitter = __webpack_require__(1);

	var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

	var _mixinsDdp = __webpack_require__(2);

	var _mixinsDdp2 = _interopRequireDefault(_mixinsDdp);

	var _mixinsMethods = __webpack_require__(4);

	var _mixinsMethods2 = _interopRequireDefault(_mixinsMethods);

	var _mixinsSubscriptions = __webpack_require__(5);

	var _mixinsSubscriptions2 = _interopRequireDefault(_mixinsSubscriptions);

	var _mixinsPasswordLogin = __webpack_require__(8);

	var _mixinsPasswordLogin2 = _interopRequireDefault(_mixinsPasswordLogin);

	var Asteroid = (function (_EventEmitter) {
	    function Asteroid(options) {
	        var _this = this;

	        _classCallCheck(this, Asteroid);

	        _get(Object.getPrototypeOf(Asteroid.prototype), "constructor", this).call(this);
	        Asteroid.initFunctions.forEach(function (fn) {
	            fn.call(_this, options);
	        });
	    }

	    _inherits(Asteroid, _EventEmitter);

	    return Asteroid;
	})(_wolfy87Eventemitter2["default"]);

	exports["default"] = Asteroid;

	Asteroid.initFunctions = [];

	Asteroid.mixin = function (mixin) {
	    Object.keys(mixin).forEach(function (key) {
	        var fn = mixin[key];
	        if (key === "init") {
	            Asteroid.initFunctions.push(fn);
	        } else {
	            Asteroid.prototype[key] = fn;
	        }
	    });
	    return Asteroid;
	};

	Asteroid.mixin(_mixinsDdp2["default"]).mixin(_mixinsMethods2["default"]).mixin(_mixinsSubscriptions2["default"]).mixin(_mixinsPasswordLogin2["default"]);
	module.exports = exports["default"];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * EventEmitter v4.2.11 - git.io/ee
	 * Unlicense - http://unlicense.org/
	 * Oliver Caldwell - http://oli.me.uk/
	 * @preserve
	 */

	'use strict';

	;(function () {
	    'use strict';

	    /**
	     * Class for managing events.
	     * Can be extended to provide event functionality in other classes.
	     *
	     * @class EventEmitter Manages event registering and emitting.
	     */
	    function EventEmitter() {}

	    // Shortcuts to improve speed and size
	    var proto = EventEmitter.prototype;
	    var exports = this;
	    var originalGlobalValue = exports.EventEmitter;

	    /**
	     * Finds the index of the listener for the event in its storage array.
	     *
	     * @param {Function[]} listeners Array of listeners to search through.
	     * @param {Function} listener Method to look for.
	     * @return {Number} Index of the specified listener, -1 if not found
	     * @api private
	     */
	    function indexOfListener(listeners, listener) {
	        var i = listeners.length;
	        while (i--) {
	            if (listeners[i].listener === listener) {
	                return i;
	            }
	        }

	        return -1;
	    }

	    /**
	     * Alias a method while keeping the context correct, to allow for overwriting of target method.
	     *
	     * @param {String} name The name of the target method.
	     * @return {Function} The aliased method
	     * @api private
	     */
	    function alias(name) {
	        return function aliasClosure() {
	            return this[name].apply(this, arguments);
	        };
	    }

	    /**
	     * Returns the listener array for the specified event.
	     * Will initialise the event object and listener arrays if required.
	     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	     * Each property in the object response is an array of listener functions.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Function[]|Object} All listener functions for the event.
	     */
	    proto.getListeners = function getListeners(evt) {
	        var events = this._getEvents();
	        var response;
	        var key;

	        // Return a concatenated array of all matching events if
	        // the selector is a regular expression.
	        if (evt instanceof RegExp) {
	            response = {};
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    response[key] = events[key];
	                }
	            }
	        } else {
	            response = events[evt] || (events[evt] = []);
	        }

	        return response;
	    };

	    /**
	     * Takes a list of listener objects and flattens it into a list of listener functions.
	     *
	     * @param {Object[]} listeners Raw listener objects.
	     * @return {Function[]} Just the listener functions.
	     */
	    proto.flattenListeners = function flattenListeners(listeners) {
	        var flatListeners = [];
	        var i;

	        for (i = 0; i < listeners.length; i += 1) {
	            flatListeners.push(listeners[i].listener);
	        }

	        return flatListeners;
	    };

	    /**
	     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Object} All listener functions for an event in an object.
	     */
	    proto.getListenersAsObject = function getListenersAsObject(evt) {
	        var listeners = this.getListeners(evt);
	        var response;

	        if (listeners instanceof Array) {
	            response = {};
	            response[evt] = listeners;
	        }

	        return response || listeners;
	    };

	    /**
	     * Adds a listener function to the specified event.
	     * The listener will not be added if it is a duplicate.
	     * If the listener returns true then it will be removed after it is called.
	     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListener = function addListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var listenerIsWrapped = typeof listener === 'object';
	        var key;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
	                listeners[key].push(listenerIsWrapped ? listener : {
	                    listener: listener,
	                    once: false
	                });
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of addListener
	     */
	    proto.on = alias('addListener');

	    /**
	     * Semi-alias of addListener. It will add a listener that will be
	     * automatically removed after its first execution.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addOnceListener = function addOnceListener(evt, listener) {
	        return this.addListener(evt, {
	            listener: listener,
	            once: true
	        });
	    };

	    /**
	     * Alias of addOnceListener.
	     */
	    proto.once = alias('addOnceListener');

	    /**
	     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	     * You need to tell it what event names should be matched by a regex.
	     *
	     * @param {String} evt Name of the event to create.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvent = function defineEvent(evt) {
	        this.getListeners(evt);
	        return this;
	    };

	    /**
	     * Uses defineEvent to define multiple events.
	     *
	     * @param {String[]} evts An array of event names to define.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvents = function defineEvents(evts) {
	        for (var i = 0; i < evts.length; i += 1) {
	            this.defineEvent(evts[i]);
	        }
	        return this;
	    };

	    /**
	     * Removes a listener function from the specified event.
	     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to remove the listener from.
	     * @param {Function} listener Method to remove from the event.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListener = function removeListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var index;
	        var key;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key)) {
	                index = indexOfListener(listeners[key], listener);

	                if (index !== -1) {
	                    listeners[key].splice(index, 1);
	                }
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of removeListener
	     */
	    proto.off = alias('removeListener');

	    /**
	     * Adds listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	     * You can also pass it a regular expression to add the array of listeners to all events that match it.
	     * Yeah, this function does quite a bit. That's probably a bad thing.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListeners = function addListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(false, evt, listeners);
	    };

	    /**
	     * Removes listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be removed.
	     * You can also pass it a regular expression to remove the listeners from all events that match it.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListeners = function removeListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(true, evt, listeners);
	    };

	    /**
	     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	     * The first argument will determine if the listeners are removed (true) or added (false).
	     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be added/removed.
	     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	     *
	     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
	        var i;
	        var value;
	        var single = remove ? this.removeListener : this.addListener;
	        var multiple = remove ? this.removeListeners : this.addListeners;

	        // If evt is an object then pass each of its properties to this method
	        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
	            for (i in evt) {
	                if (evt.hasOwnProperty(i) && (value = evt[i])) {
	                    // Pass the single listener straight through to the singular method
	                    if (typeof value === 'function') {
	                        single.call(this, i, value);
	                    } else {
	                        // Otherwise pass back to the multiple function
	                        multiple.call(this, i, value);
	                    }
	                }
	            }
	        } else {
	            // So evt must be a string
	            // And listeners must be an array of listeners
	            // Loop over it and pass each one to the multiple method
	            i = listeners.length;
	            while (i--) {
	                single.call(this, evt, listeners[i]);
	            }
	        }

	        return this;
	    };

	    /**
	     * Removes all listeners from a specified event.
	     * If you do not specify an event then all listeners will be removed.
	     * That means every event will be emptied.
	     * You can also pass a regex to remove all events that match it.
	     *
	     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeEvent = function removeEvent(evt) {
	        var type = typeof evt;
	        var events = this._getEvents();
	        var key;

	        // Remove different things depending on the state of evt
	        if (type === 'string') {
	            // Remove all listeners for the specified event
	            delete events[evt];
	        } else if (evt instanceof RegExp) {
	            // Remove all events matching the regex.
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    delete events[key];
	                }
	            }
	        } else {
	            // Remove all listeners in all events
	            delete this._events;
	        }

	        return this;
	    };

	    /**
	     * Alias of removeEvent.
	     *
	     * Added to mirror the node API.
	     */
	    proto.removeAllListeners = alias('removeEvent');

	    /**
	     * Emits an event of your choice.
	     * When emitted, every listener attached to that event will be executed.
	     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	     * So they will not arrive within the array on the other side, they will be separate.
	     * You can also pass a regular expression to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {Array} [args] Optional array of arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emitEvent = function emitEvent(evt, args) {
	        var listeners = this.getListenersAsObject(evt);
	        var listener;
	        var i;
	        var key;
	        var response;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key)) {
	                i = listeners[key].length;

	                while (i--) {
	                    // If the listener returns true then it shall be removed from the event
	                    // The function is executed either with a basic call or an apply if there is an args array
	                    listener = listeners[key][i];

	                    if (listener.once === true) {
	                        this.removeListener(evt, listener.listener);
	                    }

	                    response = listener.listener.apply(this, args || []);

	                    if (response === this._getOnceReturnValue()) {
	                        this.removeListener(evt, listener.listener);
	                    }
	                }
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of emitEvent
	     */
	    proto.trigger = alias('emitEvent');

	    /**
	     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {...*} Optional additional arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emit = function emit(evt) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        return this.emitEvent(evt, args);
	    };

	    /**
	     * Sets the current value to check against when executing listeners. If a
	     * listeners return value matches the one set here then it will be removed
	     * after execution. This value defaults to true.
	     *
	     * @param {*} value The new value to check for when executing listeners.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.setOnceReturnValue = function setOnceReturnValue(value) {
	        this._onceReturnValue = value;
	        return this;
	    };

	    /**
	     * Fetches the current value to check against when executing listeners. If
	     * the listeners return value matches this one then it should be removed
	     * automatically. It will return true by default.
	     *
	     * @return {*|Boolean} The current value to check for or the default, true.
	     * @api private
	     */
	    proto._getOnceReturnValue = function _getOnceReturnValue() {
	        if (this.hasOwnProperty('_onceReturnValue')) {
	            return this._onceReturnValue;
	        } else {
	            return true;
	        }
	    };

	    /**
	     * Fetches the events object and creates one if required.
	     *
	     * @return {Object} The events storage object.
	     * @api private
	     */
	    proto._getEvents = function _getEvents() {
	        return this._events || (this._events = {});
	    };

	    /**
	     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	     *
	     * @return {Function} Non conflicting EventEmitter class.
	     */
	    EventEmitter.noConflict = function noConflict() {
	        exports.EventEmitter = originalGlobalValue;
	        return EventEmitter;
	    };

	    // Expose the class either via AMD, CommonJS or the global object
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	            return EventEmitter;
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module === 'object' && module.exports) {
	        module.exports = EventEmitter;
	    } else {
	        exports.EventEmitter = EventEmitter;
	    }
	}).call(undefined);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.init = init;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _ddpJs = __webpack_require__(3);

	var _ddpJs2 = _interopRequireDefault(_ddpJs);

	function init(_ref) {
	    var _this = this;

	    var endpoint = _ref.endpoint;
	    var SocketConstructor = _ref.SocketConstructor;

	    this.endpoint = endpoint;
	    var options = {
	        endpoint: endpoint,
	        SocketConstructor: SocketConstructor || WebSocket
	    };
	    this._ddp = new _ddpJs2["default"](options).on("connected", function () {
	        _this.status = "connected";
	        _this.emit("connected");
	    }).on("disconnected", function () {
	        _this.status = "disconnected";
	        _this.emit("disconnected");
	    });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function webpackUniversalModuleDefinition(root, factory) {
		if (true) module.exports = factory(__webpack_require__(1));else if (typeof define === 'function' && define.amd) define(['wolfy87-eventemitter'], factory);else if (typeof exports === 'object') exports['DDP'] = factory(require('wolfy87-eventemitter'));else root['DDP'] = factory(root['wolfy87-eventemitter']);
	})(undefined, function (__WEBPACK_EXTERNAL_MODULE_1__) {
		return ( /******/(function (modules) {
				// webpackBootstrap
				/******/ // The module cache
				/******/var installedModules = {};

				/******/ // The require function
				/******/function __webpack_require__(moduleId) {

					/******/ // Check if module is in cache
					/******/if (installedModules[moduleId])
						/******/return installedModules[moduleId].exports;

					/******/ // Create a new module (and put it into the cache)
					/******/var module = installedModules[moduleId] = {
						/******/exports: {},
						/******/id: moduleId,
						/******/loaded: false
						/******/ };

					/******/ // Execute the module function
					/******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

					/******/ // Flag the module as loaded
					/******/module.loaded = true;

					/******/ // Return the exports of the module
					/******/return module.exports;
					/******/
				}

				/******/ // expose the modules object (__webpack_modules__)
				/******/__webpack_require__.m = modules;

				/******/ // expose the module cache
				/******/__webpack_require__.c = installedModules;

				/******/ // __webpack_public_path__
				/******/__webpack_require__.p = '';

				/******/ // Load entry module and return exports
				/******/return __webpack_require__(0);
				/******/
			})([
			/* 0 */
			/***/function (module, exports, __webpack_require__) {

				'use strict';

				Object.defineProperty(exports, '__esModule', {
					value: true
				});

				var _createClass = (function () {
					function defineProperties(target, props) {
						for (var i = 0; i < props.length; i++) {
							var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
						}
					}return function (Constructor, protoProps, staticProps) {
						if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
					};
				})();

				var _get = function get(_x, _x2, _x3) {
					var _again = true;_function: while (_again) {
						var object = _x,
						    property = _x2,
						    receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
							var parent = Object.getPrototypeOf(object);if (parent === null) {
								return undefined;
							} else {
								_x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
							}
						} else if ('value' in desc) {
							return desc.value;
						} else {
							var getter = desc.get;if (getter === undefined) {
								return undefined;
							}return getter.call(receiver);
						}
					}
				};

				function _interopRequireDefault(obj) {
					return obj && obj.__esModule ? obj : { 'default': obj };
				}

				function _classCallCheck(instance, Constructor) {
					if (!(instance instanceof Constructor)) {
						throw new TypeError('Cannot call a class as a function');
					}
				}

				function _inherits(subClass, superClass) {
					if (typeof superClass !== 'function' && superClass !== null) {
						throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
					}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
				}

				var _wolfy87Eventemitter = __webpack_require__(1);

				var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

				var _queue = __webpack_require__(2);

				var _queue2 = _interopRequireDefault(_queue);

				var _socket = __webpack_require__(3);

				var _socket2 = _interopRequireDefault(_socket);

				var _utils = __webpack_require__(4);

				var DDP_VERSION = '1';
				var PUBLIC_EVENTS = [
				// Subscription messages
				'ready', 'nosub', 'added', 'changed', 'removed',
				// Method messages
				'result', 'updated',
				// Error messages
				'error'];
				var RECONNECT_INTERVAL = 10000;

				var DDP = (function (_EventEmitter) {
					_inherits(DDP, _EventEmitter);

					_createClass(DDP, [{
						key: 'emit',
						value: function emit() {
							var _this = this;

							var args = arguments;
							setTimeout(function () {
								_get(Object.getPrototypeOf(DDP.prototype), 'emit', _this).apply(_this, args);
							}, 0);
						}
					}]);

					function DDP(options) {
						var _this2 = this;

						_classCallCheck(this, DDP);

						_get(Object.getPrototypeOf(DDP.prototype), 'constructor', this).call(this);

						this.status = 'disconnected';

						this.messageQueue = new _queue2['default'](function (message) {
							if (_this2.status === 'connected') {
								_this2.socket.send(message);
								return true;
							} else {
								return false;
							}
						});

						this.socket = new _socket2['default'](options.SocketConstructor, options.endpoint);

						this.socket.on('open', function () {
							// When the socket opens, send the `connect` message
							// to establish the DDP connection
							_this2.socket.send({
								msg: 'connect',
								version: DDP_VERSION,
								support: [DDP_VERSION]
							});
						});

						this.socket.on('close', function () {
							_this2.status = 'disconnected';
							_this2.messageQueue.empty();
							_this2.emit('disconnected');
							// Schedule a reconnection
							setTimeout(_this2.socket.connect.bind(_this2.socket), RECONNECT_INTERVAL);
						});

						this.socket.on('message:in', function (message) {
							if (message.msg === 'connected') {
								_this2.status = 'connected';
								_this2.messageQueue.process();
								_this2.emit('connected');
							} else if (message.msg === 'ping') {
								// Reply with a `pong` message to prevent the server from
								// closing the connection
								_this2.socket.send({ msg: 'pong', id: message.id });
							} else if ((0, _utils.contains)(PUBLIC_EVENTS, message.msg)) {
								_this2.emit(message.msg, message);
							}
						});

						this.socket.connect();
					}

					_createClass(DDP, [{
						key: 'method',
						value: function method(name, params) {
							var id = (0, _utils.uniqueId)();
							this.messageQueue.push({
								msg: 'method',
								id: id,
								method: name,
								params: params
							});
							return id;
						}
					}, {
						key: 'sub',
						value: function sub(name, params) {
							var id = (0, _utils.uniqueId)();
							this.messageQueue.push({
								msg: 'sub',
								id: id,
								name: name,
								params: params
							});
							return id;
						}
					}, {
						key: 'unsub',
						value: function unsub(id) {
							this.messageQueue.push({
								msg: 'unsub',
								id: id
							});
							return id;
						}
					}]);

					return DDP;
				})(_wolfy87Eventemitter2['default']);

				exports['default'] = DDP;
				module.exports = exports['default'];

				/***/
			},
			/* 1 */
			/***/function (module, exports) {

				module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

				/***/
			},
			/* 2 */
			/***/function (module, exports) {

				'use strict';

				Object.defineProperty(exports, '__esModule', {
					value: true
				});

				var _createClass = (function () {
					function defineProperties(target, props) {
						for (var i = 0; i < props.length; i++) {
							var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
						}
					}return function (Constructor, protoProps, staticProps) {
						if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
					};
				})();

				function _classCallCheck(instance, Constructor) {
					if (!(instance instanceof Constructor)) {
						throw new TypeError('Cannot call a class as a function');
					}
				}

				var Queue = (function () {

					/*
	    *   As the name implies, `consumer` is the (sole) consumer of the queue.
	    *   It gets called with each element of the queue and its return value
	    *   serves as a ack, determining whether the element is removed or not from
	    *   the queue, allowing then subsequent elements to be processed.
	    */

					function Queue(consumer) {
						_classCallCheck(this, Queue);

						this.consumer = consumer;
						this.queue = [];
					}

					_createClass(Queue, [{
						key: 'push',
						value: function push(element) {
							this.queue.push(element);
							this.process();
						}
					}, {
						key: 'process',
						value: function process() {
							var _this = this;

							setTimeout(function () {
								if (_this.queue.length !== 0) {
									var ack = _this.consumer(_this.queue[0]);
									if (ack) {
										_this.queue.shift();
										_this.process();
									}
								}
							}, 0);
						}
					}, {
						key: 'empty',
						value: function empty() {
							this.queue = [];
						}
					}]);

					return Queue;
				})();

				exports['default'] = Queue;
				module.exports = exports['default'];

				/***/
			},
			/* 3 */
			/***/function (module, exports, __webpack_require__) {

				'use strict';

				Object.defineProperty(exports, '__esModule', {
					value: true
				});

				var _createClass = (function () {
					function defineProperties(target, props) {
						for (var i = 0; i < props.length; i++) {
							var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
						}
					}return function (Constructor, protoProps, staticProps) {
						if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
					};
				})();

				var _get = function get(_x, _x2, _x3) {
					var _again = true;_function: while (_again) {
						var object = _x,
						    property = _x2,
						    receiver = _x3;desc = parent = getter = undefined;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
							var parent = Object.getPrototypeOf(object);if (parent === null) {
								return undefined;
							} else {
								_x = parent;_x2 = property;_x3 = receiver;_again = true;continue _function;
							}
						} else if ('value' in desc) {
							return desc.value;
						} else {
							var getter = desc.get;if (getter === undefined) {
								return undefined;
							}return getter.call(receiver);
						}
					}
				};

				function _interopRequireDefault(obj) {
					return obj && obj.__esModule ? obj : { 'default': obj };
				}

				function _classCallCheck(instance, Constructor) {
					if (!(instance instanceof Constructor)) {
						throw new TypeError('Cannot call a class as a function');
					}
				}

				function _inherits(subClass, superClass) {
					if (typeof superClass !== 'function' && superClass !== null) {
						throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
					}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
				}

				var _wolfy87Eventemitter = __webpack_require__(1);

				var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

				var Socket = (function (_EventEmitter) {
					_inherits(Socket, _EventEmitter);

					_createClass(Socket, [{
						key: 'emit',
						value: function emit() {
							var _this = this;

							var args = arguments;
							setTimeout(function () {
								_get(Object.getPrototypeOf(Socket.prototype), 'emit', _this).apply(_this, args);
							}, 0);
						}
					}]);

					function Socket(SocketConstructor, endpoint) {
						_classCallCheck(this, Socket);

						_get(Object.getPrototypeOf(Socket.prototype), 'constructor', this).call(this);
						this.SocketConstructor = SocketConstructor;
						this.endpoint = endpoint;
					}

					_createClass(Socket, [{
						key: 'send',
						value: function send(object) {
							var message = JSON.stringify(object);
							this.rawSocket.send(message);
							// Emit a copy of the object, as the listener might mutate it.
							this.emit('message:out', JSON.parse(message));
						}
					}, {
						key: 'connect',
						value: function connect() {
							var _this2 = this;

							this.rawSocket = new this.SocketConstructor(this.endpoint);

							/*
	      *   The `open`, `error` and `close` events are simply proxy-ed to `_socket`.
	      *   The `message` event is instead parsed into a js object (if possible) and
	      *   then passed as a parameter of the `message:in` event
	      */

							this.rawSocket.onopen = function () {
								return _this2.emit('open');
							};
							this.rawSocket.onerror = function (error) {
								return _this2.emit('error', error);
							};
							this.rawSocket.onclose = function () {
								return _this2.emit('close');
							};
							this.rawSocket.onmessage = function (message) {
								var object;
								try {
									object = JSON.parse(message.data);
								} catch (ignore) {
									// Simply ignore the malformed message and return
									return;
								}
								// Outside the try-catch block as it must only catch JSON parsing
								// errors, not errors that may occur inside a "message:in" event handler
								_this2.emit('message:in', object);
							};
						}
					}]);

					return Socket;
				})(_wolfy87Eventemitter2['default']);

				exports['default'] = Socket;
				module.exports = exports['default'];

				/***/
			},
			/* 4 */
			/***/function (module, exports) {

				'use strict';

				Object.defineProperty(exports, '__esModule', {
					value: true
				});
				exports.uniqueId = uniqueId;
				exports.contains = contains;
				var i = 0;

				function uniqueId() {
					return (i++).toString();
				}

				function contains(array, element) {
					return array.indexOf(element) !== -1;
				}

				/***/
			}
			/******/])
		);
	});
	;

	/************************************************************************/
	/******/

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.init = init;
	exports.apply = apply;
	exports.call = call;

	function init() {
	    var _this = this;

	    this._methodsCache = {};
	    this._ddp.on("result", function (msg) {
	        var method = _this._methodsCache[msg.id];
	        if (msg.error) {
	            method.reject(msg.error);
	        } else {
	            method.resolve(msg.result);
	        }
	        delete _this._methodsCache[msg.id];
	    });
	}

	function apply(method, params) {
	    var _this2 = this;

	    return new Promise(function (resolve, reject) {
	        var id = _this2._ddp.method(method, params);
	        _this2._methodsCache[id] = {
	            resolve: resolve,
	            reject: reject
	        };
	    });
	}

	function call(method) {
	    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        params[_key - 1] = arguments[_key];
	    }

	    return this.apply(method, params);
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.init = init;
	exports.subscribe = subscribe;
	exports.unsubscribe = unsubscribe;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	var _wolfy87Eventemitter = __webpack_require__(1);

	var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

	var _libSubscriptionCache = __webpack_require__(6);

	var _libSubscriptionCache2 = _interopRequireDefault(_libSubscriptionCache);

	var _libFingerprintSubJs = __webpack_require__(7);

	var _libFingerprintSubJs2 = _interopRequireDefault(_libFingerprintSubJs);

	function _restartSubscriptions() {
	    var _this = this;

	    this._subscriptionsCache.forEach(function (sub) {
	        _this._subscriptionsCache.del(sub.id);
	        _this.subscribe.apply(_this, [sub.name].concat(_toConsumableArray(sub.params)));
	    });
	}

	function init() {
	    var _this2 = this;

	    this._subscriptionsCache = new _libSubscriptionCache2["default"]();
	    this._ddp.on("ready", function (msg) {
	        msg.subs.forEach(function (id) {
	            _this2._subscriptionsCache.get(id).emit("ready");
	        });
	    }).on("nosub", function (msg) {
	        if (msg.error) {
	            _this2._subscriptionsCache.get(msg.id).emit("error", msg.error);
	        }
	        _this2._subscriptionsCache.del(msg.id);
	    }).on("connected", _restartSubscriptions.bind(this));
	}

	function subscribe(name) {
	    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        params[_key - 1] = arguments[_key];
	    }

	    var fingerprint = (0, _libFingerprintSubJs2["default"])(name, params);
	    var sub = this._subscriptionsCache.get(fingerprint);
	    if (!sub) {
	        // If there is no cached subscription, subscribe
	        var id = this._ddp.sub(name, params);
	        // Build the subscription object and save it in the cache
	        sub = new _wolfy87Eventemitter2["default"]();
	        sub.fingerprint = fingerprint;
	        sub.id = id;
	        sub.name = name;
	        sub.params = params;
	        this._subscriptionsCache.add(sub);
	    }
	    // Return the subscription object
	    return sub;
	}

	function unsubscribe(id) {
	    this._ddp.unsub(id);
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SubscriptionCache = (function () {
	    function SubscriptionCache() {
	        _classCallCheck(this, SubscriptionCache);

	        this.byFingerprint = {};
	        this.byId = {};
	    }

	    _createClass(SubscriptionCache, [{
	        key: "add",
	        value: function add(sub) {
	            this.byFingerprint[sub.fingerprint] = sub;
	            this.byId[sub.id] = sub;
	        }
	    }, {
	        key: "get",
	        value: function get(idOrFingerprint) {
	            return this.byId[idOrFingerprint] || this.byFingerprint[idOrFingerprint] || null;
	        }
	    }, {
	        key: "del",
	        value: function del(idOrFingerprint) {
	            var sub = this.get(idOrFingerprint) || {};
	            delete this.byFingerprint[sub.fingerprint];
	            delete this.byId[sub.id];
	        }
	    }, {
	        key: "forEach",
	        value: function forEach(iterator) {
	            var _this = this;

	            Object.keys(this.byId).forEach(function (id) {
	                iterator(_this.byId[id]);
	            });
	        }
	    }]);

	    return SubscriptionCache;
	})();

	exports["default"] = SubscriptionCache;
	module.exports = exports["default"];

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = fingerprintSub;

	function fingerprintSub(name, params) {
	    return JSON.stringify({ name: name, params: params });
	}

	module.exports = exports["default"];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.init = init;
	exports.createUser = createUser;
	exports.login = login;
	exports.logout = logout;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _libMultiStorageJs = __webpack_require__(9);

	var _libMultiStorageJs2 = _interopRequireDefault(_libMultiStorageJs);

	function _login(result) {
	    var _this = this;

	    this.userId = result.id;
	    this.loggedIn = true;
	    return _libMultiStorageJs2["default"].set(this.endpoint + "__login_token__", result.token).then(function () {
	        _this.emit("loggedIn");
	    });
	}

	function _logout() {
	    var _this2 = this;

	    this.userId = null;
	    this.loggedIn = false;
	    return _libMultiStorageJs2["default"].del(this.endpoint + "__login_token__").then(function () {
	        _this2.emit("loggedOut");
	    });
	}

	function _resumeLogin() {
	    var _this3 = this;

	    return _libMultiStorageJs2["default"].get(this.endpoint + "__login_token__").then(function (resume) {
	        if (!resume) {
	            throw "No login token";
	        }
	        return { resume: resume };
	    }).then(function (loginParameters) {
	        return _this3.call("login", loginParameters);
	    }).then(_login.bind(this))["catch"](_logout.bind(this));
	}

	function init() {
	    this.userId = null;
	    this.loggedIn = false;
	    this._ddp.on("connected", _resumeLogin.bind(this));
	}

	function createUser(options) {
	    return this.call("createUser", options).then(_login(this));
	}

	function login(_ref) {
	    var email = _ref.email;
	    var password = _ref.password;
	    var username = _ref.username;

	    var loginParameters = {
	        password: password,
	        user: {
	            username: username,
	            email: email
	        }
	    };
	    return this.call("login", loginParameters).then(_login(this));
	}

	function logout() {
	    return this.call("logout").then(_logout(this));
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.get = get;
	exports.set = set;
	exports.del = del;
	var genericStorage = {};

	function get(key) {
	    return new Promise(function (resolve) {
	        if (typeof chrome !== "undefined" && chrome.storage) {
	            chrome.storage.local.get(key, function (data) {
	                resolve(data[key]);
	            });
	        } else if (typeof localStorage !== "undefined") {
	            resolve(localStorage[key]);
	        } else {
	            resolve(genericStorage[key]);
	        }
	    });
	}

	function set(key, value) {
	    return new Promise(function (resolve) {
	        if (typeof chrome !== "undefined" && chrome.storage) {
	            var data = {};
	            data[key] = value;
	            chrome.storage.local.set(data, resolve);
	        } else if (typeof localStorage !== "undefined") {
	            localStorage[key] = value;
	            resolve();
	        } else {
	            genericStorage[key] = value;
	            resolve();
	        }
	    });
	}

	function del(key) {
	    return new Promise(function (resolve) {
	        if (typeof chrome !== "undefined" && chrome.storage) {
	            chrome.storage.local.remove(key, resolve);
	        } else if (typeof localStorage !== "undefined") {
	            delete localStorage[key];
	            resolve();
	        } else {
	            delete genericStorage[key];
	            resolve();
	        }
	    });
	}

/***/ }
/******/ ])
});
;