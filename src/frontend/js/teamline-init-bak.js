(function() {

	d3.json("data/team78.json", function(error, data) {

		var usersCommitData = data.deliverables.d1.users;
		var userNames = Object.keys(usersCommitData).sort();
		var user1Data = usersCommitData[userNames[0]].beforeDeadline;
		var user2Data = usersCommitData[userNames[1]].beforeDeadline;

		var user1PassCountAccumulated = 0, user2PassCountAccumulated = 0;
		var user1Contribution = [], user2Contribution = [];

		$.each(user1Data.commits, function(index, commit) {
			user1PassCountAccumulated += commit.passCountNew;
			user1Contribution[index] = $.extend(commit, { passCountAccumulated: user1PassCountAccumulated });
		});
		$.each(user2Data.commits, function(index, commit) {
			user2PassCountAccumulated += commit.passCountNew;
			user2Contribution[index] = $.extend(commit, { passCountAccumulated: user1PassCountAccumulated });
		});

		var user1Chart = {
			key: 'User1',
			values: []
		};

		$.each(user1Contribution, function(index, commit) {
			user1Chart.values.push({
				x: commit.passCountAccumulated,
				y: commit.passCountAccumulated
			});
		});

		function beforeDraw(env) {
			// var chart = env.nvd3Obj;
			// chart.xAxis.tickFormat(function(d) {
			// 	var dx = data[0].values[d] && data[0].values[d][0] || 0;
			// 	return d3.time.format('%x')(new Date(dx))
			// });
			// chart.yAxis.tickFormat(d3.format(',f'));
			// chart.bars.forceY([0]);
		}

		Teamline.chart('LineChart', {
			data: [user1Chart],
			width: 1200,
			height: 400,
			margin: {top: 30, right: 60, bottom: 50, left: 70},
			// Taken from NVD3 example...
			x: function(d ,i) { return i },
			y: function(d ,i) { return d[1] },
			focusEnable: false,
			beforeDraw: beforeDraw
		});

	});

}());