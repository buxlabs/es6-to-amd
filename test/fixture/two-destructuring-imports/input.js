import { Model, Collection } from 'backbone';

var MyModel = Model.extend({});

export default Collection.extend({
    model: MyModel
});
