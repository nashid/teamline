(function() {

	var currentTeamName;
	var teamData = {};

	var settings = {
		chartSelector: '#teamline-chart svg',
		width: 700,
		height: 800,
		margin: {top: 0, right: 60, bottom: 50, left: 100},
		legendMargin: {top: 10, right: 80, left: 0, bottom: 30},
		marginTopToXAxis: 80, // TODO: don't know how to calculate this
		tooltipDateFormat: 'MMMM Do YYYY, h:mm:ss a'
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

	var templates = {
		tooltip: Handlebars.compile($("#tooltip-template").html()),
		buttons: Handlebars.compile($("#buttons-template").html())
	};

	function createChartData(type, userNames, userIndex, contributionArray) {
		var userName = userNames[userIndex];
		var values = $.map(contributionArray, function(commit) {
			var commitClone = $.extend({}, commit);
			return $.extend(commitClone, {
				timestamp: commit.timestamp,
				passCountAccumulated: commit.passCountAccumulated,
				coverageContribAccumulated: commit.coverageContribAccumulated,
				userIndex: userIndex,
				userName: userName,
				type: type
			});
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

	function tooltip(object) {
		var point = object.point;
		var items = [
			{ label: 'Time', value: moment(point.timestamp).format(settings.tooltipDateFormat) },
			{ label: 'Grade', value: point.grade },
			{ label: 'Passed Tests', value: point.passCount },
			{ label: 'Failed Tests', value: point.failCount },
			{ label: 'Skipped Tests', value: point.skipCount },
			{ label: 'Coverage', value: point.coverage }
		];
		return templates.tooltip({ items: items });
	}

	function addButtons(deliverables) {
		var buttons = [];
		$.each(Object.keys(deliverables).sort(), function(index, key) {
			buttons.push({key: key, label: key.toUpperCase(), classes: index === 0 ? 'active' : ''});
		});
		var renderedTemplate = templates.buttons({buttons: buttons});
		$('#teamline-buttons').append(renderedTemplate);
	}

	function drawChart(deliverableName) {
		var data = teamData[currentTeamName];
		var targetDeliverable = data.deliverables[deliverableName];
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

		$(settings.chartSelector).html('');

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
			var chart = nv.models.lineChart()
				.width(settings.width)
				.height(settings.height)
				.margin(settings.margin)
				.x(x).y(y)
				.tooltipContent(tooltip);

			var d3Obj = d3.select(settings.chartSelector).datum([
				chartData.user1.passRate, chartData.user2.passRate,
				chartData.user1.coverage, chartData.user2.coverage
			]);

			chart.xAxis.tickFormat(function(percentValue) {
				percentValue *= percentValue < 0 ? -1 : 1;
				return d3.format('%')(percentValue / 100);
			});

			chart.yAxis.tickFormat(function(timestamp) {
				return d3.time.format('%a, %b %d')(new Date(timestamp))
			});

			chart.forceX([-100,100]);
			// 1209600000 = 2 weeks in ms; 172800000 = 1 day in ms
			chart.forceY([targetDeliverable.due-1209600000, targetDeliverable.due+172800000]);
			chart.legend.margin(settings.legendMargin);

			d3Obj.style({width: settings.width, height: settings.height}).call(chart);

			window.chart = chart;
			nv.utils.windowResize(chart.update);

		});
	}

	function loadData(callback) {
		d3.json('data/'+currentTeamName+'.json', function(error, data) {
			teamData[currentTeamName] = data;
			addButtons(data.deliverables);
			callback();
		});
	}

	function initialize() {
		currentTeamName = 'team78';
		loadData(function() {
			drawChart('d1');
		});
	}

	function onButtonClick(e) {
		var $button = $(this);
		$button.addClass('active').siblings().removeClass('active');
		drawChart($button.data('key'));
	}

	$(document.ready).ready(function() {
		initialize();
		$('#teamline-buttons').on('click', 'button', onButtonClick);
	});

}());