var mysql = require('mysql');

var config = require('../config');
var connection = mysql.createConnection(config.db);

connection.query('CREATE TABLE `forms` ( \
 `id` int(11) NOT NULL AUTO_INCREMENT, \
 `name` varchar(255) NOT NULL, \
 `location` varchar(255) NOT NULL, \
 `content` text, \
 `pictureURL` varchar(255) NOT NULL, \
 `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \
 PRIMARY KEY (`id`) \
) ENGINE=InnoDB AUTO_INCREMENT=298 DEFAULT CHARSET=latin1 \
');

console.log('Success: Database Created!');

connection.end();
