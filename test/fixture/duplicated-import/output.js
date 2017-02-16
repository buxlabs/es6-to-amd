define(['backbone', 'backbone'], function (Backbone, BB) {
    'use strict';
    return Backbone.Collection.extend({
        model: new BB.Model()
    });
});
