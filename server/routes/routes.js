const authorRoute = require('./authorRoute')
const restaurantsRoutes = require('./restaurantsRoutes')
const closestRestaurantsRoute = require('./closestRestaurantsRoute')
const populationRoute = require('./populationRoutes')
const incomeRoute = require('./incomeRoutes')
const locationRoute = require('./locationRoute')

const { author } = authorRoute
const { allRestaurants, restaurants, allRestaurantsByState, restaurantsPerCapita, restaurantsWithin, topRestaurantsByState, getSpecificRestaurantCount, getAllStates, michelinStarRestaurantsByState, singleStateRestaurants } = restaurantsRoutes
const { closestRestaurants } = closestRestaurantsRoute
const { population } = populationRoute
const { income, incomeByState, incomeByZip } = incomeRoute
const { locationForZipcode } = locationRoute

module.exports = {
  author,
  allRestaurants,
  restaurants,
  population,
  closestRestaurants,
  income,
  allRestaurantsByState,
  incomeByState,
  incomeByZip,
  restaurantsPerCapita,
  restaurantsWithin,
  topRestaurantsByState,
  getSpecificRestaurantCount,
  getAllStates,
  michelinStarRestaurantsByState,
  singleStateRestaurants,
  locationForZipcode
}
