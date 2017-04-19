(function() {

	// Global state object and core of the application.
	// Format: { deliverableName: (names in settings.deliverables), view: (names in settings.view), teamName: (name of team) }
	// With a global state object we can easily upgrade to use the History API is we want.
	var currentState;

	// Save the data for teams with the teamName as key when fetched
	var teamData = {};

	// Store overview data
	var overviewData;

	// Configuration settings
	var settings = {
		deliverables: ['d1', 'd2', 'd3'],
		views: { team: 'team', overview: 'overview' },
		overviewBackground: { hue: 111, saturation: 78, luminance: 50 },
		overviewColumns: 8,
		width: 700,
		height: 800,
		margin: {top: 0, right: 60, bottom: 50, left: 100},
		legendMargin: {top: 10, right: 80, left: 0, bottom: 30},
		marginTopToXAxis: 80, // TODO: don't know how to calculate this
		tooltipDateFormat: 'MMMM Do YYYY, h:mm:ss a'
	};

	// Selectors for a few elements
	var select = {
		container: '#teamline',
		chart: '#teamline-chart svg',
		overview: '#teamline-overview table',
		buttons: '#teamline-buttons',
		backToOverview: '.back-to-overview'
	};

	// Some generators for field-specific chart properties
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

	// Handlebars templates
	var templates = {
		tooltip: Handlebars.compile($("#tooltip-template").html()),
		buttons: Handlebars.compile($("#buttons-template").html())
	};

	// Converts the given contributionArray to a data structure required by NVD3.
	// type refers to the field being display, i.e. either 'passRate' or 'coverage' for now.
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

	// Adds the accumulated fields that aren't available on the data
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

	// Generates the HTML for the tooltips upon hover using Handlebars templating
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

	// Adds the deliverable buttons to the DOM
	function addButtons(deliverables) {
		var buttons = [];
		$.each(deliverables, function(index, deliverable) {
			buttons.push({deliverable: deliverable, label: deliverable.toUpperCase(), classes: index === 0 ? 'active' : ''});
		});
		var renderedTemplate = templates.buttons({buttons: buttons});
		$('#teamline-buttons').append(renderedTemplate);
	}

	// Draws a team chart based on the current global state
	// TODO: need to think about deliverable start date, end date and what date range to show in the chart!
	function drawTeamChart() {
		var data = teamData[currentState.teamName];
		var targetDeliverable = data.deliverables[currentState.deliverableName];
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
			var chart = nv.models.lineChart()
				.width(settings.width)
				.height(settings.height)
				.margin(settings.margin)
				.x(x).y(y)
				.tooltipContent(tooltip);

			var d3Obj = d3.select(select.chart).datum([
				chartData.user1.coverage, chartData.user2.coverage,
				chartData.user1.passRate, chartData.user2.passRate
			]);

			chart.xAxis.tickFormat(function(percentValue) {
				percentValue *= percentValue < 0 ? -1 : 1;
				return d3.format('%')(percentValue / 100);
			});

			chart.yAxis.tickFormat(function(timestamp) {
				return d3.time.format('%a, %b %d')(new Date(timestamp))
			});

			chart.forceX([-100,100]);
			// TODO: WORK OVER THIS!
			// 1209600000 = 2 weeks in ms; 172800000 = 1 day in ms
			chart.forceY([targetDeliverable.due-1209600000, targetDeliverable.due+172800000]);
			chart.legend.margin(settings.legendMargin);

			d3Obj.style({width: settings.width, height: settings.height}).call(chart);

			window.chart = chart;
			nv.utils.windowResize(chart.update);

		});
	}

	// Creates the overview table
	// TODO: luminance for table cell background is currently based on random generated numbers!
	function createOverview() {
		var count;
		var background,
			h = settings.overviewBackground.hue,
			s = settings.overviewBackground.saturation,
			l = settings.overviewBackground.luminance;

		var $tr = $('<tr>'), $td;
		// Calculate a value 0 <= X <= 50 which is added to the base luminance in settings.overviewBackground
		// 50% luminance = 100% grade; 100% luminance = 0% grade
		var getLuminanceDiff = function() {
			var grade = Math.random() * 100; // TODO
			return (grade - 100) * (-1);
		};
		for (count = 1; count < 200; count++) {
			background = 'hsl('+h+','+s+'%,'+(l+getLuminanceDiff())+'%)';
			$td = $('<td>').attr('data-teamname', 'team'+count).css({background: background}).text('Team'+count);
			$tr.append($td);
			if ($tr.children().length === settings.overviewColumns) {
				$(select.overview).append($tr);
				$tr = $('<tr>');
			}
		}
	}

	// Always call this when something in the view needs to update, i.e. when the global state has changed
	function updateView() {
		$(select.chart+','+select.overview).html('');
		$(select.container).attr('data-view', currentState.view);
		if (currentState.view === settings.views.team) {
			drawTeamChart();
		} else {
			createOverview();
		}
	}

	// Load data based on the current global state, save the results in our global data structures and
	// call the callback if given
	function loadData(callback) {
		var path = '../../data/';
		if (currentState.view === settings.views.overview) {
			path += 'overview.json';
		} else {
			path += currentState.teamName + '.json';
		}
		d3.json(path, function(error, data) {
			if (currentState.view === settings.views.team) {
				teamData[currentState.teamName] = data;
			} else {
				overviewData = data;
			}
			callback && callback();
		});
	}

	// Called when a deliverable button was clicked
	function onButtonClick(e) {
		var $button = $(this);
		if (!$button.hasClass('active')) {
			updateState({ deliverableName: $(this).data('deliverable') });
			updateView();
		}
	}

	// Called when a cell in the overview was clicked
	function onOverviewTdClick(e) {
		var $td = $(this);
		var teamName = $td.attr('data-teamname');
		updateState({ view: settings.views.team, teamName: teamName });
		if (!teamData[teamName]) {
			loadData(updateView);
		} else {
			updateView();
		}
	}

	// Called when the "back to overview" link was clicked
	function onBackToOverviewClick(e) {
		e.preventDefault();
		updateState({ view: 'overview' });
		if (!overviewData) {
			loadData(updateView);
		} else {
			updateView();
		}
	}

	// Central function for changing the global state. The state is extended by the given object, which means
	// we don't need to pass all the information all the time.
	function updateState(stateObj) {
		currentState = $.extend(currentState, stateObj);
		$(select.buttons).find('button[data-deliverable="'+stateObj.deliverableName+'"]')
			.addClass('active').siblings().removeClass('active');
	}

	// The following statements are executed on page load. We don't need a DOMReady event because our script
	// is included at the end of <body>.

	// Add the deliverable buttons
	addButtons(settings.deliverables);

	// Set the initial global state
	updateState({ deliverableName: 'd1', view: 'overview' }); // show overview on page load
	// updateState({ deliverableName: 'd1', view: settings.views.team, teamName: 'team78' }); // show team on page load

	// Load the data for the initial state and call updateView when done
	loadData(updateView);

	// Attach event listeners
	$(select.buttons).on('click', 'button', onButtonClick);
	$(select.overview).on('click', 'td', onOverviewTdClick);
	$(select.container).on('click', select.backToOverview, onBackToOverviewClick);

}());