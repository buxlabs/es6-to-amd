define(function () {
    "use strict";

    var Foo = function (code, message) {
        this.code = code;
        this.name = message;
    };

    Foo.prototype = Error.prototype;

    return Foo;
});

