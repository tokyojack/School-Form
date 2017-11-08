var router = require("express").Router();

var inventoryName = require('../config').tableName;
var flashUtils = require('../utils/flashUtils');

var redirectLocation = "/forms/1";

module.exports = function(pool) {

    router.get("/", function(req, res) {
        res.redirect(redirectLocation);
    });

    router.get("/:pageNumber", function(req, res) {
        pool.getConnection(function(err, conn) {
            if (flashUtils.isDatabaseError(req, res, redirectLocation, err)) {
                conn.release();
                return;
            }

            var q = "SELECT *  FROM " + inventoryName + " AS froms ORDER BY created_at DESC";
            conn.query(q, function(err, results) {
                conn.release();
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

    router.get("/:pageNumber/delete/:id", function(req, res) {
        pool.getConnection(function(err, conn) {
            if (flashUtils.isDatabaseError(req, res, redirectLocation, err)) {
                conn.release();
                return;
            }

            var q = "DELETE FROM " + inventoryName + " WHERE id=?";
            conn.query(q, req.params.id, function(err, results) {
                conn.release();
                if (flashUtils.isDatabaseError(req, res, redirectLocation, err))
                    return;

                res.redirect("/forms/" + req.params.pageNumber);
            });
        });
    });
    
    return router;
};
