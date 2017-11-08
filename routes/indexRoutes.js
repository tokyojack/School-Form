var router = require("express").Router();
var swearjar = require('swearjar');

var config = require('../config');
var sightengine = require('sightengine')(config.sightEngine.apiUser, config.sightEngine.apiSecret);

var inventoryName = config.tableName;
var flashUtils = require('../utils/flashUtils');
var utils = require('../utils/utils');

var redirectLocation = "/";

module.exports = function(pool) {

    router.get("/", function(req, res) {
        res.render("index.ejs");
    });

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
            
            if (utils.clearNonLetters(req.body.imageUrl).length >= 1 ) {
                if (result.status === 'failure') {
                    flashUtils.errorMessage(req, res, redirectLocation, 'An error occurred with that image.');
                    return;
                }
                
                var weaponPercent = result.weapon;
                var alchoholPercent = result.alcohol;
                var drugsPercent = result.drugs;
                var safePercent = result.nudity.safe;

                if (weaponPercent > 0.2) {
                    flashUtils.errorMessage(req, res, redirectLocation, 'You\'re not allowed to show weapons');
                    return;
                }

                if (alchoholPercent > 0.2) {
                    flashUtils.errorMessage(req, res, redirectLocation, 'You\'re not allowed to show alchohol');
                    return;
                }

                if (drugsPercent > 0.2) {
                    flashUtils.errorMessage(req, res, redirectLocation, 'You\'re not allowed to show drugs');
                    return;
                }

                if (safePercent < 0.2) {
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

            pool.getConnection(function(err, conn) {
                if (flashUtils.isDatabaseError(req, res, redirectLocation, err)) {
                    conn.release();
                    return;
                }

                var insertQuery = "INSERT INTO " + inventoryName + " SET ?";
                conn.query(insertQuery, item, function(err, results) {
                    conn.release();
                    
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
