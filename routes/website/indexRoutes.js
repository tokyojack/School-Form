var router = require("express").Router();
var swearjar = require('swearjar');

var config = require('../config');
var sightengine = require('sightengine')(config.sightEngine.apiUser, config.sightEngine.apiSecret);

var inventoryName = config.tableName;
var flashUtils = require('../utils/flashUtils');
var utils = require('../utils/utils');

var redirectLocation = "/";

// URL: "/"
module.exports = function(pool) {

    // "index.ejs" page
    router.get("/", (req, res) => res.render("index.ejs"));

    // Submitting the form
    router.post("/", function(req, res) {
        if (swearjar.profane(req.body.name) || swearjar.profane(utils.clearNonLetters(req.body.name))) {
            flashUtils.errorMessage(req, res, redirectLocation, 'That can\'t write profanity in the name');
            return;
        }

        if (swearjar.profane(req.body.content) || swearjar.profane(utils.clearNonLetters(req.body.content))) {
            flashUtils.errorMessage(req, res, redirectLocation, 'That can\'t write profanity in the content');
            return;
        }

        sightengine.check(['nudity', 'wad']).set_url(req.body.imageUrl).then(function(result) {
            
            // Removes symbols, spaces, etc.
            if (utils.clearNonLetters(req.body.imageUrl).length >= 1 ) {
                if (result.status === 'failure') {
                    flashUtils.errorMessage(req, res, redirectLocation, 'An error occurred with that image.');
                    return;
                }
                
                if (result.weapon > 0.2) {
                    flashUtils.errorMessage(req, res, redirectLocation, 'You\'re not allowed to show weapons');
                    return;
                }

                if (result.alcohol > 0.2) {
                    flashUtils.errorMessage(req, res, redirectLocation, 'You\'re not allowed to show alchohol');
                    return;
                }

                if (result.drugs > 0.2) {
                    flashUtils.errorMessage(req, res, redirectLocation, 'You\'re not allowed to show drugs');
                    return;
                }

                if (result.nudity.safe < 0.2) {
                    flashUtils.errorMessage(req, res, redirectLocation, 'You\'re not allowed that amount of nudity');
                    return;
                }
            }

            var item = {
                name: req.body.name,
                location: req.body.location,
                content: req.body.content,
                pictureURL: req.body.imageUrl
            };

            pool.getConnection(function(err, connection) {
                if (flashUtils.isDatabaseError(req, res, redirectLocation, err)) {
                    connection.release();
                    return;
                }
                var insertForm = require("./queries/insertForm.sql");

                connection.query(insertForm, [item], function(err, results) {
                    connection.release();
                    
                    if (flashUtils.isDatabaseError(req, res, redirectLocation, err))
                        return;
                        
                    flashUtils.successMessage(req, res, redirectLocation, 'Your form has been submitted!');
                });
            });
        }).catch(function(err) {
            if (flashUtils.isUnknownError(req, res, redirectLocation, err))
                return;
        });
    });

    return router;
};
