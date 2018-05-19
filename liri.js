// Requires
var dotenv = require("dotenv").config();
var keys = require("./keys.js");
var request = require('request');
var fs = require("fs");
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');

// Vars
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var command = process.argv[2];                    // The first "real" arg is the liri command
var restArgs = process.argv.slice(3).join(" ");   // The rest of the args get passed to the command

// First log the command and args (pseudo STDIN capture)
fs.appendFile("log.txt", `\n\n> node liri.js ${command} ${restArgs}\n\n`, function (err) {
  if (err) {
    return err;
  }
})

// Main (handle the command)
switch (command) {
  case 'spotify-this-song': searchSpotify(restArgs);
    break;
  case 'movie-this': searchOmdb(restArgs);
    break;
  case 'my-tweets': getTwitter(restArgs);
    break;
  case 'do-what-it-says': doFileCommand('./random.txt');
    break;
  default: dualLog("Sorry, I can only respond to spotify-this-song, movie-this, my-tweets or do-what-it-says");
}

// Tell us some information about a song
function searchSpotify(song) {
  if (!song) {
    song = 'The Sign, Ace of Base'
  }
  spotify.search({ type: 'track', query: song, limit: 1 }, function (err, data) {
    if (err) {
      return dualLog('Error occurred: ' + err);
    }

    if (data && data.tracks.items.length > 0) {
      var track = data.tracks.items[0];
      var songname = track.name;
      var artistname = track.artists[0].name;
      var previewlink = track.preview_url;
      var albumname = track.album.name;
      var albumreleased = track.album.release_date;

      dualLog(`
The top Spotify match for the song "${song}" is:
    Artist Name:     ${artistname}
    Track Name:      ${songname}
    Album Name:      ${albumname}
    Album Release:   ${albumreleased}
    Track Preview:   ${previewlink}
    `)
    }
    else {
      dualLog(`Sorry, the song "${song}" was not found.`)
    }
  });
}

// Get a bunch of cool info about a movie
function searchOmdb(movie) {
  if (!movie) {
    movie = 'Mr. Nobody'
  }
  request(`http://www.omdbapi.com/?apikey=trilogy&t=${movie}`, function (error, response, body) {
    if (error) {
      return dualLog('Error occurred: ' + error);
    }
    if (JSON.parse(body).Response != "False") {
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

      dualLog(`
The top OMDB match for the movie "${movie}" is:
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
      dualLog(`Sorry, the movie "${movie}" was not found.`)
    }
  });

}

// LArby's, We've got the TWEETS
function getTwitter(screenName) {
  if (!screenName) {
    screenName = 'CWBootcamp'
  }
  var params = { screen_name: screenName };
  client.get('statuses/user_timeline', params, function (error, tweets, response) {
    if (!error) {
      dualLog(`
The ${Math.min(20, tweets.length)} most recent tweets from ${screenName} :`);
      for (var i = 0; i < Math.min(20, tweets.length); i++) {
        dualLog(`\n(${Math.min(20, tweets.length) - i}) [${tweets[i].created_at.replace(' +0000', '')}] : ${tweets[i].text}\n`);
      }
    } else {
      dualLog("Sorry, no tweets found for the little bird named: " + screenName)
    }
  });
}


// Do whatever it says in the file
function doFileCommand(fileName) {
  // Read the liri command from the file
  fs.readFile(fileName, "utf8", function (error, data) {
    // If the code experiences any errors it will log the error to the console.
    if (error) {
      return dualLog(error);
    }

    var dataArr = data.split(",");
    var command = dataArr[0];
    var restArgs = dataArr.slice([1]).join(" ");

    switch (command) {
      case 'spotify-this-song': searchSpotify(restArgs);
        break;
      case 'movie-this': searchOmdb(restArgs);
        break;
      case 'my-tweets': getTwitter(restArgs);
        break;
      case 'do-what-it-says': dualLog("Hey, don't put me into an infinite loop!");
        break;
        default: dualLog("Sorry, I only respond to spotify-this-song, movie-this, my-tweets or do-what-it-says");
    }
  });
}

// Log string to console/stdout and log.txt file
function dualLog (string) {
  console.log(string);
  fs.appendFile("log.txt", `\n${string}\n`, function (err) {
      if (err) {
        return err;
      }
  })
}  
