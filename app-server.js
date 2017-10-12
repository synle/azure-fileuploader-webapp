console.log('bootstrap the app');

var app = require('./app');
var port = process.env.PORT || 3000;

console.log('app on port ', port)

app.listen(port);
