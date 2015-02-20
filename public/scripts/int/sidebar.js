var Sidebar = function Sidebar () {
	this.events();
}

Sidebar.prototype = {
	events : function () {
		var $this = this;
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
					$this.events();
				},
				error: function (error) {
					console.log(error)
				}
			});
		});

		$('.just-loaded .song-info, .just-loaded img').on('click', function (e){
			e.preventDefault();
			$('#loading').fadeIn();
			var target = $(this).parents('.song');
			song.stop();
			song = new Song ( target, "play", function () {
				player.update();
				$('#loading').fadeOut();
			});
		});

		$('.just-loaded .fa-heart').on('click', function (e) {
			e.preventDefault();
			if ( $(this).parents('.song').hasClass('fav') ) {
				$this.unfavoriteSong($(this));
			} else {
				$this.favoriteSong($(this));
			}
		});

		$('.just-loaded').removeClass('just-loaded');
	},
	/*
	 *  Receives data from ajax call to update favorites
	 */
	reloadSidebar : function(data) {
		$('.song').not( document.getElementById('load-more-songs') ).remove();
		$('#load-more-songs').before(data.template);
		$('.user').html('Logged in as ' + data.name);
		this.events();
	},
	favoriteSong : function( element ) {
		element.parents('.song').addClass('fav');
		var slug = element.parents('.song').attr('data-slug');
		$.ajax({
			type: 'POST',
			url: '/favorite/favorite/' + slug,
			complete: function(data) {

			},
			error: function(error) {
				element.parents('.song').removeClass('fav');
				if (error.status === 401 || error.status === 404) {
					$('#login').modal('show')
				}
			}
		})
	},
	unfavoriteSong : function( element ) {
		element.parents('.song').removeClass('fav');
		var slug = element.parents('.song').attr('data-slug');
		$.ajax({
			type: 'POST',
			url: '/favorite/unfavorite/' + slug,
			complete: function(data) {

			},
			error: function(error) {
				element.parents('.song').addClass('fav');
				if (error.status === 401 || error.status === 404) {
					$('#login').modal('show')
				}
			}
		})
	}
}