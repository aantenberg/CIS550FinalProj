const authorRoute = require('./authorRoute')
const restaurantsRoutes = require('./restaurantsRoutes')
const populationRouteModule = require('./populationRoute')
const closestRestaurantsRoute = require('./closestRestaurantsRoute')

const { author } = authorRoute
const { allRestaurants, restaurants } = restaurantsRoutes
const { population } = populationRouteModule
const { closestRestaurants } = closestRestaurantsRoute

module.exports = {
  author,
  allRestaurants,
  restaurants,
  population,
  closestRestaurants
}

// // Route 2: GET /random
// const random = async function(req, res) {
//   // you can use a ternary operator to check the value of request query values
//   // which can be particularly useful for setting the default value of queries
//   // note if users do not provide a value for the query it will be undefined, which is falsey
//   const explicit = req.query.explicit === 'true' ? 1 : 0;

//   // Here is a complete example of how to query the database in JavaScript.
//   // Only a small change (unrelated to querying) is required for TASK 3 in this route.
//   connection.query(`
//     SELECT *
//     FROM Songs
//     WHERE explicit <= ${explicit}
//     ORDER BY RAND()
//     LIMIT 1
//   `, (err, data) => {
//     if (err || data.length === 0) {
//       // if there is an error for some reason, or if the query is empty (this should not be possible)
//       // print the error message and return an empty object instead
//       console.log(err);
//       res.json({});
//     } else {
//       // Here, we return results of the query as an object, keeping only relevant data
//       // being song_id and title which you will add. In this case, there is only one song
//       // so we just directly access the first element of the query results array (data)
//       // TODO (TASK 3): also return the song title in the response
//       res.json({
//         song_id: data[0].song_id,
//         title: data[0].title
//       });
//     }
//   });
// }

// /********************************
//  * BASIC SONG/ALBUM INFO ROUTES *
//  ********************************/

// // Route 3: GET /song/:song_id
// const song = async function(req, res) {
//   // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
//   // Most of the code is already written for you, you just need to fill in the query
//   connection.query(`
//   SELECT *
//   FROM Songs
//   WHERE song_id = '${req.params.song_id}'
//   `, (err, data) => {
//     if (err || data.length === 0) {
//       console.log(err);
//       res.json({});
//     } else {
//       res.json(data[0]);
//     }
//   });
// }

// // Route 4: GET /album/:album_id
// const album = async function(req, res) {
//   // TODO (TASK 5): implement a route that given a album_id, returns all information about the album
//   connection.query(`
//   SELECT *
//   FROM Albums
//   WHERE album_id='${req.params.album_id}'
//   `, (err, data) => {
//     if (err || data.length === 0) {
//       console.log(err);
//       res.json({})
//     } else {
//       res.json(data[0])
//     }
//   })
// }

// // Route 5: GET /albums
// const albums = async function(req, res) {
//   // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
//   // Note that in this case you will need to return multiple albums, so you will need to return an array of objects
//   connection.query(`
//   SELECT *
//   FROM Albums
//   ORDER BY release_date DESC
//   `, (err, data) => {
//     if (err || data.length === 0) {
//       console.log(err)
//       res.json([])
//     } else {
//       res.json(data)
//     }
//   })
// }

// // Route 6: GET /album_songs/:album_id
// const album_songs = async function(req, res) {
//   // TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
//   connection.query(`
//   SELECT song_id, title, number, duration, plays
//   FROM Songs
//   WHERE album_id = '${req.params.album_id}'
//   ORDER BY number ASC
//   `, (err, data) => {
//     if (err) {
//       console.log(err)
//       res.json([])
//     } else {
//       res.json(data)
//     }
//   })
// }

// /************************
//  * ADVANCED INFO ROUTES *
//  ************************/

// // Route 7: GET /top_songs
// const top_songs = async function(req, res) {
//   const page = req.query.page;
//   // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
//   const pageSize = req.query.page_size ?? 10;

