define(['backbone', 'marionette'], function (a, b) {
    'use strict';
    var MyModel = a.Model.extend({});
    return b.View.extend({
        initialize: function () {
            new MyModel();
        }
    });
});

