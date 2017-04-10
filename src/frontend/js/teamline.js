var Teamline = (function() {

	var CHARTS = {
		'linechart': 'lineChart'
	};

	function convertToNvd3Data(arrayOfObjects) {
		var preparedData = {}, nvd3Data = [];
		$.each(arrayOfObjects, function(index, object) {
			$.each(object, function(propertyKey, propertyValue) {
				if (!preparedData[propertyKey]) {
					preparedData[propertyKey] = { values: [] };
				}
				preparedData[propertyKey].values.push(propertyValue);
			});
		});
		$.each(preparedData, function(chartKey, chartObject) {
			var nvd3Object = {};
			nvd3Object.key = chartKey;
			nvd3Object.values = chartObject.values;
			nvd3Data.push(nvd3Object);
		});
		return nvd3Data;
	}

	function chart(chartType, options) {

		var defaults = {
			container: '#chart svg',
			beforeDraw: $.noop,
			data: {},
			style: {}
		};

		var style = {};

		var chartData = options.data;//convertToNvd3Data(options.data);

		options = $.extend(defaults, options);

		nv.addGraph(function() {
			var chartFnName = CHARTS[chartType.toLowerCase()];
			var chartObj = nv.models[chartFnName]();
			var d3Obj = d3.select(options.container).datum(chartData);

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