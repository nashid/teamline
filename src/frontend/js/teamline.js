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
		margin: {top: 20, right: 50, bottom: 0, left: 50},
		//legendMargin: {top: 10, right: 80, left: 0, bottom: 30},
		marginTopToXAxis: 80, // TODO: don't know how to calculate this
		tooltipDateFormat: 'MMMM Do YYYY, h:mm:ss a',
		buttonAllLabel: 'all'
	};

	// Selectors for a few elements
	var select = {
		container: '#teamline',
		chart: '#grade-chart',
		chartUser1: '#user-chart-1',
		chartUser2: '#user-chart-2',
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

	// Generates the HTML for the tooltips upon hover using Handlebars templating
	function tooltip(object) {
		var point = object.point;
		var items = [
			{ label: 'Time', value: moment(point.time).format(settings.tooltipDateFormat) },
			{ label: 'Grade', value: point.grd },
			{ label: 'Passed Tests', value: point.pCnt },
			{ label: 'Failed Tests', value: point.fCnt },
			{ label: 'Skipped Tests', value: point.sCnt },
			{ label: 'Coverage', value: point.cvg }
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
		var $container = $(options.containerSelector);
		var chartSelector = options.containerSelector + ' svg';
		var $chart = $(chartSelector);
		var deliverable = globalData.deliverables[currentState.deliverableName];
		var updateSize = function(d3obj, chart) {
			var width = $container.width();
			var height = $container.height();
			chart.width(width);
			chart.height(height);
			d3obj.style({width: width, height: height}).call(chart);
			console.log('RESIZE');
		};

		nv.addGraph(function() {
			var chart = nv.models.lineChart()
				.margin(options.margin || {top: 0, right: 0, bottom: 0, left: 5})
				.tooltipContent(options.tooltip || tooltip)
				.x(options.x)
				.y(options.y)
				.showLegend(false)
				.showYAxis(options.showYAxis !== false)
				.showXAxis(options.showXAxis !== false);

			var d3obj = d3.select(chartSelector).datum(options.data);

			chart.xAxis.tickFormat(function(percentValue) {
				return d3.format('%')(percentValue / 100);
			});
			chart.xAxis.tickPadding(options.xTickPadding || 0);

			chart.yAxis.tickFormat(function(timestamp) {
				return d3.time.format('%b %d')(new Date(timestamp))
			});
			chart.yAxis.tickPadding(options.yTickPadding || 0);
			chart.forceX(options.forceX);

			chart.forceX([0, 110]);
			// TODO: WORK OVER THIS!
			// 1209600000 = 2 weeks in ms; 172800000 = 1 day in ms
			chart.forceY([deliverable.release-172800000, deliverable.due+172800000]);
			//chart.legend.margin(settings.legendMargin);

			$chart.data({d3obj: d3obj, nvd3obj: chart});

			updateSize(d3obj, chart);

			nv.utils.windowResize(function() {
				updateSize(d3obj, chart);
			});
		});
	}

	function drawGradeChart(containerSelector, chartData) {
		drawChart({
			containerSelector: containerSelector,
			margin: {top: 0, right: 0, bottom: 0, left: 50},
			data: [chartData.coverage, chartData.passRate, chartData.grade],
			x: function(commit) {
				var options = {
					passRate: parseFloat(commit.pPct),
					grade: parseFloat(commit.grd),
					coverage: parseFloat(commit.cvg)
				};
				return options[commit.type];
			},
			y: function(commit) {
				return commit.time;
			},
			xTickPadding: -15,
			yTickPadding: 5
		});
	}

	function drawIndividualChart(containerSelector, username, chartData, options) {
		var userChartData = chartData[username];
		var defaults = {
			containerSelector: containerSelector,
			data: [userChartData.coverage, userChartData.passRate],
			x: function(commit) {
				if (commit.type === 'passRate') {
					return parseFloat(commit.pCtbAcc);
				} else {
					return parseFloat(commit.cvgCtbAcc);
				}
			},
			y: function(commit) {
				return commit.time;
			},
			xTickPadding: -15,
			yTickPadding: 5
		};
		drawChart($.extend(defaults, options));
	}

	// Draws a team chart based on the current global state
	// TODO: need to think about deliverable start date, end date and what date range to show in the chart!
	function drawTeamCharts() {
		var teamData = globalData.teams[currentState.teamName];
		var targetDeliverable = teamData[currentState.deliverableName];
		var userData = targetDeliverable.users;
		var usernames = Object.keys(userData).sort();
		//var user1Data = usersCommitData[usernames[0]].beforeDeadline;
		//var user2Data = usersCommitData[usernames[1]].beforeDeadline;
		var individualChartData = {}, allCommits = [];

		$.each(usernames, function(index, username) {
			var userCommits = userData[username].commits;
			allCommits = allCommits.concat(userCommits);
			individualChartData[username] = {
				passRate: createChartData('passRate', userCommits, username),
				coverage: createChartData('coverage', userCommits, username)
			};
		});

		allCommits.sort(function(commit1, commit2) {
			return commit1.time - commit2.time;
		});


		drawGradeChart('#grade-chart-container', {
			grade: createChartData('grade', allCommits),
			passRate: createChartData('passRate', allCommits),
			coverage: createChartData('coverage', allCommits)
		});

		drawIndividualChart('#user-chart-1-container', usernames[0], individualChartData);
		drawIndividualChart('#user-chart-2-container', usernames[1], individualChartData);


		// drawGradeChart('#user-chart-1-container', {
		// 	grade: createChartData('grade', allCommits),
		// 	passRate: createChartData('passRate', allCommits),
		// 	coverage: createChartData('coverage', allCommits)
		// });
		//
		// drawGradeChart('#user-chart-2-container', {
		// 	grade: createChartData('grade', allCommits),
		// 	passRate: createChartData('passRate', allCommits),
		// 	coverage: createChartData('coverage', allCommits)
		// });


		$.each(usernames, function(index, username) {
			var containerSelector = '.gallery-chart-container[data-username="'+username+'"]';
			var $chartContainer = $('<div class="gallery-chart-container" data-username="'+username+'">');
			var $svg = $('<svg class="gallery-chart"></svg>');
			$chartContainer.append($svg);
			$('#teamline-gallery').append($chartContainer);
			drawIndividualChart(containerSelector, username, individualChartData, {
				showYAxis: false,
				showXAxis: false,
				tooltip: $.noop
			});
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
	}

	// Central function for changing the global state. The state is extended by the given object, which means
	// we don't need to pass all the information all the time.
	function updateState(stateObj) {
		currentState = $.extend(currentState, stateObj);
		$(window).trigger('teamline.state.updated');
	}

	$.getJSON(settings.teamlineDataPath, function(data) {
		var buttons, bodyHeight = $(document.body).outerHeight();
		globalData = data;
		buttons = Object.keys(globalData.deliverables);
		buttons.push(settings.buttonAllLabel);
		$(select.container).height(bodyHeight).addClass('visible');
		addButtons(buttons);
		//updateState({ deliverableName: 'd1', view: 'overview' }); // show overview on page load
		updateState({ deliverableName: 'd2', view: settings.views.team, teamName: 'team178' }); // show team on page load
	});

	$(window).on('teamline.state.updated', function(e) {
		$('#teamline-gallery, svg').html('');
		$(select.container).attr('data-view', currentState.view);
		$(select.buttons).find('button[data-deliverable="'+currentState.deliverableName+'"]')
			.addClass('active').siblings().removeClass('active');
		if (currentState.view === settings.views.team) {
			drawTeamCharts();
		}
	});

	$(select.buttons).on('click', 'button', onButtonClick);
	$(select.overview).on('click', 'td', onOverviewTdClick);
	$(select.container).on('click', select.backToOverview, onBackToOverviewClick);

}());