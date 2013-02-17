

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

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
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
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
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
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
  if (!has.call(require.modules, from)) {
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
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-css/index.js", function(exports, require, module){

/**
 * Properties to ignore appending "px".
 */

var ignore = {
  columnCount: true,
  fillOpacity: true,
  fontWeight: true,
  lineHeight: true,
  opacity: true,
  orphans: true,
  widows: true,
  zIndex: true,
  zoom: true
};

/**
 * Set `el` css values.
 *
 * @param {Element} el
 * @param {Object} obj
 * @return {Element}
 * @api public
 */

module.exports = function(el, obj){
  for (var key in obj) {
    var val = obj[key];
    if ('number' == typeof val && !ignore[key]) val += 'px';
    el.style[key] = val;
  }
  return el;
};

});
require.register("juliangruber-supersize/index.js", function(exports, require, module){
var css = require('css');

module.exports = supersize;

function supersize (el, max) {
  max = max || 0.66;
  
  css(el, {
    position : 'absolute',
    left : '50%',
    top : '50%',
    whiteSpace : 'nowrap',
    display : 'inline',
    lineHeight : 1
  });
  
  var parentRect = el.parentNode.getClientRects()[0];
  var maxWidth = parentRect.width * max;
  var maxHeight = parentRect.height * max;
  
  var rect = el.getClientRects()[0];
  var retriesLeft = 1000;
  
  var size = parseInt(el.style.fontSize, 10);
  if (isNaN(size)) size = 12;
  
  while(true) {
    if (!--retriesLeft) break;
    
    if (isInside()) {
      setSize(++size);     
      if (!isInside()) {
        setSize(--size);
        break;
      }
    } else {
      setSize(--size);
      if (isInside()) break;
    }
  }
  
  css(el, {
    marginTop : -0.5 * rect.height,
    marginLeft : -0.5 * rect.width
  });
    
  function setSize (size) {
    css(el, { fontSize : size + 'px' });
    rect = el.getClientRects()[0];
  }
  
  function isInside () {
    return rect.width <= maxWidth && rect.height <= maxHeight;
  }
  
  return function () {
    supersize(el, max);
  };
}
});
require.register("juliangruber-intervals/index.js", function(exports, require, module){
module.exports = {
  week: 604800000,
  day: 86400000,
  hour: 3600000,
  minute: 60000,
  second: 1000
};
});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-style/index.js", function(exports, require, module){

/**
 * Expose `style`.
 */

module.exports = style;

/**
 * Return the style for `prop` using the given `selector`.
 *
 * @param {String} selector
 * @param {String} prop
 * @return {String}
 * @api public
 */

