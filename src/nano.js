(function(root, _, undefined){

	'use strict';

    var noop = function() {};

    // Avoid `console` errors in browsers that lack a console.
    if ( ! root.console && ! root.console.log) {  
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'],
            len = methods.length,
            csl = root.console = {};

        while (len--) {
            csl[methods[len]] = noop;
        }
    }

    if ( ! Array.prototype.remove) {
        // Array Remove - By John Resig (MIT Licensed)
        Array.prototype.remove = function(from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };
    }

    /**
     * Base class.
     * 
     * @class nano.Base
     * @extends Object
     */

    function hasOwnProperty(obj, name) {
        return Object.prototype.hasOwnProperty.call(obj, name);
    };

    /**
     * Base nano class, all classes created by nano.define
     * extends this class.
     * 
     * @class nano.Base
     * @extends Object
     * @constructor
     * Set properties defined in $properties method.
     */
    var Base = function(o) {
        o = o || {};
        this.$setProperties();
        this.$applyConfigs(o);
    };
    Base.prototype.$setProperties = function() { 
        return _.extend(this, this.$properties && this.$properties()); 
    };
    Base.prototype.$applyConfigs = function(o) {
        var key, 
            cfg = this.$configs,
            apply = function(value, key, list) {
                var setter = 'set' + key.charAt(0).toUpperCase() + key.substr(1);

                if (typeof this[setter] == 'function') {
                    this[setter].call(this, value);
                    delete list[key];
                } else {
                    if (typeof this[key] != 'function') {
                        this[key] = value;
                        delete list[key];
                    }
                }
            };

        if (cfg === true) {
            _.each(o, apply, this);
        } else {
            var i = 0, len = cfg.length;

            for (; i < len; i++) {
                key = cfg[i];

                // This config is required
                if (key[0] == '!' && o[key] === undefined) {
                    throw new Error('Class ' + this.$className + ' requires config "' + key.slice(1) + '" to instantiate.');
                }

                apply.call(this, o[key], key, o);
            }
        }

        return this;
    };

    var nano = root.nano = {};

    nano.Loader = new function() {
        this.basePath = '';
        this.map = {};
        this.quene = [];
        this.callbacks = [];
        this.isLoading = false;

        this.autoload = function(auto) {
            nano.autoload = auto;
            return this;
        };

        this.setBasePath = function(path) {
            this.basePath = path;
            return this;
        };

        this.setNamespacePath = function(namespace, path) {
            this.map[namespace] = path;
            return this;
        };

        this.load = function(url, callback, sync) {
            sync = sync === undefined ? true : sync;

            if (sync) {
                nano.ajax({
                    url: url,
                    async: false,
                    complete: function(data) {
                        ( (function() {
                            try {
                                //var nano = this.nano;
                                eval(data);
                            } catch(e) {
                                var err = e.constructor('Error in evaled script: ' + e.message + "\n" + e.stack);
                                throw err;
                            }
                        }).call(nano.scope) );

                        nano.call(callback, [url]);
                    }
                });
            } else {
                var s = root.document.createElement('script');

                s.type = 'text/javascript';
                s.onload = function() {
                    callback();
                };
                s.src = url;
                root.document.body.appendChild(s);
            }

            return this;
        };

        this.getUrlForClass = function(cls) {
            var me = this;
            return (me.map[ cls.split('.')[0] ] || me.basePath) + cls.replace(/\./g, '/') + '.js';
        };

        this.require = function(cls, callback) {
            var me = this,
                root = nano.scope;

            me.callbacks.push(callback);

            cls = ! _.isArray(cls) ? [cls] : cls;

            _.each(cls, function(v) {
                var ns = v.split('.'),
                    len = ns.length,
                    i = 0;

                for (; i < len; i++) {
                    if ( ! root[ ns[i] ]) { break; }
                    root = root[ ns[i] ];
                }

                // Requested class not exists, try to load it
                if ( ! _.isFunction(root) || ! _.isObject(root)) {
                    me.quene.push(me.getUrlForClass(v));
                }
            });

            // Start loading if is not in progress
            if ( ! me.isLoading && me.quene.length) {
                
                me.isLoading = true;

                var loader = function() {
                    if (me.quene.length) {
                        me.load(me.quene[0], function(url) {
                            me.quene = me.quene.slice(1);
                            loader();                            
                        }, nano.autoload);
                    } else {
                        me.isLoading = false;

                        // Clone array with callbacks
                        var callbacks = me.callbacks.slice(0);
                        // Reset callbacks array
                        me.callbacks.length = 0;

                        _.map(callbacks, nano.call);                        
                    }
                }

                loader();
            }

            return this;
        };
    };
    
    /**
     * Alias for window.console object.
     * 
     * @class nano.console
     * @extends Object
     * @singleton
     */
    /**
     * Alias method for window.console.log.
     * @method log
     */
    /**
     * Alias method for window.console.warn (if not exists window.console.log will be used).
     * @method warn
     */
    /**
     * Alias method for window.console.info (if not exists window.console.log will be used).
     * @method info
     */
    /**
     * Alias method for window.console.debug (if not exists window.console.log will be used).
     * @method debug
     */
    nano.console = (function() {
        var fn = function() {};
        fn.prototype = root.console;
        fn.prototype.constructor = fn;
        return new fn;
    })();

	/**
	 * nano core.
	 * 
	 * @class nano
	 * @singleton
     * @requires _
	 */
	_.extend(nano, {
        /**
         * @property {Object} scope
         * Shortcut to global object (in browser it will be window). All classes
         * are defined on this object.
         *
         *     @example
         *     nano.namespace('foo.bar');
         *
         *     // will create
         *     nano.scope.foo.bar
         *     // in browser it's equal
         *     window.foo.bar
         */
		scope: root,
        /**
         * @property {Function} noop
         * Dummy function.
         */
        noop: noop,
        // Documented above
        Base: Base,
        classMap: {},
        loadedClasses: [],
        /**
         * @property {Boolean} autoload 
         * Flag indicating whether missing classes should be loaded or not.
         */
        autoload: false,
        /**
         * This is special version of Function.apply.
         *
         *     function hello(name, lastname) {
         *         return 'Hello ' + name + (lastname ? ' ' + lastname : '');
         *     };
         *     
         *     nano.call(hello, 'Joe'); // result will be "Hello Joe";
         *
         *     // If you need to pass more then one param then second
         *     // parameter must be an Array
         *     nano.call(hello, ['Joe', 'Kowalski']); // result will be "Hello Joe Kowalski";
         *
         *     // You can call this function on custom scope:
         *     nano.call([hello, scope], 'Joe');
         * 
         * @param  {Array/Function} o
         * Function to call, or Array where first item is function to call and second is scope.
         * @param  {Array/Mixed} params Array of parameters
         * @return {Mixed} Return result of executed function.
         */
        call: function(o, params) {
            params = _.isArray(params) ? params: [params];
            return _.isArray(o) ? o[0].apply(o[1], o.length > 2 ? params.concat(o.slice(2)) : params) : (_.isFunction(o) ? o.apply(null, params) : null);
        },
        /**
         * Translate Object to uri params.
         *
         *     nano.encodeURI({ foo: 'bar', bar: 'foo' });
         *     // return: foo=bar&bar=foo
         * 
         * @param  {Object} o
         * @return {String}
         */
        encodeURI: function(o) {
            return _.map(o, function(v, k) { 
                encodeURIComponent(k) + "=" + encodeURIComponent(v) 
            }).join('&');
        },
        /**
         * Simple ajax method.
         *
         *     var xhr = nano.ajax({
         *        url: 'foo.php',
         *        success: function() {
         *        
         *        }
         *     });
         * 
         * @param  {Object} o Configuration
         * @param  {String} o.url
         * @param  {String} o.method GET/POST/PUT/etc. Default GET.
         * @param  {Boolean} o.async Default true.
         * @param  {Object} o.headers Default Content-Type: application/x-www-form-urlencoded
         * @param  {Function/Array} o.onReadyStateChange Function called when state change.
         * @param  {Function/Array} o.complete Function called when request is complete.
         * @param  {String/Object} o.params Params and values to send in request
         * @param  {String} o.dataType Data type: plaintext or json (default is plaintext).
         * @return {XMLHttpRequest/ActiveXObject}
         */
        ajax: function(o) {
            var xhr;

            o = o || {}; 
            if ( ! o.headers) o.headers = {};

            _.defaults(o.headers, {
                'Content-Type': 'application/x-www-form-urlencoded'
            });

            _.defaults(o, {
                url: '',
                method: 'get',
                async: true,
                dataType: 'plaintext',
                params: {}
            });

            xhr = root.XMLHttpRequest != undefined ? new XMLHttpRequest() : xhr = new ActiveXObject('Microsoft.XMLHTTP');
            xhr.open(o.method.toUpperCase(), o.url, o.async);
            
            // Apply headers
            _.each(o.headers, function(v, k) { xhr.setRequestHeader(k, v); });

            xhr.onreadystatechange = function() {
                o.onReadyStateChange && nano.call(o.onReadyStateChange, [xhr]);

                if (xhr.readyState == 4) {
                    var data = xhr.responseText;

                    switch (o.dataType) {
                        case 'json':
                            data = JSON && JSON.parse(data) || eval(data);
                            break;
                    }

                    o.complete && nano.call(o.complete, [data, xhr]);
                }
            };
            xhr.send(typeof o.params == 'string' ? o.params : nano.encodeURI(o.params));

            return xhr;
        },
        /**
         * Loads required class.
         *    
         * @param  {String} cls Class name
         * @param  {Function} callback Optional. Function to call after class is loaded.
         * @return {nano}
         * @chainable
         */
        require: function(cls, callback) {
            nano.loadedClasses.push(cls);

            nano.Loader.load(nano.Loader.getUrlForClass(cls), callback, nano.autoload);

            if (nano.autoload) {
                nano.console.warn('[nano] Class ' + cls + ' was automatically loaded. Add ' + cls + ' to your nano.Loader.require() statement.');
            }
        },
        getLoadedClassesAsString: function() {
            
            var classes = _.map(nano.loadedClasses, function(v) { return "'" + v + "'"; }).join(",\n");

            var html = '<div style="position: absolute; z-index: 9999; width: 500px; height: 300px; padding: 20px; background: #333; border-radius: 10px 10px 0 0; bottom: 0; left: 50%; margin-left: -250px;"><textarea style="background: #333; border: 0; color: #fff; width: 480px; height: 300px; outline: 0px;">'+classes+'</textarea></div>',
                div = document.createElement('div');

            div.innerHTML = html;

            document.body.appendChild(div);
        },
        /**
         * Template function. It use _.template method but
         * with Twig syntax, so instead of:
         * * <% %> is {% %}
         * * <%= %> is {{ }}
         * * <%- %> is {{- }}
         * 
         * @param  {String} text
         * @param  {Object} data
         * @return {String/Function}
         */
		tmpl: function(text, data) {
            return _.template(text, data, {
                evaluate    : /\{\%([\s\S]+?)\%\}/g,
                interpolate : /\{\{([\s\S]+?)\}\}/g,
                escape      : /\{\{\-([\s\S]+?)\}\}/g
            });
        },
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
         * @param {String} namespace Namespace name.
         * @param {Object} root Base object.
         * @param {Mixed} value Optional. Value to set.
         * @return {Mixed} Newly created namespace.
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
        getNamaspace: function(ns) {
            var root = nano.scope;

            if (_.isArray(ns)) {
                root = ns[0];
                ns = ns[1];
            }

            var ns = ns.split('.'),
                len = ns.length,
                i = 0, found = true;

            for (; i < len; i++) {
                if ( ! root[ ns[i] ]) { found = false; break; }
                root = root[ ns[i] ];
            }

            return found ? root : undefined;
        },
        getClass: function(cls) {
            cls = nano.getNamaspace(cls);

            // _.isObject too becaouse class may be singleton.
            return cls && (_.isFunction(cls) || _.isObject(cls)) ? cls : false;
        },
        /**
         * Creates instance of class. If class is not loaded,
         * and autoloader is on, class will be loaded dynamically.
         * 
         * @param  {String} ns Class name to create instance of.
         * @param  {Object} o  Configuration object.
         * @return {Mixed}     Instance of class.
         */
        create: function(ns, o) {
            var cls = nano.getClass(ns);

            // Class not exists
            if (cls === false) {
                // Try to load class
                if (nano.autoload) {
                    nano.require(ns);

                    cls = nano.getClass(ns);

                    if ( ! cls) {
                        throw new Error('nano.create: Class ' + ns + ' not exists.');
                    }
                } else {
                    throw new Error('nano.create: Class ' + ns + ' not exists.');
                }
            }

            // It could be singleton so check first
            return _.isFunction(cls) ? new cls(o || {}) : cls;
        },
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
			
            // Load required classes
            if (api.$uses) {
                if (nano.autoload) {
                    _.each(api.$uses, function(v){
                        if (nano.getClass(v) === false) {
                            nano.require(v);
                        }
                    });
                }
            }

			// Class parent	
			if (api.$extend) {
                if (typeof api.$extend == 'string') {
                    parent = nano.getClass(api.$extend);

                    if (parent === false) {
                        nano.require(api.$extend);                        
                        parent = nano.getClass(api.$extend);
                    }
                } else {
                    parent = api.$extend;
                }

                // Parent not exists
                if (parent.prototype === undefined) {
                    throw new Error('Parent class not exists. ' + api.$extend);
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
				cls = function() { api.constructor.apply(this, arguments); };
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
	});
}).call(this, this, _, [][0]);