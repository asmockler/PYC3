var Index = function Index () {
	Fay.init();
	this.events();
}

Index.prototype = {
	events : function () {
		$('.fay-play-default').on('click', function (e){
			if (song.getState() == "playing") {
				song.pause();
			} else {
				song.play();
			}
		});

		$('#share').on('show.bs.modal', function() {
			$('#share-label>span').html(song.title);
			$('#soundcloud-share-text').val(song.url);
			$('#pyc-share-text').val("http://www.provoyachtclub.com/track/" + song.slug);
		});

		$('#login-submit').on('click', function(e){
			e.preventDefault();
			$.ajax({
				type : 'POST',
				url  : '/login',
				data : $('#login-form').serialize(),
				dataType : 'json',
				success: function(data) {
					sidebar.reloadSidebar(data)
					$('#login').modal('hide');
				},
				error: function(error) {
					this.loginError(error);
				}
			});
		});
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

var player, sidebar, index, song;

SC.initialize({ client_id: '91a4f9b982b687d85c9d42e2f4991a09' });

song = new Song($('.song').eq(0), "load", function () {
	player = new Player();
	sidebar = new Sidebar();
	index = new Index();
	$('#loading').fadeOut(function () {
		player.setupLoadingDiv();
	});
});