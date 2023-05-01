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
    const michelinStarQuery = `(SELECT name, latitude, longitude, 'MichelinStar' AS type FROM MichelinStarRestaurants)`
    const fastFoodQuery = `(SELECT R.name, latitude, longitude, 'FastFood' AS type FROM Restaurants R JOIN FastFoodRestaurantNames N ON R.name = N.name)`
    if (restaurantType === 'michelin-star') {
        return michelinStarQuery
    } else if (restaurantType == 'fast-food') {
        return fastFoodQuery
    } else if (restaurantType == 'all') {
        return `(SELECT name, latitude, longitude, 'Restaurant' AS type FROM Restaurants)`
    }

    return null
}

function testParamsError(zipcode, radius) {
    if (!zipcode) {
        return 'Zipcode query parameter required'
    }

    if (!Number(radius) || Number(radius) < 0) {
        return `${radius} is not a valid radius. Radius parameter must be an integer greater than 0.`
    }

    if (!Number(zipcode)) {
        return `${zipcode} is not a valid zipcode. Zipcode parameter must be an integer.`
    }
    return null
}

const createTemporaryTable = function () {
    return new Promise((resolve, reject) => {
        connection.query(`
        CREATE TEMPORARY TABLE IF NOT EXISTS FastFoodRestaurantNames (
            PRIMARY KEY (name)
        )
        SELECT DISTINCT name
        FROM FastFoodRestaurants;`, (err) => {
            if (err) {
                reject(err)
            }
            resolve()
        })
    })
}
module.exports = {
    connection,
    DEFAULT_RADIUS,
    getTableName,
    testParamsError,
    createTemporaryTable
}