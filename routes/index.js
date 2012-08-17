
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
   .replace(/ /g, '')
   .replace(/weeks|week/, 'w')
   .replace(/days|day/, 'd')
   .replace(/hours|hour/, 'h')
   .replace(/minutes|minute|mins|min/, 'm')
   .replace(/seconds|seconds|secs|sec/, 's')

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