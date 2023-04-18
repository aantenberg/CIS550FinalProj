const authorRoute = require('./authorRoute')
const restaurantsRoutes = require('./restaurantsRoutes')
const closestRestaurantsRoute = require('./closestRestaurantsRoute')
const populationRoute = require('./populationRoutes')
const incomeRoute = require('./incomeRoutes')

const { author } = authorRoute
const { allRestaurants, restaurants, restaurantsByState, restaurantsPerCapita, restaurantsWithin, topRestaurantsByState, getSpecificRestaurantCount } = restaurantsRoutes
const { closestRestaurants } = closestRestaurantsRoute
const { population } = populationRoute
const { income, incomeByState } = incomeRoute

module.exports = {
  author,
  allRestaurants,
  restaurants,
  population,
  closestRestaurants,
  income,
  restaurantsByState,
  incomeByState,
  restaurantsPerCapita,
  restaurantsWithin,
  topRestaurantsByState,
  getSpecificRestaurantCount
}
