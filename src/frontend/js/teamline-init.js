(function() {

	d3.json("data/team78.json", function(error, data) {

		var usersCommitData = data.deliverables.d1.users;
		var userNames = Object.keys(usersCommitData).sort();
		var user1Data = usersCommitData[userNames[0]].beforeDeadline;
		var user2Data = usersCommitData[userNames[1]].beforeDeadline;

		var user1Contribution = [];
		var accumulated = 0;
		$.each(user1Data, function() {

		});


		function beforeDraw(env) {
			var chart = env.nvd3Obj;
			chart.xAxis.tickFormat(function(d) {
				var dx = data[0].values[d] && data[0].values[d][0] || 0;
				return d3.time.format('%x')(new Date(dx))
			});
			chart.y1Axis.tickFormat(d3.format(',f'));
			chart.y2Axis.tickFormat(function(d) { return '$' + d3.format(',f')(d) });
			chart.bars.forceY([0]);
		}

		Teamline.chart('linePlusBarChart', {
			data: data,
			width: 1200,
			height: 400,
			margin: {top: 30, right: 60, bottom: 50, left: 70},
			// Taken from NVD3 example...
			x: function(d,i) { return i },
			y: function(d,i) { return d[1] },
			focusEnable: false,
			beforeDraw: beforeDraw
		});

	});

}());