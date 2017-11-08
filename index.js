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

var config = require('./config');
var mysql = require("mysql");
var pool = mysql.createPool(config.db);

//============================= Routes =============================

var homeRoutes = require("./routes/indexRoutes")(pool);
var formsRoutes = require("./routes/formsRoutes")(pool);
var miscRoutes = require("./routes/miscRoutes")();

app.use("/", homeRoutes);
app.use("/forms", formsRoutes);
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