const { connection, getTableName, testParamsError, DEFAULT_RADIUS } = require('./routesCore')

// GET: /closest-restaurants/:type
// Return Schema: [{ distanceInMiles (float), name (string), latitude (float), longitude (float), zipcode (int) }]
const closestRestaurants = async function(req, res) {
  const restaurantType = req.params.type
  const table = getTableName(restaurantType)
  const radius = DEFAULT_RADIUS

  if (!table) {
    res.status(400).send(`${restaurantType} is not a valid type. Type must be 'michelin-star', 'fast-food', or 'all'.`)
    return
  }

  const zipcode = req.query.zipcode

  if (!zipcode || !Number(zipcode)) {
    res.status(400).send('Required query parameter zipcode must be an integer').
    return
  }

  connection.query(`  
  WITH InitialLocation AS (
    SELECT latitude AS initial_lat, longitude AS initial_long
    FROM ZipCodeInfo
    WHERE zipcode = ${zipcode}
  )
  SELECT (69 * DEGREES(ACOS(COS(RADIANS((SELECT initial_lat FROM InitialLocation))) 
  * COS(RADIANS(latitude)) * 
  COS(RADIANS(longitude) - RADIANS((SELECT initial_long FROM InitialLocation))) +
  SIN(RADIANS((SELECT initial_lat FROM InitialLocation))) * SIN(RADIANS(latitude)))))AS distanceInMiles,
  R.name, R.latitude, R.longitude, R.hours, R.num_stars
  FROM AllRestaurants R
  ORDER BY distanceInMiles ASC
  LIMIT 0, 5;
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

module.exports = {
  closestRestaurants
}