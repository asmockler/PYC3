var Index = function Index () {
	SC.initialize({ client_id: '91a4f9b982b687d85c9d42e2f4991a09' });

	song = new Song($('.song').eq(0), "load", function () {
		player = new Player();
		sidebar = new Sidebar();
		$('#loading').fadeOut(function () {
			player.setupLoadingDiv();
		});
	});
}

Index.prototype = {
	
}

var player, sidebar, index, song;

index = new Index();