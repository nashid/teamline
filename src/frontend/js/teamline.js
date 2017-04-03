var Teamline = (function() {

	function chart(chartType, options) {

		var defaults = {
			container: '#chart svg',
			beforeDraw: $.noop,
			data: {},
			style: {}
		};

		var style = {};

		options = $.extend(defaults, options);

		nv.addGraph(function() {

			var chartObj = nv.models[chartType]();
			var d3Obj = d3.select(options.container).datum(options.data);

			if (options.width) {
				style.width = options.width;
			}
			if (options.height) {
				style.height = options.height;
			}

			$.each(options, function(fnName, fnArgs) {
				if (!$.isArray(fnArgs)) {
					fnArgs = [fnArgs];
				}
				if (typeof chartObj[fnName] === 'function') {
					chartObj[fnName].apply(chartObj, fnArgs);
				}
			});

			options.beforeDraw({
				nvd3Obj: chartObj,
				d3Obj: d3Obj
			});

			d3Obj.style(style).call(chartObj);
			nv.utils.windowResize(chart.update);

		});

	}

	return {
		chart: chart
	};

}());