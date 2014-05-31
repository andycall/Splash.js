/**
 * Created by andycall on 14-3-30.
 */
/*
*   Tick 运动库
*   Tick.to(target,attr,speed or moveType,speed);
*
*
* */
var Tick = (function(window,undefined){
    var self = this;

    var animateType = {
        "easeInSine":{a:{x:0.47,y:0},b:{x:0.745,y:0.715}},
        "easeOutSine":{a:{x:0.39,y:0.575},b:{x:0.565,y:1}},
        "easeInOutSine":{a:{x:0.445,y:0.05},b:{x:0.55,y:0.95}},
        "easeInQuad":{a:{x:0.55,y:0.085},b:{x:0.68,y:0.53}},
        "easeOutQuad":{a:{x:0.25,y:0.46},b:{x:0.45,y:0.94}},
        "easeInOutQuad":{a:{x:0.455,y:0.03},b:{x:0.515,y:0.955}},
        "easeInCubic":{a:{x:0.55,y:0.055},b:{x:0.675,y:0.19}},
        "easeOutCubic":{a:{x:0.215,y:0.61},b:{x:0.355,y:1}},
        "easeInOutCubic":{a:{x:0.645,y:0.045},b:{x:0.355,y:1}},
        "easeInQuart":{a:{x:0.895,y:0.03},b:{x:0.685,y:0.22}},
        "easeOutQuart":{a:{x:0.165,y:0.84},b:{x:0.44,y:1}},
        "easeInOutQuart":{a:{x:0.77,y:0},b:{x:0.0175,y:1}},
        "easeInQuint":{a:{x:0.755,y:0.05},b:{x:0.855,y:0.06}},
        "easeOutQuint":{a:{x:0.23,y:1},b:{x:0.32,y:1}},
        "easeInOutQuint":{a:{x:0.86,y:0},b:{x:0.07,y:1}},
        "easeInExpo":{a:{x:0.95,y:0.05},b:{x:0.795,y:0.035}},
        "easeOutExpo":{a:{x:0.19,y:1},b:{x:0.22,y:1}},
        "easeInOutExpo":{a:{x:1,y:0},b:{x:0,y:1}},
        "easeInCirc":{a:{x:0.6,y:0.04},b:{x:0.98,y:0.335}},
        "easeOutCirc":{a:{x:0.075,y:0.82},b:{x:0.165,y:1}},
        "easeInOutCirc":{a:{x:0.785,y:0.135},b:{x:0.15,y:0.86}},
        "easeInBack":{a:{x:0.6,y:-0.28},b:{x:0.735,y:0.045}},
        "easeOutBack":{a:{x:0.175,y:0.885},b:{x:0.32,y:1.275}},
        "easeInOutBack":{a:{x:0.68,y:-0.55},b:{x:0.265,y:1.55}}
    };

    function init(target,params){
        var attr = [],
            value = [],
            fn,
            fnParams,
            Type="",
            thirdPrams,
            speed;

        self.target = target;

        for(var key in params){
            if(params.hasOwnProperty(key)){
                if(key == 'onComputed'){
                    fn = params[key];
                }
                else if(key == 'onComputedParam'){
                    fnParams = params[key];
                }
                else{
                    attr[key] = params[key];
                }
            }
        }

        thirdPrams = arguments[2];

        if(isString(thirdPrams)){
            Type = animateType[thirdPrams] || animateType['easeInOutQuint'];
            speed = arguments[3] || 1000;
        }
        else{
            Type = animateType["easeInOutQuint"];
            speed = arguments[2] || 1000;
        }

        value.push(target,attr,Type,speed,fn,fnParams);

        return value;

    }


    // 库入口
    function To(target,params){
       var param = init.apply(self,arguments);

        animate.apply(self,param);
    }

    function getAttribute(target,attr){
        var isIE = document.currentStyle,
            styleValue;

        if(isIE){
            if(attr == 'opacity'){
                var RegFilter = /[\,\)]?opacity=([0-9]+)/,
                    filter = target.currentStyle["filter"];
                styleValue = parseFloat(RegFilter.exec(filter)[1]);
            }
            styleValue = target.currentStyle[attr];
        }
        else{
            styleValue = window.getComputedStyle(target,null)[attr];
        }
        return styleValue;
    }

    function setAttribute(target,attr,value){
        var isIE = document.currentStyle,
            RegFilter = /(.+opacity=)([0-9]*)([\,\)]?.+)/;

        if(isIE && attr == 'opacity'){
                var filter = target.currentStyle['filter'],
                    StrArr = RegFilter.exec(filter),
                    strHead = StrArr[1],
                    strFooter = StrArr[3];
                    target.style["filter"] = strHead + value * 100 + strFooter;
        }
        else{

            target.style[attr] = value;
        }
    }

    function _cubicBezier(type,t){
        var self = this,
            pa = {x:0,y:0},
            pb = type["a"],
            pc = type["b"],
            pd = {x:1,y:1},
            x,y;

        x = pa.x*Math.pow(1-t,3) + 3*pb.x*t*Math.pow(1-t,2) + 3*pc.x*Math.pow(t,2)*(1-t)+pd.x*Math.pow(t,3);
        y = pa.y*Math.pow(1-t,3) + 3*pb.y*t*Math.pow(1-t,2) + 3*pc.y*Math.pow(t,2)*(1-t)+pd.y*Math.pow(t,3);

        return {x:x,y:y};
    };




    function isObject(obj){
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    function isString(str){
        return Object.prototype.toString.call(str) === '[object String]';
    }

    function animate(target,json,type,speed,fn,fnParams){
        speed /= 2;
        var mills = 1000 / 60,
            count = (speed / mills) * 2 ,
            index = 0,
            timeScale,
            time = 0;

        for(var key in json){
            if(json.hasOwnProperty(key)){
                target[key.toString()] = {};
                target[key.toString()].oldValue = parseFloat(getAttribute(target,key));
            }
        }


        target.timer = target.timer || {};
        target.trace = [];


        if(target.timer){
            clearInterval(target.timer);
        }


        for(var i = 0,len = Math.ceil(count) ; i < len ; i ++){
            target.trace.push(_cubicBezier(type,(i) * (1/count)));
        }

        target.timer = setTimeout(function(){
            move.call(self);
        })

        function move(){
            var scale = target.trace[index++];

            if(index >= target.trace.length){
                clearInterval(target.timer);
                for(var key in json){
                    if(json.hasOwnProperty(key)){
                        var newValue = json[key];
                        setAttribute(target,key,newValue + 'px');
                    }
                }
                if(typeof fn == 'function'){
                    fn.apply(self,fnParams);
                }
            }
            else{
                timeScale = speed * scale.x - time;

                console.log(timeScale);

                time = speed * scale.x;

                for(var key in json){
                    if(json.hasOwnProperty(key)){
                       newValue =  target[key.toString()].oldValue + (parseFloat(json[key]) - target[key.toString()].oldValue) * scale.y;
                        setAttribute(target,key,newValue + 'px');
                    }
                }
            }

            if(index < target.trace.length){
                target.timer = setTimeout(function(){
                    move();
                },timeScale);
            }
        }
    }
    return {
        To : To,
        setAttr : setAttribute,
        getAttr : getAttribute
    }

})(window);