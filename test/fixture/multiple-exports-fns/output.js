define(function () {
    'use strict';
    function hash(str) {
        return '1' + str + '1';
    }
    
    function guid() {
        return hash('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
    }  
    
    return {
        guid: guid
    };

});
