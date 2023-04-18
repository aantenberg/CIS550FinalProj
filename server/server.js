const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes/routes')


const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/author/:type', routes.author);
app.get('/restaurants', routes.allRestaurants);
app.get('/restaurants/:type', routes.restaurants);
app.get('/population', routes.population)
app.get('/closest-restaurants/:type', routes.closestRestaurants)
app.get('/income', routes.income)
app.get('/restaurants/:type/by-state', routes.restaurantsByState)
app.get('/income/by-state', routes.incomeByState)
app.get('/restaurants/:type/per-capita', routes.restaurantsPerCapita)
app.get('/restaurants/:type/within', routes.restaurantsWithin)
app.get('/restaurants/top/:type/by-state', routes.topRestaurantsByState)
app.get('/restaurants/fast-food/by-state/:name', routes.getSpecificRestaurantCount)

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
