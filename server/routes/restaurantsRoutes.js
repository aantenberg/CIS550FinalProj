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
  SELECT name, latitude, longitude, type
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
// Return Schema: { state (string), countRestaurants (int) }
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
  SELECT name, latitude AS lat, longitude AS lng, num_stars
  FROM AllRestaurants
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

// GET /restaurants-in-zipcode/
const restaurantsInZipcode = async function (req, res) {

  const zipcode = req.query.zipcode

  if (!zipcode || !Number(zipcode)) {
    res.status(400).send('Required query parameter zipcode must be an integer').
    return
  }

  connection.query(`
  WITH ZipCodesWithHash AS (
      SELECT *, FLOOR(latitude * 3) * 10000 + FLOOR(ABS(longitude) * 5) AS location_hash
      FROM ZipCodeInfo
  ), RestaurantsWithHash AS (
      SELECT *, FLOOR(latitude * 3) * 10000 + FLOOR(ABS(longitude) * 5) AS location_hash
      FROM Restaurants
  ), ZipCodeLocation AS (
      SELECT latitude AS initial_latitude, longitude AS initial_longitude
      FROM ZipCodesWithHash
      WHERE zipcode = ${zipcode}
  ), ClosestZipCodes AS (
      SELECT *, ABS(longitude - initial_longitude) + ABS(latitude - initial_latitude) AS distance
      FROM ZipCodesWithHash CROSS JOIN ZipCodeLocation
      ORDER BY distance ASC
      LIMIT 15
  ), Distances AS (
      SELECT R.name, R.latitude, R.longitude, Z.zipcode, ABS(R.longitude - Z.longitude) + ABS(R.latitude - Z.latitude) AS distance
      FROM RestaurantsWithHash R JOIN ClosestZipCodes Z ON R.location_hash = Z.location_hash
  ), RestaurantsWithZipcode AS (
      SELECT D.name, D.latitude, D.longitude, D.zipcode, min_distance
      FROM Distances D JOIN (
          SELECT name, latitude, longitude, MIN(distance) AS min_distance
          FROM Distances
          GROUP BY name, latitude, longitude
      ) AS D2 ON D.name = D2.name AND D.longitude = D2.longitude AND D.distance = D2.min_distance
  )
  SELECT *
  FROM RestaurantsWithZipcode
  WHERE zipcode = ${zipcode};
  `, (err, data) => {
    if (err) {
      res.status(400).send(`Error in query evaluation: ${err}`);
    } else {
      res.json(data);
    }
  })
}

// GET /restaurants/by-state/top/:state
// Return Schema: [{ state (string), name (string), countRestaurants (int) }]
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
  SELECT R1.name, COUNT(DISTINCT R1.longitude) AS location_count
FROM Restaurants R1 Left JOIN Restaurants R2 ON R1.name = R2.name AND R1.state <> R2.state JOIN StateAbbreviations A on R1.state = A.abbreviation
WHERE A.name = '${state}' AND R2.name IS NULL
GROUP BY R1.name
ORDER BY location_count DESC
LIMIT 0, 5`, (err, data) => {
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
  singleStateRestaurants,
  restaurantsInZipcode
}