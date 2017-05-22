define(function () {

    function hash(str) {
        return "1" + str + "1";
    }
    
    return {
        guid: function guid() {
            return hash('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
        }  
    };

});
