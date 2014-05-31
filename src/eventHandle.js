/**
 * Created by andycall on 14-3-24.
 */
function $$(id){
    return typeof id === 'string' ? document.getElementById(id) : id;
}

function on(target,eventName,fn){
    var factor = /\s+/g;
//    debugger;
    var fnString = fn.toString().replace(factor,"");
    if(!target[eventName + "event"]){
        target[eventName + 'event'] = {};
    }
    target[eventName + 'event'][eventName] = function(e){
        fn.call(this,e);
    }
    var eventFunc = target[eventName + "event"][eventName];

    if(document.attachEvent){
        target.attachEvent('on' + eventName,eventFunc);
    }
    else if(document.addEventListener){
        target.addEventListener(eventName,eventFunc,false);
    }
    else{
        target['on' + eventName] = eventFunc;
    }
}

function off(target,eventName){
    var factor = /\s+/g;
    var Func = target[eventName + "event"][eventName];
    if(document.detachEvent){
        target.detachEvent('on' + eventName,Func);
    }
    else if(document.removeEventListener){
        target.removeEventListener(eventName,Func,false);
    }
    else{
        target['on' + eventName] = null;
    }
}


function offAll(target,eventName){
    var factor = /\s+/g;
    var Funcs = target[eventName + "event"];
    var e;
    for(var key in Funcs){
        if(Funcs.hasOwnProperty(key)){
            e = Funcs[key];
            if(document.detachEvent){
                target.detachEvent('on' + eventName,e);
            }
            else if(document.addEventListener){
                target.removeEventListener(eventName,e,false);
            }
            else{
                target['on' + eventName] = null;
            }
        }
    }
}
function isElement(o){
    return (
        typeof HTMLElement === "function" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
}
function EventWatch(parent,delegate,eventName,fn){
    var callback;
    callback = function (e) {
        var target = e.target || e.srcElement;
        var isRun = false;
        if(delegate && delegate.length && delegate[0] != null && typeof delegate != 'string'){
            for(var i = 0,len = delegate.length; i < len ; i++){
                var item  = delegate[i];
                if(item == target){
                    isRun = true;
                }
            }
        }
        else if(delegate == target){
            isRun = true;
        }
        if(isRun){
           return fn.call(target,e);
        }
    };
    on(parent,eventName,callback);
}


function containers(outer,inner){
    return outer.contains ? outer != inner && outer.contains(inner) : !!(outer.compareDocumentPosition(inner) && 16);
}



function mouseEnter(target,fn){
    var eventName = "mouseover";

    var hander = function(e){
        e = e || window.event;
//        console.log(e);
        var target = e.target;
        var FromEle = e.relatedTarget || e.fromElement;
        var flag;
//        console.log(this == target);
//        console.log(FromEle);
        flag = containers(FromEle,target) && this == target;
        if(flag){
            fn.call(target,e);
        }
    }
    on(target,eventName,hander);
}

function mouseOut(target,fn){
    var eventName = "mouseleave";

    var hander = function(e){
        e = e || window.event;
        var target = e.target;
        var FromEle = e.relatedTarget || e.fromElement;

        var flag;
//        console.log(FromEle);
        flag = containers(FromEle,target) && this == target;
        if(flag){
            fn.call(target,e);
        }
    }
    on(target,eventName,hander);
}



function focusIn(target,fn){
    var eventName = 'focus';
    var eventIE = "onfocusin";
    var factor = /\s+/g;
//    debugger;
    var fnString = fn.toString().replace(factor,"");
    if(!target[eventName + "event"]){
        target[eventName + 'event'] = {};
    }
    target[eventName + 'event'][fnString + eventName] = function(){
        fn.call(this);
    }
    var eventFunc = target[eventName + "event"][fnString + eventName];
    if(document.attachEvent){
        target.attachEvent(eventIE,eventFunc);
    }
    else if(document.addEventListener){
        target.addEventListener(eventName,eventFunc,true);
    }
    else{
        target[eventIE] = eventFunc;
    }
}

function focusOut(target,fn){
    var eventName = 'blur';
    var eventIE = "onfocusout";
    var factor = /\s+/g;
//    debugger;
    var fnString = fn.toString().replace(factor,"");
    if(!target[eventName + "event"]){
        target[eventName + 'event'] = {};
    }
    target[eventName + 'event'][fnString + eventName] = function(){
        fn.call(this);
    }
    var eventFunc = target[eventName + "event"][fnString + eventName];
    if(document.attachEvent){
        target.attachEvent(eventIE,eventFunc);
    }
    else if(document.addEventListener){
        target.addEventListener(eventName,eventFunc,true);
    }
    else{
        target[eventIE] = eventFunc;
    }
}

        Function.prototype.method = function(name,callback){
            this.prototype[name] = callback;
            return this;
        }

