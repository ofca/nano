(function(root, undefined) {

    // This is not required in normal use
    // (normally, nano.scope points to global object)
    function createScope() {
        nano.scope = {};
    }

    createScope();

    module('Namespace');
    test('nano.namespace: Creating namespace', function() {
        createScope();

        nano.namespace('foo');
        ok(nano.scope.foo, 'window.foo created.');
    });

    test('nano.namespace: Creating namespace with value', function() {
        createScope();

        nano.namespace('foo', 'Hello!');
        ok(nano.scope.foo === 'Hello!', 'window.foo has value "Hello!"');
    });

    test('nano.namespace: Getting namespace', function() {
        createScope();

        var foo = nano.namespace('foo');
        ok(foo === nano.scope.foo, 'ok');
    });

    test('nano.namespace: Creating namespace on custom scope', function() {
        createScope();
        var scope = {};

        nano.namespace([scope, 'bar']);
        ok(scope.bar, 'Namespace created.');
    });

    test('nano.namespace: Getting namespace from custom scope', function() {
        createScope();
        var scope = { bar: 'foo' };

        var bar = nano.namespace([scope, 'bar']);
        ok(bar === scope.bar, 'Ok');
    });



    module('Defining class');

    test('nano.define: Defining class', function(){
        createScope();

        // Defining class
        nano.define('Foo', {});

        ok(typeof nano.scope.Foo == 'function', 'Foo class defined.');

        var foo = new nano.scope.Foo();

        ok(foo, 'Instance of Foo created and assigned to variable "foo".');
        ok(foo instanceof nano.Base, 'foo is instance of nano.Base.');
        ok(foo instanceof nano.scope.Foo, 'foo is instance of Foo.');
        equal(foo instanceof Array, false, 'foo is not instance of Array.');
    });

    test('nano.define: Define class and assign it to variable', function() {
        createScope();

        var Foo = nano.define('Foo', {});
        ok(Foo === nano.scope.Foo, 'Ok');
    });

    test('nano.define: Define class on custom scope', function() {
        createScope();
        var scope = {};

        nano.define([scope, 'Bar'], {});

        ok(nano.scope.Bar === undefined, 'Bar class not defined on global scope.');
        ok(typeof scope.Bar === 'function', 'Bar class defined on custom scope.');
    });

    test('nano.define: Define class with custom method and properties', function() {
        createScope();
        var scope = {};

        nano.define([scope, 'Foo'], {
            foo: 'bar',
            bar: function() { return 'foo'; }
        });

        var foo = new scope.Foo();

        ok(foo.bar != undefined && foo.bar() == 'foo', 'Custom method defined.');
        ok(foo.foo === 'bar', 'Custom property defined.');
    });

    test('nano.define: Define class with statics', function() {
        createScope();
        var scope = {};

        nano.define([scope, 'Foo'], {
            $statics: {
                foo: 'bar'
            }
        });

        var foo = new scope.Foo();

        ok(scope.Foo.foo === 'bar', 'Static property defined.');
        ok(foo.foo === undefined, 'Static property not exists in instance of defined class.');
    });


    module('Class mixin');

    /**
     * @todo  nano.define, mixin classes from custom scope; 
     *        mixin multiple classes; mixin classes with custom methods;
     */

    test('nano.define: Define class with mixin', function() {
        createScope();

        nano.define('Foo', {
            bind: function() { return 'binded'; },
            unbind: function() { return 'unbinded'; }
        });

        nano.define('Bar', {
            $mixin: ['Foo']
        });

        ok(nano.scope.Bar.prototype.$mixin.Foo !== undefined, 'Basic mixin ok.');
        ok(typeof nano.scope.Bar.prototype.unbind === 'function', 'Basic mixin ok.');
    });

    test('nano.mixin: Mixin methods to class', function() {
        createScope();

        nano.define('Foo', {
            bind: function() { return 'binded'; },
            unbind: function() { return 'unbinded'; }
        });

        nano.define('Bar', {});

        nano.mixin(nano.scope.Bar, nano.scope.Foo);

        ok(typeof nano.scope.Bar.prototype.unbind === 'function', 'Ok.');

        nano.scope.Bar = undefined;
        nano.define('Bar', {});

        nano.mixin(nano.scope.Bar, nano.scope.Foo, ['bind']);

        ok(typeof nano.scope.Bar.prototype.bind === 'function', 'Single method mixin ok.');
        ok(nano.scope.Bar.prototype.unbind === undefined, 'Single method mixin ok.');
    });

   //test('nano.define')

    /*module('Inheritance');
    test('nano.define - Extending class', function() {
        //expect(8);

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
            $extend: 'TestClass',
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

        nano.define('Bar', {
            constructor: function() {
                console.log('Hi');
            }
        });

        nano.define('Foo', {
            $extend: 'Bar',
            constructor: function() {
                this.$super.prototype.constructor.apply(this, arguments);
                console.log('Hello!');
            }
        });

        ok(typeof Foo == 'function', 'Foo class with custom constructor defined.');

        var foo = new Foo();
        var bar = new Bar();

        ok(foo instanceof Foo, 'foo instantiated.');
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

    });*/
})(this, [][0]);