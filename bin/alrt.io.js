var app = require('..');
var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log('listening on port %s', port);
});