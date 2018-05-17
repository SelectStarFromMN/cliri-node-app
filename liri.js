require("dotenv").config();

var keys = require("./keys.js");

var request = require('request');

var Spotify = require('node-spotify-api');
var Twitter = require('twitter');

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var command = process.argv[2];
var restArgs = process.argv.slice([3]).join(" ");

switch (command) {
  case 'spotify-this-song': searchSpotify(restArgs);
    break;
  case 'movie-this': searchOmdb(restArgs);
    break;
  case 'my-tweets': getTwitter(restArgs);
    break;
}

function searchSpotify(song) {
  if (!song) {
    song = 'The Sign, Ace of Base'
  }
  spotify.search({ type: 'track', query: song, limit: 1 }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }

    if (data && data.tracks.items.length > 0) {
      var track = data.tracks.items[0];
      var songname = track.name;
      var artistname = track.artists[0].name;
      var previewlink = track.preview_url;
      var albumname = track.album.name;
      var albumreleased = track.album.release_date;

      console.log(`
The top Spotify match for song "${song}" is:
    Artist Name:     ${artistname}
    Track Name:      ${songname}
    Album Name:      ${albumname}
    Album Release:   ${albumreleased}
    Track Preview:   ${previewlink}
    `)
    }
    else {
      console.log(`Sorry, the song "${song}" was not found.`)
    }
  });
}

function searchOmdb(movie) {
  if (!movie) {
    movie = 'Mr. Nobody'
  }
  request(`http://www.omdbapi.com/?apikey=trilogy&t=${movie}`, function (error, response, body) {
    if (error) {
      return console.log('Error occurred: ' + error);
    }
    // console.log('body:', body); 
    if (JSON.parse(body).Response != "False") {
      // console.log(movieObj)
      var movieObj = JSON.parse(body);
      var movieTitle = movieObj.Title;
      var movieYear = movieObj.Year;
      var movieImdbRating = movieObj.imdbRating;
      var movieRatingArr = movieObj.Ratings;
      var movieCountry = movieObj.Country;
      var movieLanguage = movieObj.Language;
      var moviePlot = movieObj.Plot;
      var movieActors = movieObj.Actors;
      var tomatoMeter = "";
      for (var i = 0; i < movieRatingArr.length; i++) {
        if (movieRatingArr[i].Source == 'Rotten Tomatoes') {
          tomatoMeter = movieRatingArr[i].Value;
        }
      }

      console.log(`
The top OMDB match for movie "${movie}" is:
    Movie Title:     ${movieTitle}
    Released:        ${movieYear}
    Country Origin:  ${movieCountry}
    Language:        ${movieLanguage}
    Top Billing:     ${movieActors}
    IMDB Rating:     ${movieImdbRating}
    TomatoMeter:     ${tomatoMeter}
    Plot:            ${moviePlot}
    `)
    }
    else {
      console.log(`Sorry, the movie "${movie}" was not found.`)
    }
  });

}

function getTwitter(screenName) {
  if (!screenName) {
    screenName = 'CWBootcamp'
  }
  var params = { screen_name: screenName }; 
  client.get('statuses/user_timeline', params, function (error, tweets, response) {
    if (!error) {
      for (var i = 0; i < Math.min(20, tweets.length); i++) {
        console.log(`\n(${Math.min(20, tweets.length) - i}) [${tweets[i].created_at.replace(' +0000','')}] : ${tweets[i].text}\n`);
        debugger
      }
    }
  });
}