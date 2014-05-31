var Splash = (function(window, undefined) {
	"use strict";

	// HELPER FUNCTIONS

	var pfx = (function() {

		var style = document.createElement('dummy').style,
			prefixes = 'Webkit Moz O ms Khtml'.split(' '),
			memory = {};

		return function(prop) {
			if (typeof memory[prop] === "undefined") {

				var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
					props = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');

				memory[prop] = null;
				for (var i in props) {
					if (style[props[i]] !== undefined) {
						memory[prop] = props[i];
						break;
					}
				}

			}

			return memory[prop];
		};

	})();

	function css(target, json) {
		if (arguments.length < 2) return;

		if (typeof json == 'string') {
			json = [json];
		}

		var isIE = document.currentStyle,
			styleValue = {},
			isJSON = isObject(arguments[1]),
			isArray = isLikeArray(arguments[1]);

		if (isJSON) {
			for (var key in json) {
				if (json.hasOwnProperty(key)) {
					if (isIE && key == 'opacity') {
						var filter = target.currentStyle['filter'],
							RegFilter = /(.+opacity=)([0-9]*)([\,\)]?.+)/,
							StrArr = RegFilter.exec(filter),
							strHead = StrArr[1],
							strFooter = StrArr[3];
						target.style["filter"] = strHead + json[key] * 100 + strFooter;
					} else {

						target.style[key] = json[key];
					}
				}
			}
		} else if (isArray) {

			for (var i = 0, len = json.length; i < len; i++) {

				if (isIE) {
					if (json[i] == 'opacity') {
						var RegFilter = /[\,\)]?opacity=([0-9]+)/,
							filter = target.currentStyle["filter"];
						styleValue[json[i]] = parseFloat(RegFilter.exec(filter)[1]);
					}
					styleValue[json[i]] = target.currentStyle[json[i]];
				} else {
					styleValue[json[i]] = window.getComputedStyle(target, null)[json[i]];
				}
			}
			return styleValue;
		}
	}

	function isObject(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	}

	function isElement(o) {
		return (
			typeof HTMLElement === "function" ? o instanceof HTMLElement : //DOM2
			o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
		);
	}

	function isLikeArray(obj){
		return obj && obj.length >= 0 && typeof obj != 'string';
	}

	function on(target, eventName, fn) {
		var factor = /\s+/g;
		//    debugger;
		var fnString = fn.toString().replace(factor, "");
		if (!target[eventName + "event"]) {
			target[eventName + 'event'] = {};
		}
		target[eventName + 'event'][eventName] = function(e) {
			fn.call(this, e);
		}
		var eventFunc = target[eventName + "event"][eventName];

		if (document.attachEvent) {
			target.attachEvent('on' + eventName, eventFunc);
		} else if (document.addEventListener) {
			target.addEventListener(eventName, eventFunc, false);
		} else {
			target['on' + eventName] = eventFunc;
		}
	}

	function off(target, eventName) {
		var factor = /\s+/g;
		var Func = target[eventName + "event"][eventName];
		if (document.detachEvent) {
			target.detachEvent('on' + eventName, Func);
		} else if (document.removeEventListener) {
			target.removeEventListener(eventName, Func, false);
		} else {
			target['on' + eventName] = null;
		}
	}


	function offAll(target, eventName) {
		var factor = /\s+/g;
		var Funcs = target[eventName + "event"];
		var e;
		for (var key in Funcs) {
			if (Funcs.hasOwnProperty(key)) {
				e = Funcs[key];
				if (document.detachEvent) {
					target.detachEvent('on' + eventName, e);
				} else if (document.addEventListener) {
					target.removeEventListener(eventName, e, false);
				} else {
					target['on' + eventName] = null;
				}
			}
		}
	}


	var translate = function(t) {
		return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
	};

	var rotate = function(r, revert) {
		var rX = " rotateX(" + r.x + "deg) ",
			rY = " rotateY(" + r.y + "deg) ",
			rZ = " rotateZ(" + r.z + "deg) ";

		return revert ? rZ + rY + rX : rX + rY + rZ;
	};

	var scale = function(s) {
		return " scale(" + s + ") ";
	};

	var perspective = function(p) {
		return " perspective(" + p + "px) ";
	};

	function $(selector) {
		return document.querySelector(selector);
	}

	function $$(selector) {
		return document.querySelectorAll(selector);
	}

	function extend(obj, extension) {
		for (var key in obj) {
			extension[key] = obj[key];
		}
		return extension;
	}

	function getData(obj) {
		var data = {},
			DOMMap;
		if (isElement(obj)) {
			DOMMap = obj.dataset;
			extend(values, DOMMap);
		}
		return data;
	}

	// CHECK SUPPORT

	var ua = navigator.userAgent.toLowerCase();
	var body = document.body;
	var isSupported =
		// browser should support CSS 3D transtorms 
		(pfx("perspective") !== null) &&

		// and `classList` and `dataset` APIs
		(body.classList) &&
		(body.dataset) &&

		// but some mobile devices need to be blacklisted,
		// because their CSS 3D support or hardware is not
		// good enough to run impress.js properly, sorry...
		(ua.search(/(iphone)|(ipod)|(android)/) === -1);


	// GLOBALS AND DEFAULTS

	var _containerData = {},
		configDefault = {
			width: "500px", // 容器的宽
			height: "500px", // 容器的高
			cube_map: [4, 4], //3行3列
			count: 16 // 块的数量
		},
		cube_position = [];




 	// PRIVATE TOOLS

	function cubeConstructor(config) {
		var count = config.count,
			cube_map = config.cube_map,
			ContainerWidth = parseInt(config.width),
			ContainerHeight = parseInt(config.height),
			cubeWidth = ContainerWidth / cube_map[0],
			cubeHeight = ContainerHeight / cube_map[1],
			cubeContainer = [],
			row = config.cube_map[0],
			col = config.cube_map[1];

		for (var i = 0, len = config.count; i < len; i++) {
			cube_position.push([(i % col) * cubeHeight, (Math.floor(i / row) % row) * cubeWidth]);
			var div = document.createElement('div');
			div.className = "cube";

			css(div,{
				"position" : "absolute",
				"width" : cubeWidth + "px",
				'height': cubeHeight + 'px',
				'top' : cube_position[i][0] + 'px',
				'left': cube_position[i][1] + 'px',
				'background':  "#fff"
			});

			cubeContainer.push(div);
		}

		return cubeContainer;
	}

	function backgroundConver(cubes, img, config) {
		var cubeCount = cubes.length,
			ContainerWidth = parseInt(config.width),
			ContainerHeight = parseInt(config.height),
			row = config.cube_map[0],
			col = config.cube_map[1],
			percentage = [],
			percen = 1 / (row - 1)

		for (var i = 0; i < cubeCount; i++) {
			percentage.push([Math.floor(i / row) * percen, i % col * percen]);
			css(cubes[i],{
				'background' : "url(" + img + ") no-repeat",
				'background-size' : row * 100 + "%",
				'background-position' :  percentage[i][0] * 100 + "%" + " " + percentage[i][1] * 100 + "%"
			});

		};
		return cubes;

	}

	function wrapperImage(wrapper) {
		if (!isElement(wrapper)) {
			return
		}

		var imgs = wrapper.getElementsByTagName('img'),
			imgSrc = [];

		for (var i = 0, len = imgs.length; i < len; i++) {
			imgSrc.push(imgs[i].src);
			css(imgs[i], {'display': 'none'});
		}

		return imgSrc;
	}

	function PackageCube(cubes) {
		var cover = document.createElement('div');
		cover.id = "cover";
		for (var i = 0, len = cubes.length; i < len; i++) {
			cover.appendChild(cubes[i]);
		}

		return cover;
	}

	function moveStyle(cubes) {

	}


	Splash.prototype.init = function() {
		var container = this.container,
			config = this.config,
			cubes,
			imgs,
			cover;

		css(container, {
			'width' : config.width,
			'height' :  config.height,
			'border' :  '1px solid #000',
			'position' : 'relative'
		});

		if (!isElement(container)) {
			throw new Error('invalid container')
		}

		cubes = cubeConstructor(config);
		imgs = wrapperImage(container);

		backgroundConver(cubes, imgs[0], config);

		cover = PackageCube(cubes);

		container.appendChild(cover);
	}


	function Splash(container, config) {
		this.container = container;
		this.config = config || configDefault;
	}



	return Splash;

})(window);