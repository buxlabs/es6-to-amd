define(['hash'], function (hash) {
    'use strict';
    
    return {
        guid: function guid() {
            return hash('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
        }  
    };

});
