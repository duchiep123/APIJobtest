var app = require('../app/app'); //Here you get to require the app and put it in a variable. This app is the actual app object you created in app.js
var port = process.env.PORT || 3000;
var path = require('path')

app.get('/', (req, res) => {
    var p = process.cwd() + "/uploads/index.html";
    res.sendFile(path.join(p));
})
var server = app.listen(port, function() {
    console.log('Express server is running on port ' + port);
});