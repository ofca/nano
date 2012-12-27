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

    module('Class inheritance');

    test('nano.define: Extend class - basic', function() {
        createScope();

        nano.define('Foo', {
            bar: function() { return 'bar'; }
        });

        nano.define('Bar', {
            $extend: 'Foo'
        });

        var bar = new nano.scope.Bar();

        ok(bar instanceof nano.scope.Bar, 'Class instantiated successfully.');
        ok(bar instanceof nano.Base, 'Class extends nano.Base.');
        ok(bar instanceof nano.scope.Foo, 'Class extends parent.');
        equal(bar instanceof Array, false, 'Class not extends Array.');
        ok(typeof nano.scope.Bar.prototype.bar === 'function', 'Parent methods exists in child.');
        ok(bar.bar() === 'bar', 'Inherited method successfully executed.');
    });

    test('nano.define: Extend class - advanced', function() {
        createScope();

        nano.define('Foo', {
            foo: function() { return 'foo'; }
        });

        nano.define('Bar', {
            $extend: 'Foo',
            bar: function() { return 'bar'; }
        });

        nano.define('Rab', {
            $extend: 'Bar',
            rab: function() { return 'rab'; }
        });

        var rab = new nano.scope.Rab();

        ok(rab instanceof nano.scope.Rab, 'Class instantiated successfully.');
        ok(rab instanceof nano.Base, 'Class extends nano.Base.');
        ok(rab instanceof nano.scope.Foo, 'Class extends grant parent.');
        ok(rab instanceof nano.scope.Bar, 'Class extends parent.');
        equal(rab instanceof Array, false, 'Class not extends Array.');
        ok(typeof nano.scope.Rab.prototype.foo === 'function', 'Grant parent methods exists in child.');
        ok(typeof nano.scope.Rab.prototype.bar === 'function', 'Parent methods exists in child.');
        ok(rab.bar() === 'bar', 'Inherited method successfully executed.');
    });

    test('nano.define: Extend class - overload constructor', function() {
        createScope();

        nano.define('Foo', {
            constructor: function() {
                this.a = 'a';
            }
        });

        nano.define('Bar', {
            $extend: 'Foo',
            constructor: function() {
                this.a = 'b';
            }
        });

        var foo = new nano.scope.Foo();
        var bar = new nano.scope.Bar();

        ok(foo.a === 'a', 'Parent constructor is ok.');
        ok(bar.a === 'b', 'Child constructor successful overload parent constructor.');        
    });

    test('nano.define: Extend class - overload constructor and call parent constructor', function() {
        createScope();

        nano.define('Foo', {
            constructor: function() {
                this.a = 'a';
            }
        });

        nano.define('Bar', {
            $extend: 'Foo',
            constructor: function() {
                this.$super.prototype.constructor.apply(this, arguments);
                this.b = 'b';
            }
        });

        var foo = new nano.scope.Foo();
        var bar = new nano.scope.Bar();

        ok(foo.a === 'a', 'Parent constructor is ok.');
        ok(bar.a === 'a', 'Child constructor successfully executed parent constructor.');
        ok(bar.b === 'b', 'Child constructor successfully executed.');
    });
})(this, [][0]);