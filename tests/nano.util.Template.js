test('nano.util.Template.create() - Function return', function() {
	expect(2);

	var template = nano.util.Template.create('Hi, my name is <%=name%>');

	ok(typeof template == 'function', 'Template ready to compile.');

	var compiled = template({ name: 'Tom' });

	equal(compiled, 'Hi, my name is Tom', 'Template has been properly compiled.');
});