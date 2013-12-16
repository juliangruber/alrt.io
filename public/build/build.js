
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("visionmedia-page.js/index.js", Function("exports, require, module",
"\n\
;(function(){\n\
\n\
  /**\n\
   * Perform initial dispatch.\n\
   */\n\
\n\
  var dispatch = true;\n\
\n\
  /**\n\
   * Base path.\n\
   */\n\
\n\
  var base = '';\n\
\n\
  /**\n\
   * Running flag.\n\
   */\n\
\n\
  var running;\n\
\n\
  /**\n\
   * Register `path` with callback `fn()`,\n\
   * or route `path`, or `page.start()`.\n\
   *\n\
   *   page(fn);\n\
   *   page('*', fn);\n\
   *   page('/user/:id', load, user);\n\
   *   page('/user/' + user.id, { some: 'thing' });\n\
   *   page('/user/' + user.id);\n\
   *   page();\n\
   *\n\
   * @param {String|Function} path\n\
   * @param {Function} fn...\n\
   * @api public\n\
   */\n\
\n\
  function page(path, fn) {\n\
    // <callback>\n\
    if ('function' == typeof path) {\n\
      return page('*', path);\n\
    }\n\
\n\
    // route <path> to <callback ...>\n\
    if ('function' == typeof fn) {\n\
      var route = new Route(path);\n\
      for (var i = 1; i < arguments.length; ++i) {\n\
        page.callbacks.push(route.middleware(arguments[i]));\n\
      }\n\
    // show <path> with [state]\n\
    } else if ('string' == typeof path) {\n\
      page.show(path, fn);\n\
    // start [options]\n\
    } else {\n\
      page.start(path);\n\
    }\n\
  }\n\
\n\
  /**\n\
   * Callback functions.\n\
   */\n\
\n\
  page.callbacks = [];\n\
\n\
  /**\n\
   * Get or set basepath to `path`.\n\
   *\n\
   * @param {String} path\n\
   * @api public\n\
   */\n\
\n\
  page.base = function(path){\n\
    if (0 == arguments.length) return base;\n\
    base = path;\n\
  };\n\
\n\
  /**\n\
   * Bind with the given `options`.\n\
   *\n\
   * Options:\n\
   *\n\
   *    - `click` bind to click events [true]\n\
   *    - `popstate` bind to popstate [true]\n\
   *    - `dispatch` perform initial dispatch [true]\n\
   *\n\
   * @param {Object} options\n\
   * @api public\n\
   */\n\
\n\
  page.start = function(options){\n\
    options = options || {};\n\
    if (running) return;\n\
    running = true;\n\
    if (false === options.dispatch) dispatch = false;\n\
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);\n\
    if (false !== options.click) window.addEventListener('click', onclick, false);\n\
    if (!dispatch) return;\n\
    var url = location.pathname + location.search + location.hash;\n\
    page.replace(url, null, true, dispatch);\n\
  };\n\
\n\
  /**\n\
   * Unbind click and popstate event handlers.\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  page.stop = function(){\n\
    running = false;\n\
    removeEventListener('click', onclick, false);\n\
    removeEventListener('popstate', onpopstate, false);\n\
  };\n\
\n\
  /**\n\
   * Show `path` with optional `state` object.\n\
   *\n\
   * @param {String} path\n\
   * @param {Object} state\n\
   * @param {Boolean} dispatch\n\
   * @return {Context}\n\
   * @api public\n\
   */\n\
\n\
  page.show = function(path, state, dispatch){\n\
    var ctx = new Context(path, state);\n\
    if (false !== dispatch) page.dispatch(ctx);\n\
    if (!ctx.unhandled) ctx.pushState();\n\
    return ctx;\n\
  };\n\
\n\
  /**\n\
   * Replace `path` with optional `state` object.\n\
   *\n\
   * @param {String} path\n\
   * @param {Object} state\n\
   * @return {Context}\n\
   * @api public\n\
   */\n\
\n\
  page.replace = function(path, state, init, dispatch){\n\
    var ctx = new Context(path, state);\n\
    ctx.init = init;\n\
    if (null == dispatch) dispatch = true;\n\
    if (dispatch) page.dispatch(ctx);\n\
    ctx.save();\n\
    return ctx;\n\
  };\n\
\n\
  /**\n\
   * Dispatch the given `ctx`.\n\
   *\n\
   * @param {Object} ctx\n\
   * @api private\n\
   */\n\
\n\
  page.dispatch = function(ctx){\n\
    var i = 0;\n\
\n\
    function next() {\n\
      var fn = page.callbacks[i++];\n\
      if (!fn) return unhandled(ctx);\n\
      fn(ctx, next);\n\
    }\n\
\n\
    next();\n\
  };\n\
\n\
  /**\n\
   * Unhandled `ctx`. When it's not the initial\n\
   * popstate then redirect. If you wish to handle\n\
   * 404s on your own use `page('*', callback)`.\n\
   *\n\
   * @param {Context} ctx\n\
   * @api private\n\
   */\n\
\n\
  function unhandled(ctx) {\n\
    var current = window.location.pathname + window.location.search;\n\
    if (current == ctx.canonicalPath) return;\n\
    page.stop();\n\
    ctx.unhandled = true;\n\
    window.location = ctx.canonicalPath;\n\
  }\n\
\n\
  /**\n\
   * Initialize a new \"request\" `Context`\n\
   * with the given `path` and optional initial `state`.\n\
   *\n\
   * @param {String} path\n\
   * @param {Object} state\n\
   * @api public\n\
   */\n\
\n\
  function Context(path, state) {\n\
    if ('/' == path[0] && 0 != path.indexOf(base)) path = base + path;\n\
    var i = path.indexOf('?');\n\
\n\
    this.canonicalPath = path;\n\
    this.path = path.replace(base, '') || '/';\n\
\n\
    this.title = document.title;\n\
    this.state = state || {};\n\
    this.state.path = path;\n\
    this.querystring = ~i ? path.slice(i + 1) : '';\n\
    this.pathname = ~i ? path.slice(0, i) : path;\n\
    this.params = [];\n\
\n\
    // fragment\n\
    this.hash = '';\n\
    if (!~this.path.indexOf('#')) return;\n\
    var parts = this.path.split('#');\n\
    this.path = parts[0];\n\
    this.hash = parts[1] || '';\n\
    this.querystring = this.querystring.split('#')[0];\n\
  }\n\
\n\
  /**\n\
   * Expose `Context`.\n\
   */\n\
\n\
  page.Context = Context;\n\
\n\
  /**\n\
   * Push state.\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  Context.prototype.pushState = function(){\n\
    history.pushState(this.state, this.title, this.canonicalPath);\n\
  };\n\
\n\
  /**\n\
   * Save the context state.\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Context.prototype.save = function(){\n\
    history.replaceState(this.state, this.title, this.canonicalPath);\n\
  };\n\
\n\
  /**\n\
   * Initialize `Route` with the given HTTP `path`,\n\
   * and an array of `callbacks` and `options`.\n\
   *\n\
   * Options:\n\
   *\n\
   *   - `sensitive`    enable case-sensitive routes\n\
   *   - `strict`       enable strict matching for trailing slashes\n\
   *\n\
   * @param {String} path\n\
   * @param {Object} options.\n\
   * @api private\n\
   */\n\
\n\
  function Route(path, options) {\n\
    options = options || {};\n\
    this.path = path;\n\
    this.method = 'GET';\n\
    this.regexp = pathtoRegexp(path\n\
      , this.keys = []\n\
      , options.sensitive\n\
      , options.strict);\n\
  }\n\
\n\
  /**\n\
   * Expose `Route`.\n\
   */\n\
\n\
  page.Route = Route;\n\
\n\
  /**\n\
   * Return route middleware with\n\
   * the given callback `fn()`.\n\
   *\n\
   * @param {Function} fn\n\
   * @return {Function}\n\
   * @api public\n\
   */\n\
\n\
  Route.prototype.middleware = function(fn){\n\
    var self = this;\n\
    return function(ctx, next){\n\
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);\n\
      next();\n\
    };\n\
  };\n\
\n\
  /**\n\
   * Check if this route matches `path`, if so\n\
   * populate `params`.\n\
   *\n\
   * @param {String} path\n\
   * @param {Array} params\n\
   * @return {Boolean}\n\
   * @api private\n\
   */\n\
\n\
  Route.prototype.match = function(path, params){\n\
    var keys = this.keys\n\
      , qsIndex = path.indexOf('?')\n\
      , pathname = ~qsIndex ? path.slice(0, qsIndex) : path\n\
      , m = this.regexp.exec(decodeURIComponent(pathname));\n\
\n\
    if (!m) return false;\n\
\n\
    for (var i = 1, len = m.length; i < len; ++i) {\n\
      var key = keys[i - 1];\n\
\n\
      var val = 'string' == typeof m[i]\n\
        ? decodeURIComponent(m[i])\n\
        : m[i];\n\
\n\
      if (key) {\n\
        params[key.name] = undefined !== params[key.name]\n\
          ? params[key.name]\n\
          : val;\n\
      } else {\n\
        params.push(val);\n\
      }\n\
    }\n\
\n\
    return true;\n\
  };\n\
\n\
  /**\n\
   * Normalize the given path string,\n\
   * returning a regular expression.\n\
   *\n\
   * An empty array should be passed,\n\
   * which will contain the placeholder\n\
   * key names. For example \"/user/:id\" will\n\
   * then contain [\"id\"].\n\
   *\n\
   * @param  {String|RegExp|Array} path\n\
   * @param  {Array} keys\n\
   * @param  {Boolean} sensitive\n\
   * @param  {Boolean} strict\n\
   * @return {RegExp}\n\
   * @api private\n\
   */\n\
\n\
  function pathtoRegexp(path, keys, sensitive, strict) {\n\
    if (path instanceof RegExp) return path;\n\
    if (path instanceof Array) path = '(' + path.join('|') + ')';\n\
    path = path\n\
      .concat(strict ? '' : '/?')\n\
      .replace(/\\/\\(/g, '(?:/')\n\
      .replace(/(\\/)?(\\.)?:(\\w+)(?:(\\(.*?\\)))?(\\?)?/g, function(_, slash, format, key, capture, optional){\n\
        keys.push({ name: key, optional: !! optional });\n\
        slash = slash || '';\n\
        return ''\n\
          + (optional ? '' : slash)\n\
          + '(?:'\n\
          + (optional ? slash : '')\n\
          + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'\n\
          + (optional || '');\n\
      })\n\
      .replace(/([\\/.])/g, '\\\\$1')\n\
      .replace(/\\*/g, '(.*)');\n\
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');\n\
  }\n\
\n\
  /**\n\
   * Handle \"populate\" events.\n\
   */\n\
\n\
  function onpopstate(e) {\n\
    if (e.state) {\n\
      var path = e.state.path;\n\
      page.replace(path, e.state);\n\
    }\n\
  }\n\
\n\
  /**\n\
   * Handle \"click\" events.\n\
   */\n\
\n\
  function onclick(e) {\n\
    if (1 != which(e)) return;\n\
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;\n\
    if (e.defaultPrevented) return;\n\
\n\
    // ensure link\n\
    var el = e.target;\n\
    while (el && 'A' != el.nodeName) el = el.parentNode;\n\
    if (!el || 'A' != el.nodeName) return;\n\
\n\
    // ensure non-hash for the same path\n\
    var link = el.getAttribute('href');\n\
    if (el.pathname == location.pathname && (el.hash || '#' == link)) return;\n\
\n\
    // check target\n\
    if (el.target) return;\n\
\n\
    // x-origin\n\
    if (!sameOrigin(el.href)) return;\n\
\n\
    // rebuild path\n\
    var path = el.pathname + el.search + (el.hash || '');\n\
\n\
    // same page\n\
    var orig = path + el.hash;\n\
\n\
    path = path.replace(base, '');\n\
    if (base && orig == path) return;\n\
\n\
    e.preventDefault();\n\
    page.show(orig);\n\
  }\n\
\n\
  /**\n\
   * Event button.\n\
   */\n\
\n\
  function which(e) {\n\
    e = e || window.event;\n\
    return null == e.which\n\
      ? e.button\n\
      : e.which;\n\
  }\n\
\n\
  /**\n\
   * Check if `href` is the same origin.\n\
   */\n\
\n\
  function sameOrigin(href) {\n\
    var origin = location.protocol + '//' + location.hostname;\n\
    if (location.port) origin += ':' + location.port;\n\
    return 0 == href.indexOf(origin);\n\
  }\n\
\n\
  /**\n\
   * Expose `page`.\n\
   */\n\
\n\
  if ('undefined' == typeof module) {\n\
    window.page = page;\n\
  } else {\n\
    module.exports = page;\n\
  }\n\
\n\
})();\n\
//@ sourceURL=visionmedia-page.js/index.js"
));
require.register("component-bind/index.js", Function("exports, require, module",
"/**\n\
 * Slice reference.\n\
 */\n\
\n\
var slice = [].slice;\n\
\n\
/**\n\
 * Bind `obj` to `fn`.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function|String} fn or string\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  if ('string' == typeof fn) fn = obj[fn];\n\
  if ('function' != typeof fn) throw new Error('bind() requires a function');\n\
  var args = slice.call(arguments, 2);\n\
  return function(){\n\
    return fn.apply(obj, args.concat(slice.call(arguments)));\n\
  }\n\
};\n\
//@ sourceURL=component-bind/index.js"
));
require.register("component-style/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `style`.\n\
 */\n\
\n\
module.exports = style;\n\
\n\
/**\n\
 * Return the style for `prop` using the given `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
function style(selector, prop) {\n\
  var cache = style.cache = style.cache || {}\n\
    , cid = selector + ':' + prop;\n\
\n\
  if (cache[cid]) return cache[cid];\n\
\n\
  var parts = selector.split(/ +/)\n\
    , len = parts.length\n\
    , parent = document.createElement('div')\n\
    , root = parent\n\
    , child\n\
    , part;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    part = parts[i];\n\
    child = document.createElement('div');\n\
    parent.appendChild(child);\n\
    parent = child;\n\
    if ('#' == part[0]) {\n\
      child.setAttribute('id', part.substr(1));\n\
    } else if ('.' == part[0]) {\n\
      child.setAttribute('class', part.substr(1));\n\
    }\n\
  }\n\
\n\
  document.body.appendChild(root);\n\
  var ret = getComputedStyle(child)[prop];\n\
  document.body.removeChild(root);\n\
  return cache[cid] = ret;\n\
}//@ sourceURL=component-style/index.js"
));
require.register("component-inherit/index.js", Function("exports, require, module",
"\n\
module.exports = function(a, b){\n\
  var fn = function(){};\n\
  fn.prototype = b.prototype;\n\
  a.prototype = new fn;\n\
  a.prototype.constructor = a;\n\
};//@ sourceURL=component-inherit/index.js"
));
require.register("component-pie/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var style = require('style');\n\
\n\
/**\n\
 * Expose `Pie()`.\n\
 */\n\
\n\
module.exports = Pie;\n\
\n\
/**\n\
 * Initialize a new `Pie` with\n\
 * an optional css `selector`,\n\
 * defaulting to \".pie\".\n\
 *\n\
 * @param {String} selector\n\
 * @api public\n\
 */\n\
\n\
function Pie(selector) {\n\
  if (!(this instanceof Pie)) return new Pie(selector);\n\
  selector = selector || '.pie';\n\
  this.background = style(selector, 'background-color');\n\
  this.borderWidth = parseInt(style(selector, 'border-width'), 10);\n\
  this.borderColor = style(selector, 'border-color');\n\
  this.color = style(selector, 'color');\n\
  this.size(16);\n\
}\n\
\n\
/**\n\
 * Update percentage to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.update = function(n){\n\
  this.percent = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.size = function(n){\n\
  this._size = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Draw on to `ctx`.\n\
 *\n\
 * @param {CanvasContext2d} ctx\n\
 * @return {Pie}\n\
 * @api public\n\
 */\n\
\n\
Pie.prototype.draw = function(ctx){\n\
  var size = this._size;\n\
  var half = size / 2;\n\
  var n = this.percent / 100;\n\
  var pi = Math.PI * 2;\n\
\n\
  // clear\n\
  ctx.clearRect(0, 0, size, size);\n\
\n\
  // border\n\
  ctx.beginPath();\n\
  ctx.moveTo(half, half);\n\
  ctx.arc(half, half, half, 0, pi, false);\n\
  ctx.fillStyle = this.borderColor;\n\
  ctx.fill();\n\
\n\
  // background\n\
  ctx.beginPath();\n\
  ctx.moveTo(half, half);\n\
  ctx.arc(half, half, half - this.borderWidth, 0, pi, false);\n\
  ctx.fillStyle = this.background;\n\
  ctx.fill();\n\
\n\
  // pie\n\
  ctx.beginPath();\n\
  ctx.moveTo(half, half);\n\
  ctx.arc(half, half, half - this.borderWidth, 0, pi * n, false);\n\
  ctx.fillStyle = this.color;\n\
  ctx.fill();\n\
\n\
  return this;\n\
};\n\
//@ sourceURL=component-pie/index.js"
));
require.register("component-autoscale-canvas/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Retina-enable the given `canvas`.\n\
 *\n\
 * @param {Canvas} canvas\n\
 * @return {Canvas}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(canvas){\n\
  var ctx = canvas.getContext('2d');\n\
  var ratio = window.devicePixelRatio || 1;\n\
  if (1 != ratio) {\n\
    canvas.style.width = canvas.width + 'px';\n\
    canvas.style.height = canvas.height + 'px';\n\
    canvas.width *= ratio;\n\
    canvas.height *= ratio;\n\
    ctx.scale(ratio, ratio);\n\
  }\n\
  return canvas;\n\
};//@ sourceURL=component-autoscale-canvas/index.js"
));
require.register("component-piecon/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var style = require('style');\n\
var inherit = require('inherit');\n\
var favicon = require('favicon');\n\
var autoscale = require('autoscale-canvas');\n\
var Pie = require('pie');\n\
\n\
/**\n\
 * Expose `Piecon()`.\n\
 */\n\
\n\
module.exports = Piecon;\n\
\n\
/**\n\
 * Initialize a new `Piecon` with\n\
 * an optional css `selector`,\n\
 * defaulting to \".pie\".\n\
 *\n\
 * @param {String} selector\n\
 * @api public\n\
 */\n\
\n\
function Piecon(selector) {\n\
  if (!(this instanceof Piecon)) return new Piecon(selector);\n\
  this.el = document.createElement('canvas');\n\
  this.ctx = this.el.getContext('2d');\n\
  Pie.call(this, selector);\n\
}\n\
\n\
/**\n\
 * Inherits from `Pie.prototype`.\n\
 */\n\
\n\
inherit(Piecon, Pie);\n\
\n\
/**\n\
 * Set size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Piecon}\n\
 * @api public\n\
 */\n\
\n\
Piecon.prototype.size = function(n){\n\
  this._size = n;\n\
  this.el.width = n;\n\
  this.el.height = n;\n\
  autoscale(this.el);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Update percentage to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Piecon}\n\
 * @api public\n\
 */\n\
\n\
Piecon.prototype.update = function(n){\n\
  this.percent = n;\n\
  this.draw(this.ctx);\n\
  favicon(this.el.toDataURL());\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Reset favicon.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Piecon.prototype.reset = function(){\n\
  favicon.reset();\n\
};//@ sourceURL=component-piecon/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // Note: when moving children, don't rely on el.children\n\
  // being 'live' to support Polymer's broken behaviour.\n\
  // See: https://github.com/component/domify/pull/23\n\
  if (1 == el.children.length) {\n\
    return el.removeChild(el.children[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.children.length) {\n\
    fragment.appendChild(el.removeChild(el.children[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("matthewp-text/index.js", Function("exports, require, module",
"\n\
var text = 'innerText' in document.createElement('div')\n\
  ? 'innerText'\n\
  : 'textContent'\n\
\n\
module.exports = function (el, val) {\n\
  if (val == null) return el[text];\n\
  el[text] = val;\n\
};\n\
//@ sourceURL=matthewp-text/index.js"
));
require.register("juliangruber-audio-context/index.js", Function("exports, require, module",
"var Context = window.webkitAudioContext || window.AudioContext;\n\
if (Context) module.exports = new Context;//@ sourceURL=juliangruber-audio-context/index.js"
));
require.register("godmodelabs-span/index.js", Function("exports, require, module",
"var intervals = {\n\
  YEAR: 31557600000, \n\
  WEEK: 604800000,\n\
  DAY: 86400000,\n\
  HOUR: 3600000,\n\
  MINUTE: 60000,\n\
  SECOND: 1000,\n\
  MILLISECOND: 1\n\
};\n\
\n\
module.exports = span;\n\
\n\
/**\n\
 * Convert a number to span string and vice versa.\n\
 *\n\
 * @param {Number|String} val\n\
 * @return {Number|String}\n\
 * @api public\n\
 */\n\
\n\
function span(val) {\n\
  return typeof val == 'number' || val == parseInt(val, 10)\n\
    ? str(val)\n\
    : ms(val);\n\
};\n\
\n\
/**\n\
 * Convert `ms` to a span string.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function str(ms) {\n\
  var output = [];\n\
  var buf;\n\
  for (var i in intervals) {\n\
    if (ms >= intervals[i]) {\n\
      buf = Math.floor(ms/intervals[i]);\n\
      if (i != 'MILLISECOND') {\n\
        output.push(buf + i.substr(0,1).toLowerCase());\n\
      } else if (!output.length) {\n\
        output.push(buf + 'ms');\n\
      }\n\
      ms -= buf * intervals[i];\n\
    }\n\
  }\n\
  return output.join(' ');\n\
}\n\
\n\
/**\n\
 * Convert a date `str` to milliseconds.\n\
 *\n\
 * @param {String} str\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
function ms(str) {\n\
  var date = parseDate(str);\n\
  var ms = 0;\n\
  for (var type in date) {\n\
    switch(type) {\n\
      case 'ms': ms += date[type]; break;\n\
      case 's': ms += date[type] * intervals.SECOND; break;\n\
      case 'm': ms += date[type] * intervals.MINUTE; break;\n\
      case 'h': ms += date[type] * intervals.HOUR; break;\n\
      case 'd': ms += date[type] * intervals.DAY; break;\n\
      case 'w': ms += date[type] * intervals.WEEK; break;\n\
      case 'y': ms += date[type] * intervals.YEAR;\n\
    }\n\
  }\n\
  return ms;\n\
}\n\
\n\
/**\n\
 * Parse an absolute or relative date string into a span in milliseconds.\n\
 *\n\
 * @param {String} str\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
function parseDate(str) {\n\
  var str = str.replace(/ /g, '');\n\
  \n\
  if (str.indexOf('in') > -1) return parseRelative(str);\n\
  if (str.indexOf(':') > -1) throw 'Absolute date parsing not yet implemented';\n\
  return parseRelative(str);\n\
}\n\
\n\
/**\n\
 * Parse a relative span `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 * @todo write proper parser and move to seperate project\n\
 */\n\
\n\
function parseRelative(str) {\n\
  var str = str\n\
    .replace(/in/, '')\n\
    .replace(/years?|jahre?|j/, 'y')\n\
    .replace(/weeks?|wochen?/, 'w')\n\
    .replace(/days?|tage?/, 'd')\n\
    .replace(/hours?|stunden?/, 'h')\n\
    .replace(/minutes?|mins?|minuten?/, 'm')\n\
    .replace(/seconds?|secs?|sekunden?|sek/, 's');\n\
\n\
  var duration = 0;\n\
  var date = {};\n\
  var numBuffer = [];\n\
  for (var i = 0; i < str.length; i++) {\n\
    if (str.charCodeAt(i) < 97) {\n\
      numBuffer.push(str[i]);\n\
    } else {\n\
      date[str[i]] = parseInt(numBuffer.join(''), 10);\n\
      numBuffer = [];\n\
    };\n\
  }\n\
  return date;\n\
}\n\
//@ sourceURL=godmodelabs-span/index.js"
));
require.register("component-favicon/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Original favicon.\n\
 */\n\
\n\
var orig;\n\
\n\
/**\n\
 * Expose `set()`.\n\
 */\n\
\n\
exports = module.exports = set;\n\
\n\
/**\n\
 * Expose `reset()`.\n\
 */\n\
\n\
exports.reset = reset;\n\
\n\
/**\n\
 * Set the favicon to the given data uri `str`.\n\
 *\n\
 * @param {String} str\n\
 * @api public\n\
 */\n\
\n\
function set(str) {\n\
  if ('string' != typeof str) throw new TypeError('data uri string expected');\n\
  \n\
  // orig\n\
  var el = link();\n\
  if (el) orig = orig || el.href;\n\
\n\
  // remove old tag\n\
  remove();\n\
\n\
  // new one\n\
  var el = create();\n\
  el.href = str;\n\
  head().appendChild(el);\n\
}\n\
\n\
/**\n\
 * Return the favicon link.\n\
 *\n\
 * @return {Element}\n\
 * @api private\n\
 */\n\
\n\
function link() {\n\
  return document.querySelector('link[rel=icon]');\n\
}\n\
\n\
/**\n\
 * Remove the favicon link.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function remove() {\n\
  var el = link();\n\
  if (el) el.parentNode.removeChild(el);\n\
}\n\
\n\
/**\n\
 * Create a new link.\n\
 *\n\
 * @return {Element}\n\
 * @api private\n\
 */\n\
\n\
function create() {\n\
  var el = document.createElement('link');\n\
  el.type = 'image/x-icon';\n\
  el.rel = 'icon';\n\
  return el;\n\
}\n\
\n\
/**\n\
 * Reset to the original favicon.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function reset() {\n\
  if (orig) {\n\
    set(orig);\n\
  } else {\n\
    remove();\n\
  }\n\
}\n\
\n\
/**\n\
 * Return the head element.\n\
 *\n\
 * @return {Element}\n\
 * @api private\n\
 */\n\
\n\
function head() {\n\
  return document.getElementsByTagName('head')[0];\n\
}\n\
//@ sourceURL=component-favicon/index.js"
));
require.register("component-raf/index.js", Function("exports, require, module",
"/**\n\
 * Expose `requestAnimationFrame()`.\n\
 */\n\
\n\
exports = module.exports = window.requestAnimationFrame\n\
  || window.webkitRequestAnimationFrame\n\
  || window.mozRequestAnimationFrame\n\
  || window.oRequestAnimationFrame\n\
  || window.msRequestAnimationFrame\n\
  || fallback;\n\
\n\
/**\n\
 * Fallback implementation.\n\
 */\n\
\n\
var prev = new Date().getTime();\n\
function fallback(fn) {\n\
  var curr = new Date().getTime();\n\
  var ms = Math.max(0, 16 - (curr - prev));\n\
  var req = setTimeout(fn, ms);\n\
  prev = curr;\n\
  return req;\n\
}\n\
\n\
/**\n\
 * Cancel.\n\
 */\n\
\n\
var cancel = window.cancelAnimationFrame\n\
  || window.webkitCancelAnimationFrame\n\
  || window.mozCancelAnimationFrame\n\
  || window.oCancelAnimationFrame\n\
  || window.msCancelAnimationFrame\n\
  || window.clearTimeout;\n\
\n\
exports.cancel = function(id){\n\
  cancel.call(window, id);\n\
};\n\
//@ sourceURL=component-raf/index.js"
));
require.register("component-progress/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var autoscale = require('autoscale-canvas');\n\
\n\
/**\n\
 * Expose `Progress`.\n\
 */\n\
\n\
module.exports = Progress;\n\
\n\
/**\n\
 * Initialize a new `Progress` indicator.\n\
 */\n\
\n\
function Progress() {\n\
  this.percent = 0;\n\
  this.el = document.createElement('canvas');\n\
  this.ctx = this.el.getContext('2d');\n\
  this.size(50);\n\
  this.fontSize(11);\n\
  this.font('helvetica, arial, sans-serif');\n\
}\n\
\n\
/**\n\
 * Set progress size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.size = function(n){\n\
  this.el.width = n;\n\
  this.el.height = n;\n\
  autoscale(this.el);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set text to `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.text = function(str){\n\
  this._text = str;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set font size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.fontSize = function(n){\n\
  this._fontSize = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set font `family`.\n\
 *\n\
 * @param {String} family\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.font = function(family){\n\
  this._font = family;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Update percentage to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress}\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.update = function(n){\n\
  this.percent = n;\n\
  this.draw(this.ctx);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Draw on `ctx`.\n\
 *\n\
 * @param {CanvasRenderingContext2d} ctx\n\
 * @return {Progress}\n\
 * @api private\n\
 */\n\
\n\
Progress.prototype.draw = function(ctx){\n\
  var percent = Math.min(this.percent, 100)\n\
    , ratio = window.devicePixelRatio || 1\n\
    , size = this.el.width / ratio\n\
    , half = size / 2\n\
    , x = half\n\
    , y = half\n\
    , rad = half - 1\n\
    , fontSize = this._fontSize;\n\
\n\
  ctx.font = fontSize + 'px ' + this._font;\n\
\n\
  var angle = Math.PI * 2 * (percent / 100);\n\
  ctx.clearRect(0, 0, size, size);\n\
\n\
  // outer circle\n\
  ctx.strokeStyle = '#9f9f9f';\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad, 0, angle, false);\n\
  ctx.stroke();\n\
\n\
  // inner circle\n\
  ctx.strokeStyle = '#eee';\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad - 1, 0, angle, true);\n\
  ctx.stroke();\n\
\n\
  // text\n\
  var text = this._text || (percent | 0) + '%'\n\
    , w = ctx.measureText(text).width;\n\
\n\
  ctx.fillText(\n\
      text\n\
    , x - w / 2 + 1\n\
    , y + fontSize / 2 - 1);\n\
\n\
  return this;\n\
};\n\
\n\
//@ sourceURL=component-progress/index.js"
));
require.register("component-css/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Properties to ignore appending \"px\".\n\
 */\n\
\n\
var ignore = {\n\
  columnCount: true,\n\
  fillOpacity: true,\n\
  fontWeight: true,\n\
  lineHeight: true,\n\
  opacity: true,\n\
  orphans: true,\n\
  widows: true,\n\
  zIndex: true,\n\
  zoom: true\n\
};\n\
\n\
/**\n\
 * Set `el` css values.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} obj\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, obj){\n\
  for (var key in obj) {\n\
    var val = obj[key];\n\
    if ('number' == typeof val && !ignore[key]) val += 'px';\n\
    el.style[key] = val;\n\
  }\n\
  return el;\n\
};\n\
//@ sourceURL=component-css/index.js"
));
require.register("component-debounce/index.js", Function("exports, require, module",
"/**\n\
 * Debounces a function by the given threshold.\n\
 *\n\
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/\n\
 * @param {Function} function to wrap\n\
 * @param {Number} timeout in ms (`100`)\n\
 * @param {Boolean} whether to execute at the beginning (`false`)\n\
 * @api public\n\
 */\n\
\n\
module.exports = function debounce(func, threshold, execAsap){\n\
  var timeout;\n\
\n\
  return function debounced(){\n\
    var obj = this, args = arguments;\n\
\n\
    function delayed () {\n\
      if (!execAsap) {\n\
        func.apply(obj, args);\n\
      }\n\
      timeout = null;\n\
    }\n\
\n\
    if (timeout) {\n\
      clearTimeout(timeout);\n\
    } else if (execAsap) {\n\
      func.apply(obj, args);\n\
    }\n\
\n\
    timeout = setTimeout(delayed, threshold || 100);\n\
  };\n\
};\n\
//@ sourceURL=component-debounce/index.js"
));
require.register("time-view/index.js", Function("exports, require, module",
"var Progress = require('progress');\n\
var bind = require('bind');\n\
var css = require('css');\n\
var debounce = require('debounce');\n\
var span = require('span');\n\
\n\
module.exports = Time;\n\
\n\
/**\n\
 * Time view.\n\
 *\n\
 * @return {Time}\n\
 * @api public\n\
 */\n\
\n\
function Time(time) {\n\
  this.time = time;\n\
  this.stopped = false;\n\
  this.progress = new Progress();\n\
  this.el = this.progress.el;\n\
  css(this.el, { display: 'none' });\n\
  setTimeout(bind(this, 'place'));\n\
  this._place = bind(this, debounce(this.place, 200));\n\
  window.addEventListener('resize', this._place);\n\
  this.update(this.time);\n\
}\n\
\n\
/**\n\
 * Update time left.\n\
 *\n\
 * @param {Number} time\n\
 * @api public\n\
 */\n\
\n\
Time.prototype.update = function(time) {\n\
  this.progress.text(span(time + 1000));\n\
  this.progress.update(time / this.time * 100);\n\
};\n\
\n\
/**\n\
 * Mark the timer as ended.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Time.prototype.end = function() {\n\
  var self = this;\n\
  var i = 0;\n\
  self.progress.text('beep!');\n\
  (function blink() {\n\
    if (self.stopped) return;\n\
    setTimeout(blink, 700);\n\
    self.progress.update(i++ % 2 ? 0 : 100);\n\
  })();\n\
};\n\
\n\
/**\n\
 * Remove all listeners.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Time.prototype.destroy = function() {\n\
  window.removeEventListener('resize', this._place);\n\
  this.stopped = true;\n\
};\n\
\n\
/**\n\
 * Place and resize inside parent element.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Time.prototype.place = function() {\n\
  var par = this.el.parentNode;\n\
  var min = Math.min(par.offsetHeight, par.offsetWidth);\n\
  var size = min * .7;\n\
  this.progress.size(size);\n\
  css(this.el, {\n\
    display: 'block',\n\
    position: 'absolute',\n\
    top: par.offsetHeight / 2 - size / 2,\n\
    left: par.offsetWidth / 2 - size / 2\n\
  });\n\
};\n\
//@ sourceURL=time-view/index.js"
));
require.register("timer/index.js", Function("exports, require, module",
"var bind = require('bind');\n\
var template = require('./template');\n\
var domify = require('domify');\n\
var text = require('text');\n\
var beep = require('./beep');\n\
var Notifications = window.webkitNotifications\n\
  || window.mozNotifications\n\
  || window.Notifications;\n\
var TimeView = require('time-view');\n\
var span = require('span');\n\
var raf = require('raf');\n\
\n\
module.exports = Timer;\n\
\n\
/**\n\
 * Timer view.\n\
 *\n\
 * @param {String} dur\n\
 * @return {Timer}\n\
 * @todo Refactor out 'enable notifications' button\n\
 */\n\
 \n\
function Timer(dur) {\n\
  var self = this;\n\
  this.span = span(dur);\n\
  this.el = domify(template);\n\
  this.enableNotifications(); \n\
  this.time = new TimeView(this.span);\n\
  this.el.appendChild(this.time.el);\n\
  this.stopped = false;\n\
  this.start = Date.now();\n\
  \n\
  setTimeout(function() {\n\
    self.start = Date.now();\n\
    (function animate() {\n\
      if (self.stopped) return;\n\
      var left = self.start + self.span - Date.now();\n\
      if (left > 0) {\n\
        self.update(left);\n\
        raf(animate);\n\
      } else {\n\
        self.end();\n\
      }\n\
    })();\n\
  });\n\
};\n\
\n\
/**\n\
 * Abort.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Timer.prototype.abort = function() {\n\
  this.stopped = true;\n\
  this.time.destroy();\n\
};\n\
\n\
/**\n\
 * Update display.\n\
 *\n\
 * @param {Number} left\n\
 * @api private\n\
 */\n\
\n\
Timer.prototype.update = function(left) {\n\
  this.time.update(left);\n\
};\n\
\n\
/**\n\
 * When the timer is done.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Timer.prototype.end = function() {\n\
  notify('Alert', 'Timer finished');\n\
  beep();\n\
  this.time.end();\n\
};\n\
\n\
/**\n\
 * Show or hide 'enable notifications' button.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Timer.prototype.enableNotifications = function() {\n\
  if (!Notifications) return;\n\
  var enable = this.el.querySelector('button');\n\
\n\
  if (!Notifications.checkPermission()) {\n\
    enable.parentNode.removeChild(enable);\n\
  } else {\n\
    enable.addEventListener('click', function() {\n\
      enableNotifications(function(err) {\n\
        if (!err) enable.parentNode.removeChild(enable);\n\
      });\n\
    });\n\
  }\n\
};\n\
\n\
/**\n\
 * Notification api helper.\n\
 *\n\
 * @param {String} title\n\
 * @param {String} text\n\
 * @api private\n\
 */\n\
\n\
function notify(title, text) {\n\
  if (!Notifications) return;\n\
  var hasCheck = !! Notifications.checkPermission;\n\
  if (hasCheck && Notifications.checkPermission()) return;\n\
  \n\
  Notifications.createNotification('/favicon.ico', title, text).show();\n\
}\n\
\n\
/**\n\
 * Enable browser notifications.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function enableNotifications(fn) {\n\
  Notifications.requestPermission(function(perm) {\n\
    if (perm == 'granted') fn();\n\
    else fn(new Error('denied'));\n\
  });\n\
}\n\
//@ sourceURL=timer/index.js"
));
require.register("timer/template.js", Function("exports, require, module",
"module.exports = '<div class=\"timer\">\\n\
  <button>Enable notifications</button>\\n\
</div>';//@ sourceURL=timer/template.js"
));
require.register("timer/beep.js", Function("exports, require, module",
"var ctx = require('audio-context');\n\
\n\
/**\n\
 * Beep!\n\
 *\n\
 * @api private\n\
 */\n\
\n\
module.exports = function beep() {\n\
  if (!ctx || !ctx.createOscillator) return;\n\
  var osc = ctx.createOscillator();\n\
  osc.connect(ctx.destination);\n\
  osc.frequency.value = 440;\n\
  osc.start(ctx.currentTime);\n\
  osc.stop(ctx.currentTime + 1);\n\
};\n\
//@ sourceURL=timer/beep.js"
));
require.register("home/index.js", Function("exports, require, module",
"var template = require('./template');\n\
var domify = require('domify');\n\
var page = require('page');\n\
\n\
module.exports = function() {\n\
  var el = domify(template);\n\
  var form = el.querySelector('form');\n\
  var input = form.querySelector('input');\n\
  \n\
  form.addEventListener('submit', function(e) {\n\
    page('/' + input.value);\n\
    e.preventDefault();\n\
  });\n\
  \n\
  return el;\n\
};\n\
//@ sourceURL=home/index.js"
));
require.register("home/template.js", Function("exports, require, module",
"module.exports = '<div id=\"home\">\\n\
  <form><input type=\"text\"></form>\\n\
</div>';//@ sourceURL=home/template.js"
));
require.register("boot/index.js", Function("exports, require, module",
"var page = require('page');\n\
var Home = require('home');\n\
var Timer = require('timer');\n\
\n\
// State\n\
\n\
var timer;\n\
\n\
/**\n\
 * Reset.\n\
 */\n\
\n\
page(function(ctx, next) {\n\
  if (timer) timer.abort();\n\
  document.body.innerHTML = '';\n\
  next();\n\
});\n\
\n\
/**\n\
 * Timer page.\n\
 */\n\
\n\
page('/:duration', function(ctx) {\n\
  timer = new Timer(ctx.params.duration);\n\
  document.body.appendChild(timer.el);\n\
  analytics.page('Timer', {\n\
    duration: ctx.params.duration\n\
  });\n\
});\n\
\n\
/**\n\
 * Home page.\n\
 */\n\
\n\
page(function() {\n\
  document.body.appendChild(Home());\n\
  analytics.page('Home');\n\
});\n\
\n\
// GO!\n\
\n\
page();\n\
//@ sourceURL=boot/index.js"
));
































