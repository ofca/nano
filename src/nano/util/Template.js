(function(global){

	var nano = global.nano;

	nano.namespace('nano.util');

	/**
	 * Javascript micro-templating code is borrowed from Unserscore.js
	 * 
	 * Documentation is copied from http://documentcloud.github.com/underscore/#template
	 * 
	 * ## nano.util.Template.create(templateString, [context]) 
	 * 
	 * Compiles JavaScript templates into functions that can be evaluated for rendering. 
	 * Useful for rendering complicated bits of HTML from JSON data sources. Template 
	 * functions can both interpolate variables, using <%= … %>, as well as execute 
	 * arbitrary JavaScript code, with <% … %>. If you wish to interpolate a value, 
	 * and have it be HTML-escaped, use <%- … %> When you evaluate a template function, 
	 * pass in a context object that has properties corresponding to the template's 
	 * free variables. If you're writing a one-off, you can pass the context object 
	 * as the second parameter to template in order to render immediately instead of 
	 * returning a template function.
	 * 
	 *     var compiled = nano.util.Template.create("hello: <%= name %>");
	 *     compiled({name : 'moe'});
	 *     => "hello: moe"
	 * 
	 *     var list = "hello: <%= name %>";
	 *     nano.util.Template.create(list, {people : ['moe', 'curly', 'larry']});
	 *     => "hello: moe"
	 * 
	 *     var template = nano.util.Template.create("<b><%- value %></b>");
	 *     template({value : '<script>'});
	 *     => "<b>&lt;script&gt;</b>"
	 *     
	 * You can also use print from within JavaScript code. This is sometimes more 
	 * convenient than using <%= ... %>.
	 * 
	 *     var compiled = nano.util.Template.create("<% print('Hello ' + epithet); %>");
	 *     compiled({epithet: "stooge"});
	 *     => "Hello stooge."
	 *     
	 * If ERB-style delimiters aren't your cup of tea, you can change Underscore's 
	 * template settings to use different symbols to set off interpolated code. 
	 * Define an interpolate regex to match expressions that should be interpolated 
	 * verbatim, an escape regex to match expressions that should be inserted after 
	 * being HTML escaped, and an evaluate regex to match expressions that should be 
	 * evaluated without insertion into the resulting string. You may define or 
	 * omit any combination of the three. For example, to perform Mustache.js style 
	 * templating:
	 * 
	 *     nano.util.Template.templateSettings = {
	 *         interpolate : /\{\{(.+?)\}\}/g
	 *     };
	 * 
	 *     var template = nano.util.Template.create("Hello {{ name }}!");
	 *     template({name : "Mustache"});
	 *     => "Hello Mustache!"
	 * 
	 * @class nano.util.Template
	 * @type {Object}
	 * @singleton
	 */
	nano.util.Template = {
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
		/**
		 * Return template.
		 * 
		 *     @example
		 *     var body = document.getElementsByTagName('body')[0];
		 *     
		 *     var template = nano.util.Template.create('<span><%=name%></span>');
		 *     body.innerHTML = template({name: 'Tom'});
		 *     
		 *     body.innerHTML = nano.util.Template.create('<span><%=name%></span>', {name: 'Tom'});
		 * 
		 * @param  {String} str  Template string.
		 * @param  {Object} data Data passed to template.
		 * @return {Function}
		 */
		create: function(str, data) {
			var me = nano.util.Template,
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
					.replace(/\t/g, '\\t') + "');}return __p.join('');";
			
			var func = new Function('obj', 'nano', tmpl);
			
			if (data) {
				return func(data, nano);
			}

			return function(data) {
				return func.call(this, data, nano);
			};
		}
	};
})( (function() { return this; }).call() );
