define(function () {
    "use strict";
    const sqrt = Math.sqrt;
    function square(x) {
        return x * x;
    }
    function diag(x, y) {
        return sqrt(square(x) + square(y));
    }
    return {
        sqrt: sqrt,
        square: square,
        diag: diag
    };
});

