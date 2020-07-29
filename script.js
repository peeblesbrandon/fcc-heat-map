var w = 1000;
var h = 700;
var padding = 75;

url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json",
months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
color = ["#ef5350", "#EC407A", "#AB47BC", "#7E57C2", "#5C6BC0", "#42A5F5", "#26C6DA", "#26A69A", "#D4E157", "#FFEE58", "#FFA726"];

// svg for plot
var svg = d3.select("#chart")
            .append("svg")
            .attr("height", h)
            .attr("width", w)
// div for creating tooltip
var tooltipDiv = d3.select("#chart")
                    .append("div")
                    .attr("id", "tooltip")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

d3.json(url, function(err, json) {
    if (err) {
        throw err;
    }

    var baseTemp = json.baseTemperature;
    var monthlyData = json.monthlyVariance;
    var cellWidth = w / ((monthlyData.length - 1) / 12);
    var cellHeight = (h - padding) / 12;
    
    var parseYear  = d3.timeParse('%Y'); 
    var formatYear = d3.timeFormat('%Y'); 
    var parseMonth = d3.timeParse('%m');
    var formatMonth = d3.timeFormat('%B');

    var parsedYears = monthlyData.map((d) => {
        return parseYear(d.year);
    });
    var parsedMonths = monthlyData.map((d) => {
        return parseMonth(d.month);
    });

    // create scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(parsedYears))
        .range([padding, w - padding]);
    const yScale = d3.scaleBand()
        .domain(parsedMonths)
        .range([h - padding, padding]);
    var colorScale = d3.scaleQuantize()
                        .range(color);
    //scale the colors
    colorScale.domain(d3.extent(monthlyData, function (d) {
        return d.variance;
    }));

    // AXES
    // add scales to axes
    const xAxis = d3.axisBottom()
                    .scale(xScale)
                    .tickFormat((d) => {
                        return formatYear(d);
                    })
                    .ticks(d3.timeYear.every(10));
    const yAxis = d3.axisLeft()
                    .scale(yScale)
                    .tickFormat((d) => {
                        return formatMonth(d);
                    })
                    .ticks(d3.timeMonth.every(1));
    // append group and insert axes
    svg.append("g")
        .call(xAxis)
        .attr("transform", "translate(0, " + (h - padding) + ")")
        .attr("id", "x-axis");
    svg.append("g")
        .call(yAxis)
        .attr("transform", "translate(" + padding + ", 0)")
        .attr("id", "y-axis");

    // CELLS
    svg.selectAll(".dot")
        .data(monthlyData)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-year", (d) => parseYear(d.year))
        .attr("data-month", (d) => parseMonth(d.month))
        .attr("data-temp", (d) => baseTemp + d.variance)
        .attr("x", (d) => xScale(parseYear(d.year)))
        .attr("y", (d) => yScale(parseMonth(d.month)))
        .attr("width", cellWidth)
        .attr("height", yScale.bandwidth())
        .style("fill", (d) => {
            return colorScale(d.variance);
        })
        .on("mouseover", function(d) {
            d3.select(this).transition()
                .duration("0")
                .style("stroke", "black")
                .style("stroke-width", 2);
            tooltipDiv.transition()
                .duration("200")
                .style("opacity", 0.9)
            tooltipDiv.html(formatMonth(parseMonth(d.month)) + ', ' + d.year + '</br>' + 'Temp: ' + d3.format("+.1f")(baseTemp + d.variance) + "&#8451;" + '</br>' + 'Var: ' + d3.format("+.1f")(d.variance) + "&#8451;")
                .style("left", (d3.event.pageX + 25) + "px")
                .style("top", (d3.event.pageY - 20) + "px")
                .attr("data-year", parseYear(d.year));
        })
        .on("mouseout", function(d) {
            d3.select(this).transition()
                .duration("0")
                .style("stroke", '')
                .style("stroke-width", 0);
            tooltipDiv.transition()
                .duration("200")
                .style("opacity", 0);
        });

    const colorCount = color.length;
    const legendWidth = 300;
    const legendHeight = 30;
    const legendCellWidth = legendWidth / colorCount;
    const minVar = Math.min(...monthlyData.map((d) => { return d.variance }));
    const maxVar = Math.max(...monthlyData.map((d) => { return d.variance }));
    
    const legend = d3.select("#legend")
        .append('svg')
        .attr("height", legendHeight)
        .attr("width", legendWidth)
        .style("border", "1px solid black")
        .selectAll('rect')
        .data(color)
        .enter()
        .append('rect')
        .attr("x", (d, i) => {
            return i * legendCellWidth;
        })
        .attr("y", 0)
        .attr("height", legendHeight)
        .attr("width", legendCellWidth)
        .attr("fill", (d) => {
            return d;
        })
    //legend axis
    // const legendScale = d3.scaleOrdinal()
    //     .domain(color)
    //     .range([0, legendWidth]);
    const legendAxis = d3.axisBottom()
        .scale(colorScale.invertExtent())
        // .tickFormat((d) => {
        //     console.log(d3.format("0.1f")(colorScale.invertExtent(d)[0]))
        //     return d3.format("0.1f")(colorScale.invertExtent(d)[0]);
        // });
    legend.append("g")
        .call(legendAxis)
        .attr("transform", "translate(0, " + legendHeight + ")")
        .attr("id", "legend-axis");
});
