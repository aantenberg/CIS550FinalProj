const { connection, DEFAULT_RADIUS, testParamsError } = require('./routesCore.js')

// GET: /income
// Return Schema: { averageIncome (float) } 
const income = async function (req, res) {
  const radius = req.query.radius ?? DEFAULT_RADIUS
  const zipcode = req.query.zipcode

  const error = testParamsError(zipcode, radius)
  if (error) {
    res.status(400).send(error)
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
  SELECT AVG(averageAGI) AS averageIncome
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
    } else if (data.length === 0) {
      res.status(400).send('No data found.')
    } else {
      res.json(data[0]);
    }
  });
}

// GET: /income/by-state
const incomeByState = async function (req, res) {

  const state = req.query.state
  if (!state) {
    res.status(400).send(`State query parameter required.`)
    return
  }

  connection.query(`
  SELECT state, AVG (averageAGI) AS averageIncome 
  FROM ZipCodeInfo 
  WHERE state = '${state}'
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

module.exports = {
  income,
  incomeByState
}