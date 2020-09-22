# ES to AMD converter

![npm](https://img.shields.io/npm/v/@buxlabs/es6-to-amd.svg)

> ES (EcmaScript) Module to AMD (Asynchronous Module Definition) converter

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Examples](#examples)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

The import/export syntax is becoming more and more popular. Given a huge, legacy AMD application it's not trivial to migrate it all at once. The converter can help you transpile the modules into the AMD syntax temporarily for backwards compatibility.

## Install

```
npm install @buxlabs/es6-to-amd
```

## Usage

### node

Convert a single file with:

```javascript
const es6toamd = require('@buxlabs/es6-to-amd');
const source = 'export default { hello: 'world' }';
const result = es6toamd(source); // define({ hello: 'world' });
```

## Examples

**ES**

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

There are more examples in the test/fixture directory.

## Maintainers

[@emilos](https://github.com/emilos).

## Contributing

All contributions are highly appreciated! Open an issue or submit a PR.

## License

MIT © buxlabs

