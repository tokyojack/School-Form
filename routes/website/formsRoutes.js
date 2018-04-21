var router = require("express").Router();

var flashUtils = require('../utils/flashUtils');

var redirectLocation = "/forms/1";

// URL: "/forms"
module.exports = function(pool) {

    // "forms.ejs" page
    router.get("/", (req, res) => res.redirect("/forms/1"));

    // "forms.ejs" page
    router.get("/:pageNumber", function(req, res) {
        pool.getConnection(function(err, connection) {

            if (flashUtils.isDatabaseError(req, res, redirectLocation, err)) {
                connection.release();
                return;
            }
            
            var selectForms = require("./queries/selectForms.sql");

            connection.query(selectForms, function(err, results) {
                connection.release();

                if (flashUtils.isDatabaseError(req, res, redirectLocation, err))
                    return;

                var totalForms = results.length;
                var finals = [];
                
                for (var i = (parseInt(req.params.pageNumber) - 1) * 20; i < parseInt(req.params.pageNumber) * 20; i++) {
                    if (results[i] === undefined)
                        break;
                    finals.push(results[i]);
                }
                
                res.render("forms.ejs", { forms: finals, pageNumber: req.params.pageNumber, size: totalForms });
            });
        });
    });

    // Delete's the form
    router.get("/:pageNumber/delete/:id", function(req, res) {
        pool.getConnection(function(err, connection) {
            if (flashUtils.isDatabaseError(req, res, redirectLocation, err)) {
                connection.release();
                return;
            }

            var deleteForm = require("./queries/deleteForm.sql");
            
            connection.query(deleteForm, [req.params.id], function(err, results) {
                connection.release();
                if (flashUtils.isDatabaseError(req, res, redirectLocation, err))
                    return;

                res.redirect("/forms/" + req.params.pageNumber);
            });
        });
    });
    
    return router;
};
