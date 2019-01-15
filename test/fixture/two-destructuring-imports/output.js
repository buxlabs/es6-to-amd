define(["backbone"], function (a) {
    "use strict";
    var MyModel = a.Model.extend({});
    return a.Collection.extend({
        model: MyModel
    });
});

