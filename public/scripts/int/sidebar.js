var Sidebar = function Sidebar () {
	this.events();
}

Sidebar.prototype = {
	events : function () {
		var $this = this;
		// Load more songs
		$('#load-more-songs').off('click');
		$('#load-more-songs').click(function(){
			$this.loadMoreSongs(10);
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

		$('#user-dropdown-logout').off('click');
		$('#user-dropdown-logout').on('click', function (e){
			e.preventDefault();
			$.ajax({
				type: 'POST',
				url: '/logout',
				dataType : 'json',
				success: function (data) {
					$this.reloadSidebar(data, 'out');
				}
			})
		});

		$('#login-submit').off('click');
		$('#login-submit').on('click', function (e){
			e.preventDefault();
			$.ajax({
				type : 'POST',
				url  : '/login',
				data : $('#login-form').serialize(),
				dataType : 'json',
				success: function(data) {
					$this.reloadSidebar(data, "in")
					$('#login').modal('hide');
				},
				error: function(error) {
					$this.loginError(error);
				}
			});
		});

		$('#show-favorites').off('click');
		$('#show-favorites').on('click', function (e){
			$this.showFavorites();
		});

		$('#show-recent').off('click');
		$('#show-recent').on('click', function (e){
			$this.showRecent();
		});

		$('.just-loaded').removeClass('just-loaded');

		$('.song>img').error(function() { 
			$(this).attr('src', '/assets/provo_yacht_club2.png');
			$(this).attr('style', 'margin-top:25px');  
		});
	},
	loadMoreSongs : function (number) {
		var num_songs = $('.song').length - 1; // Get songs minus the load more button
		var data = $.ajax({
			type: 'GET',
			url: '/more/' + num_songs + '/' + number,
			complete: function (data) {
				var html = data.responseText
				$('.song').eq(num_songs - 1).after(html); // -1 because arrays
				sidebar.events();
			},
			error: function (error) {
				console.log(error)
			}
		});
	},
	reloadSidebar : function(data, action) {
		$('.song').not( document.getElementById('load-more-songs') ).remove();
		$('#load-more-songs').before(data.template);

		if ( action === "in" ) {
			$('.user').html('<div class="dropdown user-dropdown"><a href="#" class="dropdown-toggle" id="user-dropdown" data-toggle="dropdown">Logged in as <span>' + data.name + '<span class="caret"></span></span></a><ul class="dropdown-menu"><li><a href="#" id="user-dropdown-logout">Log Out</a></li></ul></div>')
			
		} 
		else if (action === "out") {
			$('.user').html('<a href="#" data-toggle="modal" data-target="#login">Log In</a>');
		}
		
		this.events();
	},
	showFavorites : function() {
		$.ajax({
			type : 'GET',
			url : '/favorites',
			dataType : 'json',
			success : function (data) {
				sidebar.reloadSidebar(data, "favorites");
				$('#player-dropdown').html('<span>Favorites <span class="caret"></span></span>');
				$('.song[data-sc-url="' + song.url + '"]').addClass('active');
			},
			error : function(error) {
				if (error.status === 401) {
					$('#login').modal('show');
				}
			}
		})
	},
	showRecent : function() {
		$.ajax({
			type : 'GET',
			url : '/recent',
			dataType : 'json',
			success : function (data) {
				sidebar.reloadSidebar(data, "recent");
				$('#player-dropdown').html('<span>Recent <span class="caret"></span></span>');
				$('.song[data-sc-url="' + song.url + '"]').addClass('active');
			}
		});
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
	},
	loginError : function (error) {
		if ( error.status === 401 ) {
			if ( $('#login .alert').length < 1 ) {
				$('#login-form').before('<div class="alert alert-danger"><strong>Uh oh...</strong> Looks like you\'ve got the wrong password</div>')
			} else {
				$('.alert').html('<strong>Uh oh...</strong> Looks like you\'ve got the wrong password')
			}
		} else if ( error.status === 404 ) {
			if ( $('#login .alert').length < 1 ) {
				$('#login-form').before('<div class="alert alert-danger"><strong>Uh oh...</strong> We couldn\'t find that user. Are you sure you have an account?</div>')
			} else {
				$('.alert').html('<strong>Uh oh...</strong> We couldn\'t find that user. Are you sure you have an account?')
			}
		}
	}
}