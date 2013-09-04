var argv = require('optimist').argv

  // state
  , state =
    {
      // default values
      defaults: {},

      // prefix for environment variables
      prefix: '',

      // variables lookup order
      // A - argv/cli options
      // E - environment variables
      // N - npm package config
      // D - default values
      order: 'AEND'
    }
  ;

// expose function/object
module.exports = envar;

// lookup variable
function envar(key)
{
  var i, value;

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

// configuration methods

// defaults
envar.defaults = function envar_defaults(defaults)
{
  if (typeof defaults == 'object')
  {
    state.defaults = defaults;
  }

  return state.defaults;
}

// environment variables prefix
envar.prefix = function envar_prefix(prefix)
{
  if (typeof prefix == 'string')
  {
    state.prefix = prefix;
  }

  return state.prefix;
}

// lookup order
envar.order = function envar_order(order)
{
  if (typeof order == 'string')
  {
    state.order = order;
  }

  return state.order;
}

// --- private

// lookup methods
// use same letters as lookup order string
var lookup =
{
  // defaults
  D: function envar_lookup_defaults(key)
  {
    return state.defaults[key];
  },

  // npm package config
  N: function envar_lookup_npmPackageConfig(key)
  {
    return process.env['npm_package_config_'+key];
  },

  // environment variables
  E: function envar_lookup_env(key)
  {
    return process.env[state.prefix+key];
  },

  // argv/cli options
  A: function envar_lookup_argv(key)
  {
    return argv[key];
  }
}
