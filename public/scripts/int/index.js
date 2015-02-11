var Song;
var Track;
var Circle;
var circleOffset, circleWidth, circleHeight, circleCenterX, circleCenterY;
var currentUrl;

// Make it not go to sleep
// Search songs
// Favorites

var Index = {
	events : function () {
		// Load and play songs from sidebar
		$('.song').on('click', function (e){
			e.preventDefault();

			var albumArt = $(this).find('img').attr('src');
			var song = $(this).data('title');
			var artist = $(this).data('artist');
			currentUrl = $(this).data('sc-url');
			Index.updatePlayer(albumArt, song, artist);
			Index.streamTrack(currentUrl, "play");
		});

		// Play and Pause
		$('.fay-play-default').on('click', function (e){
			Index.playAndPause();
		});

		// Setup variables for scrubbing
		Index.setupScrubbing();
		$(window).on('resize', function(){ Index.setupScrubbing() });

		// Scrubbing
		$(Circle.path).on('click', function (e) {
			Index.scrub(e);
		});

		// Volume controls
		$('.fa-volume-up').on('mouseenter', function () {
			$('#volume-control').fadeIn();
		});

		$('#volume-control').on('mouseleave', function () {
			$(this).fadeOut();
		});

		$('#volume-control').on('click', function (e) {
			var parentOffset = $(this).offset(); 
			var relX = e.pageX - parentOffset.left;

			$('#volume-bar').css({
				'width' : (relX / 2) + "%"
			});

			Song.setVolume(relX/200);
		});
	},
	setupScrubbing : function () {
		// Get values for player circle to do scrubbing calculations
		circleOffset = $(Circle.path).offset();	
		circleWidth = $('#album').width();	
		circleHeight = $('#album').height();	
		circleCenterX = circleOffset.left + circleWidth / 2;	
		circleCenterY = circleOffset.top + circleHeight / 2;
	},
	scrub : function (e) {
		// Get absolute click coordinates
		var x = e.clientX;
		var y = e.clientY;

		// Find circumference of clicked circle
		var PI = Math.PI;
		var radius = Math.sqrt(Math.pow((x - circleCenterX), 2) + Math.pow((y - circleCenterY), 2));
		var circumference = 2*PI*radius;

		// Get the coordinates for 12 oclock line
		var topOfCircleX = 0;
		var topOfCircleY = radius;

		// Get angle between clicked point vector and 12 oclock
		var v1 = {x: 0, y: radius}, v2 = {x: (x - circleCenterX), y: (circleCenterY - y)},
		    angleRad = Math.acos( (v1.x * v2.x + v1.y * v2.y) / ( Math.sqrt(v1.x*v1.x + v1.y*v1.y) * Math.sqrt(v2.x*v2.x + v2.y*v2.y) ) ),
		    angleDeg = angleRad * 180 / Math.PI;

	    // Return the angle on 360 degree scale
		if ( (x - circleCenterX) < 0 ) {
			var actualAngle = 360 - angleDeg;
		} else {
			var actualAngle = angleDeg;
		}
		var seekPercent = actualAngle / 360;
		Song.seek(seekPercent * Song.getDuration());
		Circle.animate(seekPercent, {
			duration: 300,
		});
	},
	updatePlayer : function (albumArt, song, artist) {
		$('image').attr('xlink:href', albumArt);
		$('#title').html(song);
		$('#artist').html(artist)
	},
	streamTrack : function (url, action) {
		var action = action || 'load';
		SC.get('/resolve', { url: url }, function (track) {
			Track = track;
			SC.stream('/tracks/' + Track.id, function (song) {
				if (Song != undefined) Song.stop();
				Song = song;
				if (action === 'play') {
					if ( $('.fay-play-default').attr('data-fay-play') === "true" ) { $('.fay-play-default').triggerHandler('click') }
					Song.play();
				}
			})
		})
	},
	playAndPause : function () {
		if (Song.getState() == "playing") {
			Song.pause();
		} else {
			Song.play();
		}
	},
	setupProgressBar : function () {
		if (Song) {	
			if (Song.getState() == "playing") {
				var position = Song.getCurrentPosition() / Song.getDuration();
				Circle.animate(position);
			}
		}
	},
	autoAdvance : function () {
		if (Song != undefined) {			
			if (Song.getState() === 'ended' ) {
				Song.stop();
				Song = undefined;
				Circle.animate(0, {
					duration: 1
				});
				var nextSong = $('.song[data-sc-url="' + currentUrl + '"]').next();
				var albumArt = nextSong.find('img').attr('src');
				var song = nextSong.data('title');
				var artist = nextSong.data('artist');
				currentUrl = nextSong.data('sc-url');
				Index.updatePlayer(albumArt, song, artist);
				Index.streamTrack(currentUrl, "play");

				
			}
		}
	},
	///////////////////////////////////////
	// ^^ DO THIS LIKE ON THE OLD ONE ^^ //
	///////////////////////////////////////
	init : function() {

		// Initialize Soundcloud
		SC.initialize({ client_id: '91a4f9b982b687d85c9d42e2f4991a09' });

		// Draw SVG circle
		Circle = new ProgressBar.Circle('#album', {
		    color: '#FFF',
		    strokeWidth: 3,
		    fill: 'url(\'#image\')',
		    duration: 1000,
		    easing: 'linear',
		    trailColor: "rgba(0,0,0,.5)"
		});

		// Initialize Icons
		Fay.init();

		// Get first song
		var albumArt = $('.song').eq(0).find('img').attr('src');
		var song = $('.song').eq(0).data('title');
		var artist = $('.song').eq(0).data('artist');
		currentUrl = $('.song').eq(0).data('sc-url');
		Index.updatePlayer(albumArt, song, artist);
		Index.streamTrack(currentUrl, "load")

		window.setInterval(Index.setupProgressBar, 1000);
		window.setInterval(Index.autoAdvance, 1000);

		// Set up events
		Index.events();
	}
}

Index.init();