// nv.addGraph(function() {
// 	var chart = nv.models.lineChart()
// 			.margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
// 			.useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
// 			.showLegend(true)       //Show the legend, allowing users to turn on/off line series.
// 			.showYAxis(true)        //Show the y-axis
// 			.showXAxis(true)        //Show the x-axis
// 		;
//
// 	chart.xAxis     //Chart x-axis settings
// 		.axisLabel('Time (ms)')
// 		.tickFormat(d3.format(',r'));
//
// 	chart.yAxis     //Chart y-axis settings
// 		.axisLabel('Voltage (v)')
// 		.tickFormat(d3.format('.02f'));
//
// 	/* Done setting the chart up? Time to render it!*/
// 	var myData = sinAndCos();   //You need data...
//
// 	d3.select('#chart svg')    //Select the <svg> element you want to render the chart in.
// 		.datum(myData)         //Populate the <svg> element with chart data...
// 		.call(chart);          //Finally, render the chart!
//
// 	//Update the chart when window resizes.
// 	nv.utils.windowResize(function() { chart.update() });
// 	return chart;
// });


Teamline.chart('LineChart', {
	container: '#chart2 svg',
	data: sinAndCos(),
	height: 400,
	margin: {left: 100},
	useInteractiveGuideline: true,
	showLegend: true,
	showYAxis: true,
	showXAxis: true,
	beforeDraw: beforeDraw
});

function beforeDraw(env) {
	var chart = env.nvd3Obj;
	chart.xAxis     //Chart x-axis settings
		.axisLabel('Time (ms)')
		.tickFormat(d3.format(',r'));

	chart.yAxis     //Chart y-axis settings
		.axisLabel('% Contribution')
		.tickFormat(d3.format('%'))

	chart.forceY([0,1]);

}


function sinAndCos() {
	var sin = [],
		sin2 = [],
		cos = [],
		rand = [],
		rand2 = []
		;

	for (var i = 0; i < 100; i++) {
		sin.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) }); //the nulls are to show how defined works
		sin2.push({x: i, y: Math.sin(i/5) * 0.4 - 0.25});
		cos.push({x: i, y: .5 * Math.cos(i/10)});
		rand.push({x:i, y: Math.random() / 10});
		rand2.push({x: i, y: Math.cos(i/10) + Math.random() / 10 })
	}

	return [
		{
			area: true,
			values: sin,
			key: "Sine Wave",
			color: "#ff7f0e",
			strokeWidth: 4,
			classed: 'dashed'
		},
		{
			values: cos,
			key: "Cosine Wave",
			color: "#2ca02c"
		},
		{
			values: rand,
			key: "Random Points",
			color: "#2222ff"
		},
		{
			values: rand2,
			key: "Random Cosine",
			color: "#667711",
			strokeWidth: 3.5
		},
		{
			area: true,
			values: sin2,
			key: "Fill opacity",
			color: "#EF9CFB",
			fillOpacity: .1
		}
	];
}