var Splash = (function(window, undefined) {
	var _containerData = {},
		configDefault = {
			width : "500px", // 容器的宽
			height : "500px", // 容器的高
			cube_map : [3, 2], //3行3列
			count : 6// 块的数量
		},
		cube_position = [];



	function _css(target, json){

	}


	function getAttribute(target, attr) {
		var isIE = document.currentStyle,
			styleValue;

		if (isIE) {
			if (attr == 'opacity') {
				var RegFilter = /[\,\)]?opacity=([0-9]+)/,
					filter = target.currentStyle["filter"];
				styleValue = parseFloat(RegFilter.exec(filter)[1]);
			}
			styleValue = target.currentStyle[attr];
		} else {
			styleValue = window.getComputedStyle(target, null)[attr];
		}
		return styleValue;
	}

	function setAttribute(target, attr, value) {
		var isIE = document.currentStyle,
			RegFilter = /(.+opacity=)([0-9]*)([\,\)]?.+)/;

		if (isIE && attr == 'opacity') {
			var filter = target.currentStyle['filter'],
				StrArr = RegFilter.exec(filter),
				strHead = StrArr[1],
				strFooter = StrArr[3];
			target.style["filter"] = strHead + value * 100 + strFooter;
		} else {

			target.style[attr] = value;
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

	function $ (selector) {
		document.querySelectorAll(selector);
	}

	function extend(obj, extension){
		for(var key in obj){
			extension[key] = obj[key];
		}
		return extension;
	}

	function getData(obj) {
		var data = {},
			DOMMap;
		if(isElement(obj)){
			DOMMap = obj.dataset;
			extend(values, DOMMap);
		}
		return data;
	}

	function cubeConstructor(config){
		var count = config.count,
			cube_map = config.cube_map,
			ContainerWidth = parseInt(config.width),
			ContainerHeight = parseInt(config.height),
			cubeWidth = ContainerWidth / cube_map[0],
			cubeHeight = ContainerHeight / cube_map[1],
			cubeContainer = [],
			row = config.cube_map[0],
			col = config.cube_map[1];

		for(var i = 0,len = config.count; i < len; i ++){
			cube_position.push([(i % col) * cubeHeight, (Math.floor(i / row) % row) * cubeWidth]);
			var div = document.createElement('div');
			div.className = "cube";
			setAttribute(div, "position", "absolute");
			setAttribute(div, "width", cubeWidth + "px");
			setAttribute(div, 'height', cubeHeight + 'px');
			setAttribute(div, 'top', cube_position[i][0] + 'px');
			setAttribute(div, 'left', cube_position[i][1] + 'px');
			setAttribute(div, 'background', "#fff");

			cubeContainer.push(div);
		}

		return cubeContainer;
	}

	function backgroundConver(cubes, img, config){
		var cubeCount = cubes.length,
			ContainerWidth = parseInt(config.width),
			ContainerHeight = parseInt(config.height),
			row = config.cube_map[0],
			col = config.cube_map[1],
			percentage = [];


		console.log(cube_position);
		for (var i = 0; i < cubeCount ; i++) {
			percentage.push([1,1]);
			setAttribute(cubes[i], 'background', "url(" + img + ") no-repeat");
			setAttribute(cubes[i], 'background-size', 0.5 * row * col * 100 + "%");
			setAttribute(cubes[i], 'background-position', percentage[i][1] * 100 + "%" + " " + percentage[i][0] * 100 + "%")
		};
		console.log(percentage);
		return cubes;

	}

	function wrapperImage(wrapper){
		if(!isElement(wrapper)){ return }

		var imgs = wrapper.getElementsByTagName('img'),
			imgSrc = [];

		for(var i = 0,len = imgs.length; i < len ; i ++){
			imgSrc.push(imgs[i].src);
			setAttribute(imgs[i], 'display', 'none');
		}

		return imgSrc;
	}

	function PackageCube(cubes){
		var cover = document.createElement('div');
		cover.id = "cover";
		for(var i = 0,len = cubes.length; i < len;  i++){
			cover.appendChild(cubes[i]);
		}

		return cover;
	}


	Splash.prototype.init = function(){
		var container = this.container,
			config = this.config,
			cubes,
			imgs,
			cover;

		setAttribute(container, 'width', config.width);
		setAttribute(container, 'height', config.height);
		setAttribute(container, 'border', '1px solid #000');
		setAttribute(container, 'position', 'relative');


		if(!isElement(container)){ throw new Error('invalid container') }

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