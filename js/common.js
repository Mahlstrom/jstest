/**
 * Function for inheritance
 * @param child target class to be extended
 * @param parent class
 * @param [init] variables for parent when a parent gets initialized
 * @returns target
 */
function _extend(child, parent, init) {
	if(typeof parent == 'function') {
		// For normal inheritance.
		child.prototype = new parent(init);
		child.prototype.constructor = child;
		child.prototype.parent = parent.prototype;
	}
	else {
		// For virtual inheritance. Ie plain objects. {}.
		child.prototype = parent;
		child.prototype.constructor = child;
		child.prototype.parent = parent;
	}
	return child;
}

/**
 * Compability Script
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 *
 */
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP && oThis
					? this
					: oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}

/**
 * Make an element draggable like a progress- or volume bar
 * Expectes the element to have a child with the class "draggable"
 *
 * @param {boolean} vertical if true then becomes draggable on height instead of width
 * @param {function} callback takes 2 variables: number volume, boolean finished
 * @param {boolean} inverted if true then the height/width parameter will be inverted
 * @param {number} initialValue a value that will be multiplied with the bars total width/height and then set as the width/height of .draggable
 * @param {boolean} runCallbackOnMove if true will run the callback function on every mouse-move BUT without the 2nd callback return variable
 * @return {Object} the value that was called on - so you can jQuery style do chained functions
 */
(function ($) {
	$.fn.draggableBar = function (vertical, callback, inverted, initialValue, runCallbackOnMove) {
		inverted = inverted ? -1 : 0;
		var dirFunc = vertical ? $.fn.height : $.fn.width;
		var dirMouse = vertical ? 'pageY' : 'pageX';
		var dirOffset = vertical ? 'top' : 'left';
		var self = this;

		if (isset(initialValue)) {
			dirFunc.call($('.jsDraggable', self), 100 * initialValue + '%');
		}

		//save the mousemove function as element data
		$(this).data('dragBarMove', function (e) {
			var pos = Math.min(Math.max(e[dirMouse], ($(self).offset())[dirOffset]) - ($(self).offset())[dirOffset], dirFunc.call($(self)));
			if (inverted)
				pos = dirFunc.call($(self)) - pos;
			var maxDist = 100;
			//if we are too far away from the element we abort the action
			if (($(self).offset().left - e.pageX) > maxDist || (e.pageX - ($(self).offset().left + $(self).width())) > maxDist ||
				($(self).offset().top - e.pageY) > maxDist || (e.pageY - ($(self).offset().top + $(self).height())) > maxDist) {
				pos = $(self).data('dragBarPrev');
				$(document).off('mousemove', $(this).data('dragBarMove'));
				$(document).off('mouseup', $(this).data('dragBarUp'));
			}
			if (runCallbackOnMove && typeof callback == 'function')
				callback(pos / dirFunc.call($(self)));
			dirFunc.call($('.jsDraggable', self), (100 * pos / dirFunc.call($(self))) + '%');
		});
		//save the mouseup function as element data
		$(this).data('dragBarUp', function (e) {
			//unbind mouse events, we are finished
			$(document).off('mousemove', $(this).data('dragBarMove'));
			$(document).off('mouseup', $(this).data('dragBarUp'));
			//send the position to the callback function
			var pos = dirFunc.call($('.jsDraggable', self)) / dirFunc.call($(self));
			if (typeof callback == 'function')
				callback(pos, true);
		});
		$(this).off('mousedown.draggableBar'); //remove any previous draggable bars - we do not want two draggables on one element
		$(this).on('mousedown.draggableBar', function (e) {
			//save old draggable direction size
			$(this).data('dragBarPrev', dirFunc.call($('.jsDraggable', this)));

			//set draggable interval to fix the element width
			($(this).data('dragBarMove')).call(this, e);
			$(document).on('mousemove', $(this).data('dragBarMove'));
			$(document).on('mouseup', $(this).data('dragBarUp'));

			//prevent any other event to be thrown, otherwise we will select the whole page because mousebutton is pressed down
			e.preventDefault();
			e.stopPropagation();
			return false;
		});

		return this;
	};
})(jQuery);

