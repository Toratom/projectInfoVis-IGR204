// Setting up the svg element for D3 to draw in
let w = 1280
let h = 720

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
let init = true;
var timeCurrentCountry = [];
let correspondingActivities = [];

//pour voir le pays qui fait le plus l'activité
let indexCountryMostDoComputing = 0;
let indexCountryMostDoSleep = 0;
let indexCountryMostDoEating = 0;
let indexCountryMostDoStudy = 0;
let indexCountryMostDoLaundry = 0;
let indexCountryMostDoPets =0;
let indexCountryMostDoTravel =0;
let indexCountryMostDoChildcare =0;


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

function getCountryThatDoesMostActivity(activity){

  let index_country = 0;
  let timeActivityCountryMax = 0;
  let indexCurrent = 0;
  for (let i = 0; i < dataset.length; i++) {
    const data = dataset[i];
    if (data["activity"]==activity && data["sex"] == currentSex && data["period"] == currentPeriod){
      if (data["minutes"]>timeActivityCountryMax){
        index_country = indexCurrent;
        timeActivityCountryMax = data["minutes"];
      }
      indexCurrent+=1;
    }
  }
  return index_country;
}

// Create SVG element
let svg = d3.select(".map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("align","center");

// ---------------- load map -------------------- //
// A projection tells D3 how to orient the GeoJSON features
let europeProjection = d3.geoMercator()
.center([ 13, 52 ])
.scale([ w / 1.5 ])
.translate([ w / 2, h / 2 ])
function loadMap(){
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
            //Pour colorier le pays (heatmap) et mettre le logo au pays qui fait le plus l'activité
            
            //on colorie avec le temps de l'activité (-1 si pas de temps)
            let timeUse = -1;
            let nameCountry = d.properties.name;

            for (let i = 0; i < correspondingCountries.length; i++) {
              const country = correspondingCountries[i];

              if (nameCountry == country){
                timeUse = timeCurrentActivity[i];
                [centroid_pixel_x,centroid_pixel_y] = getCountryCentroid(country);
                // svg.append("text").text(node.__data__.properties.name).attr("x",centroid_pixel_x).attr("y",centroid_pixel_y)
                // .attr("fill","black").style("background-color","white");
                
                //pour voir pays qui fait le plus l'activité
                if (i == indexCountryMostDoComputing) svg.append("image").attr("x",centroid_pixel_x-50/2).attr("y",centroid_pixel_y-50/2).attr("xlink:href", "../data/images/icons8_computer_50px.png");
                if (i == indexCountryMostDoSleep) svg.append("image").attr("x",centroid_pixel_x-50/2).attr("y",centroid_pixel_y-50/2).attr("xlink:href", "../data/images/icons8_sleeping_in_bed_50px.png");
                if (i == indexCountryMostDoEating) svg.append("image").attr("x",centroid_pixel_x-50/2).attr("y",centroid_pixel_y-50/2).attr("xlink:href", "../data/images/icons8_restaurant_50px.png");
                if (i == indexCountryMostDoStudy) svg.append("image").attr("x",centroid_pixel_x-50/2).attr("y",centroid_pixel_y-50/2).attr("xlink:href", "../data/images/icons8_reading_50px.png");
                if (i == indexCountryMostDoPets) svg.append("image").attr("x",centroid_pixel_x-50/2).attr("y",centroid_pixel_y-50/2).attr("xlink:href", "../data/images/icons8_dog_50px.png");
                if (i == indexCountryMostDoLaundry) svg.append("image").attr("x",centroid_pixel_x-50/2).attr("y",centroid_pixel_y-50/2).attr("xlink:href", "../data/images/icons8_washing_machine_50px.png");
                if (i == indexCountryMostDoChildcare) svg.append("image").attr("x",centroid_pixel_x-50/2).attr("y",centroid_pixel_y-50/2).attr("xlink:href", "../data/images/icons8_children_50px.png");
                if (i == indexCountryMostDoTravel) svg.append("image").attr("x",centroid_pixel_x-50/2).attr("y",centroid_pixel_y-50/2).attr("xlink:href", "../data/images/icons8_airport_50px.png");


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

            changePieChart(d.properties.name, "Total", svg_tot)
            changePieChart(d.properties.name, "Females", svg_female)
            changePieChart(d.properties.name, "Males", svg_male)

        })
        /*.on("mouseout", function(d) {
            text.style("opacity", 0);
            text.html("")
                .style("left", "-500px")
                .style("top", "-500px");
        });*/
       
        
});
}

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
  let data = dataset[i];

  if (data["activity"]==currentActivity && data["sex"] == currentSex && data["period"] == currentPeriod) {
    timeCurrentActivity.push(data["minutes"]); 
    correspondingCountries.push(data["country"]);
  }
    
  if (data["country"]==currentCountry && data["sex"] == currentSex && data["period"] == currentPeriod) {
    timeCurrentCountry.push(data["minutes"]); 
    correspondingActivities.push(data["activity"]);
  }
}

