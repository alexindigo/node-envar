var envar = require('./index');

envar.defaults({bla: 'bzu'});

console.log(['1', envar('name'), envar(envar('name')) ]);

// envar.order('K');

// console.log(['2', envar('z') ]);