/**
 * Basic isset function like the one in php. Checks if its undefined or null.
 * @param value
 * @return
 */
function isset(value) {
	return !!(typeof value != "undefined" && value != null);
}

/**
 *
 * @param string_id
 * @return
 */
function getLangText(string_id) {
	var e = $('#LANGUAGE_TAGS div#' + string_id, RP.construct);
	return e.length ? e.html() : string_id;
}

/**
 * Checks to see if a clicked link is internal or external.
 * @param {String} link
 * @return {Boolean}
 */
function isExternalLink(link) {
	return /^([a-z]*:)?\/\//i.test(link);
}

/**
 * Create a numeric hash representation of a string
 * @param str
 * @returns {number}
 */
String.hashCode = function(str){
	var hash = 0, i, char;
	if (str.length == 0) return hash;
	for (i = 0, l = str.length; i < l; i++) {
		char  = str.charCodeAt(i);
		hash  = ((hash<<5)-hash)+char;
		hash |= 0; // Convert to 32bit integer
	}
	return Math.abs(hash);
};


/**
 * dlog. dlog.out(value,caller) where value is what to be printed and caller is an optional string statement which class is calling
 * IF you use caller make sure to add it to callers.
 */
var dlog = {
	out: function(value, caller, prefix, background) {

		caller = caller ? this.getCaller(caller) : 'undef';
		prefix = prefix ? prefix + '%:; ' : '';
		if(typeof window.console != 'undefined' && typeof console.log != 'undefined') {

			// Redefine this.out to also print to the console.log.
			this.out = function(value, caller, prefix, background) {

				caller = caller ? this.getCaller(caller) : 'undef';
				prefix = prefix ? prefix + '%:; ' : '';

				// If its a string, log it ot the out stack.
				if(typeof value == 'string')
					dlog.push(caller + ' :: ' + value, true);

				// Should we print stuff?
				if(this.active() && this.callers[caller]) {
					var cc =  '#' + (String.hashCode(caller)).toString(16).substr(-6);
					// We got an object, print a describing line then the object.
					if (typeof value == 'object') {
						this.print(prefix + '%'+cc+';' + caller + ' %black;:: [[output below]] | %blue;' + dlog.time(), background);
						console.log(value);
					}
					// We got something that easily converts to string. Just print it.
					else {
						this.print(prefix + '%'+cc+';' + caller + ' %black;:: ' + value + ' | %blue;' + dlog.time(), background);
					}
				}
			};

			this.out(value, caller, prefix, background);

		} else {
			// We don't have a console. Just store everything to be printed if and when we open the console.
			dlog.push(caller + ' :: ' + value, true);
		}
	},

	/**
	 * Prints a string and interprets color tags. Color tags are in the format:
	 * %<color>:<background>;
	 * %:<background>;
	 * %<color>;
	 * @param {string} printable a string with the possibility to use color tags
	 * @param {string} background overrides the background color for every color tag, can be color or hex, e.g. #FFF or white
	 */
	print : function(printable, background){
		var isWebkit = window.navigator && window.navigator.userAgent.match(/webkit/gi);
		var replace = '';
		var regex = /(%[a-z0-9:#]*;)/gi;
		var applyArray = [''];
		background = background ? background : '#FFF';
		if(isWebkit){
			replace = '%c';
			var color = printable.match(regex);
			if(color){
				for(var i = 0; i < color.length; i++){
					var tmp = color[i].slice(1, -1).split(':');
					color[i] = 'color:' + (tmp[0] ? tmp[0] : '#000') + '; background-color:' + (tmp[1] ? tmp[1] : background) + ';';
				}
				applyArray = applyArray.concat(color);
			}
		}
		applyArray[0] = printable.replace(regex, replace);
		console.log.apply(console, applyArray);
	},

	time: function(){
		var d = new Date();
		function pad(type){
			return ( ( d['get'+type]() + 100 ) + '' ).substr(1);
		}
		return [pad('Hours'), pad('Minutes'), pad('Seconds')].join(':');
	},

	warning: function(value, caller) {
		this.out(value, caller, '%:gold;Warning:', 'lightgoldenrodyellow');
	},

	note: function(value, caller) {
		this.out(value, caller, '%:#FFB6C1;Note:', '#FFF0F5');
	},

	callers: {
		'undef': true,
		'LiveMusicFactory': false,
		'OnAir': false
	},

	active: function() {
		return isset(consts.enableDlog) && consts.enableDlog;
	},

	getCaller: function(caller) {
		if( ! (caller in this.callers))
			this.callers[caller] = true;
		return caller;
	},

	push: function (msg, out) {
		out = isset(out) ? out : false;
		if(out) {
			dlog.outStack.push(msg);
			if (dlog.outStack.length > 35) dlog.outStack.shift();
		} else {
			dlog.responseStack.push(msg + ' -- time: ' + (new Date()).toString());
			if (dlog.responseStack.length > 75) dlog.responseStack.shift();
		}
	},
	outStack:[],
	responseStack:[],
	toString:function () {
		var stackTrace = 'AJAX MESSAGES:',
			key;
		for(key = 0; key < dlog.responseStack.length; key++)
			stackTrace += '\n- ' + dlog.responseStack[key];
		stackTrace += '\nDLOG MESSAGES:';
		for(key = 0; key < dlog.outStack.length; key++)
			stackTrace += '\n- ' + dlog.outStack[key];
		return stackTrace;
	}

};

/**
 * Creates a Date object from a string like this. 2012-09-14 14:49:54
 */
function mkDate(date) {
	var nums = date.split(/[-: ]/);
	if (nums.length != 6)
		throw('Invalid date string, Need format YYYY-MM-DD HH:MM:SS. Got "' + date + '"');
	return new Date(nums[0], nums[1] - 1, nums[2], nums[3], nums[4], nums[5]);
}

/**
 * Get a time string from a date. In the format HH:MM.
 */
function getTime(d) {
	function pad(n) {
		return n < 10 ? '0' + n : n;
	}

	return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

/**
 * Get a time string from an int length. Return format MM:SS.
 * @param {Number} length (in seconds)
 * @returns {string}
 */
function getMinSec(length) {
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    var min = Math.floor(length/60);
    var sec = length%60;
    return pad(min) + ':' + pad(sec);
}

/**
 * Get a date time string from a Date object. In the format YYYY-MM-DD HH:MM:SS.
 */
function getDateTime(d) {
	function pad(n) {
		return n < 10 ? '0' + n : n;
	}

	return     d.getFullYear()
		+ '-' + pad(d.getMonth() + 1)
		+ '-' + pad(d.getDate())
		+ ' ' + pad(d.getHours())
		+ ':' + pad(d.getMinutes())
		+ ':' + pad(d.getSeconds());
}

function getDate(d) {
	function pad(n) {
		return n < 10 ? '0' + n : n;
	}

	return     d.getFullYear()
		+ '-' + pad(d.getMonth() + 1)
		+ '-' + pad(d.getDate());
}

/**
 * This is our own version of the toggleClass function that hopefully won't behave as badly.
 * @param {string} className The class you want to set/toggle/remove.
 * @param {boolean} [setClass] True: Set the class. False: Remove the class. Undefined: Toggle class.
 * @returns {jQuery}
 */
(function ($) {
	$.fn.setClass = function(className, setClass) {
		this.each(function(){
			var toggle = typeof setClass == 'undefined' ? ! $(this).hasClass(className) : setClass;
			if(toggle)
				$(this).addClass(className);
			else
				$(this).removeClass(className);
		});
		return this;
	};
})(jQuery);

/**
 * Function that check if the selected element has the attribute attr.
 * @param {string} attr
 * @returns {Boolean}
 */
(function ($) {
	$.fn.hasAttr = function (attr) {
		var attribVal = $(this).attr(attr);
		return (attribVal !== undefined) && (attribVal !== false);
	};
})(jQuery);

/**
 * Replace newlines with paragraphs (<p>) and set the html to the newly paragraphed text
 * Especially good for IE which does not support pre-line properly
 */
(function ($) {
	$.fn.paragraph = function (text) {
		text = text.replace(/(\r\n|\n|\r)+/gm, '</p><p>');
		$(this).html('<p>' + text + '</p>');
		return this;
	};
})(jQuery);

/**
 * Takes a URI encoded string. Returns the URI decoded string. Including spaces encoded as +.
 * @param str The URI encoded string.
 * @returns {string} URI decoded string.
 */
function urldecode(str) {
	return decodeURI((str + '').replace(/\+/g, ' '));
}

/**
 * This inserts the ECMA Script v5 Date::toISOString() function for browsers not supporting it natively.
 */
if (!Date.prototype.toISOString) {
	Date.prototype.toISOString = function () {
		function pad(n) {
			return n < 10 ? '0' + n : n;
		}

		return this.getUTCFullYear() + '-'
			+ pad(this.getUTCMonth() + 1) + '-'
			+ pad(this.getUTCDate()) + 'T'
			+ pad(this.getUTCHours()) + ':'
			+ pad(this.getUTCMinutes()) + ':'
			+ pad(this.getUTCSeconds()) + 'Z';
	};
}

Array.filter = function (arr, fun) {
	var ret = [];
	if (typeof fun != "function")
		throw new TypeError();

	for (var i = 0; i < arr.length; i++) {
		if (fun(arr[i], i, arr)) {
			ret.push(arr[i]);
		}
	}
	return ret;
};


Array.unique = function (input) {
	var o = {}, i, l = input.length, r = [];
	for (i = 0; i < l; i += 1)
		o[input[i]] = input[i];
	for (i in o)
		r.push(o[i]);
	return r;
};

/**
 * This inserts Mozilla's (ECMA-262) version of Array::indexOf function for browsers not supporting it natively.
 */
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(searchElement /*, fromIndex */) {

		"use strict";

		if (this === void 0 || this === null)
			throw new TypeError();

		var t = Object(this);
		var len = t.length >>> 0;
		if (len === 0)
			return -1;

		var n = 0;
		if (arguments.length > 0)
		{
			n = Number(arguments[1]);
			if (n !== n)
				n = 0;
			else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}

		if (n >= len)
			return -1;

		var k = n >= 0
			? n
			: Math.max(len - Math.abs(n), 0);

		for (; k < len; k++)
		{
			if (k in t && t[k] === searchElement)
				return k;
		}
		return -1;
	};
}

// Implements the ECMA Script v5 Object.keys() function.
Object.keys = Object.keys || (function () {
	var hasOwnProperty = Object.prototype.hasOwnProperty,
		hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
		DontEnums = [
			'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
			'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
		],
		DontEnumsLength = DontEnums.length;

	return function (o) {
		if (typeof o != "object" && typeof o != "function" || o === null)
			throw new TypeError("Object.keys called on a non-object");

		var result = new Array();
		for (var name in o) {
			if (hasOwnProperty.call(o, name))
				result.push(name);
		}

		if (hasDontEnumBug) {
			for (var i = 0; i < DontEnumsLength; i++) {
				if (hasOwnProperty.call(o, DontEnums[i]))
					result.push(DontEnums[i]);
			}
		}

		return result;
	};
})();


String.prototype.trim = String.prototype.trim || function () {
	return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};
String.prototype.ltrim = String.prototype.ltrim || function () {
	return this.replace(/^\s+/, '');
};
String.prototype.rtrim = String.prototype.rtrim || function () {
	return this.replace(/\s+$/, '');
};
String.prototype.fulltrim = String.prototype.fulltrim || function () {
	return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
};

/**
 * Returns the first set value in the argument list.
 * @param {Array} values The values.
 * @param {function} [comparator] The function that determines if a value is valid or not.
 * @returns {*}
 */
function first(values, comparator){
	comparator = comparator ? comparator : function(v){return !!v;};
	for(var i = 0; i < values.length; i++)
		if(comparator(values[i]))
			return values[i];
}

/**
 * Pass url for app redirect. If app is not installed open app store or google play store.
 * @param {string} url The url to open in the app.
 * @param {boolean} autoplay Should we add the string ?autoplay=true to the url?
 */
function openAppUrlWithFallback(url, autoplay) {

	var fallback;

	// Fix the url.
	url = 'radioplay://radioplay.se' + url + (autoplay ? '?autoplay=true' : '');

	if(navigator.userAgent.toLowerCase().indexOf("android") > -1) {
		fallback = consts.appUrls.android;
	}

	if(navigator.userAgent.toLowerCase().indexOf("iphone") > -1) {
		fallback = consts.appUrls.ios;
	}

	// Try to open the app.
	window.location = url;

	// Make the fallback come later in the call queue when the above code has already taken effect.
	// If the app could not start, this could will run and take us to the fallback!
	setTimeout(function() {
		if(fallback)
			window.location = fallback;
	}, 0);
}

/**
 * Returns image server url with correct size depending on mobile pixel ratio if its set or custom img size.
 * If height is undefined it will get the same value as width.
 * If with is undefined, imageUrl will be returned.
 * @param {string} imageUrl Old url that needs to be converted to image server url.
 * @param {number} [width]
 * @param {number} [height]
 * @return {string|undefined} the parsed image server url.
 */

function buildImgUrl(imageUrl, width, height) {
	"use strict";

	var maxDevicePixelRatio = 2,
		dpr = window.devicePixelRatio ? window.devicePixelRatio : 1;

	// No image?
	if( ! imageUrl)
		return;

	if( ! width)
		return imageUrl;

	// We have no image server. Pass through.
	if( ! consts.config.IMAGE_SERVER_URL)
		return imageUrl;

	// Don't pass images twice.
	if(imageUrl.search(consts.config.IMAGE_SERVER_URL) == 0)
		return imageUrl;

	// Don't pass svgs to img server.
	if(/.*\.svg$/i.test(imageUrl))
		return imageUrl;

	// Always check pixel ratio and set width and height according to size for higher resolution screens.
	function timesDpr(dimension) {
		return dimension * Math.round(Math.min(maxDevicePixelRatio, dpr));
	}

	// If height is not set, use width as height.
	height = height ? height : width;

	return consts.config.IMAGE_SERVER_URL + '?' + $.param({
		url: imageUrl,
		w: timesDpr(width),
		h: timesDpr(height)
	});

}

/**
 * Decode a url search query.
 * Returns an object.
 * Does not currently handle array variables.
 * Adapted from: http://stackoverflow.com/a/2091331
 *
 * @param {String} [query] The query string without the question mark. (If not provided or undefined
 * window.location.search is used instead.
 * @param {String} delimiter The delimiter to split the variables on. Default is '&'.
 * @returns {Object}
 */
function parseQueryString(query, delimiter) {
	query = typeof(query) != 'undefined' ? query : window.location.search.substring(1);
	delimiter = delimiter ? delimiter : '&';

	if(typeof(query) != 'string')
		return {};

	var vars = query.split(delimiter),
		ret = {},
		key, pair, i, value;

	for(i = 0; i < vars.length; i++) {
		pair = vars[i].split('=');
		key = decodeURIComponent(pair.shift());
		value = decodeURIComponent(pair.join('='));
		ret[key] = value;
	}
	return ret;
}
