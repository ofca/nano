(function(nano){
	nano.namespace('nano.util');

	/**
	 * Base class for events functionality.
	 * 
	 * @class nano.util.Observable
	 */
	nano.define('nano.util.Observable', {
		events: {},
		/**
		 * Adds event.
		 * 
		 * @param {String} name Event name.
		 * @return {nano.util.Observable}
		 */
		addEvent: function(name) {
			var i = arguments.length;
			
			while (i--) {
				if (this.events[arguments[i]] == undefined) {
					this.events[arguments[i]] = [];
				}
			}

			return this;
		}, // eo addEvent
		/**
		 * Adds listener to event.
		 * 
		 *     this.addListener('eventName', function(){}, this, {});
		 * 
		 * @param {String}   e  Event name.
		 * @param {Function} fn Function to call on event fire.
		 * @param {Object} [scope=Object which fire the event] The scope in which the handler function is executed.
		 * @param {Object} [o]  Additional options passed to event.
		 * 
		 * Additional configuration:
		 * 
		 * - **scope** : Object 
		 *
		 *   The scope in which the handler function is executed.
		 *
		 * - **args** : Array 
		 *
		 *   Arguments passed to function.
		 *
		 * - **single** : Boolean 
		 *
		 *   Call listener only once, and remove them.
		 *
		 * @return {nano.util.Observable}
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

			return this;
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
})(nano);
