# ES6 to AMD converter

## Installation

`npm install @buxlabs/es6-to-amd`

## Usage

Convert a single file with:

```javascript
const es6toamd = require('@buxlabs/es6-to-amd');
const source = 'export default { hello: 'world' }';
const result = es6toamd(source); // define({ hello: 'world' });
```

## Example:

**ES6**

```javascript
import Backbone from 'backbone';

export default Backbone.Model.extend({});
```

**AMD**

```javascript
define(['backbone'], function (Backbone) {
    'use strict';
    return Backbone.Model.extend({});
});
```

There are more examples in the test/fixture directory
