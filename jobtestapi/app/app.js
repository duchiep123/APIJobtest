var express = require('express');
var app = express();
var db = require('../db/mydb');
const cors = require('cors')
var UserController = require('../controllers/UserController');
app.use(cors())
app.use('/users', UserController);
module.exports = app;
//An app.js for configuring the application