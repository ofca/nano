(function(global){

	'use strict';

	/**
	 * nano core.
	 * 
	 * @class nano
	 * @type {Object}
	 * @singleton
	 */
	global.nano = {
		global: global,
		classCache: {},
		/**
		 * Base function.
		 */
		Base: function(){},
		/**
		 * Creates clone of object.
		 * 
		 *     var o = {},
		 *         c = { car: 'red' },
		 *         defaults = { car: 'black', speed: 2 };
		 *     
		 *      nano.extend(o, c, defaults);
		 * 
		 *      // Result
		 *      { car: 'red', speed: 2 }
		 * 
		 * @param  {Object} o        
		 * @param  {Object} c        
		 * @param  {Object} defaults Default values.
		 * @return {Object}
		 */
		extend: function(o, c, defaults) {
			var me = this;

			// Apply defaults first
			if (defaults) {
				me.extend(o, defaults);   
			}

			// Copy keys & values to o
			for (var p in c) {
				o[p] = c[p];
			}

			return o;
		}, // eo extend
		/**
		 * Create namespaces.
		 */
		namespace: function() {
			var root = this.global,
				i, len, ns, j, sublen, part;

			for (i = 0, len = arguments.length; i < len; i++) {
				root = this.global;
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
			var root = this.global,
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
			var root = this.global,
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
		 *     @example
		 *     nano.define('my.new.SillyClass', {
		 *         extend: 'my.old.SillyClass',
		 *         mixin: 'nano.util.Observable',
		 *         statics: {
		 *             instance: true
		 *         }
		 *     });
		 *
		 * ## Mixins
		 * 
		 *     @example
		 *     // This will mixin all functions from SomeClass
		 *     nano.define('TestClass', {
		 *         mixin: 'some.namespace.SomeClass',
		 *         constructor: function() {
		 *             // Call mixed class contructor
		 *             this.mixins.SomeClass.constructor.call(this);
		 *         }
		 *     });
		 *     
		 *     // This will mix only two methods: 'foo' and 'bar'
		 *     nano.define('TestClass', {
		 *         mixin: {
		 *             'SomeClass': { 
		 *                 cls: 'some.namespace.SomeClass',
		 *                 methods: ['foo', 'bar'] 
		 *             }
		 *         },
		 *         hello: function() {
		 *             this.foo();
		 *         }
		 *     });
		 *   
		 * @param  {String} name Class name
		 * @param  {Object} o    Class definition
		 * @return {Object}
		 */
		define: function(name, o) {
			var me = this,
				F = function(){ }, Cls,
				parent;
			
			// Class parent	
			if (o.extend) {						
				parent = typeof o.extend == 'string' ? me.getNamespace(o.extend) : o.extend;
			} else {
				parent = me.Base;
				o.extend = 'nano.Base';
			}

			// Custom constructor not defined
			if (o.constructor == Object.prototype.constructor) {
				// Default constructor
				Cls = function() {
					// Call parent constructor
					this.superclass.constructor.apply(this, arguments);
				};
			} else {
				// Constructor defined by user
				Cls = function() { o.constructor.apply(this, arguments); };
			}

			F.prototype = parent.prototype;
			Cls.prototype = new F();
			
			// Apply statics from parent
			me.extend(Cls, parent);

			// Apply statics from class definition
			if (o.statics) {
				me.extend(Cls, o.statics);
				delete o.statics;
			}

			// Apply user methods to prototype
			me.extend(Cls.prototype, o);

			// Override construtctor
			Cls.prototype.constructor = Cls;
			Cls.prototype.className = name;
			Cls.prototype.superclass = parent;

			Cls.prototype.mixin = [];

			if (o.mixin) {
				var mixin = o.mixin,
					mixins = {},
					alias;
				delete o.mixin;

				// __mixin: 'some.Class'
				if (typeof mixin == 'string') {
					alias = mixin.split('.');
					alias = alias[alias.length-1];

					mixins[alias] = { cls: me.getNamespace(mixin), methods: true };
				} else {

					var item;

					for (alias in mixin) {
						item = mixin[alias];

						if (typeof item == 'string') {
							// Class to mixin
							mixins[name] = { cls: me.getNamespace(item), methods: true };
						} else {
							mixins[name] = { cls: me.getNamespace(item.cls) };

						if (item.methods !== undefined) {
							mixins[name].methods = item.methods;
						}
					}
				}
			}

			for (alias in mixins) {
				me.mixin(Cls, alias, mixins[alias].cls, mixins[alias].methods);
		        }
	        }
			
			me.setNamespace(name, o.singleton ? new Cls() : Cls);
		},
		mixin: function(cls, alias, mixin, methods) {
			cls = cls.prototype;
			mixin = mixin.prototype;
			methods = methods === true ? [] : methods;
			
			var	all = methods.length === 0,
				i;

			for (i in mixin) {
				if (mixin.hasOwnProperty(i) && cls[i] === undefined) { 
					if ( ! all && methods.indexOf(i) == -1) { 
						continue;
					}

					cls[i] = mixin[i];
				} 
			}

			cls.mixin[alias] = mixin;
		}, // eo mixin
		/**
		 * @inheritDoc nano.util.Template#create
		 */
		template: function(str, data) { return this.util.template.create(str, data); },
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
})( (function() { return this; }).call() );