// Setting up the svg element for D3 to draw in
let w = 600
let h = 600

let text = d3.select(".text");

let colorCountries; //colorisateur pour la heatmap
let dataset = []; //full dataset
let timeCurrentActivity = []; //tableau des minutes pour une activité / une période / un sexe (ou le total), trié par rapport au nom du pays alphabétiquement
let correspondingCountries = []; //même taille que timeCurrentActivity, correspondingCountries[i] est le pays dont l'activité dure timeCurrentActivity[i] 

let currentActivity = "Total";
let currentSex = "Total";
let currentPeriod = "All days of the week";

let colorActivities;
let currentCountry = "Belgium";
let timeCurrentCountry = [];
let correspondingActivities = [];

let allActivities = ["Total"
,"Personal care"
,"Sleep"
,"Eating"
,"Other and/or unspecified personal care"
,"Employment, related activities and travel as part of/during main and second job"
,"Main and second job and related travel"
,"Activities related to employment and unspecified employment"
,"Study"
,"School and university except homework"
,"Homework"
,"Free time study"
,"Household and family care"
,"Food management except dish washing"
,"Dish washing"
,"Cleaning dwelling"
,"Household upkeep except cleaning dwelling"
,"Laundry"
,"Ironing"
,"Handicraft and producing textiles and other care for textiles"
,"Gardening; other pet care"
,"Tending domestic animals"
,"Caring for pets"
,"Walking the dog"
,"Construction and repairs"
,"Shopping and services"
,"Childcare, except teaching, reading and talking"
,"Teaching, reading and talking with child"
,"Household management and help family member"
,"Leisure, social and associative life"
,"Organisational work"
,"Informal help to other households"
,"Participatory activities"
,"Visiting and feasts"
,"Other social life"
,"Entertainment and culture"
,"Resting"
,"Walking and hiking"
,"Sports and outdoor activities except walking and hiking"
,"Computer games"
,"Computing"
,"Hobbies and games except computing and computer games"
,"Reading books"
,"Reading, except books"
,"TV and video"
,"Radio and music"
,"Unspecified leisure"
,"Travel except travel related to jobs"
,"Travel to/from work"
,"Travel related to study"
,"Travel related to shopping and services"
,"Transporting a child"
,"Travel related to other household purposes"
,"Travel related to leisure, social and associative life"
,"Unspecified travel"
,"Unspecified time use"];

