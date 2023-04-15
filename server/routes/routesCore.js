const mysql = require('mysql')
const config = require('../config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect((err) => err && console.log(err));

const DEFAULT_RADIUS = 20

function getTableName(restaurantType) {
    const michelinStarQuery = `(SELECT name, latitude, longitude, zipcode, 'MichelinStar' AS type FROM MichelinStarRestaurants)`
    const fastFoodQuery = `(SELECT name, latitude, longitude, zipcode, 'FastFood' AS type FROM FastFoodRestaurants)`
    if (restaurantType === 'michelin-star') {
        return michelinStarQuery
    } else if (restaurantType == 'fast-food') {
        return fastFoodQuery
    } else if (restaurantType == 'all') {
        return `(${michelinStarQuery} UNION ${fastFoodQuery})`
    }

    return null
}

module.exports = {
    connection,
    DEFAULT_RADIUS,
    getTableName
}