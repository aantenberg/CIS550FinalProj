const {connection, DEFAULT_RADIUS, getTableName, testParamsError} = require('./routesCore')

// GET /restaurants
// Return Schema: [{ name (string), latitude (float), longitude (float), zipcode (int), type (string) }] 
const allRestaurants = async function(req, res) {
  restaurants({ ...req, params: { ...req.params, type: 'all' }}, res)
}

// GET /restaurants/:type
// Return Schema: [{ name (string), latitude (float), longitude (float), zipcode (int), type (string) }] 
const restaurants = async function(req, res) {
  const restaurantType = req.params.type
  const table = getTableName(restaurantType);
  if (!table) {
    res.status(400).send(`${restaurantType} is not a valid type. Type must be 'michelin-star', 'fast-food', or 'all'.`)
    return
  }
  const radius = req.query.radius ?? DEFAULT_RADIUS
  const zipcode = req.query.zipcode

  const error = testParamsError(zipcode, radius)
    if (error) {
      res.status(400).send(error)
      return
    }

  connection.query(`WITH InitialLocation AS (
    SELECT latitude AS initial_lat, longitude AS initial_lng
    FROM ZipCodeInfo
    WHERE zipcode = ${zipcode}
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

// GET /restaurants/:type/by-state
// Return Schema: { state (string), countRestaurants (int) }
const restaurantsByState = async function(req, res) {
  const restaurantType = req.params.type
  const table = getTableName(restaurantType);

  const state = req.query.state
  if (!state) {
    res.status(400).send(`State query parameter required.`)
    return
  }
  if (!table) {
    res.status(400).send(`${restaurantType} is not a valid type. Type must be 'michelin-star', 'fast-food', or 'all'.`)
    return
  }

  connection.query(`
  WITH stateZipCodes AS (
    SELECT zipcode, state
    FROM ZipCodeInfo
    WHERE state = '${state}' )
    SELECT S.state, Count(*) AS countRestaurants
    FROM ${table} R JOIN stateZipCodes S ON R.zipcode = S.zipcode
    GROUP BY state;
  `, (err, data) => {
    if (err) {
      res.status(400).send(`Error in query evaluation: ${err}`);
    } else if (data.length === 0) {
      res.status(400).send('No data found.');
    } else {
      res.json(data[0]);
    }
  });
}

// GET /restaurants/:type/per-capita
// Return Schema: { restaurantsPerCapita (int) } 
const restaurantsPerCapita = async function(req, res) {

  const state = req.query.state
  if (!state) {
    res.status(400).send(`State query parameter required.`)
    return
  }

  // TODO: This returns a list of zipcodes and per capita of that zip code, but not total per capita for state
  // Figure out what we wanna do with that.

  connection.query(`
  WITH ZipCodesInState AS (
    SELECT *
    FROM ZipCodeInfo
    WHERE state = '${state}'
  )
  SELECT Z.zipcode AS zipcode, COUNT(*) / Z.numPeople AS restaurantsPerCapita
  FROM ZipCodesInState Z JOIN FastFoodRestaurants R ON Z.zipcode = R.zipcode
  GROUP BY Z.zipcode
  `, (err, data) => {
    if (err) {
      res.status(400).send(`Error in query evaluation: ${err}`);
    } else if (data.length === 0) {
      res.status(400).send('No data found.');
    } else {
      res.json(data);
    }
  });
}

module.exports = {
  allRestaurants,
  restaurants,
  restaurantsByState,
  restaurantsPerCapita
}