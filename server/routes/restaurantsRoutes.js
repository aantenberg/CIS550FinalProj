const { connection, DEFAULT_RADIUS, getTableName, testParamsError } = require('./routesCore')

// GET /restaurants
// Return Schema: [{ name (string), latitude (float), longitude (float), zipcode (int), type (string) }] 
const allRestaurants = async function (req, res) {
  restaurants({ ...req, params: { ...req.params, type: 'all' } }, res)
}

// GET /restaurants/:type
// Return Schema: [{ name (string), latitude (float), longitude (float), zipcode (int), type (string) }] 
const restaurants = async function (req, res) {
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
const restaurantsByState = async function (req, res) {
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
const restaurantsPerCapita = async function (req, res) {

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

// GET /restaurants/:type/within
// Return Schema: [{ name (string), latitude (float), longitude (float), zipcode (int) }]
const restaurantsWithin = async function (req, res) {

  const restaurantType = req.params.type
  const table = getTableName(restaurantType);
  if (!table) {
    res.status(400).send(`${restaurantType} is not a valid type. Type must be 'michelin-star', 'fast-food', or 'all'.`)
    return
  }
  const { latitude1, longitude1, latitude2, longitude2 } = req.query
  if (!(latitude1 && longitude1 && latitude2 && longitude2)) {
    res.status(400).send('Query parameters latitude1, longitude1, latitude2, and longitude2 required')
    return
  }

  if (!(Number(latitude1) && Number(longitude1) && Number(latitude2) && Number(longitude2))) {
    res.status(400).send('Query parameters latitude1, longitude1, latitude2, and longitude2 must be floats')
    return
  }

  connection.query(`
  SELECT name, zipcode, latitude, longitude
  FROM ${table} AS RestaurantsTable
  WHERE latitude > ${latitude1} AND latitude < ${latitude2} 
  AND longitude > ${longitude1} AND longitude < ${longitude2}
  `, (err, data) => {
    if (err) {
      res.status(400).send(`Error in query evaluation: ${err}`);
    } else {
      res.json(data);
    }
  });
}

// GET /restaurants/top/:type/by-state
// Return Schema: [{ name (string), latitude (float), longitude (float), zipcode (int) }]
const topRestaurantsByState = async function (req, res) {
  const restaurantType = req.params.type
  const table = getTableName(restaurantType);
  if (!table) {
    res.status(400).send(`${restaurantType} is not a valid type. Type must be 'michelin-star', 'fast-food', or 'all'.`)
    return
  }
  const state = req.query.state
  if (!state) {
    res.status(400).send('Query parameter state is required.')
  }

  connection.query(`
  SELECT name, COUNT(*) AS num_of_restaurants
  FROM ${table} AS F join ZipCodeInfo Z on F.zipcode = Z.zipcode
  WHERE state = '${state}'
  GROUP BY name
  ORDER BY num_of_restaurants DESC
  LIMIT 0, 5
  `, (err, data) => {
    if (err) {
      res.status(400).send(`Error in query evaluation: ${err}`);
    } else {
      res.json(data);
    }
  });
}

// GET /restaurants/fast-food/by-state/:name
// Return Schema: { name (string), countSpecificRestaurant (int) }
const getSpecificRestaurantCount = async function (req, res) {
  const restaurantName = req.params.name
  const state = req.query.state
  if (!state) {
    res.status(400).send('Query parameter state is required.')
  }

  connection.query(`
  WITH ZipCodesInState AS (
    SELECT *
    FROM ZipCodeInfo
    WHERE state = '${state}'
  )
  SELECT name, Count(*) AS countSpecificRestaurant
  FROM FastFoodRestaurants R JOIN ZipCodesInState S on R.zipcode = S.zipcode
  WHERE name = '${restaurantName}
  GROUP BY name'
  `, (err, data) => {
    if (err) {
      res.status(400).send(`Error in query evaluation: ${err}`);
    } else if (data.length === 0) {
      res.status(400).send('No data found in query evaluation.')
    } else {
      res.json(data[0]);
    }
  });
}

module.exports = {
  allRestaurants,
  restaurants,
  restaurantsByState,
  restaurantsPerCapita,
  restaurantsWithin,
  topRestaurantsByState,
  getSpecificRestaurantCount
}