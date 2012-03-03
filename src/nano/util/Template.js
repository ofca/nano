(function(nano){
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
})(nano);
