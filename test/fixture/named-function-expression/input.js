var Foo = function (code, message) {
    this.code = code;
    this.name = message;
};

Foo.prototype = Error.prototype;

export default Foo;