/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */


 // cookie "key=name; expires=Thu, 25 Feb 2016 04:18:00 GMT; domain=ppsc.sankuai.com; path=/; secure; HttpOnly"
;(function (factory) {
	var registeredInModuleLoader;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		// 都学会了?
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	/**
	 * 将参数对象的k-v合到一起
	 * @param {...Object} rest参数	
	 * @returns {Object} 合并后的对象
	 * @example extend({a:1},{b:2}) = {a:1,b:2}
	 */
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	/**
	 * 解码字符串	
	 * @param {String} s 待解码的字符串
	 * @returns {String} s 解码后的字符串
	 */
	function decode (s) {
		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	}

	/**
	 * @todo
	 * @param {Object} converter 
	 */
	function init (converter) {
		function api() {}

		/**
		 * 写cookie
		 * @param {String} key cookie key
		 * @param {String} value cookie value 可以合法的json对象
		 * @param {Oject} attributes cookie参数
		 * - attributes.expires {String|number} cookie 过期时间
		 * - attributes.domain {String} 域名
		 * - attributes.path {String} 路径
		 * - attributes.secure {boolean} 是否必须走https
		 * - attributes.HttpOnly {boolean} 加这个js不可访问
		 */
		function set (key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			attributes = extend({
				path: '/'
			}, api.defaults, attributes);

			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}

			// We're using "expires" because "max-age" is not supported by IE
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			try {
				var result = JSON.stringify(value);
				if (/^[\{\[]/.test(result)) {
					value = result;
				}
			} catch (e) {}

			// @todo, 这个convert.write是来编码的?
			value = converter.write ?
				converter.write(value, key) :
				encodeURIComponent(String(value))
					.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

			key = encodeURIComponent(String(key))
				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
				.replace(/[\(\)]/g, escape);

			var stringifiedAttributes = '';
			for (var attributeName in attributes) {
				if (!attributes[attributeName]) {
					continue;
				}
				stringifiedAttributes += '; ' + attributeName;
				if (attributes[attributeName] === true) {
					continue;
				}

				// Considers RFC 6265 section 5.2:
				// ...
				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
				//     character:
				// Consume the characters of the unparsed-attributes up to,
				// not including, the first %x3B (";") character.
				// ...
				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
			}

			// @todo ??
			return (document.cookie = key + '=' + value + stringifiedAttributes);
		}

		/**
		 * 取cookie
		 * @param {String} key 要获取的cookie的key 
		 * @param {boolean} json 是不是要将cookie格式化为json对象形式
		 */
		function get (key, json) {
			if (typeof document === 'undefined') {
				return;
			}

			var jar = {};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;
			// "key=name; expires=Thu, 25 Feb 2016 04:18:00 GMT; domain=ppsc.sankuai.com; path=/; secure; HttpOnly"
			
			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('='); // [k,v]
				var cookie = parts.slice(1).join('='); // k=v

				if (!json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) ||
						decode(cookie);

					if (json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		}

		// 暴露一些方法
		api.set = set;
		// 字符串
		api.get = function (key) {
			return get(key, false /* read as raw */);
		};
		// json对象, 失败还是原始值
		api.getJSON = function (key) {
			return get(key, true /* read as json */);
		};
		/**
		 * 移除cookie
		 * @param key {String} 要移除的cookie的key
		 */
		api.remove = function (key, attributes) {
			set(key, '', extend(attributes, {
				expires: -1
			}));
		};

		// @todo 这个是干啥的, 想给默认值确没法配置
		api.defaults = {};

		api.setDefault = function (attributes) {
			api.defaults = attributes;
		}
		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