function style(selector, prop) {
  var cache = style.cache = style.cache || {}
    , cid = selector + ':' + prop;

  if (cache[cid]) return cache[cid];

  var parts = selector.split(/ +/)
    , len = parts.length
    , parent = document.createElement('div')
    , root = parent
    , child
    , part;

  for (var i = 0; i < len; ++i) {
    part = parts[i];
    child = document.createElement('div');
    parent.appendChild(child);
    parent = child;
    if ('#' == part[0]) {
      child.setAttribute('id', part.substr(1));
    } else if ('.' == part[0]) {
      child.setAttribute('class', part.substr(1));
    }
  }

  document.body.appendChild(root);
  var ret = getComputedStyle(child)[prop];
  document.body.removeChild(root);
  return cache[cid] = ret;
}
});
require.register("component-inherit/index.js", function(exports, require, module){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
});
require.register("component-pie/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var style = require('style');

/**
 * Expose `Pie()`.
 */

module.exports = Pie;

/**
 * Initialize a new `Pie` with
 * an optional css `selector`,
 * defaulting to ".pie".
 *
 * @param {String} selector
 * @api public
 */

function Pie(selector) {
  if (!(this instanceof Pie)) return new Pie(selector);
  selector = selector || '.pie';
  this.background = style(selector, 'background-color');
  this.borderWidth = parseInt(style(selector, 'border-width'), 10);
  this.borderColor = style(selector, 'border-color');
  this.color = style(selector, 'color');
  this.size(16);
}

/**
 * Update percentage to `n`.
 *
 * @param {Number} n
 * @return {Pie}
 * @api public
 */

Pie.prototype.update = function(n){
  this.percent = n;
  return this;
};

/**
 * Set size to `n`.
 *
 * @param {Number} n
 * @return {Pie}
 * @api public
 */

Pie.prototype.size = function(n){
  this._size = n;
  return this;
};

/**
 * Draw on to `ctx`.
 *
 * @param {CanvasContext2d} ctx
 * @return {Pie}
 * @api public
 */

Pie.prototype.draw = function(ctx){
  var size = this._size;
  var half = size / 2;
  var n = this.percent / 100;
  var pi = Math.PI * 2;

  // clear
  ctx.clearRect(0, 0, size, size);

  // border
  ctx.beginPath();
  ctx.moveTo(half, half);
  ctx.arc(half, half, half, 0, pi, false);
  ctx.fillStyle = this.borderColor;
  ctx.fill();

  // background
  ctx.beginPath();
  ctx.moveTo(half, half);
  ctx.arc(half, half, half - this.borderWidth, 0, pi, false);
  ctx.fillStyle = this.background;
  ctx.fill();

  // pie
  ctx.beginPath();
  ctx.moveTo(half, half);
  ctx.arc(half, half, half - this.borderWidth, 0, pi * n, false);
  ctx.fillStyle = this.color;
  ctx.fill();

  return this;
};

});
require.register("component-favicon/index.js", function(exports, require, module){

/**
 * Original favicon.
 */

var orig;

/**
 * Expose `set()`.
 */

exports = module.exports = set;

/**
 * Expose `reset()`.
 */

exports.reset = reset;

/**
 * Expose `current()`.
 */

exports.current = current;

/**
 * Set the favicon to the given data uri `str`.
 *
 * @param {String} str
 * @api public
 */

function set(str) {
  if ('string' != typeof str) throw new TypeError('data uri string expected');
  var prev = remove();
  if (!orig) orig = prev;
  var link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  link.href = str;
  head().appendChild(link);
}

/**
 * Reset to the original favicon.
 *
 * @api public
 */

function reset() {
  remove();
  if (orig) head().appendChild(orig);
}

/**
 * Return current favicon link with rel=icon.
 *
 * @return {Element}
 * @api private
 */

function current() {
  var rel;
  var links = document.getElementsByTagName('link');
  for (var i = 0; i < links.length; ++i) {
    rel = links[i].getAttribute('rel') || '';
    if (rel.match(/\bicon\b/)) {
      return links[i];
    }
  }
}

/**
 * Remove current favicon link with rel=icon.
 *
 * @return {Element}
 * @api private
 */

function remove() {
  var link = current();
  if (!link) return;
  head().removeChild(link);
  return link;
}

/**
 * Return the head element.
 *
 * @return {Element}
 * @api private
 */

function head() {
  return document.getElementsByTagName('head')[0];
}
});
require.register("component-autoscale-canvas/index.js", function(exports, require, module){

/**
 * Retina-enable the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Canvas}
 * @api public
 */

module.exports = function(canvas){
  var ctx = canvas.getContext('2d');
  var ratio = window.devicePixelRatio || 1;
  if (1 != ratio) {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx.scale(ratio, ratio);
  }
  return canvas;
};
});
require.register("component-piecon/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var style = require('style')
  , inherit = require('inherit')
  , favicon = require('favicon')
  , autoscale = require('autoscale-canvas')
  , Pie = require('pie');

/**
 * Expose `Piecon()`.
 */

module.exports = Piecon;

/**
 * Initialize a new `Piecon` with
 * an optional css `selector`,
 * defaulting to ".pie".
 *
 * @param {String} selector
 * @api public
 */

function Piecon(selector) {
  if (!(this instanceof Piecon)) return new Piecon(selector);
  this.el = document.createElement('canvas');
  this.ctx = this.el.getContext('2d');
  Pie.call(this, selector);
}

/**
 * Inherits from `Pie.prototype`.
 */

inherit(Piecon, Pie);

/**
 * Set size to `n`.
 *
 * @param {Number} n
 * @return {Piecon}
 * @api public
 */

Piecon.prototype.size = function(n){
  this._size = n;
  this.el.width = n;
  this.el.height = n;
  autoscale(this.el);
  return this;
};

/**
 * Update percentage to `n`.
 *
 * @param {Number} n
 * @return {Piecon}
 * @api public
 */

Piecon.prototype.update = function(n){
  this.percent = n;
  this.draw(this.ctx);
  favicon(this.el.toDataURL());
  return this;
};

});
require.register("alrt/index.js", function(exports, require, module){
/**
 * module dependencies
 */

var supersize = require('supersize');
var intervals = require('intervals');
var events = require('event');
var Piecon = require('piecon');

/**
 * time display
 */

var el = document.getElementById('time');
var scale = supersize(el, 0.85);
events.bind(window, 'resize', scale);

/**
 * variables exposed from express
 */

var duration = window.duration;
var largest = window.largest;

/**
 * notifications api
 */
 
var notifications;
if ('webkitNotifications' in window) {
  notifications = window.webkitNotifications;
} else if ('mozNotification' in navigator) {
  notifications = navigator.mozNotification;
  notifications.checkPermission = function () { return false };
}

/**
 * enable notifications button
 */

var button = document.getElementById('enable');
if (notifications && notifications.checkPermission()) {
  button.style['display'] = 'block';
}
events.bind(document.getElementById('enable'), 'click', function(e) {
  window.webkitNotifications.requestPermission(function() {
    button.style.display = 'none';
  });
});

/**
 * tick
 */

var start = +new Date();
var timeLeft = duration;
var scaled = false;
var piecon = window.piecon = new Piecon();

function tick () {
  displayTime(formatDate(timeLeft));
  if (!scaled) scale();
  scaled = true;
  
  piecon.update((1 - timeLeft / duration) * 100);
  
  if (timeLeft == 0) return notify();
  
  timeLeft = start + duration - +new Date();
  if (timeLeft < 0) timeLeft = 0;
  
  setTimeout(tick, 1000);
}

tick();

/**
 * notification functions
 */

function notify() { notifyWindow() || notifyTitle(); }

function notifyWindow() {
  if (!notifications || notifications.checkPermission()) return false;
  
  notifications.createNotification(
    'favicon.ico',
    'Alert',
    'Timer finished (after '+formatDate(duration).replace(/&nbsp;/g, '')+')'
  ).show();
  return true;
}

function notifyTitle() {
  var i = 0;
  setTimeout(title, 500);
  function title() {
    i++;
    document.title = 'Alert: over';
    document.title += (i%2)? ' !1!1!1!1' : ' 1!1!1!1!';
    document.title += (i%2)? '!1!1!1!1' : '1!1!1!1!';
    document.title += (i%2)? '!1!1!1!1' : '1!1!1!1!';
    setTimeout(title, 500);
  };
}

/**
 * helper functions
 */

function displayTime (date) {
  el.innerHTML = date;
  document.title = 'Alert: ' +
    date.replace(/&nbsp;/g,' ').replace(/<span>|<\/span>/g, '');
}

function formatDate(ms) {
  var output = [];
  var buf;
  var formatted;
  for (i in intervals) {
    if (ms>=intervals[i] || intervals[i]<=duration) {
      buf = Math.floor(ms/intervals[i]);
      formatted = pad(''+buf) + i.substr(0,1);
      if (ms < intervals[i] && duration-ms < intervals[i]) {
        formatted = '<span>'+formatted+'</span>';
      }
      output.push(formatted);
      ms -= buf*intervals[i];
    }
  }

  return output.join('&nbsp;');
}

function pad(str, len) {
  len = len || 2;
  while (str.length < len) {
    str = '&nbsp;'+str;
  }
  return str;
}
});
require.alias("juliangruber-supersize/index.js", "alrt/deps/supersize/index.js");
require.alias("component-css/index.js", "juliangruber-supersize/deps/css/index.js");

require.alias("juliangruber-intervals/index.js", "alrt/deps/intervals/index.js");

require.alias("component-event/index.js", "alrt/deps/event/index.js");

require.alias("component-piecon/index.js", "alrt/deps/piecon/index.js");
require.alias("component-style/index.js", "component-piecon/deps/style/index.js");

require.alias("component-inherit/index.js", "component-piecon/deps/inherit/index.js");

require.alias("component-pie/index.js", "component-piecon/deps/pie/index.js");
require.alias("component-style/index.js", "component-pie/deps/style/index.js");

require.alias("component-favicon/index.js", "component-piecon/deps/favicon/index.js");

require.alias("component-autoscale-canvas/index.js", "component-piecon/deps/autoscale-canvas/index.js");

