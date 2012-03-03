(function(){

	// Root object ('window' in the browser)
	var root = this;

	root.nano = {
		global: root,
		classCache: {},
		/**
		 * Base function.
		 */
		Base: function(){},
		/**
		 * Creates clone of object.
		 * 
		 * 		var o = {},
		 * 			c = { car: 'red' },
		 * 			defaults = { car: 'black', speed: 2 };
		 * 			
		 * 		nano.extend(o, c, defaults);
		 * 		
		 * 		// Result
		 * 		{ car: 'red', speed: 2 }
		 * 
		 * @param  {Object} o        
		 * @param  {Object} c        
		 * @param  {Object} defaults Default values.
		 * @return {Object}
		 */
		extend: function(o, c, defaults) {
			// Apply defaults first
			if (defaults) {
				nano.extend(o, defaults);   
			}

			// Copy keys & values to o
			for (var p in c) {
				o[p] = c[p];
			}

			return o;
		}, // eo extend
		/**
		 * Create namespaces.
		 * 
		 * @return {Void}
		 */
		namespace: function() {
			var root = window,
				i, len, ns, j, sublen, part;

			for (i = 0, len = arguments.length; i < len; i++) {
				root = window;
				ns = arguments[i].split('.');

				for (j = 0, sublen = ns.length; j < sublen; j++) {
					part = ns[j];

					if ( ! root[part]) {
						root[part] = {};
					}

					root = root[part];
				}				
			}
		}, // eo namespace
		setNamespace: function(name, value) {
			var root = window,
				ns = name.split('.'),
				len = ns.length - 1,
				last = ns[len],
				i, part;

			for (i = 0; i < len; i++) {
				part = ns[i];

				if ( ! root[part]) {
					root[part] = {};
				}

				root = root[part];
			}
			
			return root[last] = value;
		}, // eo setNamespace
		getNamespace: function(name) {
			var root = window,
				ns = name.split('.'),
				len = ns.length - 1,
				last = ns[len],
				i, part;

			for (i = 0; i < len; i++) {
				part = ns[i];

				if ( ! root[part]) {
					root[part] = {};
				}

				root = root[part];
			}
			
			return root[last];
		}, // eo getNamespace
		/**
		 * Define new class.
		 * 
		 * 		nano.class('my.new.SillyClass', {
		 * 			__extend: 'my.old.SillyClass',
		 * 			__mixin: 'nano.util.Observable',
		 * 			__statics: {
		 * 				instance: true
		 * 			}
		 * 		});
		 * 
		 * @param  {String} name Class name
		 * @param  {Object} o    Class definition
		 * @return {Object}
		 */
		class: function(name, o) {
			var f = function(){ }, cls,
				parent;
			
			// Class parent	
			if (o.__extend) {						
				parent = typeof o.__extend == 'String' ? nano.getNamespace(o.__extend) : o.__extend;
			} else {
				parent = nano.Base;
				o.__extend = 'nano.Base';
			}

			// Custom constructor not defined
			if (o.constructor == Object.prototype.constructor) {
				// Default constructor
				cls = function() {
					// Call parent constructor
					this.__superclass.apply(this, arguments);
				};
			} else {
				// Constructor defined by user
				cls = function() { o.constructor.apply(this, arguments); };
			}

			f.prototype = parent.prototype;
			cls.prototype = new f();
			
			// Apply statics from parent
			nano.extend(cls, parent);

			// Apply statics from class definition
			if (o.__statics) {
				nano.extend(cls, o.__statics);
				delete o.__statics;
			}

			// Apply user methods to prototype
			nano.extend(cls.prototype, o);

			// Override construtctor
			cls.prototype.constructor = cls;
			cls.prototype.__className = name;
			cls.prototype.__superclass = parent;

			cls.prototype.__mixin = [];

			if (o.__mixin) {
				var mixin = o.__mixin;
				delete o.__mixin, mixins = {};

				// __mixin: 'some.Class'
				if (typeof mixin == 'string') {
					var alias = mixin.split('.');
					alias = alias[alias.length-1];

					mixins[alias] = { cls: nano.getNamespace(mixin), methods: true };
				} else {

					var item;

		        	for (alias in mixin) {
		        		item = mixin[alias];

		        		if (typeof item == 'string') {
		        			// Class to mixin
		        			mixins[name] = { cls: nano.getNamespace(item), methods: true };
		        		} else {
		        			mixins[name] = { cls: nano.getNamespace(item.cls) };

		        			if (item.methods != undefined) {
		        				mixins[name].methods = item.methods;
		        			}
		        		}
		        	}
		        }

		        for (alias in mixins) {
		        	nano.mixin(cls, alias, mixins[alias].cls, mixins[alias].methods);
		        }
	        }
			
			nano.setNamespace(name, o.__singleton ? new cls : cls);
		},
		mixin: function(cls, alias, mixin, methods) {
			var cls = cls.prototype,
				mixin = mixin.prototype,
				methods = methods == true ? [] : methods,
				all = methods.length == 0,
				i;

			for (i in mixin) {
				if (mixin.hasOwnProperty(i) && cls[i] === undefined) { 
					if ( ! all && methods.indexOf(i) == -1) { 
						continue;
					}

					cls[i] = mixin[i];
				} 
			}

			cls.__mixin[alias] = mixin;
		}, // eo mixin
		/**
		 * Alias method for nano.util.template.
		 * 
		 * @param  {String} str   Template string.
		 * @param  {Object} data Data passed to template.
		 * @return {String}
		 */
		template: function(str, data) { return nano.util.template.get(str, data); },
		/**
		 * Escape a string for HTML interpolation.
		 * 
		 * @param {String} string
		 * @return {String}
		 */ 
		escape: function(string) {
			return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
		} // eo escape
	};

	nano.namespace('nano.util');

	/**
	 * Javascript micro-templating code is borrowed from Unserscore.js
	 */
	// JavaScript micro-templating, similar to John Resig's implementation.
	// Underscore templating handles arbitrary delimiters, preserves whitespace,
	// and correctly escapes quotes within interpolated code.
	nano.util.template = {
		// By default, Underscore uses ERB-style template delimiters, change the
		// following template settings to use alternative delimiters.
		templateSettings: {
			evaluate    : /<%([\s\S]+?)%>/g,
			interpolate : /<%=([\s\S]+?)%>/g,
			escape      : /<%-([\s\S]+?)%>/g
		},
		// When customizing `templateSettings`, if you don't want to define an
		// interpolation, evaluation or escaping regex, we need one that is
		// guaranteed not to match.
		noMatch: /.^/,
		// Within an interpolation, evaluation, or escaping, remove HTML escaping
		// that had been previously added.
		unescape: function(code) {
			return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
		},
		get: function(str, data) {
			var me = nano.util.template,
				c  = me.templateSettings;

			var tmpl = 
				'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
				'with(obj||{}){__p.push(\'' +
				str.replace(/\\/g, '\\\\')
					.replace(/'/g, "\\'")
					.replace(c.escape || me.noMatch, function(match, code) {
						return "',nano.escape(" + me.unescape(code) + "),'";
					})
					.replace(c.interpolate || me.noMatch, function(match, code) {
						return "'," + me.unescape(code) + ",'";
					})
					.replace(c.evaluate || me.noMatch, function(match, code) {
						return "');" + me.unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
					})
					.replace(/\r/g, '\\r')
					.replace(/\n/g, '\\n')
					.replace(/\t/g, '\\t')
					+ "');}return __p.join('');";
			
			var func = new Function('obj', 'nano', tmpl);
			if (data) return func(data, nano);
			return function(data) {
				return func.call(this, data, nano);
			};
		}
	};

	nano.class('nano.util.Observable', {
		events: {},
		addEvent: function(name) {
			var i = arguments.length;
			
			while (i--) {
				if (this.events[arguments[i]] == undefined) {
					this.events[arguments[i]] = [];
				}
			}
		},
		/**
		 * Adds listener to event.
		 * 
		 * @param {String}   e  Event name.
		 * @param {Function} fn Function to call on event fire.
		 * @param {Object}   o  Additional options passed to event.
		 */
		addListener: function(e, fn, scope, o) {
			o = nano.extend({}, o || {}, {
				args: [],
				single: false,
				scope: scope || null		
			});

			if (this.events[e]) {
				this.events[e].push({
					fn: fn,
					o: o
				});
			}
		}, // eo addListener
		fireEvent: function(name, args, delayed) {
			var me = this,
				e = this.events[name];

			if ( ! e || e.length == 0) {
				return true;
			}

			delayed = delayed === undefined ? true : delayed;

			if (delayed !== true) {
				setTimeout(function() { me.fireEvent(name, true); }, delayed);
				return true;
			}

			var args = args || [],
				i = 0, len = e.length, item, result, o, remove = [], tmp = [],
				returnTrue = true;

			for (; i < len, item = e[i]; i++) {
				o = item.o;

				result = item.fn.apply(o.scope || this, args.concat(o.args));

				if (o.single) {
					remove.push(i);
				}

				if (result === false) {
					returnFalse = false;
					break;
				}
			}

			if (remove.length > 0) {
				for (i = 0; i < len; i++) {
					if (remove.indexOf(i) == -1) {
						tmp.push(e[i]);
					}
				}

				me.events[name] = tmp;
			}

			return returnTrue;
		} // eo fireEvent
	}); // eo nano.util.Observable

})();