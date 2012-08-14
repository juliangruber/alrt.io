window.onload = function() {
  var SECOND = 1000;
  var MINUTE = 60000;
  var HOUR = 3600000;

  (function tick() {
    document.getElementById('time').innerHTML = formatDate(toGo);
    toGo -= 100;
    window.setTimeout(tick, 100);
  })();

  function formatDate(ms) {
    var output = [];
    if (ms>=HOUR) {
      var hours = Math.floor(ms/HOUR);
      output.push(hours+'h');
      ms -= hours*HOUR;
    }
    if (ms>=MINUTE) {
      var minutes = Math.floor(ms/MINUTE);
      output.push(minutes+'m');
      ms -= minutes*MINUTE;
    }
    var seconds = Math.floor(ms/SECOND);
    output.push(seconds+'s');

    return output.join(' ');
  }
}