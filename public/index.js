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