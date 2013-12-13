var intervals = {
 WEEK: 604800000,
 DAY: 86400000,
 HOUR: 3600000,
 MINUTE: 60000,
 SECOND: 1000
};

var intervalMap = {
  w : 'WEEK',
  d : 'DAY',
  h : 'HOUR',
  m : 'MINUTE',
  s : 'SECOND'
};

exports.index = function(req, res) {
  var date = parseDate(req.params.time);
  res.render('index', {
    title: 'Alrt',
    duration: getMiliseconds(date),
    largest: getLargest(date)
  });
};

exports.help = function(req, res) {
  res.render('help', {
    title: 'Alrt'
  });
};

function getLargest(date) {
  for (var abbr in intervalMap) {
    if (date[abbr]) {
      return intervals[intervalMap[abbr]];
    }
  }
  return 0;
}

function getMiliseconds(date) {
  var ms = 0;
  for (var abbr in intervalMap) {
    if (date[abbr]) {
      ms += date[abbr] * intervals[intervalMap[abbr]];
    }
  }
  return ms;
}

function parseDate(str) {
  return ~str.search(':')
    ? parseAbsolute(str)
    : parseRelative(str);
}

function parseRelative(str) {
  var str = str
    .replace(/ /g, '')
    .replace(/^in/, '')
    .replace(/weeks?|wochen?/i, 'w')
    .replace(/days?|tage?/i, 'd')
    .replace(/hours?|stunden?|std/i, 'h')
    .replace(/min[a-z]*/i, 'm')
    .replace(/se(c|k)[a-z]*/i, 's')

  var duration = 0;
  var date = {};
  var numBuffer = [];

  for (var i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) < 97) {
      numBuffer.push(str[i]);
    } else {
      date[str[i]] = parseInt(numBuffer.join(''), 10);
      numBuffer = [];
    }
  }

  return date;
}

function parseAbsolute(str) {
  var dt = Number(new Date(str)) - Date.now();
  var parsed = {};

  for (var abbr in intervalMap) {
    var length = intervals[intervalMap[abbr]];
    parsed[abbr] = dt >= length
      ? Math.floor(dt / length)
      : 0;
    dt -= parsed[abbr] * length;
  }

  return parsed;
}
