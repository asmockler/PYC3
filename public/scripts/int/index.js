var Song;
var Track;
var Circle;
var circleOffset, circleWidth, circleHeight, circleCenterX, circleCenterY;
var currentUrl;
var sidebarLoading = false;

// Make it not go to sleep
// Search songs
// Favorites (cumulative favorites for songs - use this as upvotes	)

var Index = {
	pageEvents : function () {
		// Play and Pause
		$('.fay-play-default').on('click', function (e){
			Index.playAndPause();
		});

		// Setup variables for scrubbing
		Index.setupScrubbing();
		$(window).on('resize', function(){ 
			Index.setupScrubbing(); 
			Index.setupLoadingDiv();

			var textareaWidth = document.getElementById("textarea").scrollWidth;
			document.getElementById("wrapper").style.width = textareaWidth + "px"; 
		});

		// Scrubbing
		$(Circle.path).on('mousedown', function (e) {
			Index.scrub(e, 100);
			$(document).on('mousemove', function (e) {
				Index.scrub(e, 1);
			});
			$(document).on('mouseup', function(){
				$(document).off('mousemove').off('mouseup');
			});
		});

		// Volume controls
		$('#volume-control').on('mousedown', function (e) {
			var volume = function (e) {
				var parentOffset = $('#volume-control').offset(); 
				var relX = e.pageX - parentOffset.left;
				var vol = relX / 1.5;
				if (vol > 100) {
					vol = 100;
				} else if (vol <= 0) {
					vol = 0;
					$('.vol-icon').removeClass('fa-volume-up fa-volume-down').addClass('fa-volume-off');
				} else if (vol > 0 && vol < 60) { 
					$('.vol-icon').removeClass('fa-volume-up fa-volume-off').addClass('fa-volume-down');
				} else if (vol >= 60 && vol <= 100) {
					$('.vol-icon').removeClass('fa-volume-off fa-volume-down').addClass('fa-volume-up');
				}
				$('#volume-bar').css('width', (vol) + "%");
				Song.setVolume(vol/100);
			}
			volume(e);
			$(document).on('mousemove', function (e) {
				volume(e);
			});
			$(document).on('mouseup', function(){
				$(document).off('mousemove').off('mouseup');
			});
		});
		$('.vol-icon').on('click', function (e) {
			e.preventDefault();
			if ( $(this).hasClass('fa-volume-off') ) {
				$(this).removeClass('fa-volume-off').addClass('fa-volume-up');
				Song.setVolume(0.6);
				$('#volume-bar').css('width', '60%');
			} else {
				$(this).removeClass('fa-volume-up fa-volume-down').addClass('fa-volume-off');
				Song.setVolume(0);
				$('#volume-bar').css('width', '0%');
			}
		});

		// Load more songs
		$('#load-more-songs').off('click');
		$('#load-more-songs').click(function(){
			var num_songs = $('.song').length - 1; // Get songs minus the load more button
			var data = $.ajax({
				type: 'GET',
				url: '/more/' + num_songs,
				complete: function (data) {
					var html = data.responseText
					$('.song').eq(num_songs - 1).after(html); // -1 because arrays
					Index.songEvents();
				},
				error: function (error) {
					console.log(error)
				}
			})
				// .done(function (data){
				// 	console.log(data)
				// })
		});
	},
	songEvents : function () {
		// Load and play songs from sidebar
		$('.just-loaded .song-info, .just-loaded img').on('click', function (e){
			e.preventDefault();
			$this = $(this).parent('.song');
			var albumArt = $this.find('img').attr('src');
			var song = $this.data('title');
			var artist = $this.data('artist');
			currentUrl = $this.data('sc-url');
			Index.updatePlayer(albumArt, song, artist);
			Index.streamTrack(currentUrl, "play");
		});

		$('.just-loaded .fa-heart').on('click', function (e) {
			e.preventDefault();
			$(this).parents('.song').toggleClass('fav');
		});

		$('.just-loaded').removeClass('just-loaded');
	},
	setupScrubbing : function () {
		// Get values for player circle to do scrubbing calculations
		circleOffset = $(Circle.path).offset();	
		circleWidth = $('#album').width();	
		circleHeight = $('#album').height();	
		circleCenterX = circleOffset.left + circleWidth / 2;	
		circleCenterY = circleOffset.top + circleHeight / 2;
	},
	scrub : function (e, speed) {
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
			duration: speed,
		});
	},
	updatePlayer : function (albumArt, song, artist) {
		$('image').attr('xlink:href', albumArt);
		$('#title').html(song);
		$('#artist').html(artist)
	},
	setupLoadingDiv: function () {						
		$('#loading').css({
			'width': circleWidth,
			'height': circleHeight - 4,
			'left': circleOffset.left - 7,
			'top': circleOffset.top - 7,
			'border-radius': '100%'
		});
		$('.spinner').css('margin', (circleHeight / 2) - 10 + 'px auto 0');
	},
	streamTrack : function (url, action) {
		var action = action || 'load';
		$('#loading').fadeIn();
		SC.get('/resolve', { url: url }, function (track) {
			Track = track;
			SC.stream('/tracks/' + Track.id, function (song) {
				// Fade out loading status
				$('#loading').fadeOut(function(){
					// Sets up the loading div on first load
					if(action === 'load') {
						Index.setupLoadingDiv();
					}
				});
				if (Song != undefined) Song.stop();
				Song = song;
				Circle.animate(0, {
					duration: 1,
				});
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
		Index.streamTrack(currentUrl, "load");

		window.setInterval(Index.setupProgressBar, 1000);
		window.setInterval(Index.autoAdvance, 1000);

		// Set up events
		Index.pageEvents();
		Index.songEvents();
	}
}

Index.init();