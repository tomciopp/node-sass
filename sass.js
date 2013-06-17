var binding;
var fs = require('fs');
try {
  if (fs.realpathSync(__dirname + '/build')) {
    // use the build version if it exists
    binding = require(__dirname + '/build/Release/binding');
  }
} catch (e) {
  // default to a precompiled binary if no build exists
  var platform_full = process.platform+'-'+process.arch;
  binding = require(__dirname + '/precompiled/'+platform_full+'/binding');
}
if (binding === null) {
  throw new Error('Cannot find appropriate binary library for node-sass');
}

var SASS_OUTPUT_STYLE = {
    nested: 0,
    expanded: 1,
    compact: 2,
    compressed: 3
};

var prepareOptions = function(options) {
  var paths, style;
  options = typeof options !== 'object' ? {} : options;
  paths = options.include_paths || options.includePaths || [];
  style = SASS_OUTPUT_STYLE[options.output_style || options.outputStyle] || 0;

  return {
    paths: paths,
    style: style
  };
}

var deprecatedRender = function(css, callback, options) {
  options = prepareOptions(options);
  return binding.oldRender(css, callback, options.paths.join(':'), options.style);
};

var deprecatedRenderSync = function(css, options) {
  options = prepareOptions(options);
  return binding.renderSync(css, options.paths.join(':'), options.style);
};

exports.render = function(options) {
  var newOptions;

  if (typeof arguments[0] === 'string') {
    return deprecatedRender.apply(this, arguments);
  }

  newOptions = prepareOptions(options);
  options.error = options.error || function(){};

  if (options.file !== undefined && options.file !== null) {
    return binding.renderFile(options.file, options.success, options.error, newOptions.paths.join(':'), newOptions.style);
  }

  //Assume data is present if file is not. binding/libsass will tell the user otherwise!
  return binding.render(options.data, options.success, options.error, newOptions.paths.join(":"), newOptions.style);
};

exports.renderSync = function(options) {
  var newOptions;

  if (typeof arguments[0] === 'string') {
    return deprecatedRenderSync.apply(this, arguments);
  }

  newOptions = prepareOptions(options);

  if (options.file !== undefined && options.file !== null) {
    return binding.renderFileSync(options.file, newOptions.paths.join(':'), newOptions.style);
  }

  //Assume data is present if file is not. binding/libsass will tell the user otherwise!
  return binding.renderSync(options.data, newOptions.paths.join(":"), newOptions.style);
};

exports.middleware = require('./lib/middleware');