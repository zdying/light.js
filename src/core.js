/**
 * @fileOverview light.js core
 * @author daiying.zhang
 */

define(["var/toString", "var/slice", "var/splice", "var/rHTMLTag"],
function(toString, slice, splice, rHtml){
    var $ = light;
    function light(selector, context){
        return new light.fn.init(selector, context)
    }

    $.fn = $.prototype;
    $.light = "1.0.0";

    /**
     * extend
     * @param deep
     * @param target
     * @param source
     * @returns {*}
     */
    $.extend = $.fn.extend = function(deep, target, source/*, source1, source2, ...*/){
        var tmp,
            type,
            isArray,
            isBool = typeof deep === 'boolean',
            args = slice.call(arguments, 0),
            len = args.length,
            i = 2;
        // .extend(object)        or .extend(true|false, object)
        if((len === 1 && !isBool) || (len === 2 && isBool)){
            target = this;
            deep = len === 1 ? false : deep;
            i = len - 1;
            // .extend(target, source, ...)
        }else if(!isBool){
            target = deep;
            deep = false;
            i = 1;
        }

        for(; i<len; i++){
            source = args[i];
            for(var key in source){
                // deep clone
                if(deep){
                    if(source.hasOwnProperty(key)){
                        type = $type(tmp = source[key]);
                        isArray = $isArray(tmp);
                        if(/^(object|array)$/.test(type)){
                            target[key] = target[key] ? target[key] :
                                isArray ? [] : {};
                            $.extend(true, target[key] , tmp)
                        }else{
                            target[key] = tmp
                        }
                    }
                }else{
                    if(source.hasOwnProperty(key)){
                        target[key] = source[key]
                    }
                }
            }
        }
        return target
    };

    // tools
    $.extend({
        type: $type,
        isArray: $isArray,
        isFunction: function(obj) {
            return this.type(obj) === 'function'
        },
        isString: $isString,
        isUndefined: function (obj){
            return obj === undefined
        },
        isNumber: function (obj){
            var ps = Number(obj);
            return !$.isArray(obj) && !Number.isNaN(ps)
        },
        //isWindow: function (obj){
        //    return obj && obj.window === obj
        //},
        isFunction: function (obj){
            return $type(obj) === 'function'
        },
        isLight: function (obj){
            return obj.constructor === light
        },
        noop: function(){},
        each: function(obj, func){
            if(!this.isFunction(func)) return;
            var type = this.type(obj);
            if(type === 'array'){
                for(var i = 0, len = obj.length; i<len; i++){
                    if(func.call(obj[i], i, obj[i]) === false){
                        return
                    }
                }
            }else if(type === 'object'){
                for(var key in obj){
                    if(func.call(obj[key], key, obj[key]) === false){
                        return
                    }
                }
            }
        },
        makeArray: function (selector, context){
            var type = $type(selector), context = context || document;
            if(type === 'string'){
                if(rHtml.test(selector)){
                    // html片段
                    var div = document.createElement('div');
                    div.innerHTML = selector;
                    return $.toArray(div.childNodes)
                }else{
                    return $.toArray(context.querySelectorAll(selector))
                }
            }else if(type === 'object' || type.match(/^html\w+element$/)){
                return $.isLight(selector) ? selector : [selector]
            }else{
                return []
            }
        },
        toArray: function(obj){
            var result = [];
            try{
                result = slice.call(obj)
            }catch(e){
                var i = 0, len = obj.length;
                if($.isNumber(len)){
                    for(;i<len;i++){
                        result.push(obj[i])
                    }
                }
            }
            return result
        },
        unique: function (obj){
            var tmp = [], index;
            for(var i= 0; i<obj.length; i++){
                if(~(index = tmp.indexOf(obj[i]))){
                    splice.call(obj, index, 1);
                    i--
                }else{
                    tmp.push(obj[i])
                }
            }
            return obj
        },
        expando: ('light' + light.light + Math.random()).replace(/\./g,''),
        guid: (function(){
            var count = 0;
            return function (){
                return ++count
            }
        })()
    });

    light.fn.extend(true, {
        init: function(selector, context){
            //this.length = 0;
            this.selector = selector;
            this.context = context || document;
            //var arr = $.makeArray(selector, this.context), len = arr.length;
            //this.length = len;
            //while(--len >= 0){
            //    this[len] = arr[len]
            //}
            var arr = $.makeArray(selector, this.context), len = arr.length;
            this.length = len;
            this.extend($.toArray(arr))
        },
        /**
         * 遍历所有元素，执行fn，fn接受两个参数`index`和`element`
         * @param {Function} fn
         * @returns {light.fn}
         */
        each: function(fn){
            if($.isFunction(fn)){
                for(var i = 0, len = this.length; i<len; i++) {
                    if(fn.call(this[i], i, this[i]) === false){
                        break
                    }
                }
            }
            return this
        },
        map: function (){

        },
        pushState: function (elems){
            var ret = $();
            ret.prevObject = this;
            ret.context = this.context;
            ret.selector = this.selector;
            //todo $.extend 有bug，当elems是数组的时候
            ret.length = elems.length;
            return $.extend(ret, elems);
        },
        end: function (){
            return this.prevObject
        },
        eq: function(index){
            return this.pushState([this[index]])
        },
        gt: function (index){
            return this.pushState(this.slice(index + 1))
        },
        lt: function (index){
            return this.pushState(this.slice(0, index))
        },
        not: function (){

        },
        add: function (){

        },
        first: function (){
            return this.eq(0)
        },
        last: function (){
            return this.eq(this.length - 1)
        },
        //slice: function (returnArray){
        //    var ret = slice.apply(this, arguments);
        //    return returnArray ? ret : this.pushState(ret)
        //},
        slice: slice,
        splice: splice
    });

    light.fn.init.prototype = light.fn;

    function $type(obj){
        return toString.call(obj).replace(/^\[object (\w+)\]$/, '$1').toLowerCase()
    }

    function $isArray(obj) {
        return $type(obj) === 'array'
    }

    function $isString(obj){
        return $type(obj) === 'string'
    }

    return light
});