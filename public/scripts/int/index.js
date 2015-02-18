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
			$.post('/login',
				$('#login-form').serialize()
			);
		});
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