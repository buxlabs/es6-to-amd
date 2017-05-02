import { Model } from 'backbone';
import { View } from 'marionette';

var MyModel = Model.extend({});

export default View.extend({
    initialize: function () {
        new MyModel();
    }
});
