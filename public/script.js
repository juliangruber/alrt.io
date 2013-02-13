;(function update() {
  var intervals = {
    WEEK: 604800000,
    DAY: 86400000,
    HOUR: 3600000,
    MINUTE: 60000,
    SECOND: 1000
  }
  
  var notifications;
  if ('webkitNotifications' in window) notifications = window.webkitNotifications;
  if ('mozNotification' in navigator) {
    notifications = navigator.mozNotification;
    notifications.checkPermission = function () { return false };
  }
  
  // DOM elements
  var body = document.childNodes[1];
  var el = document.getElementById('time');
  
  // Get variables from express
  var start = window.duration;
  var timeLeft = parseInt(start, 10);
  var largest = window.largest;
  
  var len;
  (function tick() {
    if (timeLeft <= 0) timeLeft = 0;
    var date = formatDate(timeLeft);
    el.innerHTML = date;
    document.title = 'Alert: '+date.replace(/&nbsp;/g,' ').replace(/<span>|<\/span>/g, '');
    if (len != date.length) scale();
    len = date.length;
    if (timeLeft == 0) return notify();
    timeLeft -= 1000;
    window.setTimeout(tick, 1000);
  })();
  
  window.onresize = scale;
  
  window.onload = function() {
    scale();
    if (notifications && notifications.checkPermission()) {
      document.getElementById('enable').style.display = 'block';
    }
    document.getElementById('enable').onclick = function(e) {
      window.webkitNotifications.requestPermission(function() {
        document.getElementById('enable').style.display = 'none';
      });
    }
    if (navigator.mozApps) {
      var el = document.createElement('button')
      el.innerHTML = 'install'
      el.addEventListener('click', navigator.mozApps.install.bind(
        navigator.mozApps,
        location.href.substring(0, location.href.lastIndexOf("/")) + '/manifest.webapp'
      ))
      document.body.appendChild(el)
    }
  }
  
  function notify() { notifyWindow() || notifyTitle(); }
  
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
  
  function notifyWindow() {
    if (!notifications) return false;
    if (notifications.checkPermission()) return false;
    notifications.createNotification(
      'favicon.ico',
      'Alert',
      'Timer finished (after '+formatDate(start).replace(/&nbsp;/g, '')+')'
    ).show();
    return true;
  }
  
  function formatDate(ms) {
    var output = [];
    var buf;
    var formatted;
    for (i in intervals) {
      if (ms>=intervals[i] || intervals[i]<=start) {
        buf = Math.floor(ms/intervals[i]);
        formatted = pad(''+buf) + i.substr(0,1).toLowerCase();
        if (ms < intervals[i] && start-ms < intervals[i]) {
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
  
  function scale() {
    var maxFactor = 0.85;
    var maxWidth = Math.floor(body.clientWidth)*maxFactor;
    var maxHeight = Math.floor(body.clientHeight)*maxFactor;
    
    var curSize = el.style.fontSize.substr(0, el.style.fontSize.length-2);
    if (curSize == '') curSize = 12;
    var curRect = el.getClientRects()[0];
    while(true) {
      if (curRect.width < maxWidth && curRect.height < maxHeight) {
        el.style.fontSize = ++curSize+'px';
        el.style.height = curSize+'px';
        curRect = el.getClientRects()[0];
        if (curRect.width >= maxWidth || curRect.height >= maxHeight) {
          el.style.fontSize = --curSize+'px';
          el.style.height = curSize+'px';
          return position();
        }
      } else {
        el.style.fontSize = --curSize+'px';
        el.style.height = curSize+'px';
        curRect = el.getClientRects()[0];
        if (curRect.width < maxWidth && curRect.height < maxHeight) {
          return position();
        }
      }
    }
  }
  
  function position() {
    el.style.marginTop = -(0.5*el.style.height.replace('px', ''))+'px';
    el.style.marginLeft = -(0.5*el.getClientRects()[0].width)+'px';
  }
  
})();