require.alias("boot/index.js", "alrt.io/deps/boot/index.js");
require.alias("boot/index.js", "boot/index.js");
require.alias("visionmedia-page.js/index.js", "boot/deps/page/index.js");

require.alias("timer/index.js", "boot/deps/timer/index.js");
require.alias("timer/template.js", "boot/deps/timer/template.js");
require.alias("timer/beep.js", "boot/deps/timer/beep.js");
require.alias("component-bind/index.js", "timer/deps/bind/index.js");

require.alias("component-piecon/index.js", "timer/deps/piecon/index.js");
require.alias("component-style/index.js", "component-piecon/deps/style/index.js");

require.alias("component-inherit/index.js", "component-piecon/deps/inherit/index.js");

require.alias("component-pie/index.js", "component-piecon/deps/pie/index.js");
require.alias("component-style/index.js", "component-pie/deps/style/index.js");

require.alias("component-favicon/index.js", "component-piecon/deps/favicon/index.js");

require.alias("component-autoscale-canvas/index.js", "component-piecon/deps/autoscale-canvas/index.js");

require.alias("component-domify/index.js", "timer/deps/domify/index.js");

require.alias("matthewp-text/index.js", "timer/deps/text/index.js");

require.alias("juliangruber-audio-context/index.js", "timer/deps/audio-context/index.js");
require.alias("juliangruber-audio-context/index.js", "timer/deps/audio-context/index.js");
require.alias("juliangruber-audio-context/index.js", "juliangruber-audio-context/index.js");
require.alias("godmodelabs-span/index.js", "timer/deps/span/index.js");

require.alias("component-favicon/index.js", "timer/deps/favicon/index.js");

require.alias("component-raf/index.js", "timer/deps/raf/index.js");

require.alias("time-view/index.js", "timer/deps/time-view/index.js");
require.alias("component-progress/index.js", "time-view/deps/progress/index.js");
require.alias("component-autoscale-canvas/index.js", "component-progress/deps/autoscale-canvas/index.js");

require.alias("component-bind/index.js", "time-view/deps/bind/index.js");

require.alias("component-css/index.js", "time-view/deps/css/index.js");

require.alias("component-debounce/index.js", "time-view/deps/debounce/index.js");
require.alias("component-debounce/index.js", "time-view/deps/debounce/index.js");
require.alias("component-debounce/index.js", "component-debounce/index.js");
require.alias("godmodelabs-span/index.js", "time-view/deps/span/index.js");

require.alias("home/index.js", "boot/deps/home/index.js");
require.alias("home/template.js", "boot/deps/home/template.js");
require.alias("component-domify/index.js", "home/deps/domify/index.js");

require.alias("visionmedia-page.js/index.js", "home/deps/page/index.js");
