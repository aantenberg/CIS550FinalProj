const { connection, DEFAULT_RADIUS } = require('./routesCore.js')

const population = async function (req, res) {
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

  connection.query(`  
  WITH InitialLocation AS (
    SELECT latitude AS initial_lat, longitude AS initial_lng
    FROM ZipCodeInfo
    WHERE zipcode = ${zipcode}
  ), LooseEstimate AS(
    SELECT *
    FROM ZipCodeInfo
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
  SELECT SUM(numPeople) AS totalPopulation
  FROM LooseEstimate
  WHERE (69 * DEGREES(
    ACOS(
      COS(RADIANS((SELECT initial_lat FROM InitialLocation))) *
      COS(RADIANS(latitude)) *
      COS(RADIANS(longitude) - RADIANS((SELECT initial_lng FROM InitialLocation))) +
    SIN(RADIANS((SELECT initial_lat FROM InitialLocation))) *
    SIN(RADIANS(latitude))
  ))) < ${radius};
  
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send(`Error in query evaluation: ${err}`);
    } else {
      res.json(data);
    }
  });
}

module.exports = {
  population
}