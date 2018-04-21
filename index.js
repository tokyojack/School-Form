//============================= Packages =============================

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
var flash = require('express-flash');
var session = require('express-session');

//============================= Letting express use them =============================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(flash());

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//============================= Pool =============================

var config = require('./config/config');
var mysql = require("mysql");
var pool = mysql.createPool(config.db);

require('require-sql');

//============================= Routes =============================


var homeRoutes = require("./routes/indexRoutes")(pool);
app.use("/", homeRoutes);

var formsRoutes = require("./routes/formsRoutes")(pool);
app.use("/forms", formsRoutes);

var miscRoutes = require("./routes/miscRoutes")();
app.use("*", miscRoutes);

//============================= Starting Server =============================

app.listen(8080, function() {
    console.log("Server running");
});

//============================= Ending Server =============================

require('./utils/nodeEnding').nodeEndingCode(nodeEndInstance);
function nodeEndInstance() {
    console.log("The pool has been closed.");
    pool.end();
}