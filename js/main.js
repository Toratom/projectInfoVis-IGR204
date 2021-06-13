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


let allActivities = ["Total"
,"Personal care"
,"Sleep"
,"Eating"
,"Other and/or unspecified personal care"];

// let allActivities = ["Total"
// ,"Personal care"
// ,"Sleep"
// ,"Eating"
// ,"Other and/or unspecified personal care"
// ,"Employment, related activities and travel as part of/during main and second job"
// ,"Main and second job and related travel"
// ,"Activities related to employment and unspecified employment"
// ,"Study"
// ,"School and university except homework"
// ,"Homework"
// ,"Free time study"
// ,"Household and family care"
// ,"Food management except dish washing"
// ,"Dish washing"
// ,"Cleaning dwelling"
// ,"Household upkeep except cleaning dwelling"
// ,"Laundry"
// ,"Ironing"
// ,"Handicraft and producing textiles and other care for textiles"
// ,"Gardening; other pet care"
// ,"Tending domestic animals"
// ,"Caring for pets"
// ,"Walking the dog"
// ,"Construction and repairs"
// ,"Shopping and services"
// ,"Childcare, except teaching, reading and talking"
// ,"Teaching, reading and talking with child"
// ,"Household management and help family member"
// ,"Leisure, social and associative life"
// ,"Organisational work"
// ,"Informal help to other households"
// ,"Participatory activities"
// ,"Visiting and feasts"
// ,"Other social life"
// ,"Entertainment and culture"
// ,"Resting"
// ,"Walking and hiking"
// ,"Sports and outdoor activities except walking and hiking"
// ,"Computer games"
// ,"Computing"
// ,"Hobbies and games except computing and computer games"
// ,"Reading books"
// ,"Reading, except books"
// ,"TV and video"
// ,"Radio and music"
// ,"Unspecified leisure"
// ,"Travel except travel related to jobs"
// ,"Travel to/from work"
// ,"Travel related to study"
// ,"Travel related to shopping and services"
// ,"Transporting a child"
// ,"Travel related to other household purposes"
// ,"Travel related to leisure, social and associative life"
// ,"Unspecified travel"
// ,"Unspecified time use"];

// Create SVG element
let svg = d3.select(".map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("align", "center"); 

// ---------------- load dataset -------------------- //
d3.tsv("../data/data.csv")
.row( (d, i) => {
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
}
}
console.log("Activity :",currentActivity,", Times :",timeCurrentActivity);
colorCountries = d3.scaleSequential()
.domain(d3.extent(timeCurrentActivity))
.interpolator(d3.interpolateHcl("yellow", "red"));
});


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
  let id = "buttonActivity"+String(i);
  button.id = id;
  button.classList.add("mode");
  button.innerHTML = activityName;
  document.getElementById("activities").appendChild(button);  
  button.onclick = function(){changeActivity(id)};

  if (i==0) document.getElementById(id).classList.add('selected');
}    