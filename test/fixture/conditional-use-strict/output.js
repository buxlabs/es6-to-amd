(define(['core/view'], function (View) {
    'use strict'
    return View.extend({
        template: function (data) {
            var __t, __p = '', __j = Array.prototype.join, print = function () {
                    __p += __j.call(arguments, '');
                };
            __p += '<div>' + ((__t = data.hello) == null ? '' : _.escape(__t)) + '</div>';
            return __p;
        }
    });
}))

