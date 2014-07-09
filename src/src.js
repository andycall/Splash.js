/**
 * Splash.js
 *
 * Splash.js is a simple tool to build some wonderful
 * transform styles
 *
 * ------------------------------------------------
 *  author:  AndyCall
 *  version: 0.0.1
 *  source:     http://github.com/dongtiangche/Splash.js
 *  contact : <a href="mailto:dongtiangche@gmail.com">Andy Call</a>
 */




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
     * 在某些地方需要返回类似-webkit-transform这样的东西
     */
    var pfx_second = (function(){

        var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            prefix = '-webkit -moz -o -ms -khtml'.split(' '),
            memory = {};

        return function(prop) {
            if (typeof memory[prop] === "undefined") {

                var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' '),
                    real_prop = (prop + " "  + prefix.join('-' + prop + ' ')).split(' ');

                for (var i in props) {
                    if (style[props[i]] !== undefined) {
                        memory[prop] = real_prop[i];
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

    // Global Variables
    var configDefault = {
            cube_map: 13, //3行3列
            isContinue: true, // 是否连播
            duration: 2000, // 500ms
            index : 0,
            speed  : 400,
            transitionEnd : function(){console.log(this)}

        },
        cube_position = [], // 方块位置缓存数组
        imgArr = [],       // 图片缓存数组
        Index = 0,  // 切换索引
        container, // 容器
        swap = new Swap(), // 摆动器
        changeStyle = {x : 0, y : 0, z : 0}, // 切换效果对象
        isAnimation = false; // 判断是否正在进行动画

    /**
     * 方块构造器
     * @param config
     * @returns {Array}
     */
	function cubeConstructor(config) {
		var count = config.cube_map * config.cube_map,
			cube_map = [config.cube_map, config.cube_map],
			ContainerWidth = parseInt(config.width),
			ContainerHeight = parseInt(config.height),
			cubeWidth = parseFloat((ContainerWidth / cube_map[0]).toFixed(8)),
			cubeHeight = parseFloat((ContainerHeight / cube_map[1]).toFixed(8)),
			cubeContainer = [],
			row = cube_map[0],
			col = cube_map[1],
            speed = config.speed,
            transformPfx = pfx_second("transform"),
            pfxTransform = pfx("transform");

		for (var i = 0, len = count; i < len; i++) {
			cube_position.push([(i % col) * cubeHeight, (Math.floor(i / row) % row) * cubeWidth]);
			var div = {};

			extend({
				"position": "absolute",
                "display" : "inline-block",
				"width": cubeWidth + "px",
				'height': cubeHeight + 'px',
				'top': cube_position[i][0] + 'px',
				'left': cube_position[i][1] + 'px',
				'background': "#fff",
                "transition": transformPfx + " " + speed + "ms " + " linear",
                "transitionDelay"  : 0+ "ms",
                'transformStyle' : 'preserve-3d',
                "WebkitBackfaceVisibility": "hidden",
                "front" : {
                    "position" : "absolute",
                    "width" : cubeWidth + 'px',
                    "height" : cubeHeight + 'px',
                    "transform" : "rotateY(0deg)",
                    "WebkitBackfaceVisibility": "hidden"
                },
                "back" : {
                    "position" : "absolute",
                    "width" : cubeWidth + 'px',
                    "height" : cubeHeight + 'px',
                    "transform" : "rotateY(180deg) translateZ(1px)",
                    "WebkitBackfaceVisibility": "hidden"
                }
			}, div);

            div[pfxTransform] = rotate(changeStyle);

			cubeContainer.push(div);
		}


		return cubeContainer;
	}


    /**
     * 为索引添加click事件
     * @param obj
     * @private
     */
    function addButtonEvent (obj){
        var index,
            self = this,
            isContinue = self.config.isContinue,
            lis;

        function fireAction(){
            index = parseInt(this.innerHTML);
            if(isAnimation) return;

            Index = index - 1;

            lis = container.getElementsByTagName('li');

            for(var i = 0,len = lis.length; i < len; i ++){
                lis[i].className = "select";
            }

            this.className = "selected";

            clearInterval(self._cancelSpeed);

            self.slide(Index, changeStyle, function(){
                Index ++;
                if(!isContinue) return;

                self.Run(Index);
            });
        }

        on(obj, 'click', function(){
            fireAction.call(this);
        });
        on(obj,'mouseover', function(){
            fireAction.call(this);
        })
    };

    /**
     * 添加索引
     * @private
     */
    function listConstructor(){
        var wrapper = document.createElement('ul'),
            self = this;

        for(var i = 0,len = imgArr.length; i < len; i ++){
            var li = document.createElement('li');
            li.className = "select";
            li.textContent = i + 1;
            addButtonEvent.call(self, li);
            wrapper.appendChild(li);
        }

        container.appendChild(wrapper);
    };

    /**
     * 负责为每个小方块设置背景
     * @param face
     * @param img
     * @param config
     */
	function backgroundConver(face, img, config) {
		var	row = config.cube_map,
			col = config.cube_map,
            cubes = $$("." + face),
			percentage = [],
			percent = 1 / (row - 1);


		for (var i = 0, len = cubes.length; i < len ; i ++) {

			percentage.push([Math.floor(i / row) * percent, i % col * percent]);


            var back_position = (percentage[i][0] * 100) + "%" + " " + percentage[i][1] * 100 + "%";

			css(cubes[i], {
				'background': "url(" + img.src + ") no-repeat",
				'backgroundSize': row * 100 + "%",
				'backgroundPosition': back_position
			});
		}
	};

    /**
     * 检测容器内的图片，并获取图片的宽高
     */
    function checkImg(){
        var self = this,
            config = self.config,
            imgs = container.querySelectorAll('img'),
            imgSrc = [],
            width = 0,
            height = 0,
            life = 1;

        for(var i = 0; i < imgs.length; i ++){
            var img = imgs[i],
                styles = css(img,["width", "height"]);

            imgSrc.push(img);
            container.removeChild(img);

            if(width != styles.width || height != styles.height){
                life--;
            }

            if(life < 0) return [];

            width = styles.width;
            height = styles.height;

        }

        config.width = width;
        config.height = height;

        return imgSrc;
    }

    /**
     * 最初的更新节点
     */
    function refreshInit(){
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
    }

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

        self.index = flag[index] ? 0 : 1;

        return arr[self.index];

    };

    /**
     * 初始化
     */
    Splash.prototype.init = function() {
        var config = this.config,
            self = this;

        container = this.container;

        imgArr = checkImg.call(self, container);

        if(imgArr.length === 0){
            container.innerHTML = "图片的大小不一致！";
            return;
        }

        css(container, {
            'width': config.width,
            'height': config.height,
            'position': 'relative'
        });

        if (!isElement(container)) {
            throw new Error('invalid container')
        }

        self.cubeArr = cubeConstructor(config);

        refreshInit.call(self);

        listConstructor.call(self);

        backgroundConver.call(self, "front", imgArr[Index], config);
        backgroundConver.call(self, 'back', imgArr[Index + 1], config);

        self.Run(Index);

    };

    /**
     * 动画入口
     * @param index
     * @constructor
     */
    Splash.prototype.Run = function(index){
        var self = this,
            config = self.config,
            cubeArr = self.cubeArr,
            isContinue = self.config.isContinue;

        if(isAnimation) return;

        self.slide(Index, changeStyle, function(){
            Index++;
            if(!isContinue) return;
            self.Run(Index);
        });
    };

    /**
     * 下一个图片
     */
    Splash.prototype.next = function () {
        var self = this,
            isContinue = self.config.isContinue;

        if(isAnimation) return;

        Index++;

        self.slide(Index, changeStyle, function(){
            Index ++;
            if(!isContinue) return;
            self.Run(Index);
        });

    };

    /**
     * 上一个图片
     */
    Splash.prototype.prev = function(){
        var self = this,
            isContinue = self.config.isContinue;

        if(isAnimation) return;

        Index--;

        self.slide(Index, changeStyle, function(){
            Index --;
            if(!isContinue) return;
            self.Run(Index);
        });
    };

    /**
     * 切换动画
     * @param to
     * @param moveStyle
     * @param callback
     */
    Splash.prototype.slide = function(to, moveStyle, callback){
        var self = this,
            config = self.config,
            background,
            duration = config.duration,
            speed = config.speed,
            delay = config.delay,
            isContinue = config.isContinue;

        changeStyle.y += 180;


        to == undefined && (to = config.index);

        to < 0 && (to = imgArr.length - 1) || to > (imgArr.length - 1) && (to = 0);


        Index = to;

        background = swap.circle(['back', 'front']);
        backgroundConver.call(self, background, imgArr[to], config);


        self.move(moveStyle, speed, duration, function(){

            callback.call(self);
        });
    };


    /**
     * 动画函数
     * @param value
     */
    Splash.prototype.move = function(value, speed, duration, callback) {
        var cubes = $$(".cube"),
            self = this,
            transitionEnd = self.config.transitionEnd;

        isAnimation = true;

        setTimeout(function(){
            for (var i = 0, len = cubes.length; i < len; i++) {
                css(cubes[i], {
                    transform: rotate(value)
                });
            }
        },0)


        if(self._cancelSpeed)
            clearTimeout(self._cancelSpeed);

        // 动画停止
        setTimeout(function(){
            isAnimation = false;

            var lis = container.getElementsByTagName('li');

            for(var i = 0,len = lis.length; i < len; i ++){
                lis[i].className = "select";
            }

            lis[Index].className = "selected";

            transitionEnd.call(lis[Index]);

        }, speed);

        self._cancelSpeed = setTimeout(function(){

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