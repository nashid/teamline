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
		teamlineDataPath: 'teamline-data-mini.json',
		deliverables: ['d1', 'd2', 'd3'],
		views: { team: 'team', overview: 'overview' },
		overviewBackground: { hue: 111, saturation: 78, luminance: 50 },
		overviewColumns: 8,
		margin: {top: 20, right: 50, bottom: 0, left: 50},
		marginTopToXAxis: 80, // TODO: don't know how to calculate this
		tooltipDateFormat: 'MMMM Do YYYY, h:mm:ss a',
		buttonAllLabel: 'all',
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
				grade: '#1b9e77',
				passRate: '#d95f02',
				coverage: '#7570b3'
			},
			user: {
				grade: 'white', // niu
				passRate: '#377eb8',
				coverage: '#66a61e'
			}
		}
	};

	// Selectors for a few elements
	var select = {
		container: '#teamline',
		chart: '#grade-chart',
		chartUser1: '#user-chart-1',
		chartUser2: '#user-chart-2',
		overview: '#teamline-overview table',
		buttons: '#teamline-buttons',
		teamlineCharts: '#teamline-charts'
	};

	// Handlebars templates
	var templates = {
		tooltip: Handlebars.compile($("#tooltip-template").html()),
		buttons: Handlebars.compile($("#buttons-template").html()),
		legend: Handlebars.compile($("#legend-template").html())
	};

	// Central function for changing the global state. The state is extended by the given object, which means
	// we don't need to pass all the information all the time.
	function updateState(trigger, stateObj) {
		currentState = $.extend(currentState, stateObj);
		currentState.lastTrigger = trigger;
		$(window).trigger('teamline.state.updated');
	}

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

	function createDateLine(type, date) {
		return {
			key: type,
			values: [{type: type, time: date, percentage: 0}, {type: type, time: date, percentage: 110}],
			color: '#ccc',
			classed: 'dashed dateline ' + type
		};
	}

	// Generates the HTML for the tooltips upon hover using Handlebars templating
	function tooltip(object) {
		var point = object.point;
		var items = [
			{ label: 'Time', value: moment(point.time).format(settings.tooltipDateFormat) }
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

	// Adds the deliverable buttons to the DOM
	function addButtons(deliverables) {
		var buttons = [], renderedTemplate;
		$.each(deliverables, function(index, deliverable) {
			buttons.push({deliverable: deliverable, label: deliverable.toUpperCase(), classes: index === 0 ? 'active' : ''});
		});
		renderedTemplate = templates.buttons({buttons: buttons});
		$('#teamline-buttons').append(renderedTemplate);
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

			$chart.data({d3obj: d3obj, nvd3obj: chart});

			updateSize(d3obj, chart);

			nv.utils.windowResize(function() {
				updateSize(d3obj, chart);
			});
		});
	}

	function addLegend(containerSelector, items) {
		var $container = $(containerSelector);
		if (!$container.find('.teamline-legend').length) {
			$(containerSelector).prepend(templates.legend({ items: items }));
		}
	}

	function drawGradeChart(context) {
		var containerSelector = '#grade-chart-container';
		drawChart({
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

	function drawIndividualChart(containerSelector, username, chartData, options) {
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
		drawChart($.extend(defaults, options));
	}

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

	function createChartContext() {
		var teamData = globalData.teams[currentState.teamName];
		var deliverableObj = globalData.deliverables[currentState.deliverableName];
		var targetDeliverable = teamData[currentState.deliverableName];
		var userData = targetDeliverable.users;
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
			userData: userData,
			usernames: usernames,
			gradeChartData: gradeChartData,
			disabledGradeData: disabledGradeData,
			emptyChartData: emptyChartData,
			dateLineRelease: dateLineRelease,
			dateLineDue: dateLineDue
		};
	}

	function drawUserCharts(context) {
		$.each([0,1], function(index) {
			var userIndex = currentState.users[index];
			var containerSelector = '#user-chart-'+(index+1)+'-container';
			var username, userCommits;
			if (userIndex === undefined) {
				drawIndividualChart(containerSelector, '', context.emptyChartData);
			} else {
				username = context.usernames[userIndex];
				userCommits = context.userData[username].commits;
				drawIndividualChart(containerSelector, username, {
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
			drawIndividualChart(galleryContainerSelector, username, chartData, {
				showYAxis: false,
				showXAxis: false,
				tooltip: $.noop
			});
		});
	}

	// Draws a team chart based on the current global state
	function drawTeamCharts() {
		var context = createChartContext();
		drawGradeChart(context);
		drawGalleryCharts(context);
		drawUserCharts(context);
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

	function setTeamName() {
		var teamName = currentState.teamName;
		var teamNameUpperCase;
		if (teamName) {
			teamNameUpperCase = teamName.charAt(0).toUpperCase() + teamName.slice(1);
		}
		$('#teamline-team').val(teamNameUpperCase || '');
	}

	// Called when a deliverable button was clicked
	function onButtonClick(e) {
		var $button = $(this);
		if (!$button.hasClass('active')) {
			updateState('button', { deliverableName: $(this).data('deliverable') });
		}
	}

	// Called when a cell in the overview was clicked
	function onOverviewTdClick(e) {
		var $td = $(this);
		var teamName = $td.attr('data-teamname');
		updateState('overviewcell', { view: settings.views.team, teamName: teamName });
	}

	function onGalleryItemClick(e) {
		var activeIndexes = [];
		var $target = $(this);
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

	function onTeamChange(e) {
		var value = $(this).val().toLowerCase();
		if (globalData.teams[value]) {
			updateState('teamchange', { teamName: value });
		}
	}

	$.getJSON(settings.teamlineDataPath, function(data) {
		var buttons, bodyHeight = $(document.body).outerHeight();
		globalData = data;
		buttons = Object.keys(globalData.deliverables);
		buttons.push(settings.buttonAllLabel);
		$(select.container).height(bodyHeight).addClass('visible');
		addButtons(buttons);
		//updateState({ deliverableName: 'd1', view: 'overview' }); // show overview on page load
		updateState('init', { deliverableName: 'd1', view: settings.views.team, teamName: 'team178', users: [0,1] });
	});

	$(window).on('teamline.state.updated', function(e) {
		$(select.container).attr('data-view', currentState.view);
		$('button[data-deliverable="'+currentState.deliverableName+'"]').addClass('active').siblings().removeClass('active');
		setTeamName();
		if (currentState.view === settings.views.team) {
			if (currentState.lastTrigger === 'gallery') {
				$('.user-chart').html('');
				drawUserCharts(createChartContext());
			} else {
				$('#teamline-gallery, svg').html('');
				drawTeamCharts();
			}
		}
	});

	$(select.buttons).on('click', 'button', onButtonClick);
	$(select.overview).on('click', 'td', onOverviewTdClick);
	$(select.container).on('click', '.gallery-chart-container', onGalleryItemClick);
	$(select.container).on('keyup', '#teamline-team', onTeamChange);

}());