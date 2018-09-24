'use strict';
// These variables create the connection to the dependencies.
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
const app = express();

// Allows us to use the .env file
require('dotenv').config();

// Setup database by creating a client instance, pointing it at our database
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

//Error handling for database
client.on('error', err => console.error(err));

// Tells express to use 'cors' for cross-origin resource sharing
app.use(cors());

// assigns the PORT variable to equal the port declared in the .env file for our local server.  It also allows heroku to assign it's own port number.
const PORT = process.env.PORT || 3000;

// When the user submits the form, the following app.get() will call the correct helper function to retrieve the API information.
app.get('/location', getLocation); //google API
app.get('/weather', getWeather); //darkskies API
app.get('/yelp', getRestaurants); // yelp API
app.get('/movies', getMovies); // the movie database API
app.get('/meetups', getMeetups); // meetup API
app.get('/trails', getTrails); //The Hiking Guide API

// Tells the server to start listening to the PORT, and console.logs to tell us it's on.
app.listen(PORT, () => console.log(`LAB-09 - Listening on ${PORT}`));

// ++++++++++++++++++++++++++++++++++++++++++++++++++
// CONSTRUCTOR FUNCTIONS ANS PROTOTYPES START HERE //
// ++++++++++++++++++++++++++++++++++++++++++++++++++

// Constructor and prototype for Google API
function LocationResults(search, location) {
  this.search_query = search;
  this.formatted_query = location.body.results[0].formatted_address;
  this.latitude = location.body.results[0].geometry.location.lat;
  this.longitude = location.body.results[0].geometry.location.lng;
  this.created_at = Date.now();
}

LocationResults.prototype = {
  save: function () {
    const SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id;`;
    const values = [this.search_query, this.formatted_query, this.latitude, this.longitude];

    return client.query(SQL, values)
      .then(result => {
        this.id = result.rows[0].id;
        return this;
      });
  }
};

// Constructor and prototype for Darksky API
function WeatherResult(weather) {
  this.tableName = 'weathers';
  this.time = new Date(weather.time * 1000).toString().slice(0, 15);
  this.forecast = weather.summary;
  this.created_at = Date.now();
}

WeatherResult.prototype = {
  save: function (location_id) {
    const SQL = `INSERT INTO ${this.tableName} (forecast, time, created_at, location_id) VALUES ($1, $2, $3, $4);`;
    const values = [this.forecast, this.time, this.created_at, location_id];
    client.query(SQL, values);
  }
};

//Constructor and prototype for Yelp API
function RestaurantResult(restaurant) {
  this.tableName = 'restaurants';
  this.name = restaurant.name;
  this.image_url = restaurant.image_url;
  this.price = restaurant.price;
  this.rating = restaurant.rating;
  this.url = restaurant.url;
  this.created_at = Date.now();
}

RestaurantResult.prototype = {
  save: function (location_id) {
    const SQL = `INSERT INTO ${this.tableName} (name,image_url,price,rating,url,created_at,location_id) VALUES ($1, $2, $3, $4, $5, $6, $7);`;
    const values = [
      this.name,
      this.image_url,
      this.price,
      this.rating,
      this.url,
      this.created_at,
      location_id
    ];

    client.query(SQL, values);
  }
};

//Constructor and prototype for The Movie Database API
function MovieResults(movie) {
  this.tableName = 'movies';
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
  this.created_at = Date.now();
}

MovieResults.prototype = {
  save: function (location_id) {
    const SQL = `INSERT INTO ${this.tableName} (title, overview, average_votes, total_votes, image_url, popularity, released_on, created_at, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
    const values = [
      this.title,
      this.overview,
      this.average_votes,
      this.total_votes,
      this.image_url,
      this.popularity,
      this.released_on,
      this.created_at,
      location_id
    ];

    client.query(SQL, values);
  }
};

//Constructor and prototype for Meetup API
function MeetupResults(meetup) {
  this.tableName = 'meetups';
  this.name = meetup.name;
  this.link = meetup.link;
  this.host = meetup.venue.name;
  this.creation_date = new Date(meetup.created).toString().slice(0, 15);
  this.created_at = Date.now();
}

MeetupResults.prototype = {
  save: function (location_id) {
    const SQL = `INSERT INTO ${this.tableName} (name, link, host, creation_date, created_at, location_id) VALUES ($1, $2, $3, $4, $5, $6);`;
    const values = [
      this.name,
      this.link,
      this.host,
      this.creation_date,
      this.created_at,
      location_id
    ];

    client.query(SQL, values);
  }
};

//Constructor and prototype for The Hiking Project
function TrailsResults(trail) {
  this.tableName = 'trails';
  this.name = trail.name;
  this.trail_url = trail.url;
  this.location = trail.location;
  this.length = trail.length;
  this.condition_date = trail.conditionDate.toString().slice(0, 10);
  this.condition_time = trail.conditionDate.toString().slice(11, 19);
  this.conditions = trail.conditionStatus;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.created_at = Date.now();
}

TrailsResults.prototype = {
  save: function (location_id) {
    const SQL = `INSERT INTO ${this.tableName} (name, trail_url, location, length, condition_date, condition_time, conditions, stars, star_votes, summary, created_at, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`;
    const values = [
      this.name,
      this.trail_url,
      this.location,
      this.length,
      this.condition_date,
      this.condition_time,
      this.conditions,
      this.stars,
      this.star_votes,
      this.summary,
      this.created_at,
      location_id
    ];
    client.query(SQL, values);
  }
}

// Define table names, lookup, and deleteByLoaction for each process

WeatherResult.tableName = 'weathers';
WeatherResult.lookup = lookup;
WeatherResult.deleteByLocationId = deleteByLocationId;

RestaurantResult.tableName = 'restaurants';
RestaurantResult.lookup = lookup;
RestaurantResult.deleteByLocationId = deleteByLocationId;

MovieResults.tableName = 'movies';
MovieResults.lookup = lookup;
MovieResults.deleteByLocationId = deleteByLocationId;

MeetupResults.tableName = 'meetups';
MeetupResults.lookup = lookup;
MeetupResults.deleteByLocationId = deleteByLocationId;

TrailsResults.tableName = 'trails';
TrailsResults.lookup = lookup;
TrailsResults.deleteByLocationId = deleteByLocationId;

// +++++++++++++++++++++++++++
// HELPER FUNCTIONS START HERE
// +++++++++++++++++++++++++++

// This lookup helper function is unique to the Google API
LocationResults.lookupLocation = (location) => {
  const SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  const values = [location.query]

  return client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0) {
        location.cacheHit(result.rows[0]);
      } else {
        location.cacheMiss();
      }
    })
    .catch(console.error);
}

