Promise.all([
    import('foo.js'),
    import('bar.js')
]).then((values) => { console.log(values) })

import('foo.js').then(() => {
    return import('bar.js')
})
