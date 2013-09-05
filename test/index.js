var test  = require('tap').test
  , envar = require('../')

  , nonExistent = 'undefined';
  ;

// argv/cli layer, call test with --test ok argument
test('argv', function test_envar_argv(t)
{
  var fix = {name: 'test', value: 'ok'};

  // check for existing
  t.equal(envar(fix.name), fix.value, 'Argument --test ok passed to the test.');

  // check for non-existent
  t.equal(envar(nonExistent), undefined, 'Should return undefined if no key found.');

  // check that it sits exactly in right place of the stack
  t.equal(envar.arg(fix.name), fix.value, 'Found in argv layer.');
  t.equal(envar.env(fix.name), undefined, 'Not found in env layer.');
  t.equal(envar.npm(fix.name), undefined, 'Not found in npm layer.');
  t.equal(envar.config(fix.name), undefined, 'Not found in config layer.');
  t.equal(envar.default(fix.name), undefined, 'Not found in defaults layer.');

  t.end();
});

// environment variables layer
test('env', function test_envar_env(t)
{
  var fix = {name: 'env_var', value: 'ok'};

  // pre-check – doesn't exists in the stack
  t.equal(envar(fix.name), undefined, 'Make sure stack has no noise');

  // populate env
  process.env[fix.name] = fix.value;

  // check it's in the stack
  t.equal(envar(fix.name), fix.value, 'Enviroment has '+fix.name+' variable.');

  // check for non-existent
  t.equal(envar(nonExistent), undefined, 'Should return undefined if no key found.');

  // check that it sits exactly in right place of the stack
  t.equal(envar.arg(fix.name), undefined, 'Not found in argv layer.');
  t.equal(envar.env(fix.name), fix.value, 'Found in env layer.');
  t.equal(envar.npm(fix.name), undefined, 'Not found in npm layer.');
  t.equal(envar.config(fix.name), undefined, 'Not found in config layer.');
  t.equal(envar.default(fix.name), undefined, 'Not found in defaults layer.');

  // clean up
  delete process.env[fix.name];

  // and be paranoid about it
  t.equal(envar(fix.name), undefined, 'Make sure stack has been cleaned up');

  t.end();
});

// npm package config variables layer
test('npm', function test_envar_npm(t)
{
  var fix = {name: 'npm_var', value: 'ok'};

  // pre-check – doesn't exists in the stack
  t.equal(envar(fix.name), undefined, 'Make sure stack has no noise');

  // populate env
  process.env['npm_package_config_'+fix.name] = fix.value;

  // check it's in the stack
  t.equal(envar(fix.name), fix.value, 'Npm config has '+fix.name+' variable.');

  // check for non-existent
  t.equal(envar(nonExistent), undefined, 'Should return undefined if no key found.');

  // check that it sits exactly in right place of the stack
  t.equal(envar.arg(fix.name), undefined, 'Not found in argv layer.');
  t.equal(envar.env(fix.name), undefined, 'Not found in env layer.');
  t.equal(envar.npm(fix.name), fix.value, 'Found in npm layer.');
  t.equal(envar.config(fix.name), undefined, 'Not found in config layer.');
  t.equal(envar.default(fix.name), undefined, 'Not found in defaults layer.');

  // clean up
  delete process.env['npm_package_config_'+fix.name];

  // and be paranoid about it
  t.equal(envar(fix.name), undefined, 'Make sure stack has been cleaned up');

  t.end();
});

// config variables layer
test('config', function test_envar_config(t)
{
  // use package.json as test json file
  // package name should be pretty consistent
  var fix = {name: 'name', value: 'envar'};

  // pre-check – doesn't exists in the stack
  t.equal(envar(fix.name), undefined, 'Make sure stack has no noise');

  // import config
  envar.import('package.json');

  // check it's in the stack
  t.equal(envar(fix.name), fix.value, 'Config has been loaded and package.json contains top level variable "'+fix.name+'".');

  // check for non-existent
  t.equal(envar(nonExistent), undefined, 'Should return undefined if no key found.');

  // check that it sits exactly in right place of the stack
  t.equal(envar.arg(fix.name), undefined, 'Not found in argv layer.');
  t.equal(envar.env(fix.name), undefined, 'Not found in env layer.');
  t.equal(envar.npm(fix.name), undefined, 'Not found in npm layer.');
  t.equal(envar.config(fix.name), fix.value, 'Found in config layer.');
  t.equal(envar.default(fix.name), undefined, 'Not found in defaults layer.');

  // reset config layer
  envar.import({});

  // and be paranoid about it
  t.equal(envar(fix.name), undefined, 'Make sure stack has been cleaned up');

  t.end();
});

