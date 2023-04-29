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

// GET /restaurants/by-state/:state
// Return Schema: { name (string), state (string), countRestaurants (int) }
const allRestaurantsByState = async function (req, res) {
  // const restaurantType = req.params.type
  // const table = getTableName(restaurantType);

  const state = req.params.state
  if (!state) {
    res.status(400).send(`State query parameter required.`)
    return
  }
  // if (!table) {
  //   res.status(400).send(`${restaurantType} is not a valid type. Type must be 'michelin-star', 'fast-food', or 'all'.`)
  //   return
  // }

  connection.query(`
  SELECT S.name, Count(*) As countRestaurants
  FROM Restaurants R join StateAbbreviations S on R.state = S.abbreviation
  WHERE S.name = '${state}'
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

  const state = req.params.state
  if (!state) {
    res.status(400).send(`State query parameter required.`)
    return
  }

  // TODO: This returns a list of zipcodes and per capita of that zip code, but not total per capita for state
  // Figure out what we wanna do with that.
  connection.query(`
  WITH ZipCodesInState AS (
    SELECT sum(numPeople) as totalNumPeople
    FROM ZipCodeInfo
    WHERE state = '${state}'
  )
  SELECT (count(*) / (SELECT totalNumPeople FROM ZipCodesInState)) AS RestaurantsPerCapita
  FROM Restaurants R JOIN StateAbbreviations S ON R.state = S.abbreviation
  Where S.name = '${state}'
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

// GET /restaurants/:type/within
// Return Schema: [{ name (string), latitude (float), longitude (float), zipcode (int) }]
const restaurantsWithin = async function (req, res) {

  const { latitude1, longitude1, latitude2, longitude2 } = req.query
  if (!(latitude1 && longitude1 && latitude2 && longitude2)) {
    res.status(400).send('Query parameters latitude1, longitude1, latitude2, and longitude2 required')
    return
  }

  if (!(Number(latitude1) && Number(longitude1) && Number(latitude2) && Number(longitude2))) {
    res.status(400).send('Query parameters latitude1, longitude1, latitude2, and longitude2 must be floats')
    return
  }

  console.log(latitude1, latitude2, longitude1, longitude2)

  connection.query(`
  SELECT name, latitude AS lat, longitude AS lng
  FROM Restaurants
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

// NOTE: THIS QUERY IS JUST FOR RETURNING TOP 5 FAST FOOD RESTAURANTS PER STATE
// GET /restaurants/by-state/top/:state
// Return Schema: [{ name (string), latitude (float), longitude (float), zipcode (int) }]
const topRestaurantsByState = async function (req, res) {
  
  const state = req.params.state
  if (!state) {
    res.status(400).send(`State query parameter required.`)
    return
  }

  connection.query(`
  SELECT S.name, R.name, Count(*) As countRestaurants
  FROM Restaurants R join StateAbbreviations S on R.state = S.abbreviation
  WHERE S.name = '${state}'
  GROUP BY R.name
  ORDER BY countRestaurants DESC
  LIMIT 0,5
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
  WHERE name = '${restaurantName}'
  GROUP BY name
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

// GET /all/states
// Return Schema: { state (string) }
const getAllStates = async function (req, res) {
  
  connection.query(`
  SELECT distinct State
  FROM ZipCodeInfo
  `, (err, data) => {
    if (err) {
      res.status(400).send(`Error in query evaluation: ${err}`);
    } else if (data.length === 0) {
      res.status(400).send('No data found in query evaluation.')
    } else {
      res.json(data);
    }
  });
}

const michelinStarRestaurantsByState = async function (req, res) {
  // const restaurantType = req.params.type
  // const table = getTableName(restaurantType);

  const state = req.params.state
  if (!state) {
    res.status(400).send(`State query parameter required.`)
    return
  }

  connection.query(`
  WITH ZipCodesInState AS (
    SELECT *
    FROM ZipCodeInfo
    WHERE state = '${state}'
  )
SELECT count(*) As countRestaurants
FROM MichelinStarRestaurants
WHERE zipcode IN (Select zipcode FROm ZipCodesInState)
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

const singleStateRestaurants = async function (req, res) {
  // const restaurantType = req.params.type
  // const table = getTableName(restaurantType);

  const state = req.params.state
  if (!state) {
    res.status(400).send(`State query parameter required.`)
    return
  }

  connection.query(`
  WITH SingleStateRestaurants AS (
    SELECT state, name, COUNT(longitude) AS location_count
    FROM Restaurants
    GROUP BY name
    HAVING COUNT(DISTINCT state) = 1)
SELECT A.name, S.name, location_count
FROM SingleStateRestaurants S JOIN StateAbbreviations A on S.state = A.abbreviation
WHERE A.name = '${state}'
ORDER BY location_count DESC
LIMIT 0, 5 
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
  allRestaurantsByState,
  restaurantsPerCapita,
  restaurantsWithin,
  topRestaurantsByState,
  getSpecificRestaurantCount,
  getAllStates,
  michelinStarRestaurantsByState,
  singleStateRestaurants
}