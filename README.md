# envar [![NPM Module](https://img.shields.io/npm/v/envar.svg?style=flat)](https://www.npmjs.com/package/envar)

Library to read environment variables, including npm package config, custom config file, command line and default object.

[![Linux Build](https://img.shields.io/travis/alexindigo/node-envar/master.svg?label=linux:0.10-5.x&style=flat)](https://travis-ci.org/alexindigo/node-envar)
[![Windows Build](https://img.shields.io/appveyor/ci/alexindigo/node-envar/master.svg?label=windows:0.10-5.x&style=flat)](https://ci.appveyor.com/project/alexindigo/node-envar)

[![Coverage Status](https://img.shields.io/coveralls/alexindigo/node-envar/master.svg?label=code+coverage&style=flat)](https://coveralls.io/github/alexindigo/node-envar?branch=master)
[![Dependency Status](https://img.shields.io/david/alexindigo/node-envar.svg?style=flat)](https://david-dm.org/alexindigo/node-envar)

[![bitHound Overall Score](https://www.bithound.io/github/alexindigo/node-envar/badges/score.svg)](https://www.bithound.io/github/alexindigo/node-envar)

## Install

```
$ npm install --save envar
```

## Usage

### Basic

Add some environment variables

```bash
$ export user=my_account
$ export pass=my_secret
```

Run node script with custom port

```bash
$ node ./my_project.js --port 8080
```

Enjoy aggregated state:

```javascript
var http  = require('http')
  , envar = require('envar') // it will automatically process command line options (using optimist)
  ;

// define defaults for demo/test environments
envar.defaults(
{
  port: 1337,
  user: 'demo',
  pass: 'demo'
});

http.createServer(function(req, res)
{
  var auth = getAuth(req); // just for the example's sake

  if (auth.user == envar('user') && auth.pass == envar('pass'))
  {
    res.end('Welcome '+envar('user')+'!'); // will be `my_account` or `demo` if environment is not populated
  }
  else
  {
    res.end('Please authorize.');
  }

}).listen(envar('port')); // will be 8080 or 1337 if no option provided

```

### Defaults

Adds default parameters to the mix, will be used if all other layers failed lookup. And will be overridden if present in any other layer. Consider it as last resort fallback.

```javascript
var envar = require('envar');

envar.defaults(
{
  port: 1337,
  user: 'test'
});

envar('port'); // -> 1337
envar('user'); // -> 'test'
envar('pass'); // -> undefined, not present in any layer
```

### Prefix

Prefix only affects environment variables layer

```bash
$ export my_app_user=me
$ export my_app_pass=12345
$ node ./my_project.js --port 8001
```

```javascript
var envar = require('envar');

envar.prefix('my_app_');

envar('user'); // -> me
envar('pass'); // -> 12345
envar('port'); // -> 8001
```

### Variables lookup order

Default lookup order is ```AENCD```, where:

- ```A``` - argv/cli options
- ```E``` - environment variables
- ```N``` - npm package configuration parameters
- ```C``` - imported json config file (if any)
- ```D``` - default parameters

Order can be changed by calling ```envar.order(<new order>);```

```bash
$ export port=8080
$ node ./my_project.js --port 80
```

```javascript
var envar = require('envar');

envar.defaults({port: 1337});

// default order 1. argv, 2. env, 3. npm, 4. json config file, 5. defaults
envar.order(); // -> AENCD
envar('port'); // -> 80

// Change order to 1. env, 2. defaults, 3. argv
envar.order('EDA'); // and don't bother with npm config or json config file
envar('port'); // -> 8080

// Change order to only defaults
envar.order('D');
envar('port'); // -> 1337

// and change it back to original
envar.order('AENCD');

```

### NPM config layer

For more information about NPM configuration parameters check out [NPM Per-Package Config Settings](https://npmjs.org/doc/misc/npm-config.html#Per-Package-Config-Settings)

```bash
$ npm config set my_project:port 80
$ node ./my_project.js
```

```javascript
var envar = require('envar');

envar('port'); // -> 80
```

### Import config file

If you have data stored in some json file, like for example ```env.json```, you can add it to the mix using ```envar.import()``` method.

*Note*: ```envar.import``` method is sync like ```require```, so it makes sense to use it before execution app's logic.

```bash
$ cat env.json
{
  "port": 5432,
  "user": "pg"
}

$ node ./my_project.js
```

```javascript
var envar = require('envar');

envar.import('env.json');

envar('port'); // -> 5432
envar('user'); // -> pg
```

Or if your project is using more sophisticated means of configuration storage, you can pass javascript object.

```javascript
var envar = require('envar');

storage.getConfig(function(err, config)
{
  if (err) throw err;

  // config -> {port: 5432, user: 'pg'}
  envar.import(config);

  envar('port'); // -> 5432
  envar('user'); // -> pg
});

```

### Accessing individual layers

In case cases you may need to have access to specific layer in the mix, following methods could be used for this task:

```javascript
var envar = require('envar');

envar.default('port'); // will fetch data directly from `defaults` layer

envar.config('port'); // will fetch data directly from `config file` layer

envar.npm('port'); // will fetch data directly from `npm package config` layer

envar.env('port'); // will fetch data directly from `environment variables` layer

envar.arg('port'); // will fetch data directly from `argv/cli` layer
```

Note: All direct layer access methods, can be used to override/assign values.

Note 2: ```envar.arg``` and ```envar.npm``` coerce all values into strings, because of the way node interacts with the process's environment.

```javascript
var envar = require('envar');

envar.env('test'); // -> undefined

envar.env('test', 25); // -> '25'

envar.env('test'); // -> '25'

process.env['test']; // -> '25'
```

Note 3: `undefined` has special meaning within ```envar.arg``` and ```envar.npm```, it removes corresponding key from the environment variables, to prevent it coercing into a string (i.e. `undefined -> 'undefined'`).

```javascript
var envar = require('envar');

envar('test'); // -> undefined

envar.env('test', 'me env'); // -> 'me env'
envar.default('test', 'me default'); // -> 'me default'
envar('test'); // -> 'me env'

envar.env('test', undefined); // -> undefined
envar('test'); // -> 'me default'

envar.default('test', undefined); // -> undefined
envar('test'); // -> undefined
```

## History

History of the project could be found in  [CHANGELOG.md](CHANGELOG.md).

## TODO

- Add case insensitive option
- Add cli options aliases
- Add config file watch
- Add config file save
- Add npm config save

## License

EnVar is licensed under the MIT license.