// Create SVG element
let svg = d3.select(".map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("align", "center"); 

// ---------------- load dataset -------------------- //
d3.tsv("../data/data.csv")
.row((d, i) => {
  return {
        country: d.GEO,
          period: d.DAYSWEEK,
          sex: d.SEX,
          activity: d.ACL00,
          minutes: +d.Value
        };
    })
.get((error, rows) => {
  console.log("Loaded " + rows.length + " rows");
  if (rows.length > 0) {
    console.log("First row: ", rows[0])
      console.log("Last  row: ", rows[rows.length-1])
    }

  dataset = rows;
for (let i = 0; i < dataset.length; i++) {
  const data = dataset[i];

  if (data["activity"]==currentActivity && data["sex"] == currentSex && data["period"] == currentPeriod){
    timeCurrentActivity.push(data["minutes"]); 
    correspondingCountries.push(data["country"]);   
}}
console.log("Activity :",currentActivity,", Times :",timeCurrentActivity);
colorCountries = d3.scaleSequential()
.domain(d3.extent(timeCurrentActivity))
.interpolator(d3.interpolateHcl("yellow", "red"));

for (let i = 0; i < dataset.length; i++) {
  const data = dataset[i];

  if (data["country"]==currentCountry && data["sex"] == currentSex && data["period"] == currentPeriod){
    timeCurrentCountry.push(data["minutes"]); 
    correspondingActivities.push(data["activity"]);
}}
console.log("Country :",currentCountry,", Times :",timeCurrentCountry);

colorActivities = d3.scaleSequential()
.domain(d3.extent(timeCurrentCountry))
.interpolator(d3.interpolateHcl("yellow", "red"));
});

console.log("Country :",currentCountry,", Times :",timeCurrentCountry);
console.log("Activity :",currentActivity,", Times :",timeCurrentActivity);

// ---------------- load map -------------------- //
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
          .style("fill", function(d) { 

            let timeUse = -1;
            let nameCountry = d.properties.name;
            for (let i = 0; i < correspondingCountries.length; i++) {
              const country = correspondingCountries[i];

              if (nameCountry == country){
                timeUse = timeCurrentActivity[i];
              }
            }

            if (timeUse==-1) return "white"; //si on a pas la donnée du pays on met en blanc
            else return colorCountries(timeUse)})
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

//pour changer d'activité          
function changeActivity(id) {
  document.getElementById(id).classList.add('selected');
  for (let i = 0; i < allActivities.length; i++) {
    let otherId = "buttonActivity"+String(i);
    if (id!=otherId) document.getElementById(otherId).classList.remove('selected');
  }
  
  currentActivity = document.getElementById(id).innerHTML;
  console.log(currentActivity);

  //on actualise la heatmap
  timeCurrentActivity = [];
  correspondingCountries = [];
  for (let i = 0; i < dataset.length; i++) {
    const data = dataset[i];

    if (data["activity"]==currentActivity && data["sex"] == currentSex && data["period"] == currentPeriod){
      timeCurrentActivity.push(data["minutes"]); 
      correspondingCountries.push(data["country"]);   
    }
  }

  console.log(timeCurrentActivity);

  colorCountries = d3.scaleSequential()
  .domain(d3.extent(timeCurrentActivity))
  .interpolator(d3.interpolateHcl("yellow", "red"));

  svg.selectAll("path")
          .attr("d", pathGenerator) // This is where the magic happens
          .style("fill", function(d) { 
            let timeUse = -1;
            let nameCountry = d.properties.name;
            for (let i = 0; i < correspondingCountries.length; i++) {
              const country = correspondingCountries[i];
              if (nameCountry == country){
                timeUse = timeCurrentActivity[i];
              }
            }
            if (timeUse==-1) return "white"; //si on a pas la donnée du pays on met en blanc
            else return colorCountries(timeUse)})
}

// add activities to html
for (let i = 0; i < allActivities.length; i++) {
  const activityName = allActivities[i];
  let button = document.createElement("BUTTON"); 
  let id = "buttonActivity" + String(i);
  button.id = id;
  button.classList.add("mode");
  button.innerHTML = activityName;
  document.getElementById("activities").appendChild(button);  
  button.onclick = function() { 
    changeActivity(id)
  };
  if (i==0) document.getElementById(id).classList.add('selected');
}   

/*
// Pie Chart
var width = 100;
var height = 100;
//var data = [2, 4, 8, 10];

// Create SVG element
var svg_ = d3.select(".map")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
            //.attr("align", "center"); 

/*var svg_ = d3.select(".charts"),
    width = svg_.attr("width"),
    height = svg_.attr("height"),*/

/*
var radius = Math.min(width, height) / 2;
var g = svg_.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

// Generate the pie
var pie = d3.pie();

// Generate the arcs
var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

//Generate groups
var arcs = g.selectAll("arc")
            .data(pie(timeCurrentCountry))
            .enter()
            .append("g")
            .attr("class", "arc")

//Draw arc paths
arcs.append("path")
    .attr("fill", function(d, i) {
        return color(i);
    })
    .attr("d", arc);
*/
// set the dimensions and margins of the graph
var width = 450
    height = 450
    margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
var svg_ = d3.select(".charts")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
//var data = {a: 9, b: 20, c:30, d:8, e:12, f:8, g:12, h:8, i:12}
var ent={};
for (let i = 0; i < allActivities.length; i++) {
  const time = timeCurrentCountry[i];
  const activity = correspondingActivities[i];
  console.log(activity);
  ent.activity = time;  
}
console.log(" zefae ", JSON.stringify(ent));

// set the color scale
var color = d3.scaleOrdinal()
  .domain(data)
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

// Compute the position of each group on the pie:
var pie = d3.pie()
  .value(function(d) {return d.value; })

  /*var name=[];
  var age=[];
  name.push('sulfikar');
  age.push('24');
  var ent={};
  for(var i=0;i<name.length;i++)
  {
  ent.name=name[i];
  ent.age=age[i];
  }*/
  


  
console.log(JSON.stringify(want));
console.log("ee",want)
var data_ready = pie(d3.entries(want))

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg_
  .selectAll('whatever')
  .data(data)
  .enter()
  .append('path')
  .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
  )
  .attr('fill', function(d){ return(color(d.data.key)) })

  .attr("stroke", "black")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)
