# cliri-node-app
CommandLine Siri-like app - your lowtech digital assistant!

CommandLine Siri (liri for short) is invoked via the node.js commandline like so:

 node liri.js <command> <arguments>

Liri understand the following commands:

* spotify-this-song [songName]
* movie-this [movieName]
* my-tweets [screenName]
* do-what-it-says
    (runs the command saved inside the random.txt file)

examples:

node liri.js spotify-this-song 'wish you were here'

node liri.js spotify-this-song ride my llama neil young

    (note: quotes in all command-line arguments are optional)

node liri.js movie-this jaws

node liri.js my-tweets CWBootcamp

node liri.js do-what-it-says