// Generic lookup helper function for remaining APIS
function lookup(options) {

  const SQL = `SELECT * FROM ${options.tableName} WHERE location_id=$1;`;
  const values = [options.id];

  client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0) {
        options.cacheHit(result.rows);
      } else {
        options.cacheMiss();
      }
    })
    .catch(error => processError(error));
}

// This function gets the information from GOOGLE
function getLocation(request, response) {
  LocationResults.lookupLocation({
    query: request.query.data,
    cacheMiss: function () {

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GOOGLE_API_KEY}`;

      return superagent.get(url)
        .then(result => {
          const location = new LocationResults(request.query.data, result);
          location.save()
            .then(location => response.send(location)
            );
        })
        .catch(error => processError(error, response));
    },
    cacheHit: function (result) {
      response.send(result);
    }
  })
}

// This function gets the information from DARK SKY
function getWeather(request, response) {
  WeatherResult.lookup({
    tableName: WeatherResult.tableName,
    id: request.query.data.id,
    cacheMiss: function () {

      const url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

      superagent.get(url)
        .then(result => {
          const weatherSummary = result.body.daily.data.map(day => {
            const dailySumary = new WeatherResult(day);
            dailySumary.save(request.query.data.id);
            return dailySumary;
          });
          response.send(weatherSummary);
        })
        .catch(error => processError(error, response));
    },
    cacheHit: function (resultsArray) {
      let ageOfData = (Date.now() - resultsArray[0].created_at) / (1000 * 60);
      if (ageOfData > 30) {
        deleteByLocationId(
          WeatherResult.tableName,
          request.query.data.id
        );
      } else {
        response.send(resultsArray);
      }
    }
  });
}

// This function gets the information from YELP
function getRestaurants(request, response) {
  RestaurantResult.lookup({
    tableName: RestaurantResult.tableName,
    id: request.query.data.id,
    cacheMiss: function () {

      const url = `https://api.yelp.com/v3/businesses/search?location=${request.query.data.search_query}`;

      superagent.get(url)
        .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
        .then(result => {
          const yelpSummary = result.body.businesses.map(restaurant => {
            const eachRestaurant = new RestaurantResult(restaurant);
            eachRestaurant.save(request.query.data.id);
            return eachRestaurant;
          });
          response.send(yelpSummary);
        })
        .catch(error => processError(error, response));
    },
    cacheHit: function (resultsArray) {
      let ageOfData = (Date.now() - resultsArray[0].created_at) / (1000 * 60);
      if (ageOfData > 30) {
        deleteByLocationId(
          RestaurantResult.tableName,
          request.query.data.id
        );
      } else {
        response.send(resultsArray);
      }
    }
  });
}

