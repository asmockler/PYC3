/* 
 *  Creates a new song object to be worked with.
 *  Mostly used to store song information for easy access.
 *  Accepts a jQuery object as a parameter.
 */

var Song = function Song ( reference, action, callback ) {
	var action = action || 'load';
	var deferredObject = $.Deferred();
	var $this = this;

	this.albumArt = reference.find("img").attr('src');
	this.title = reference.data('title');
	this.artist = reference.data('artist');
	this.slug = reference.data('slug');
	this.url = reference.data('sc-url');

	this.init(this.url, deferredObject);
	deferredObject.done(function (scSong) {
		$.extend( $this, scSong );
		if (action === 'play') { 
			$this.play();
			if ( $('.fay-play-default').attr('data-fay-play') == "true" ) {
				$('.fay-play-default').triggerHandler('click');
			}
		}

		$('.active').removeClass('active');
		$('.song[data-sc-url="' + $this.url + '"]').addClass('active');

		callback();
	});
}

Song.prototype = {
	init : function ( url, deferredObject ) {
		SC.get('/resolve', { url: url }, function (track) {
			SC.stream('/tracks/' + track.id, function (song) {
				deferredObject.resolve(song);
			});
		});
	}
}