console.log("Activity :",currentActivity,", Times :",timeCurrentActivity);

colorCountries = d3.scaleSequential()
                .domain(d3.extent(timeCurrentActivity))
                .interpolator(d3.interpolateHcl("yellow", "red"));

console.log("Country :",currentCountry,", Times :",timeCurrentCountry);

colorActivities = d3.scaleSequential()
                .domain(d3.extent(timeCurrentCountry))
                .interpolator(d3.interpolateHcl("yellow", "red"));


//pour voir le pays qui fait le plus l'activité
indexCountryMostDoComputing = getCountryThatDoesMostActivity("Computer games");
indexCountryMostDoSleep = getCountryThatDoesMostActivity("Sleep");
indexCountryMostDoEating = getCountryThatDoesMostActivity("Eating");
indexCountryMostDoStudy = getCountryThatDoesMostActivity("Study");
indexCountryMostDoLaundry = getCountryThatDoesMostActivity("Laundry");
indexCountryMostDoPets = getCountryThatDoesMostActivity("Walking the dog");
indexCountryMostDoChildcare = getCountryThatDoesMostActivity("Childcare, except teaching, reading and talking");
indexCountryMostDoTravel = getCountryThatDoesMostActivity("Travel except travel related to jobs");

loadMap();
});



function getCountryCentroid(country){
  
  let nodes = d3.selectAll("path").nodes();
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.__data__.properties.name==country){
      
      // let bbox = node.getBBox();
      // let centroid = [bbox.x + bbox.width/3, bbox.y + bbox.height/3];
  
      let arrayOfCoordinates = node.__data__.geometry.coordinates[node.__data__.geometry.coordinates.length-1][0]; //on prend le tableau avec le plus de coordonnées pour correspondre au pays sans les iles
      let centroid_x = 0;
      let centroid_y = 0;
      for (let i = 0; i < arrayOfCoordinates.length; i++) {
        centroid_x += arrayOfCoordinates[i][0];
        centroid_y += arrayOfCoordinates[i][1];
      }
      centroid_x/=arrayOfCoordinates.length;
      centroid_y/=arrayOfCoordinates.length;
  
      centroid_pixel_x = europeProjection([centroid_x,centroid_y])[0];
      centroid_pixel_y = europeProjection([centroid_x,centroid_y])[1];
    }
    
  }
  return [centroid_pixel_x,centroid_pixel_y];
}

/*function calculCenterEachCountry(country){

  // let arrayOfCoordinates = country.geometry.coordinates[country.geometry.coordinates.length-1][0]; //on prend le tableau avec le plus de coordonnées pour correspondre au pays sans les iles
  // let centroid_x = 0;
  // let centroid_y = 0;
  // for (let i = 0; i < arrayOfCoordinates.length; i++) {
  //   centroid_x += arrayOfCoordinates[i][0];
  //   centroid_y += arrayOfCoordinates[i][1];
  // }
  // centroid_x/=arrayOfCoordinates.length;
  // centroid_y/=arrayOfCoordinates.length;

  // centroid_pixel_x = europeProjection([centroid_x,centroid_y])[0];
  // centroid_pixel_y = europeProjection([centroid_x,centroid_y])[1];
  
  // console.log(country.getBBox());
   

  // let img = document.createElement("img");
  // img.src = "../data/laundry2.png";

  // console.log(document.getElementsByTagName("svg")[0].style);
  // img.style.left = (centroid_pixel_x - img.width/2)+ "px";
  // img.style.top = (centroid_pixel_y - img.height/2)+150+"px";

  // //console.log([centroid_x,centroid_y]," ",europeProjection([centroid_x,centroid_y]));

  // img.style.position = "absolute";
  // document.getElementsByClassName("map")[0].appendChild(img);

  // let button = document.createElement("BUTTON");
  // button.innerHTML = country.properties.name; 
  // button.style.position = "absolute";
  // let margintop = document.getElementsByClassName("container")[0].getBoundingClientRect().top;
  // let marginLeft = -10//document.getElementsByClassName("container")[0].getBoundingClientRect().left;
  // button.style.left = centroid_pixel_x + marginLeft+"px";
  // button.style.top = centroid_pixel_y  + margintop+"px";
  // document.getElementsByClassName("map")[0].appendChild(button);  
}*/



