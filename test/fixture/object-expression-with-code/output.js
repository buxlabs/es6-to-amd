define(function () {
    "use strict";
    function hash(str) {
        return str + "1";
    }

    return function (str) {
        return "2" + hash(str);
    };
});
