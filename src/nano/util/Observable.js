(function(nano){
	nano.namespace('nano.util');

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
})(nano);
