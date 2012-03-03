Ext.data.JsonP.Base({"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/nano.html#Base' target='_blank'>nano.js</a></div></pre><div class='doc-contents'><p>Base function.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-define' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Base'>Base</span><br/><a href='source/nano.html#Base-method-define' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Base-method-define' class='name expandable'>define</a>( <span class='pre'>String name, Object o</span> ) : Object</div><div class='description'><div class='short'>Define new class. ...</div><div class='long'><p>Define new class.</p>\n\n<pre><code>nano.define('my.new.SillyClass', {\n    __extend: 'my.old.SillyClass',\n    __mixin: 'nano.util.Observable',\n    __statics: {\n        instance: true\n    }\n});\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : String<div class='sub-desc'><p>Class name</p>\n</div></li><li><span class='pre'>o</span> : Object<div class='sub-desc'><p>Class definition</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-escape' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Base'>Base</span><br/><a href='source/nano.html#Base-method-escape' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Base-method-escape' class='name expandable'>escape</a>( <span class='pre'>String string</span> ) : String</div><div class='description'><div class='short'>Escape a string for HTML interpolation. ...</div><div class='long'><p>Escape a string for HTML interpolation.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>string</span> : String<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-extend' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Base'>Base</span><br/><a href='source/nano.html#Base-method-extend' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Base-method-extend' class='name expandable'>extend</a>( <span class='pre'>Object o, Object c, Object defaults</span> ) : Object</div><div class='description'><div class='short'>Creates clone of object. ...</div><div class='long'><p>Creates clone of object.</p>\n\n<pre><code>var o = {},\n    c = { car: 'red' },\n    defaults = { car: 'black', speed: 2 };\n\n nano.extend(o, c, defaults);\n\n // Result\n { car: 'red', speed: 2 }\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>o</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>c</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>defaults</span> : Object<div class='sub-desc'><p>Default values.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-namespace' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Base'>Base</span><br/><a href='source/nano.html#Base-method-namespace' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Base-method-namespace' class='name expandable'>namespace</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Create namespaces. ...</div><div class='long'><p>Create namespaces.</p>\n</div></div></div><div id='method-template' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Base'>Base</span><br/><a href='source/nano.html#Base-method-template' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Base-method-template' class='name expandable'>template</a>( <span class='pre'>String str, Object data</span> ) : String</div><div class='description'><div class='short'>Alias method for nano.util.template. ...</div><div class='long'><p>Alias method for nano.util.template.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>str</span> : String<div class='sub-desc'><p>Template string.</p>\n</div></li><li><span class='pre'>data</span> : Object<div class='sub-desc'><p>Data passed to template.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","mixedInto":[],"subclasses":[],"aliases":{},"inheritdoc":null,"superclasses":[],"tagname":"class","files":[{"href":"nano.html#Base","filename":"nano.js"}],"parentMixins":[],"html_meta":{},"alternateClassNames":[],"members":{"css_var":[],"event":[],"method":[{"tagname":"method","owner":"Base","name":"define","id":"method-define","meta":{}},{"tagname":"method","owner":"Base","name":"escape","id":"method-escape","meta":{}},{"tagname":"method","owner":"Base","name":"extend","id":"method-extend","meta":{}},{"tagname":"method","owner":"Base","name":"namespace","id":"method-namespace","meta":{}},{"tagname":"method","owner":"Base","name":"template","id":"method-template","meta":{}}],"css_mixin":[],"cfg":[],"property":[]},"extends":null,"requires":[],"singleton":false,"statics":{"event":[],"css_var":[],"method":[],"css_mixin":[],"cfg":[],"property":[]},"name":"Base","mixins":[],"code_type":"assignment","inheritable":false,"uses":[],"id":"class-Base","component":false,"meta":{}});