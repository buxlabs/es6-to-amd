define(["hash"], function (hash) {
    "use strict";
    function guid() {
        return hash("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx");
    }

    return {
        guid: guid
    };

});
