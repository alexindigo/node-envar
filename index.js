var fs   = require('fs')
  , path = require('path')

  // third-party
  , argv  = require('minimist')(process.argv.slice(2))
  , clone = require('deeply/immutable')

  // lookup methods
  , lookup = {}

  // state
  , state = {
    // default values
    defaults: {},

    // config variables
    config: {},

    // prefix for environment variables
    prefix: '',

    // variables lookup order
    // A - argv/cli options
    // E - environment variables
    // N - npm package config
    // C – config imported from external json file
    // D - default values
    order: 'AENCD'
  }
  ;

// expose function/object
module.exports = envar;

/**
 * Looks up requested variable
 *
 * @param   {string} key - variable name to look for
 * @returns {mixed} - found variable or `undefined` if nothing found
 */
function envar(key)
{
  var i, value;

  // be extra paranoid
  if (typeof key != 'string' || !key) return undefined;

  // lookup according to the order
  for (i=0; i<state.order.length; i++)
  {
    if ((value = lookup[state.order[i]](key)) !== undefined)
    {
      return value;
    }
  }

  // nothing found
  return undefined;
}

// --- configuration methods

// (synchronous) import config variables
envar.import = function envar_import(config)
{
  var filename;

  // check if it's real object,
  // means it was preloaded from file or by other means :)
  // store right away
  if (Object.prototype.toString.call(config) == '[object Object]')
  {
    // make it untangled
    state.config = clone(config);
    // done here
    return state.config;
  }

  // otherwise it supposed to be a string
  if (typeof config != 'string') return false;

  // resolve absolute path
  filename = path.resolve(process.cwd(), config);

  if (!fs.existsSync(filename)) return false;

  // it's ok to just throw here,
  // it supposed to be used in sync way before services start
  state.config = JSON.parse(fs.readFileSync(filename, {encoding: 'utf8'}));

  return state.config;
};

// defaults
envar.defaults = function envar_defaults(defaults)
{
  if (Object.prototype.toString.call(defaults) == '[object Object]')
  {
    // make it untangled
    state.defaults = clone(defaults);
  }

  return state.defaults;
};

// environment variables prefix
envar.prefix = function envar_prefix(prefix)
{
  if (typeof prefix == 'string')
  {
    state.prefix = prefix;
  }

  return state.prefix;
};

// lookup order
envar.order = function envar_order(order)
{
  if (typeof order == 'string')
  {
    state.order = order;
  }

  return state.order;
};

// --- getters/setters

// defaults
envar.default = function envar_default(key, value)
{
  if (typeof key != 'string' || !key) return undefined;

  // if second argument provided behave as setter
  if (arguments.length == 2)
  {
    state.defaults[key] = value;
  }

  return state.defaults[key];
};

// config variables
envar.config = function envar_config(key, value)
{
  if (typeof key != 'string' || !key) return undefined;

  // if second argument provided behave as setter
  if (arguments.length == 2)
  {
    state.config[key] = value;
  }

  return state.config[key];
};

// npm package config
envar.npm = function envar_npm(key, value)
{
  if (typeof key != 'string' || !key) return undefined;

  // if second argument provided behave as setter
  if (arguments.length == 2)
  {
    // process.env converts everything to strings
    // handle `undefined` as unset action
    if (value === undefined)
    {
      delete process.env['npm_package_config_' + key];
    }
    else
    {
      process.env['npm_package_config_' + key] = value;
    }
  }

  return process.env['npm_package_config_' + key];
};

// environment variables
envar.env = function envar_env(key, value)
{
  if (typeof key != 'string' || !key) return undefined;

  // if second argument provided behave as setter
  if (arguments.length == 2)
  {
    // process.env converts everything to strings
    // handle `undefined` as unset action
    if (value === undefined)
    {
      delete process.env[state.prefix + key];
    }
    else
    {
      process.env[state.prefix + key] = value;
    }
  }

  return process.env[state.prefix + key];
};

// argv/cli options
envar.arg = function envar_arg(key, value)
{
  if (typeof key != 'string' || !key) return undefined;

  // if second argument provided behave as setter
  if (arguments.length == 2)
  {
    argv[key] = value;
  }

  return argv[key];
};

// use same letters as lookup order string
lookup = {
  // defaults
  D: envar.default,

  // config
  C: envar.config,

  // npm package config
  N: envar.npm,

  // environment variables
  E: envar.env,

  // argv/cli options
  A: envar.arg
};
