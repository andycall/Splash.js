(function(window, undefined) {
	"use strict";

	// HELPER FUNCTIONS

    /**
     * 获取兼容当前浏览器的属性
     */
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


    /**
     * 兼容的属性函数
     * @type {css}
     */
	var css = Splash.prototype.css = function (target, json) {
		if (arguments.length < 2) return;

		if (typeof json == 'string') {
			json = [json];
		}

		var isIE = document.currentStyle,
			styleValue = {},
			isJSON = isObject(arguments[1]),
			isArray = isLikeArray(arguments[1]),
			pkey;

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
						pkey = pfx(key);
						if (pkey != null) {
							target.style[pkey] = json[key];
						}
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
	};


    /**
     * 判断是否是对象
     * @param obj
     * @returns {boolean}
     */
	function isObject(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	}

    /**
     * 判断是否是DOM对象
     * @param o
     * @returns {boolean}
     */
	function isElement(o) {
		return (
			typeof HTMLElement === "function" ? o instanceof HTMLElement : //DOM2
			o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
		);
	}

    /**
     * 判断是否是数组或者类数组
     * @param obj
     * @returns {*|boolean}
     */
	function isLikeArray(obj) {
		return obj && obj.length >= 0 && typeof obj != 'string';
	}

    /**
     * 事件添加函数
     * @type {on}
     */
	var on = Splash.prototype.on = function (target, eventName, fn) {
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
	};

    /**
     * 事件解除函数
     * @type {off}
     */
	var off = Splash.prototype.off = function (target, eventName) {
		var factor = /\s+/g;
		var Func = target[eventName + "event"][eventName];
		if (document.detachEvent) {
			target.detachEvent('on' + eventName, Func);
		} else if (document.removeEventListener) {
			target.removeEventListener(eventName, Func, false);
		} else {
			target['on' + eventName] = null;
		}
	};


    /**
     * 解除一个对象的所有事件
     * @type {offAll}
     */
	var offAll = Splash.prototype.offAll = function (target, eventName) {
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
	};

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

    var body = document.body;

    // PRIVATE TOOLS
    var _containerData = {},
        configDefault = {
            width: "500px", // 容器的宽
            height: "500px", // 容器的高
            cube_map: [4, 4], //3行3列
            count: 16, // 块的数量
            isContinue: true, // 是否连播
            duration: 500, // 500ms
            index : 0
        },
        cube_position = [],
        imgArr = [],
        cubeArr = [],
        Index = 0,
        container,
        target;

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
			var div = {};

			extend({
				"position": "absolute",
				"width": cubeWidth + "px",
				'height': cubeHeight + 'px',
				'top': cube_position[i][0] + 'px',
				'left': cube_position[i][1] + 'px',
				'background': "#fff",
				"transition": "all 0.4s ease-in-out"
			}, div);

			cubeContainer.push(div);
		}

		return cubeContainer;
	}

	function backgroundConver(img, config) {
		var	row = config.cube_map[0],
			col = config.cube_map[1],
			percentage = [],
			percent = 1 / (row - 1);

		for (var i = 0, len = cubeArr.length; i < len ; i ++) {
			percentage.push([Math.floor(i / row) * percent, i % col * percent]);
			css(cubeArr[i], {
				'background': "url(" + img + ") no-repeat",
				'background-size': row * 100 + "%",
				'background-position': percentage[i][0] * 100 + "%" + " " + percentage[i][1] * 100 + "%"
			});
		}

	}

	function wrapperImage() {
		if (!isElement(container)) {
			return
		}

		var imgs = container.querySelectorAll('img'),
			imgSrc = [];

		for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];
			imgSrc.push(img);
			container.removeChild(img);
		}

		return imgSrc;
	}

    /**
     * 动画动作的添加
     */
	function addMovement() {

		for (var i = 0, len = cubeArr.length; i < len; i++) {
			extend({
				"transform": rotate({
					x: 0,
					y: 270,
					z: 90
				}),
				"transformStyle": "preserve-3d"
			}, cubeArr[i]);
		}

	}

    /**
     * 在动画背后添加一张图片
     * @param index
     * @param config
     */
	function changeImageBack(index, config){
		var backImage = imgArr[index + 1],
			imgNode = document.createElement('img');
		
		css(imgNode,{
			width : config.width,
			height : config.height
		});
		imgNode.src = backImage;

        container.appendChild(imgNode);
	}


	Splash.prototype.init = function() {
		var config = this.config,
			self = this;

		container = this.container;

		css(container, {
			'width': config.width,
			'height': config.height,
			'border': '1px solid #000',
			'position': 'relative'
		});

		if (!isElement(container)) {
			throw new Error('invalid container')
		}

		cubeArr = cubeConstructor(config);
		
		imgArr = wrapperImage(container);

        self.Run();
//		backgroundConver(cubeArr, imgArr[0], config);

//		PackageCube(wrapper, cubeArr);
		// console.log(imgArr);
		// cubes = addMovement(cubes);
	};

	Splash.prototype.prev = function() {

		if (options.continuous) slide(index - 1);
		else if (index) slide(index - 1);

	};

	Splash.prototype.next = function (index) {
		var self = this,
            config = self.config;

		changeImageBack(index, config);
		addMovement(index, config);

        self.refresh();
	};

    Splash.prototype.refresh = function(){
        var self = this,
            config = self.config,
            cubes = container.getElementsByTagName('div'),
            cubeLength,
            isFirst = true,
            div,
            FrageMent = document.createDocumentFragment();

        if(!cubes){
            cubeLength = cubeArr.length;
        }


        for(var i = 0; i < cubeLength;  i++){
            isFirst ? (div = document.createElement('div')) :
                    div = cubes[i];

            css(div, cubeArr[i]);

            FrageMent.appendChild(div);
        }

        container.appendChild(FrageMent);
    };

    Splash.prototype.Run = function(index){
        var self = this,
            config = self.config;

        index == undefined && (index = config.index);

        index < 0 && (index = cubeArr.length - 1) || index >= cubeArr.length && (index = 0);

        target = cubeArr[index];

        self.start(index);
    };

	Splash.prototype.start = function (index) {
		var self = this,
			config = self.config,
			isContinue = config.isContinue,
			duration = config.duration;

		clearTimeout(self._timer);

		if (index == imgArr.length) index = 0;

		if (imgArr.length < 2) {
			isContinue = false
		}

		self._timer = setTimeout(function() {
			
			self.next(index);
		
		}, duration);

	}

	function Splash(container, config) {
		this.container = container;
		this.config = config || configDefault;
	}



	window.Splash = Splash;

})(window);