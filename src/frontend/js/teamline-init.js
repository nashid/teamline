(function() {

	var settings = {
		width: 700,
		height: 700,
		margin: {top: 0, right: 60, bottom: 50, left: 100},
		legendMargin: {top: 10, right: 80, left: 0, bottom: 30},
		marginTopToXAxis: 80 // TODO: don't know how to calculate this
	};

	var props = {
		passRate: {
			label: function (userName) {
				return userName + ' pass rate contribution';
			},
			color: '#ff7f0e'
		},
		coverage: {
			label: function (userName) {
				return userName + ' coverage contribution';
			},
			color: '#667711'
		}
	};

	function createChartData(type, userNames, userIndex, contributionArray) {
		var userName = userNames[userIndex];
		var values = $.map(contributionArray, function(commit) {
			return {
				timestamp: commit.timestamp,
				passCountAccumulated: commit.passCountAccumulated,
				coverageContribAccumulated: commit.coverageContribAccumulated,
				userIndex: userIndex,
				userName: userName,
				type: type
			};
		});
		return {
			key: props[type].label(userName),
			values: values,
			color: props[type].color
		};
	}

	function addAccumulatedData(commitsArray) {
		var passCountAccumulated = 0, coverageContribAccumulated = 0;
		$.each(commitsArray, function(index, commit) {
			passCountAccumulated += commit.passCountNew;
			coverageContribAccumulated += commit.coverageContrib;
			$.extend(commit, {
				passCountAccumulated: passCountAccumulated,
				coverageContribAccumulated: coverageContribAccumulated
			});
		});
	}


	d3.json("data/team78.json", function(error, data) {

		var targetDeliverable = data.deliverables.d1;
		var usersCommitData = targetDeliverable.users;
		var userNames = Object.keys(usersCommitData).sort();
		var user1Data = usersCommitData[userNames[0]].beforeDeadline;
		var user2Data = usersCommitData[userNames[1]].beforeDeadline;
		var totalPassCount = user1Data.contribution.passCount + user2Data.contribution.passCount;
		var chartData;

		var x = function(commit) {
			var percentValue;
			if (commit.type === 'passRate') {
				percentValue = commit.passCountAccumulated / totalPassCount * 100;
			} else {
				percentValue = commit.coverageContribAccumulated;
			}
			percentValue *= commit.userIndex === 0 ? -1 : 1;
			return percentValue;
		};

		var y = function(commit) {
			return commit.timestamp;
		};

		addAccumulatedData(user1Data.commits);
		addAccumulatedData(user2Data.commits);

		chartData = {
			user1: {
				passRate: createChartData('passRate', userNames, 0, user1Data.commits),
				coverage: createChartData('coverage', userNames, 0, user1Data.commits)
			},
			user2: {
				passRate: createChartData('passRate', userNames, 1, user2Data.commits),
				coverage: createChartData('coverage', userNames, 1, user2Data.commits)
			}
		};

		nv.addGraph(function() {
			var WIDTH = 700;
			var HEIGHT = 700;

			var chart = nv.models.lineChart()
				.width(WIDTH)
				.height(HEIGHT)
				.margin(settings.margin)
				.x(x).y(y);

			var d3Obj = d3.select('#chart svg').datum([
				chartData.user1.passRate, chartData.user2.passRate,
				chartData.user1.coverage, chartData.user2.coverage
			]);

			chart.xAxis.tickFormat(function(percentValue) {
				percentValue *= percentValue < 0 ? -1 : 1;
				return d3.format('%')(percentValue / 100);
			});

			chart.yAxis.tickFormat(function(timestamp) {
				return d3.time.format('%x')(new Date(timestamp))
			});

			chart.forceX([-100,100]);
			// 1209600000 = 2 weeks in ms; 86400000 = 1 day in ms
			chart.forceY([targetDeliverable.due-1209600000, targetDeliverable.due+86400000]);
			chart.legend.margin(settings.legendMargin);

			d3Obj.style({width: settings.width, height: settings.height}).call(chart);

			// d3.select('#chart svg').append('line')
			// 	.attr({
			// 		x1: 0,
			// 		x2: WIDTH,
			// 		y1: settings.marginTopToXAxis + chart.yAxis.scale()(targetDeliverable.due),
			// 		y2: settings.marginTopToXAxis + chart.yAxis.scale()(targetDeliverable.due)
			// 	})
			// 	.attr('class', 'duedate-line');

			//d3.select('.nv-legendWrap').attr('transform', 'translate(0, 100)');


			window.chart = chart;
			nv.utils.windowResize(chart.update);

		});

	});

}());