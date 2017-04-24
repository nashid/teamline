(function() {

	// Cache for the global data that we load from the JSON file.
	var globalData;

	// Global state object and core of the application.
	// With a global state object we can easily upgrade to use the History API is we want.
	var currentState;

	// Configuration settings
	var settings = {
		teamlineDataPath: 'teamline-data-min.json',
		numberRegex: /\d+/,
		labels: {
			team: {
				grade: '% Grade'/*(80% Pass Rate + 20% Coverage)*/,
				passRate: '% Pass Rate'/*(against instructor-written tests)*/,
				coverage: '% Coverage'/*(of student-written tests)*/
			},
			user: {
				grade: '', // niu
				passRate: '% Contrib. to Pass Rate',
				coverage: '% Contrib. to Coverage'
			}
		},
		colors: {
			team: {
				grade: '#162eae',
				passRate: '#d95f02',
				coverage: '#1b9e77'
			},
			user: {
				grade: 'white', // niu
				passRate: '#377eb8',
				coverage: '#66a61e'
			}
		}
	};

	// Handlebars templates
	var templates = {
		tooltip: Handlebars.compile($('#tooltip-template').html()),
		buttons: Handlebars.compile($('#buttons-template').html()),
		legend: Handlebars.compile($('#legend-template').html())
	};

	// Make the first letter of the given string upper case
	function firstLetterUpperCase(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	// Central function for changing the global state. The state is extended by the given object, which means
	// we don't need to pass all the information all the time.
	function updateState(trigger, stateObj) {
		currentState = $.extend(currentState, stateObj);
		currentState.lastTrigger = trigger;
		$(window).trigger('teamline.state.updated');
	}

	// Creates proper chart data based on the given type and options
	function createChartData(type, commits, options) {
		var values;
		options = $.extend({}, options);
		values = $.map(commits, function(commit) {
			var commitClone = $.extend({}, commit);
			return $.extend(commitClone, {
				username: options.username || null,
				type: type
			});
		});
		return {
			key: settings.labels[options.username ? 'user' : 'team'][type],
			values: values,
			color: settings.colors[options.username ? 'user' : 'team'][type],
			disabled: options.disabled === true
		};
	}

	// Creates the data set for a date line. This is used for our deliverable release date and due date lines.
	function createDateLine(type, date) {
		return {
			key: type,
			values: [{type: type, time: date, percentage: 0}, {type: type, time: date, percentage: 110}],
			color: '#ccc',
			classed: 'dashed dateline ' + type
		};
	}

	// Global tooptip function that generates the HTML with the Handlebars template based on the given object
	// environment.
	function tooltip(object) {
		var point = object.point;
		var items = [
			{ label: 'Time', value: moment(point.time).format('MMMM Do YYYY, h:mm:ss a') }
		];

		if (point.username) {
			items = items.concat([
				{ label: 'Contrib. to Pass Rate', value: d3.format('%')(point.pCtbAcc / 100) },
				{ label: 'Contrib. to Coverage', value: d3.format('%')(point.cvgCtbAcc / 100) }
			]);
		} else {
			items = items.concat([
				{ label: 'Grade', value: d3.format('%')(point.grd / 100) },
				{ label: 'Coverage', value: d3.format('%')(point.cvg / 100) },
				{ label: 'Passed Tests', value: point.pCnt },
				{ label: 'Failed Tests', value: point.fCnt },
				{ label: 'Skipped Tests', value: point.sCnt }
			]);
		}

		return templates.tooltip({ items: items });
	}

	// Adds the menu buttons to the DOM
	function addButtons(deliverables) {
		var buttons = [], renderedTemplate;
		$.each(deliverables, function(index, deliverable) {
			buttons.push({deliverable: deliverable, label: deliverable.toUpperCase(), classes: index === 0 ? 'active' : ''});
		});
		renderedTemplate = templates.buttons({buttons: buttons});
		$('#teamline-buttons').append(renderedTemplate);
	}

	// Add a custom legend with the given items to the container specified
	function addLegend(containerSelector, items) {
		var $container = $(containerSelector);
		if (!$container.find('.teamline-legend').length) {
			$(containerSelector).prepend(templates.legend({ items: items }));
		}
	}

	// Main function to draw a line chart with NVD3. Takes the environment specified in the options argument and
	// overrides defaults.
	function drawLineChart(options) {
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
		};

		nv.addGraph(function() {
			var chart = nv.models.lineChart()
				.margin(options.margin || {top: 0, right: 0, bottom: 0, left: 5})
				.tooltipContent(options.tooltip || tooltip)
				.x(options.x)
				.y(options.y)
				.showYAxis(options.showYAxis !== false)
				.showXAxis(options.showXAxis !== false)
				.showLegend(false);

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
			chart.forceY([deliverable.release-172800000, deliverable.due+103680000]);

			chart.lines.dispatch.on('elementClick', function(e) {
				//alert("You've clicked on " + e.series.key + " - " + e.point.x);
			});

			$chart.data({d3obj: d3obj, nvd3obj: chart});

			updateSize(d3obj, chart);

			nv.utils.windowResize(function() {
				updateSize(d3obj, chart);
			});

			options.done && options.done();

		});
	}

	// Draws the grade chart in the left quarter
	function drawGradeChart(context) {
		var containerSelector = '#grade-chart-container';
		drawLineChart({
			containerSelector: containerSelector,
			margin: {top: 0, right: 0, bottom: 0, left: 50},
			data: [context.gradeChartData.coverage, context.gradeChartData.passRate, context.gradeChartData.grade,
				context.gradeChartData.release, context.gradeChartData.due],
			x: function(point) {
				var options = {
					passRate: parseFloat(point.pPct),
					grade: parseFloat(point.grd),
					coverage: parseFloat(point.cvg),
					release: point.percentage,
					due: point.percentage
				};
				return options[point.type];
			},
			y: function(point) {
				return point.time;
			},
			xTickPadding: -15,
			yTickPadding: 5
		});
		addLegend(containerSelector, [
			{ key: 'teamPassRate', label: settings.labels.team.passRate, color: settings.colors.team.passRate },
			{ key: 'teamCoverage', label: settings.labels.team.coverage, color: settings.colors.team.coverage },
			{ key: 'teamGrade', label: settings.labels.team.grade, color: settings.colors.team.grade }
		]);
	}

	// Draws an individual chart for a user. Used for the two charts on the right.
	function drawIndividualChart(containerSelector, chartData, options) {
		var defaults = {
			containerSelector: containerSelector,
			data: [chartData.coverage, chartData.passRate, chartData.grade,
				chartData.release, chartData.due],
			x: function(point) {
				var options = {
					passRate: parseFloat(point.pCtbAcc),
					grade: parseFloat(point.grd),
					coverage: parseFloat(point.cvgCtbAcc),
					release: point.percentage,
					due: point.percentage
				};
				return options[point.type];
			},
			y: function(point) {
				return point.time;
			},
			xTickPadding: -15,
			yTickPadding: 5
		};
		drawLineChart($.extend(defaults, options));
	}

	// Draws the two user charts on the right
	function drawUserCharts(context) {
		$.each([0,1], function(index) {
			var userIndex = currentState.users[index];
			var containerSelector = '#user-chart-'+(index+1)+'-container';
			var username, userCommits;
			if (userIndex === undefined) {
				drawIndividualChart(containerSelector, context.emptyChartData);
			} else {
				username = context.usernames[userIndex];
				userCommits = context.userData[username].commits;
				drawIndividualChart(containerSelector, {
					grade: context.disabledGradeData,
					passRate: createChartData('passRate', userCommits, { username: username }),
					coverage: createChartData('coverage', userCommits, { username: username }),
					due: context.dateLineDue,
					release: context.dateLineRelease
				});
			}
			$(containerSelector).find('.username-container').html(username || '');

			if (index === 0) {
				addLegend(containerSelector, [
					{ label: settings.labels.user.passRate, color: settings.colors.user.passRate },
					{ label: settings.labels.user.coverage, color: settings.colors.user.coverage }
				]);
			}
		});
	}

	// Draws the small charts in the bottom gallery.
	function drawGalleryCharts(context) {
		$.each(context.usernames, function(index, username) {
			var userCommits = context.userData[username].commits;
			var userChartIndex = currentState.users.indexOf(index);
			var hasFocus = userChartIndex === 0 || userChartIndex === 1;
			var galleryContainerSelector = appendGalleryChartContainer(username, hasFocus);
			var chartData = {
				grade: context.disabledGradeData,
				passRate: createChartData('passRate', userCommits, { username: username }),
				coverage: createChartData('coverage', userCommits, { username: username }),
				release: context.dateLineRelease,
				due: context.dateLineDue
			};
			var $usernameContainer = $('<div class="username-container">').html(username);
			$(galleryContainerSelector).append($usernameContainer);
			drawIndividualChart(galleryContainerSelector, chartData, {
				showYAxis: false,
				showXAxis: false,
				tooltip: $.noop
			});
		});
	}

	// Draws a sparkline chart. Used for the overview cells.
	function drawSparklineChart(context, done) {
		var data = [];
		var width = 50, height = 50;
		var finalGrade = parseFloat(context.deliverableTeamResult.grd);
		$.each(context.gradeChartData.grade.values, function(index, point) {
			data.push({x: parseFloat(point.grd), y: point.time});
		});
		nv.addGraph(function() {
			var chart = nv.models.sparkline()
				.width(width)
				.height(height)
				.margin({top: 3, right: 3, bottom: 3, left: 3})
				.xRange([0, (finalGrade / 100) * width])
				.color([settings.colors.team.grade]);
			d3.select('#cell'+'-'+context.deliverableName+'-'+context.teamName+' svg')
				.datum(data)
				.call(chart);

			done && done();
		});
	}

	// Adds a container in the gallery for a gallery chart
	function appendGalleryChartContainer(username, hasFocus) {
		var containerSelector = '.gallery-chart-container[data-username="'+username+'"]';
		var $chartContainer = $('<div class="gallery-chart-container" data-username="'+username+'">');
		var $svg = $('<svg class="gallery-chart"></svg>');
		if (hasFocus) {
			$chartContainer.addClass('active');
		}
		$chartContainer.append($svg);
		$('#teamline-gallery').append($chartContainer);
		return containerSelector;
	}

	// Create a context object that establishes the environment for drawing a chart
	function createChartContext(teamName, deliverableName) {
		var teamData = globalData.teams[teamName || currentState.teamName];
		var deliverableObj = globalData.deliverables[deliverableName || currentState.deliverableName];
		var deliverableTeamResult = teamData[deliverableName || currentState.deliverableName];
		var userData = deliverableTeamResult.users;
		var usernames = Object.keys(userData).sort();
		var allCommits = [], gradeChartData, disabledGradeData, emptyChartData;
		var dateLineRelease = createDateLine('release', deliverableObj.release),
			dateLineDue = createDateLine('due', deliverableObj.due);

		$.each(usernames, function(index, username) {
			var userCommits = userData[username].commits;
			allCommits = allCommits.concat(userCommits);
		});

		allCommits.sort(function(commit1, commit2) {
			return commit1.time - commit2.time;
		});

		gradeChartData = {
			grade: createChartData('grade', allCommits),
			passRate: createChartData('passRate', allCommits),
			coverage: createChartData('coverage', allCommits),
			release: dateLineRelease,
			due: dateLineDue
		};

		disabledGradeData = $.extend({}, gradeChartData.grade);
		disabledGradeData.disabled = true;

		emptyChartData = {
			grade: disabledGradeData,
			passRate: createChartData('passRate', []),
			coverage: createChartData('coverage', []),
			release: dateLineRelease,
			due: dateLineDue
		};

		return {
			teamName: teamName,
			deliverableTeamResult: deliverableTeamResult,
			deliverableName: deliverableName,
			userData: userData,
			usernames: usernames,
			gradeChartData: gradeChartData,
			disabledGradeData: disabledGradeData,
			emptyChartData: emptyChartData,
			dateLineRelease: dateLineRelease,
			dateLineDue: dateLineDue
		};
	}

	// Draw all the charts in the team view
	function drawTeamCharts() {
		var context = createChartContext();
		drawGradeChart(context);
		drawGalleryCharts(context);
		drawUserCharts(context);
	}

	// Creates the overview content for the given deliverable. This should only be called if the overview
	// wasn't created before.
	function createOverview(deliverableName) {
		var $overview = $('#teamline-overview');
		var $deliverableOverview = $('<div>').attr('id', 'overview-'+deliverableName).addClass('deliverable-overview');
		$overview.append($deliverableOverview);
		$deliverableOverview.addClass('active');

		var background = 'white',
			h = 31,
			s = 100,
			l = 50;

		var getLightnessDiff = function(contributionDistribution) {
			return (contributionDistribution / 2) * 100;
		};

		var teamNamesSorted = Object.keys(globalData.teams).sort(function(team1, team2) {
			var team1Num = settings.numberRegex.exec(team1)[0];
			var team2Num = settings.numberRegex.exec(team2)[0];
			if (team1Num && team2Num) {
				team1Num = parseInt(team1Num, 10);
				team2Num = parseInt(team2Num, 10);
				return team1Num - team2Num;
			} else {
				return team1 - team2;
			}
		});

		var updateCellSize = function($container, $div) {
			var containerWidth = $container.outerWidth();
			var cellWidth = $div.outerWidth();
			var cellsInRow = Math.floor(containerWidth / cellWidth);
			var newWidthAndHeight = containerWidth / cellsInRow;
			$div.css({width: newWidthAndHeight, height: newWidthAndHeight});
		};

		$.each(teamNamesSorted, function(index, teamName) {
			var $div, upperCaseTeamName, contributionDistribution;
			var deliverableData = globalData.teams[teamName][deliverableName];
			upperCaseTeamName = firstLetterUpperCase(teamName);
			if (deliverableData) {
				contributionDistribution = parseFloat(deliverableData.ctbDist);
				background = 'hsl('+h+','+s+'%,'+(l+getLightnessDiff(contributionDistribution))+'%)';
			}

			$div = $('<div>').addClass('team-cell')
				.attr({'data-teamname': teamName, id: 'cell-'+deliverableName+'-'+teamName})
				.css({background: background}).html('<svg></svg><span class="teamname">'+upperCaseTeamName+'</span>');
			$deliverableOverview.append($div);

			updateCellSize($deliverableOverview, $div);

			if (deliverableData) {
				drawSparklineChart(createChartContext(teamName, deliverableName));
			}
		});
	}

	// Sets the contents of the heading in the menu
	function setHeading() {
		var teamName = currentState.teamName;
		var $input = $('#teamline-heading-input');
		if (teamName) {
			teamName = firstLetterUpperCase(teamName);
		}
		$input.val(teamName || 'Overview').attr('disabled', !teamName);
	}

	// Called when a deliverable button was clicked
	function onButtonClick(e) {
		var $button = $(e.target).closest('button');
		if (!$button.hasClass('active')) {
			updateState('button', { deliverableName: $button.data('deliverable') });
		}
	}

	// Called when a cell in the overview was clicked
	function onOverviewTeamClick(e) {
		var $cell = $(e.target).closest('.team-cell');
		var teamName = $cell.attr('data-teamname');
		updateState('overviewcell', { view: 'team', teamName: teamName, users: [0,1] });
	}

	// Called when a gallery chart was clicked
	function onGalleryItemClick(e) {
		var $target = $(e.target).closest('.gallery-chart-container');
		var activeIndexes = [];
		var changeState = true;
		if (!$target.hasClass('active')) {
			if ($('.gallery-chart-container.active').length < 2) {
				$target.addClass('active');
			} else {
				changeState = false;
			}
		} else {
			$target.removeClass('active');
		}

		if (changeState) {
			$('.gallery-chart-container.active').each(function() {
				activeIndexes.push($(this).index());
			});
			updateState('gallery', {users: activeIndexes});
		}
	}

	// Called when the team name in the heading was changed
	function onTeamChange(e) {
		var value = $(e.target).closest('input').val().toLowerCase();
		if (globalData.teams[value]) {
			updateState('teamchange', { teamName: value });
		}
	}

	// Called when the back button was clicked
	function onBackButtonClick(e) {
		updateState('back', {view: 'overview', teamName: '', users: []});
	}

	// Show the overview for the current deliverable. Create its contents if that didn't happen before.
	function showOverview() {
		var deliverableName = currentState.deliverableName;
		var selector = '#overview-'+deliverableName;
		if (!$(selector).length) {
			createOverview(deliverableName);
		}
		$(selector).addClass('active').siblings().removeClass('active');
	}

	// Fetch our JSON data and initialize the whole thing
	$.getJSON(settings.teamlineDataPath, function(data) {
		var buttons, bodyHeight = $(document.body).outerHeight();
		globalData = data;
		buttons = Object.keys(globalData.deliverables);
		$('#teamline').height(bodyHeight).addClass('visible');
		addButtons(buttons);
		updateState('init', { deliverableName: 'd1', view: 'overview' }); // show overview on page load
	});

	// Main listener called whenever our global state changes
	$(window).on('teamline.state.updated', function(e) {
		$('#teamline').attr('data-view', currentState.view);
		$('button[data-deliverable="'+currentState.deliverableName+'"]').addClass('active').siblings().removeClass('active');
		setHeading();
		if (currentState.view === 'team') {
			if (currentState.lastTrigger !== 'gallery') {
				$('#teamline-gallery, #teamline-charts svg').html('');
				drawTeamCharts();
			} else {
				$('.user-chart').html('');
				drawUserCharts(createChartContext());
			}
		} else if (currentState.view === 'overview') {
			showOverview();
		}
	});

	// Adds all the listeners we need for interaction
	$('#teamline')
		.on('click', '.gallery-chart-container', onGalleryItemClick)
		.on('click', '#back-button', onBackButtonClick)
		.on('click', '#teamline-buttons', onButtonClick)
		.on('click', '#teamline-overview', onOverviewTeamClick)
		.on('keyup', '#teamline-heading-input', onTeamChange)
	;

}());