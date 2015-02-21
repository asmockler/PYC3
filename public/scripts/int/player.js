var Player = function Player () {
	
	this.circle = new ProgressBar.Circle('#album', {
	    color: '#FFF',
	    strokeWidth: 3,
	    fill: 'url(\'#image\')',
	    duration: 1000,
	    easing: 'linear',
	    trailColor: "rgba(0,0,0,.5)"
	});

	this.volume = 1;

	this.shuffle = false;
	this.playedShuffle = [];

	this.update();
	this.setupScrubbing();
	this.events();

	$this = this; // window.setInterval changes the scope of this to window, so there needs to be another way to access the object
	window.setInterval(function() {$this.updateProgressBar($this)}, 1000);
	window.setInterval(function() {$this.autoAdvance($this)}, 1000);

	Fay.init();
}

Player.prototype = {
	update : function () {
		$('image').attr('xlink:href', song.albumArt);
		$('#title').html(song.title);
		$('#artist').html(song.artist);
		$('#song-info').attr('data-current-slug', song.slug);
		document.title = song.title + " - " + song.artist + " | Provo Yacht Club";
		this.circle.animate(0, {duration: 1});	
		song.setVolume(this.volume);
	},
	events : function () {
		var $this = this;
		$(window).on('resize', function() {
			$this.setupScrubbing();
			$this.setupLoadingDiv();
		});

		$(this.circle.path).on('mousedown', function (e) {
			$this.scrub(e, 100);
			$(document).on('mousemove', function (e) {
				$this.scrub(e, 1);
			});
			$(document).on('mouseup', function(){
				$(document).off('mousemove').off('mouseup');
			});
		});

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
				song.setVolume(vol/100);
				$this.volume = vol/100;
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
				song.setVolume(0.6);
				$this.volume = 0.6;
				$('#volume-bar').css('width', '60%');
			} else {
				$(this).removeClass('fa-volume-up fa-volume-down').addClass('fa-volume-off');
				song.setVolume(0);
				$this.volume = 0;
				$('#volume-bar').css('width', '0%');
			}
		});

		// Play button
		$('.fay-play-default').on('click', function (e){
			if (song.getState() == "playing") {
				song.pause();
			} else {
				song.play();
			}
		});
		$(window).keyup(function (e){
			if (e.keyCode == 0 || e.keyCode == 32) {
				e.preventDefault();
				if ( song.getState() === 'playing' ) {
					song.pause();
				} else if ( song.getState() === 'paused' || song.getState() === 'idle' ) {
					song.play();
				}

				$('.fay-play-default').triggerHandler('click');
			}
			else if (e.keyCode == 37) {
				e.preventDefault()
				$this.previousSong();
			}
			else if (e.keyCode == 39) {
				e.preventDefault();
				$this.nextSong();
			}
		});

		$('.fa-backward').on('click', function (e) {
			e.preventDefault();
			$this.previousSong();
		});

		$('.fa-forward').on('click', function (e) {
			e.preventDefault();
			$this.nextSong();
		});

		$('#random').off('click');
		$('#random').on('click', function (e) {
			if ( $('.song').length < 25 ) {
				var numToLoad = 25 - $('.song').length;
				sidebar.loadMoreSongs(numToLoad)
			}

			if (player.shuffle == true) {
				player.shuffle = false;
				player.playedShuffle = [];
				$('#random').removeClass('on');
			} else {
				player.shuffle = true;
				$('#random').addClass('on');
			}
		})

		// Share button
		$('#share').on('show.bs.modal', function() {
			$('#share-label>span').html(song.title);
			$('#soundcloud-share-text').val(song.url);
			$('#pyc-share-text').val("http://www.provoyachtclub.com/track/" + song.slug);
		});
	},
	setupScrubbing : function () {
		this.circleOffset = $(this.circle.path).offset();	
		this.circleWidth = $('#album').width();	
		this.circleHeight = $('#album').height();	
		this.circleCenterX = this.circleOffset.left + this.circleWidth / 2;	
		this.circleCenterY = this.circleOffset.top + this.circleHeight / 2;
	},
	scrub : function (e, speed) {
		// Get absolute click coordinates
		var x = e.clientX;
		var y = e.clientY;

		// Find circumference of clicked circle
		var PI = Math.PI;
		var radius = Math.sqrt(Math.pow((x - this.circleCenterX), 2) + Math.pow((y - this.circleCenterY), 2));
		var circumference = 2*PI*radius;

		// Get the coordinates for 12 oclock line
		var topOfCircleX = 0;
		var topOfCircleY = radius;

		// Get angle between clicked point vector and 12 oclock
		var v1 = {x: 0, y: radius}, v2 = {x: (x - this.circleCenterX), y: (this.circleCenterY - y)},
		    angleRad = Math.acos( (v1.x * v2.x + v1.y * v2.y) / ( Math.sqrt(v1.x*v1.x + v1.y*v1.y) * Math.sqrt(v2.x*v2.x + v2.y*v2.y) ) ),
		    angleDeg = angleRad * 180 / Math.PI;

	    // Return the angle on 360 degree scale
		if ( (x - this.circleCenterX) < 0 ) {
			var actualAngle = 360 - angleDeg;
		} else {
			var actualAngle = angleDeg;
		}
		var seekPercent = actualAngle / 360;
		song.seek(seekPercent * song.getDuration());
		this.circle.animate(seekPercent, {
			duration: speed,
		});
	},
	setupLoadingDiv : function () {
		$('#loading').css({
			'width': this.circleWidth,
			'height': this.circleHeight - 4,
			'left': this.circleOffset.left - 7,
			'top': this.circleOffset.top - 7,
			'border-radius': '100%'
		});
		$('.spinner').css('margin', (this.circleHeight / 2) - 10 + 'px auto 0');
	},
	updateProgressBar : function (scope) {
		if (typeof song.getState == 'function') {
			$this = scope;
			if (song.getState() == "playing") {
				var position = song.getCurrentPosition() / song.getDuration();
				$this.circle.animate(position);
			}
		}
	},
	autoAdvance : function () {
		if (typeof song.getState == 'function') {
			if (song.getState() === 'ended' ) {
				this.nextSong();
			}
		}
	},
	randomSong : function () {
		if ( $('.song').length - 1 > this.playedShuffle.length ) {
			$('#loading').fadeIn();
			numberofSongs = $('.song').length - 1;
			do {
				songNumber = Math.floor(Math.random() * (numberofSongs));
			} while ( this.playedShuffle.indexOf(songNumber) > -1 ); // Keep picking randoms until you pick one that hasn't been played
			song = new Song( $('.song').eq(songNumber), "play", function () {
				player.update();
				$('#loading').fadeOut();
				player.playedShuffle.push(songNumber);
			});
		} else {
			$('.fay-play-default').triggerHandler('click');
		}
	},
	previousSong : function () {
		if( this.shuffle ) {
			return;
		}

		if ( !$('.song[data-sc-url="' + song.url + '"]').is( $('.song').first() ) ) {
			song.stop();
			$('#loading').fadeIn();
			var previousSong = $('.song[data-sc-url="' + song.url + '"]').prev();
			song = new Song( previousSong, "play", function () {
				player.update();
				$('#loading').fadeOut();
			});
		}
	},
	nextSong : function () {
		song.stop();

		if( this.shuffle ) {
			this.randomSong();
			return;
		}

		$('#loading').fadeIn();

		// Check if they left the page with the song; loads in the top song in the list if it can't find the current song for "next"-ing
		if ( $('.song[data-sc-url="' + song.url + '"]').length < 1 ) {
			song = new Song($('.song').first(), "play", function () {
				player.update();
				$('#loading').fadeOut();
			})
			return;
		}

		// If there are still songs in the queue, proceed as normal. Otherwise, load more and then play.
		var nextSong = $('.song[data-sc-url="' + song.url + '"]').next();
		if ( !nextSong.is($('#load-more-songs')) ) {
			song = new Song( nextSong, "play", function () {
				player.update();
				$('#loading').fadeOut();
			});
		}
		else if ( nextSong.is( $('#load-more-songs') ) ) {
			$('#load-more-songs').click();
			var findNextSong = window.setInterval(function() {
				if ( !$('.song[data-sc-url="' + song.url + '"]').next().is( $('#load-more-songs') ) ) {
					clearInterval(findNextSong);
					player.nextSong();
				}
			}, 500);
		}
	}
}


// call the setupLoadingDiv function when you fade the loading thing out the first time