//   if (!page) {
//     // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
//     connection.query(`
//     SELECT song_id, Songs.title, Songs.album_id, Albums.title AS album, plays
//     FROM Songs JOIN Albums ON Songs.album_id = Albums.album_id
//     ORDER BY plays DESC
//     `, (err, data) => {
//       if (err) {
//         console.log(err)
//         res.json([])
//       } else {
//         res.json(data)
//       }
//     })
//   } else {
//     // TODO (TASK 10): reimplement TASK 9 with pagination
//     // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
//     connection.query(`
//     SELECT song_id, Songs.title, Songs.album_id, Albums.title AS album, plays
//     FROM Songs JOIN Albums ON Songs.album_id = Albums.album_id
//     ORDER BY plays DESC
//     LIMIT ${pageSize} OFFSET ${(page-1) * pageSize}
//     `, (err, data) => {
//       if (err) {
//         console.log(err)
//         res.json([])
//       } else {
//         res.json(data)
//       }
//     })
//   }
// }

// // Route 8: GET /top_albums
// const top_albums = async function(req, res) {
//   // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
//   // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
//   const page = req.query.page;
//   const pageSize = req.query.page_size ?? 10;

//   if (!page) {
//     connection.query(`
//     SELECT Songs.album_id, Albums.title, sum(plays) AS plays
//     FROM Songs JOIN Albums on Songs.album_id = Albums.album_id
//     GROUP BY album_id, title
//     ORDER BY plays DESC
//     `, (err, data) => {
//       if (err) {
//         console.log(err)
//         res.json([])
//       } else {
//         res.json(data)
//       }
//     })
//   } else {
//     connection.query(`
//     SELECT Songs.album_id, Albums.title, sum(plays) AS plays
//     FROM Songs JOIN Albums on Songs.album_id = Albums.album_id
//     GROUP BY album_id, title
//     ORDER BY plays DESC
//     LIMIT ${pageSize} OFFSET ${(page-1) * pageSize}
//     `, (err, data) => {
//       if (err) {
//         console.log(err)
//         res.json([])
//       } else {
//         res.json(data)
//       }
//     })
//   }
// }

// // Route 9: GET /search_albums
// const search_songs = async function(req, res) {
//   // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
//   // Some default parameters have been provided for you, but you will need to fill in the rest
//   const title = req.query.title ?? '';
//   const durationLow = req.query.duration_low ?? 60;
//   const durationHigh = req.query.duration_high ?? 660;
//   const playsLow = req.query.plays_low ?? 0;
//   const playsHigh = req.query.plays_high ?? 1100000000;
//   const danceabilityLow = req.query.danceability_low ?? 0;
//   const danceabilityHigh = req.query.danceability_high ?? 1;
//   const energyLow = req.query.energy_low ?? 0;
//   const energyHigh = req.query.energy_high ?? 1;
//   const valenceLow = req.query.valence_low ?? 0;
//   const valenceHigh = req.query.valence_high ?? 1;
//   const explicit = req.query.explicit === 'true' ? 1 : 0;
//   connection.query(`
//   SELECT song_id, album_id, title, number, duration, plays, danceability, energy, valence, tempo, key_mode, explicit
//   FROM Songs
//   WHERE title like '%${title}%'
//   AND duration BETWEEN ${durationLow} AND ${durationHigh}
//   AND plays BETWEEN ${playsLow} AND ${playsHigh}
//   AND danceability BETWEEN ${danceabilityLow} AND ${danceabilityHigh}
//   AND energy BETWEEN ${energyLow} AND ${energyHigh}
//   AND valence BETWEEN ${valenceLow} AND ${valenceHigh}
//   AND explicit <= ${explicit}
//   ORDER BY title
//   `, (err, data) => {
//     if (err) {
//       console.log(err)
//       res.json([])
//     } else {
//       res.json(data)
//     }
//   })
// }


