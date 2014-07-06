(function(window, undefined) {
	"use strict";

	// HELPER FUNCTIONS

    /**
     * 获取兼容当前浏览器的属性
     */
	var pfx = Splash.prototype.pfx = (function() {

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
     * 兼容的属性函数, 对于无法处理的属性，将以数组的形式返回
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
			pkey,
            unKnown = [],
            filter,
            RegFilter;

		if (isJSON) {
			for (var key in json) {
				if (json.hasOwnProperty(key)) {
					if (isIE && key == 'opacity') {

                        filter = target.currentStyle['filter'];
                        RegFilter = /(.+opacity=)([0-9]*)([\,\)]?.+)/;

                        var StrArr = RegFilter.exec(filter),
							strHead = StrArr[1],
							strFooter = StrArr[3];

						target.style["filter"] = strHead + json[key] * 100 + strFooter;

                    } else {
						pkey = pfx(key);
						if (pkey != null) {
							target.style[pkey] = json[key];
						}
                        else{
                            unKnown.push([json[key], key]);
                        }
					}
				}
			}

            return unKnown;

		} else if (isArray) {

			for (var i = 0, len = json.length; i < len; i++) {

				if (isIE) {
					if (json[i] == 'opacity') {
                        RegFilter = /[\,\)]?opacity=([0-9]+)/;
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

    // PRIVATE TOOLS
    var _containerData = {},
        configDefault = {
            width: "500px", // 容器的宽
            height: "500px", // 容器的高
            cube_map: [9, 9], //3行3列
            count: 81, // 块的数量
            isContinue: true, // 是否连播
            duration: 2000, // 500ms
            index : 0,
            from : "rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
            to : "rotateX(0deg) rotateY(180deg) rotateZ(0deg)",
            speed  : 400
        },
        cube_position = [],
        imgArr = [],
        Index = 0,
        container,
        target,
        swap = new Swap(),
        start = {x : 0, y : 0, z : 0},
        isAnimation = false;


    function CreateFrame(from, to){
        var cssAnimation = document.createElement('style');
        cssAnimation.type = "text/css";
        var pfx = "-webkit- -moz- -o-  ".split(" ");

        var str = "";

        for(var i = 0,len = pfx.length; i < len; i ++){
            str += "@" + pfx[i] + "keyframes slider{\n" +
                "from { \n" + pfx[i]  + "transform: " + from  + " } \n" +
                " 50 %{ background : rgba(0,0,0,0.8);}" +
                " to { \n" +  pfx[i]  + "transform: " + to +  "} \n" +
            "} \n";
        }

        var rules = document.createTextNode(str);

        cssAnimation.appendChild(rules);

        document.getElementsByTagName('head')[0].appendChild(cssAnimation);


    }

	function cubeConstructor(config) {
		var count = config.count,
			cube_map = config.cube_map,
			ContainerWidth = parseInt(config.width),
			ContainerHeight = parseInt(config.height),
			cubeWidth = ContainerWidth / cube_map[0],
			cubeHeight = ContainerHeight / cube_map[1],
			cubeContainer = [],
			row = config.cube_map[0],
			col = config.cube_map[1],
            speed = config.speed,
            duration = config.duration;

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
                "transition": "-webkit-transform" + " " + speed + "ms " + " linear",
                "transitionDelay"  : 0+ "ms",
                'transformStyle' : 'preserve-3d',
                "front" : {
                    "position" : "absolute",
                    "width" : cubeWidth + 'px',
                    "height" : cubeHeight + 'px',
                    "transform" : "rotateY(0deg)"
                },
                "back" : {
                    "position" : "absolute",
                    "width" : cubeWidth + 'px',
                    "height" : cubeHeight + 'px',
                    "transform" : "rotateY(180deg) translateZ(1px)"
                }
			}, div);

			cubeContainer.push(div);
		}


		return cubeContainer;
	}

	Splash.prototype.backgroundConver = function(face, img, config) {
		var	row = config.cube_map[0],
			col = config.cube_map[1],
            cubes = $$("." + face),
			percentage = [],
			percent = 1 / (row - 1),
            cubeArr = this.cubeArr;

		for (var i = 0, len = cubes.length; i < len ; i ++) {

			percentage.push([Math.floor(i / row) * percent, i % col * percent]);
			css(cubes[i], {
				'background': "url(" + img.src + ") no-repeat",
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
     * 初始化
     */
	Splash.prototype.init = function() {
		var config = this.config,
			self = this,
            duration = config.duration,
            from = config.from,
            to = config.to;

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

        CreateFrame(from, to);

        self.cubeArr = cubeConstructor(config);
		
		imgArr = wrapperImage(container);

        self.refreshInit();

        self.backgroundConver("front", imgArr[Index], config);
        self.backgroundConver('back', imgArr[Index + 1], config);

        self.Run(Index);

    };

    /**
     * 最初的更新节点
     */
    Splash.prototype.refreshInit = function(){
        var self = this,
            cubeArr = self.cubeArr,
            cubeLength = cubeArr.length,
            div,
            FrageMent = document.createDocumentFragment(),
            unKnown,
            childStyle,
            child,
            childType;


        for(var i = 0; i < cubeLength;  i++){
            div = document.createElement('div');
            div.className = 'cube';

            unKnown = css(div, cubeArr[i]);

            // 说明有无法处理的属性
            if(unKnown.length > 0){
                unKnown.forEach(function(value, index){

                    if(isObject(value[0])){
                        childStyle = unKnown[index][0];
                        childType = unKnown[index][1];
                        child = document.createElement('div');
                        css(child, childStyle);
                        child.className = childType;
                        div.appendChild(child);
                    }
                })
            }

            FrageMent.appendChild(div);
        }

        container.appendChild(FrageMent);
    };

    /**
     * 交换工具函数
     * @constructor
     */
    function Swap(){
        this.flag = [0,1];
        this.index = 0;
    }

    Swap.prototype.circle = function(arr){
        var self = this,
            flag = self.flag,
            index = self.index;

        self.index = self.flag[self.index] ? 0 : 1;

        return arr[self.index];

    };




    /**
     * 动画入口
     * @param index
     * @constructor
     */
    Splash.prototype.Run = function(index){
        var self = this,
            config = self.config,
            cubeArr = self.cubeArr;

        index == undefined && (index = config.index);

        index < 0 && (index = imgArr.length - 1) || index >= (imgArr.length - 1) && (index = -1);

        target = cubeArr[index];

        Index = index;

        self.next();
    };

    Splash.prototype.prev = function() {
        var self = this,
            isContinue = self.config.isContinue;

        if(!isContinue) return;


        self.slide(Index - 1, start, function(){
            if(!isContinue) return;
            Index--;
            self.Run(Index);
        });

        start.y += 180;

    };

    Splash.prototype.next = function () {
        var self = this,
            isContinue = self.config.isContinue;

        if(isAnimation) return;

        self.slide(Index + 1 ,start, function(){
            Index ++;
            if(!isContinue) return;
            self.Run(Index);
        });

        start.y += 180;

    };

    Splash.prototype.circle = function(){
        var len = imgArr.length;

        return (len + (Index % len)) % len;
    };

    Splash.prototype.slide = function(to, moveStyle, callback){
        var self = this,
            config = self.config,
            background,
            duration = config.duration,
            speed = config.speed,
            delay = config.delay,
            isContinue = config.isContinue;

        to < 0 && (to = imgArr.length - 1) || to > (imgArr.length - 1) && (to = 0);

        self.move(moveStyle, speed, duration , function(){

            background = swap.circle(['front', 'back']);

            self.backgroundConver(background, imgArr[to], config);

            callback.call(self);
        });
    };


    /**
     * 动画函数
     * @param value
     */
    Splash.prototype.move = function(value, speed, duration, callback){
        var cubes = $$(".cube");

        isAnimation = true;

        for (var i = 0, len = cubes.length; i < len; i++) {
            css(cubes[i], {
                transform : rotate(value)
            });
        }

        if(self._cancelSpeed)
            clearTimeout(self._cancelSpeed);


        self._cancelSpeed = setTimeout(function(){
            isAnimation = false;

            callback();

        }, speed + duration);

    };


	function Splash(container, config) {
		this.container = container;
		this.config = extend(config, configDefault);
        this.cubeArr = [];
	}


	window.Splash = Splash;

})(window);