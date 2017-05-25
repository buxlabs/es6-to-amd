define(function () {
    'use strict';
    
    return {
        getErrorText: function (status) {
            switch (status) {
            case 413:
                return 'Lorem ipsum';
            default:
                return 'Dolor sit amet';
            }
        }
    };
    
});