// This function gets the information from THE MOVIE DATABASE
function getMovies(request, response) {

  MovieResults.lookup({
    tableName: MovieResults.tableName,
    id: request.query.data.id,
    cacheMiss: function () {

      const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_APIv3_KEY}&query=${request.query.data.search_query}`;

      superagent.get(url)
        .then(result => {
          const movieSummary = result.body.results.map(movie => {
            const eachMovie = new MovieResults(movie);
            eachMovie.save(request.query.data.id);
            return eachMovie;
          });
          response.send(movieSummary);
        })
        .catch(error => processError(error, response));
    },
    cacheHit: function (resultsArray) {
      let ageOfData = (Date.now() - resultsArray[0].created_at) / (1000 * 60);

      if (ageOfData > 30) {
        deleteByLocationId(
          MovieResults.tableName,
          request.query.data.id
        );
      } else {
        response.send(resultsArray);
      }
    }
  })
}

// This function gets the information from MEETUP
function getMeetups(request, response) {
  MeetupResults.lookup({
    tableName: MeetupResults.tableName,
    id: request.query.data.id,
    cacheMiss: function () {
      const url = `https://api.meetup.com/find/upcoming_events?key=${process.env.MEETUP_API_KEY}&lon=${request.query.data.longitude}&page=5&lat=${request.query.data.latitude}`;

      superagent.get(url)
        .then(result => {

          const meetupSummary = result.body.events.map(meetup => {
            const eachMeetup = new MeetupResults(meetup);
            eachMeetup.save(request.query.data.id);
            return eachMeetup;
          });
          response.send(meetupSummary);
        })
        .catch(error => processError(error, response));
    },
    cacheHit: function (resultsArray) {
      let ageOfData = (Date.now() - resultsArray[0].created_at) / (1000 * 60);

      if (ageOfData > 30) {
        deleteByLocationId(
          MeetupResults.tableName,
          request.query.data.id
        );
      } else {
        response.send(resultsArray);
      }
    }
  })
}

// This function gets the information from THE HIKING PROJECT
function getTrails(request, response) {
  TrailsResults.lookup({
    tableName: TrailsResults.tableName,
    id: request.query.data.id,

    cacheMiss: function () {

      const url = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${request.query.data.longitude}&maxDistance=10&key=${process.env.HIKING_PROJECT_API_KEY}`;


      superagent.get(url)
        .then(result => {
          const trailsSummary = result.body.trails.map(trail => {
            const eachTrail = new TrailsResults(trail);
            eachTrail.save(request.query.data.id);
            return eachTrail;
          });
          response.send(trailsSummary);
        })
        .catch(error => processError(error, response));
    },
    cacheHit: function (resultsArray) {
      let ageOfData = (Date.now() - resultsArray[0].created_at) / 1000(1000 * 60);

      if (ageOfData > 30) {
        deleteByLocationId(
          TrailsResults.tableName,
          request.query.data.id
        );
      } else {
        response.send(resultsArray);
      }
    }
  })
}

// Empty the contents of a table if data is old
function deleteByLocationId(table, city) {
  const SQL = `DELETE from ${table} WHERE location_id=${city};`;
  return client.query(SQL);
}

// Error handeling helper function
function processError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}
