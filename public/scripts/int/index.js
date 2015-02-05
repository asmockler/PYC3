var Index = {
	init: function() {
		$('#album').innerHTML = '<object id="scene" type="image/svg+xml" data="images/moon-scene.svg"></object>';
		var circle = new ProgressBar.Circle('#album', {
		    color: '#FFF',
		    strokeWidth: 2,
		    fill: 'url(\'#image\')',
		    duration: 1000,
		    trailColor: "rgba(0,0,0,0)",
		    trailWidth: 2,
		    text: {
		    	value: 'SONG TITLE\r\nSONG ARTIST',
		    	//color: '#f00',
		    	autoStyle: true,
		    	//className: 'progress-text'
	        },
		});

		circle.animate(.5, function() {
			circle.animate(.75);
		});
	}
}

Index.init();