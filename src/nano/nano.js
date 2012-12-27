(function(root, _, undefined){

	'use strict';

    function hasOwnProperty(obj, name) {
        return Object.prototype.hasOwnProperty.call(obj, name);
    };

	/**
	 * nano core.
	 * 
	 * @class nano
	 * @type {Object}
	 * @singleton
	 */
	var nano = {
		scope: root,
        Base: function() {},
		classCache: {},
		/**
		 * Create namespace.
         *
         * If namespace exists, it will be just returned.
         * 
         * NOTE: If value is provided and namespace already exists it will be overwrited!
         * 
         * @example
         *     // Create namespace on _nano_'s root object 
         *     // (it's _window_ in browser)
         *     nano.namespace('foo.bar');
         *
         *     // Creates window.foo.bar with value 'hello'
         *     nano.namespace('foo.bar', undefined, 'hello');
         *
         *     // Multiple namespaces can be created too...
         *     nano.namespace(['foo.bar', object], ['bar.foo', root]);
         *
         * @param {string} namespace Namespace name.
         * @param {object} root Base object.
         * @param {mixed} value Optional. Value to set.
         * @return {mixed} Newly created namespace.
		 */
		namespace: function(namespace, value) {

            var root = nano.scope;

            if (_.isArray(namespace)) {
                root = namespace[0];
                namespace = namespace[1];
            }

			var ns = namespace.split('.'),
                len = ns.length,
                lastIdx = len - 1,
                last = ns[lastIdx],
                part, i = 0;

            for (; i < len; i++) {
                part = ns[i];

                // Last element
                if (lastIdx == i) {
                    // Namespace not exists, so create it always
                    if ( ! root[part]) {
                        root[part] = value || {};
                    } else {
                        // Namespace exists, so create it only
                        // if value is provided
                        if (value) {
                            root[part] = value;
                        }
                    }
                } else {
                    if ( ! root[part]) {
                        root[part] = {};                    
                    }
                }

                root = root[part];
            }

            return root;
		}, // eo namespace
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
		define: function(name, api) {

            if (api === undefined) {
                api = name;
                name = undefined;
            } else if (_.isArray(name)) {
                root = name[0];
                name = name[1];
            } else {
                root = nano.scope;
            }

			var dummy = function(){}, cls, parent;
			
			// Class parent	
			if (api.$extend) {						
				parent = typeof api.$extend == 'string' ? nano.namespace(api.$extend) : api.$extend;

                // Parent not exists
                if (parent.prototype === undefined) {
                    parent = nano.Base;
                    api.$extend = 'nano.Base';
                }
			} else {
				parent = nano.Base;
				api.$extend = 'nano.Base';
			}

			// Custom constructor not defined
			if ( ! api.hasOwnProperty('constructor')) {
				// Default constructor
				cls = function() {
					// Call parent constructor
					parent.apply(this, arguments);
				};
			} else {
				// Constructor defined by user
				cls = api.constructor;
			}

            // Create dummy function to not execute
            // parent constructor
            dummy.prototype = parent.prototype;
			cls.prototype = new dummy();
			
			// Apply statics from parent
			_.extend(cls, parent);

			// Apply statics from class definition
            _.extend(cls, api.$statics || {});

			// Apply user methods to prototype
			_.extend(cls.prototype, api);

			// Override construtctor
            cls.prototype.constructor = cls;           

            if (name) {
                cls.prototype.$className = name;
            }

			cls.prototype.$super = parent;
			cls.prototype.$mixin = {};

			if (api.$mixin) {

                if (typeof api.$mixin == 'string') {
                    api.$mixin = [api.$mixin];
                }

                var mixin = api.$mixin,
                    len = mixin.length,
                    i = 0, className, methods;

                for (; i < len; i++) {
                    if (_.isArray[mixin[i]]) {
                        className = mixin[i][0];
                        methods = mixin[i].slice(1, mixin[i].length-1);
                    } else {
                        className = mixin[i];
                        methods = undefined;
                    }

                    cls.prototype.$mixin[_.isArray(className) ? className[0] : className] = !methods;
                    nano.mixin(cls, nano.namespace(className), methods);
                }
			}

            if (name) {
                return nano.namespace([root, name], api.$singleton ? new cls : cls);    
            } else {
                return api.$singleton ? new cls : cls;
            }
		},
		mixin: function(cls, mixin, methods) {
            var cls = cls.prototype,
                mixin = mixin.prototype,
                methods = methods || [],
                all = methods.length === 0,
				i;

			for (i in mixin) {
				if (mixin.hasOwnProperty(i) && cls[i] === undefined) { 
					if ( ! all && methods.indexOf(i) == -1) { 
						continue;
					}

					cls[i] = mixin[i];
				} 
			}
		} // eo mixin
	};

    root.nano = nano;
})( this, _, [][0] );