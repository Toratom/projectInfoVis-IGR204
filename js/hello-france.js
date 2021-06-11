// Setting up the svg element for D3 to draw in
let w = 600
let h = 600

let text = d3.select(".text");

// Create SVG element
let svg = d3.select(".map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("align", "center"); 

// A projection tells D3 how to orient the GeoJSON features
let europeProjection = d3.geoMercator()
  .center([ 13, 52 ])
  .scale([ w / 1.5 ])
  .translate([ w / 2, h / 2 ])
// The path generator uses the projection to convert the GeoJSON
// geometry to a set of coordinates that D3 can understand
let pathGenerator = d3.geoPath().projection(europeProjection)
let geoJsonUrl = '../data/europe_features.json';

d3.json(geoJsonUrl, function(error, geojson) { 
    if (error) throw error; 
    // Tell D3 to render a path for each GeoJSON feature
    svg.selectAll("path")
          .data(geojson.features)
          .enter()
          .append("path")
          .attr("d", pathGenerator) // This is where the magic happens
          .attr("stroke", "grey") // Color of the lines themselves
          .on("click", function(d) {
            text.transition()        
                .duration(200)
                .style("opacity", .9);      
            text.html("Country: " + d.properties.name)  
                .style("left", (d3.event.pageX + 30) + "px")     
                .style("top", (d3.event.pageY - 30) + "px")
        })
        .on("mouseout", function(d) {
            text.style("opacity", 0);
            text.html("")
                .style("left", "-500px")
                .style("top", "-500px");
        });
         
});

/*d3.json(url, function(error, bb) { 
    if (error) throw error;

    var bbox = d3.select('body').node().getBoundingClientRect()
    var width = window.innerWidth;
    var height = window.innerHeight;
    var projection = d3.geoEqualEarth();
    projection.fitExtent([[20, 20], [width, height]], bb);
    var geoGenerator = d3.geoPath().projection(projection);
    var svg = d3.select("body").append('svg')
        .style("width", "100%")
        .style("height", "100%");
    svg.append('g').selectAll('path')
    .data(bb.features)
    .enter()
        .append('path')
        .attr('d', geoGenerator)
        .attr('fill', '#088')
        .attr('stroke', '#000');
});*/