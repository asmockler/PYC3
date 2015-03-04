var Index = function Index () {
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