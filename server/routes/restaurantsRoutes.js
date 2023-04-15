const {connection, DEFAULT_RADIUS, getTableName} = require('./routesCore')

// GET /restaurants
const allRestaurants = async function(req, res) {
  restaurants({ ...req, params: { ...req.params, type: 'all' }}, res)
}

// GET /restaurants/:type
const restaurants = async function(req, res) {
  const restaurantType = req.params.type
  const table = getTableName(restaurantType);
  if (!table) {
    res.status(400).send(`${restaurantType} is not a valid type. Type must be 'michelin-star', 'fast-food', or 'all'.`)
  }
  const radius = req.query.radius ?? DEFAULT_RADIUS
  const zipcode = req.query.zipcode

  if (!zipcode) {
    res.status(400).send('Zipcode query parameter required')
    return
  }

  if (!Number(radius) || Number(radius) < 0) {
    res.status(400).send(`${radius} is not a valid radius. Radius parameter must be an integer greater than 0.`)
    return
  }

  if (!Number(zipcode)) {
    res.status(400).send(`${zipcode} is not a valid zipcode. Zipcode parameter must be an integer.`)
    return
  }

  connection.query(`WITH InitialLocation AS (
    SELECT latitude AS initial_lat, longitude AS initial_lng
    FROM ZipCodeInfo
    WHERE zipcode =  ${zipcode}
  ),
  LiberalResults AS (
    SELECT *
    FROM ${table} AS RestaurantsTable
    WHERE (
      latitude BETWEEN
        (SELECT initial_lat FROM InitialLocation) - ${radius / 69}
        AND
        (SELECT initial_lat FROM InitialLocation) + ${radius / 69}
      AND longitude BETWEEN
        (SELECT initial_lng FROM InitialLocation) - ${radius / 52}
        AND
        (SELECT initial_lng FROM InitialLocation) + ${radius / 52}
    )
  )
  SELECT name, latitude, longitude, zipcode, type
  FROM LiberalResults
  WHERE (69 * DEGREES(
    ACOS(
      COS(RADIANS((SELECT initial_lat FROM InitialLocation))) *
      COS(RADIANS(latitude)) *
      COS(RADIANS(longitude) - RADIANS((SELECT initial_lng FROM InitialLocation))) +
    SIN(RADIANS((SELECT initial_lat FROM InitialLocation))) *
    SIN(RADIANS(latitude))
  ))) < ${radius};`, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

module.exports = {
  allRestaurants,
  restaurants
}