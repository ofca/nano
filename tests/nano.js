test('nano.define - Defining class', function(){
	expect(3);

	// Defining class
	nano.define('TestClass', {
		foo: function() {
			console.log('foo called!');
		}
	});

	ok(typeof TestClass == 'function', 'TestClass defined.');

	var test = new TestClass();

	ok(test instanceof nano.Base, 'Created instance of TestClass is instance of nano.Base.');
	ok(test instanceof TestClass, 'Created instance of TestClass is instance of TestClass.');
});

test('nano.define - Extending class', function() {
	expect(8);

	// Defining class
	nano.define('TestClass', {
		foo: function() {
			console.log('foo called!');
		}
	});

	ok(typeof TestClass == 'function', 'TestClass defined.');

	var test = new TestClass();

	ok(test instanceof nano.Base, 'Created instance of TestClass is instance of nano.Base.');
	ok(test instanceof TestClass, 'Created instance of TestClass is instance of TestClass.');

	// Extending
	nano.define('ChildClass', {
		extend: 'TestClass',
		bar: function() {
			console.log('bar called!');
		}
	});

	ok(typeof ChildClass == 'function', 'ChildClass defined.');

	var child = new ChildClass();

	ok(child instanceof nano.Base, 'Created instance of ChildClass is instance of nano.Base.');
	ok(child instanceof TestClass, 'Created instance of ChildClass is instance of TestClass.');
	ok(child instanceof ChildClass, 'Created instance of ChildClass is instance of ChildClass.');
	equal(child instanceof Array, false, 'Created instance of ChildClass is not instance of Array.');
});

test('nano.define - Statics', function() {

	expect(2);

	// Defining class
	nano.define('TestClass', {
		statics: {
			hello: function() {
				return 'hello!';
			},
			instance: 1
		},
		foo: function() {
			console.log('foo called!');
		}
	});

	var test = new TestClass();

	ok(typeof TestClass.hello == 'function' && TestClass.hello() == 'hello!', 'Statics works.');
	ok(test.hello === undefined, 'Statics works.');

});

test('nano.define - Mixins', function() {

	expect(1);

	// Defining class
	nano.define('TestClass', {
		foo: function() {
			console.log('foo called!');
		}
	});

	// Second class
	nano.define('SecondClass', {
		mixin: 'TestClass',
		bar: function() {
			console.log('bar called!');
		}
	});

	var test = new TestClass(),
		second = new SecondClass();

	ok(typeof second.foo === 'function', 'Mixin full class.');

});