// defaults layer
test('defaults', function test_envar_defaults(t)
{
  var fix      = {name: 'default_var', value: 'ok'}
    , defaults = {}
    ;

  // pre-check – doesn't exists in the stack
  t.equal(envar(fix.name), undefined, 'Make sure stack has no noise');

  // populate defaults
  defaults[fix.name] = fix.value;

  envar.defaults(defaults);

  // check it's in the stack
  t.equal(envar(fix.name), fix.value, 'Defaults has '+fix.name+' variable.');

  // check for non-existent
  t.equal(envar(nonExistent), undefined, 'Should return undefined if no key found.');

  // check that it sits exactly in right place of the stack
  t.equal(envar.arg(fix.name), undefined, 'Not found in argv layer.');
  t.equal(envar.env(fix.name), undefined, 'Not found in env layer.');
  t.equal(envar.npm(fix.name), undefined, 'Not found in npm layer.');
  t.equal(envar.config(fix.name), undefined, 'Not found in config layer.');
  t.equal(envar.default(fix.name), fix.value, 'Found in defaults layer.');

  // clean up
  envar.defaults({});

  // and be paranoid about it
  t.equal(envar(fix.name), undefined, 'Make sure stack has been cleaned up');

  t.end();
});

// environment variables prefix
test('prefix', function test_envar_prefix(t)
{
  var fix    = {name: 'env_var', value: 'ok'}
    , prefix = 'custom_prefix__'
    ;

  // pre-check – doesn't exists in the stack
  t.equal(envar(fix.name), undefined, 'Make sure stack has no noise');
  t.equal(envar(prefix+fix.name), undefined, 'Make sure stack has no prefixed noise');

  // populate prefixed env
  process.env[prefix+fix.name] = fix.value;

  // request unprefixed var
  t.equal(envar(fix.name), undefined, 'Unable to find unprefixed env var');

  // setup prefix
  envar.prefix(prefix);

  // check it's in the stack
  t.equal(envar(fix.name), fix.value, 'Enviroment has '+fix.name+' variable with prefix '+prefix+'.');

  // check for non-existent
  t.equal(envar(nonExistent), undefined, 'Should return undefined if no key found.');

  // clean up
  delete process.env[prefix+fix.name];

  // and be paranoid about it
  t.equal(envar(fix.name), undefined, 'Make sure stack has been cleaned up');

  // unset prefix
  envar.prefix('');

  t.end();
});

// more detailed look at import() method
test('import', function test_envar_import(t)
{
  // prepare test data
  var fix    = {name: 'name', value: 'envar'}
    , config = {}
    , output
    ;

  // pre-check – doesn't exists in the config layer
  t.equal(envar.config(fix.name), undefined, 'Make sure config has no noise');

  // populate config with object
  config[fix.name] = fix.value;
  envar.import(config);

  // check it's there
  t.equal(envar.config(fix.name), fix.value, 'Config has been populated from object and contains top level variable "'+fix.name+'".');

  // reset config layer
  envar.import({});

  // and be paranoid about it
  t.equal(envar.config(fix.name), undefined, 'Make sure stack has been cleaned up');

  // import check something else rather than object or string

  // number
  output = envar.import(13);
  t.equal(output, false, 'Can not import just a number.');

  // array
  output = envar.import([13]);
  t.equal(output, false, 'Can not import just an array.');

  // string object
  output = envar.import(new String('package.json'));
  t.equal(output, false, 'Can not import just a string object.');

  t.end();
});

// test layers order
test('order', function test_envar_order(t)
{
  // prepare test data
  var fix =
      {
        // defaults
        D: {name: 'test_defaults', value: 'ok'},

        // config
        C: {name: 'test_config', value: 'ok'},

        // npm package config
        N: {name: 'test_npm', value: 'ok'},

        // environment variables
        E: {name: 'test_env', value: 'ok'},

        // argv/cli options
        A: {name: 'test', value: 'ok'} // real cli option
      }
    ;

  // check the hat before the trick
  Object.keys(fix).forEach(function test_envar_order_precheck(layer)
  {
    // argv is real and always here
    if (layer != 'A')
    {
      t.equal(envar(fix[layer].name), undefined, 'Make sure layer '+layer+' has no noise');
    }
  });

  t.end();
});
