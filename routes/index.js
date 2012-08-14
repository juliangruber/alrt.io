
/*
 * GET home page.
 */

var SECOND = 1000;
var MINUTE = SECOND*60;
var HOUR = MINUTE*60;
var DAY = HOUR*24;
var WEEK = DAY*7;

exports.index = function(req, res) {
  res.render('index', {
    title: 'Alrt',
    duration: getMiliseconds(parseDate(req.params.time))
  });
};

function getMiliseconds(date) {
 var ms = 0;
 for (type in date) {
   if (type == 's') ms += date[type] * SECOND;
   if (type == 'm') ms += date[type] * MINUTE;
   if (type == 'h') ms += date[type] * HOUR;
   if (type == 'd') ms += date[type] * DAY;
   if (type == 'w') ms += date[type] * WEEK;
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