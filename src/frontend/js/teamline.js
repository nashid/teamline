(function() {

	// === data ===
	// deliverables: { d1: { due: ..., release: ... }, ... },
	// teams: { team1: { d1: {  }, ... } }    }
	// === deliverable ===
	// ctbDist: "0.5783", cvgGrd: "97.2800", grd:"99.4560", pGrd: "100.0000", users: {...}
	var globalData;

	// Global state object and core of the application.
	// Format: { deliverableName: (names in settings.deliverables), view: (names in settings.view), teamName: (name of team) }
	// With a global state object we can easily upgrade to use the History API is we want.
	var currentState;

	// Configuration settings
	var settings = {
		teamlineDataPath: '../../data/teamline-data-mini.json',
		deliverables: ['d1', 'd2', 'd3'],
		views: { team: 'team', overview: 'overview' },
		overviewBackground: { hue: 111, saturation: 78, luminance: 50 },
		overviewColumns: 8,
		width: 500,
		height: 600,
		margin: {top: 0, right: 60, bottom: 50, left: 100},
		//legendMargin: {top: 10, right: 80, left: 0, bottom: 30},
		marginTopToXAxis: 80, // TODO: don't know how to calculate this
		tooltipDateFormat: 'MMMM Do YYYY, h:mm:ss a',
		buttonAllLabel: 'all'
	};

	// Selectors for a few elements
	var select = {
		container: '#teamline',
		chart: '#grade-chart',
		overview: '#teamline-overview table',
		buttons: '#teamline-buttons',
		backToOverview: '.back-to-overview',
		teamlineCharts: '#teamline-charts'
	};

	// Some generators for field-specific chart properties
	var props = {
		passRate: {
			label: function (username) {
				if (username) {
					return username + ' pass rate contribution';
				} else {
					return 'Team pass rate';
				}
			},
			color: '#ff7f0e'
		},
		coverage: {
			label: function (username) {
				if (username) {
					return username + ' coverage contribution';
				} else {
					return 'Team coverage';
				}
			},
			color: '#667711'
		},
		grade: {
			label: function() {
				return 'Team grade';
			},
			color: 'blue'
		}
	};

	// Handlebars templates
	var templates = {
		tooltip: Handlebars.compile($("#tooltip-template").html()),
		buttons: Handlebars.compile($("#buttons-template").html())
	};

	function createChartData(type, commits, username) {
		var values = $.map(commits, function(commit) {
			var commitClone = $.extend({}, commit);
			return $.extend(commitClone, {
				username: username,
				type: type
			});
		});
		return {
			key: props[type].label(username),
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

	function getChartId(username) {
		return 'chart-'+username;
	}

	function drawChart(options) {
		nv.addGraph(function() {
			var chart = nv.models.lineChart()
				.width(settings.width)
				.height(settings.height)
				.margin(settings.margin)
				.tooltipContent(tooltip)
				.x(options.x)
				.y(options.y);

			var d3Obj = d3.select(options.selector).datum(options.data);

			chart.xAxis.tickFormat(function (percentValue) {
				return d3.format('%')(percentValue / 100);
			});

			chart.yAxis.tickFormat(function (timestamp) {
				return d3.time.format('%a, %b %d')(new Date(timestamp))
			});
			chart.yAxis.tickPadding(0);

			chart.forceX([0, 100]);
			// TODO: WORK OVER THIS!
			// 1209600000 = 2 weeks in ms; 172800000 = 1 day in ms
			chart.forceY(options.forceY);
			//chart.legend.margin(settings.legendMargin);

			d3Obj.style({width: settings.width, height: settings.height}).call(chart);

			window.chart = chart;
			nv.utils.windowResize(chart.update);
		});
	}

	function drawIndividualChart(deliverable, username, totalPassCount, chartData) {
		var $newChart = $('<svg id="'+getChartId(username)+'"></svg>');
		$(select.teamlineCharts).append($newChart);
		drawChart({
			data: [chartData[username].coverage, chartData[username].passRate],
			selector: '#' + getChartId(username),
			x: function(commit) {
				if (commit.type === 'passRate') {
					return commit.passCountAccumulated / totalPassCount * 100;
				} else {
					return commit.coverageContribAccumulated;
				}
			},
			y: function(commit) {
				return commit.timestamp;
			},
			forceY: [deliverable.due-1209600000, deliverable.due+172800000]
		});
	}

	function drawGradeChart(deliverable, chartData) {
		drawChart({
			data: [chartData.coverage, chartData.passRate, chartData.grade],
			selector: '#grade-chart',
			x: function(commit) {
				var options = {
					passRate: 100 * commit.passTests.length / (commit.passTests.length + commit.failTests.length + commit.skipTests.length),
					grade: parseFloat(commit.grade),
					coverage: parseFloat(commit.coverage)
				};
				return options[commit.type];
			},
			y: function(commit) {
				return commit.timestamp;
			},
			forceY: [deliverable.due-1209600000, deliverable.due+172800000]
		});
	}

	// Draws a team chart based on the current global state
	// TODO: need to think about deliverable start date, end date and what date range to show in the chart!
	function drawTeamCharts() {
		var data = teamData[currentState.teamName];
		var targetDeliverable = data.deliverables[currentState.deliverableName];
		var usersCommitData = targetDeliverable.users;
		var usernames = Object.keys(usersCommitData).sort();
		//var user1Data = usersCommitData[usernames[0]].beforeDeadline;
		//var user2Data = usersCommitData[usernames[1]].beforeDeadline;
		//var totalPassCount = user1Data.contribution.passCount + user2Data.contribution.passCount;
		var totalPassCount = 0, individualChartData = {}, allCommits = [];

		$.each(usernames, function(index, username) {
			var userCommitData = usersCommitData[username].beforeDeadline;
			totalPassCount += userCommitData.contribution.passCount;
			addAccumulatedData(userCommitData.commits);
			allCommits = allCommits.concat(userCommitData.commits);
			individualChartData[username] = {
				passRate: createChartData('passRate', userCommitData.commits, username),
				coverage: createChartData('coverage', userCommitData.commits, username)
			};
		});

		allCommits.sort(function(commit1, commit2) {
			return commit1.timestamp - commit2.timestamp;
		});

		drawGradeChart(targetDeliverable, {
			grade: createChartData('grade', allCommits),
			passRate: createChartData('passRate', allCommits),
			coverage: createChartData('coverage', allCommits)
		});

		$.each(usernames, function(index, username) {
			drawIndividualChart(targetDeliverable, username, totalPassCount, individualChartData);
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
			drawTeamCharts();
		} else {
			createOverview();
		}
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
		$(window).trigger('teamline.state.updated');
		$(select.buttons).find('button[data-deliverable="'+stateObj.deliverableName+'"]')
			.addClass('active').siblings().removeClass('active');
	}

	$.getJSON(settings.teamlineDataPath, function(data) {
		var buttons;
		globalData = data;
		buttons = Object.keys(globalData.deliverables);
		buttons.push(settings.buttonAllLabel);
		addButtons(buttons);
		//updateState({ deliverableName: 'd1', view: 'overview' }); // show overview on page load
		updateState({ deliverableName: 'd1', view: settings.views.team, teamName: 'team178' }); // show team on page load
	});

	$(window).on('teamline.state.updated', function(e) {
		console.log('STATE UPDATE');
	});

	$(select.buttons).on('click', 'button', onButtonClick);
	$(select.overview).on('click', 'td', onOverviewTdClick);
	$(select.container).on('click', select.backToOverview, onBackToOverviewClick);

}());