//pour changer d'activité          
function changeActivity(id) {
  document.getElementById(id).classList.add('selected');
  for (let i = 0; i < allActivities.length; i++) {
    let otherId = "buttonActivity"+String(i);
    if (id != otherId) document.getElementById(otherId).classList.remove('selected');
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

  colorCountries = d3.scaleSequential()
                  .domain(d3.extent(timeCurrentActivity))
                  .interpolator(d3.interpolateHcl("yellow", "red"));

  svg.selectAll("path") // Create the path
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

//Pie Charts

// set the dimensions and margins of the graph
var width = 200
    height = 200
    margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

var svg_tot = d3.select(".charts")
.append("svg")
  .attr("width", width)
  .attr("height", height)
.append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var svg_female = d3.select(".charts")
.append("svg")
  .attr("width", width)
  .attr("height", height)
.append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var svg_male = d3.select(".charts")
.append("svg")
  .attr("width", width)
  .attr("height", height)
.append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color;

function initPieChart(countryName, sex, svg_graph) {
  //pie charts update
  //currentCountry = countryName;
  timeCurrentCountry = [];
  correspondingActivities = [];
  for (let i = 0; i < dataset.length; i++) {
    const data = dataset[i];
    if (data["country"]==countryName && data["sex"] == sex && data["period"] == currentPeriod && data['activity']!='Total'){
      timeCurrentCountry.push(data["minutes"]); 
      correspondingActivities.push(data["activity"]);   
    }
  }

  var have = [];

  for (let i = 0; i < 10; i++) {
    const time = timeCurrentCountry[i];
    const activity = correspondingActivities[i];
    have.push([activity, time]);
  }

  let want = new Map(have);

  // Using Reduce
  want = have.reduce((a, v) => {
    a[v[0]] = v[1];
    return a;
  }, {});

  // set the color scale
  color = d3.scaleOrdinal()
              .domain(want)
              .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])
              //.range(d3.schemeDark2);

  /*var color = d3.scaleOrdinal()
  .domain(correspondingActivities)
  .range(d3.schemeDark2);*/

  // Compute the position of each group on the pie:
  var pie = d3.pie()
             .value(function(d) {return d.value; })

  var data_ready = pie(d3.entries(want))

  var arcGenerator = d3.arc()
                      .innerRadius(0)
                      .outerRadius(radius)

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg_graph.selectAll('whatever')
          .data(data_ready)
          .enter()
          .append('path')
          .attr('d', arcGenerator)
          /*.attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
          )*/
          .attr('fill', function(d){ return(color(d.data.key)) })
          .attr("stroke", "white")
          .style("stroke-width", "2px")
          .style("opacity", 0.9)

  var k = 3;
  svg_graph.selectAll('mySlices')
          .data(data_ready)
          .enter()
          .append('text')
          .text(function(d){ if (k > 0) { 
            k -= 1;
            return d.data.key;
          }
          else return ""})
          .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
          .style("text-anchor", "middle")
          .style("font-size", 17)

}

function updatePieChart(data, svg_graph) {

  // Compute the position of each group on the pie:
  var pie = d3.pie()
    .value(function(d) {return d.value; })
    .sort(function(a, b) { console.log(a) ; return d3.ascending(a.key, b.key);} ) // This make sure that group order remains the same in the pie chart
  var data_ready = pie(d3.entries(data))

  // map to data
  var u = svg_graph.selectAll("path")
    .data(data_ready)

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  u
    .enter()
    .append('path')
    .merge(u)
    .transition()
    .duration(1000)
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(radius)
    )
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.9)

  // remove the group that is not present anymore
  u
    .exit()
    .remove()
	
}

function changePieChart(countryName, sex, svg_graph) {
    //pie charts update
    //currentCountry = countryName;
    timeCurrentCountry = [];
    correspondingActivities = [];
    for (let i = 0; i < dataset.length; i++) {
      const data = dataset[i];
      if (data["country"]==countryName && data["sex"] == sex && data["period"] == currentPeriod && data['activity']!='Total'){
        timeCurrentCountry.push(data["minutes"]); 
        correspondingActivities.push(data["activity"]);   
      }
    }
  
    var have = [];
  
    for (let i = 0; i < 10; i++) {
      const time = timeCurrentCountry[i];
      const activity = correspondingActivities[i];
      have.push([activity, time]);
    }
  
    let want = new Map(have);
  
    // Using Reduce
    want = have.reduce((a, v) => {
      a[v[0]] = v[1];
      return a;
    }, {});
    updatePieChart(want, svg_graph)
}


function init2() {
  initPieChart("France", "Total", svg_tot)
  initPieChart("France", "Females", svg_female)
  initPieChart("France", "Males", svg_male)
}

var searchBar = document.getElementById("searchBar")

function searchActivities() {
  let input = searchBar.value.toLowerCase()
    
  for (i = 0; i < allActivities.length; i++) { 
    let id = "buttonActivity" + String(i);
    if (allActivities[i].toLowerCase().includes(input)) {
      document.getElementById(id).classList.add('searched');
      document.getElementById(id).classList.remove('not_searched');
    }
    else { 
      document.getElementById(id).classList.add('not_searched'); 
      document.getElementById(id).classList.remove('searched');             
    }
  }
}

