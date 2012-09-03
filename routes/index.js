
/*
 * GET home page.
 */

var intervals = {
 WEEK: 604800000,
 DAY: 86400000,
 HOUR: 3600000,
 MINUTE: 60000,
 SECOND: 1000
}

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
  })
}

function getLargest(date) {
  for (type in date) {
    if (type == 'w') return intervals.WEEK;
    if (type == 'd') return intervals.DAY;
    if (type == 'h') return intervals.HOUR;
    if (type == 'm') return intervals.MINUTE;
    if (type == 's') return intervals.SECOND;
  } 
}

function getMiliseconds(date) {
 var ms = 0;
 for (type in date) {
   if (type == 's') ms += date[type] * intervals.SECOND;
   if (type == 'm') ms += date[type] * intervals.MINUTE;
   if (type == 'h') ms += date[type] * intervals.HOUR;
   if (type == 'd') ms += date[type] * intervals.DAY;
   if (type == 'w') ms += date[type] * intervals.WEEK;
 }
 return ms;
}

function parseDate(str) {
  var str = str
    .replace(/ /g, '');
  
  if (str.search('in') > -1) return parseRelative(str);
  if (str.search(':') > -1) return parseAbsolute(str);
  return parseRelative(str);
}

function parseRelative(str) {
  var str = str
   .replace(/in/, '')
   .replace(/weeks|week|wochen|wochen/, 'w')
   .replace(/days|day|tage|tag/, 'd')
   .replace(/hours|hour|stunden|stunde/, 'h')
   .replace(/minutes|minute|mins|min|minuten/, 'm')
   .replace(/seconds|seconds|secs|sec|sekunden|sekunde/, 's')

  var duration = 0;
  var date = {};
  var numBuffer = [];
  for (var i = 0; i < str.length; i++) {
   if (str.charCodeAt(i) < 97) {
     numBuffer.push(str[i]);
   } else {
     date[str[i]] = parseInt(numBuffer.join(''), 10);
     numBuffer = [];
   };
  }
  return date;
}

function parseAbsolute(str) {
  console.log(str)
  // 12:13
  var sep;
  if (str.search(':') > -1) sep = ':';
  //if (str.search('|') > -1) sep = '|';
  var segs = str.split(sep);
  return {
    h: segs[0],
    m: segs[1],
    s: segs.length > 2? segs[2] : null
  }
}