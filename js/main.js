// Setting up the svg element for D3 to draw in
let w = window.innerWidth / 2. - 20
let h = window.innerHeight / 1.5

let text = d3.select(".text");
let activityName = d3.select(".activityName");

let colorCountries; //colorisateur pour la heatmap
let dataset = []; //full dataset
let timeCurrentActivity = []; //tableau des minutes pour une activité / une période / un sexe (ou le total), trié par rapport au nom du pays alphabétiquement
let correspondingCountries = []; //même taille que timeCurrentActivity, correspondingCountries[i] est le pays dont l'activité dure timeCurrentActivity[i] 

let currentActivity = "Personal care";
let currentSex = "Total";
let currentPeriod = "All days of the week";

let colorActivities;
let currentCountry = "Belgium";
let neighborsToCurrentCountry = []
let init = true;
var timeCurrentCountry = [];
let correspondingActivities = [];

//pour voir le pays qui fait le plus l'activité
let indexCountryMostDoComputing = 0;
let indexCountryMostDoSleep = 0;
let indexCountryMostDoEating = 0;
let indexCountryMostDoStudy = 0;
let indexCountryMostDoLaundry = 0;
let indexCountryMostDoPets = 0;
let indexCountryMostDoTravel = 0;
let indexCountryMostDoChildcare = 0;


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
.translate([ 0.5 * w , 0.6 * h ])


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

                break;

              }
            }

            
            if (timeUse==-1) return "white"; //si on a pas la donnée du pays on met en blanc
            else return colorCountries(timeUse)})

          .on("click", function(d) {

            changePieChart(d.properties.name, "Total", svg_tot, 0, 5)
            changePieChart(d.properties.name, "Females", svg_female, 0, 5)
            changePieChart(d.properties.name, "Males", svg_male, 0, 5)
            changePieChart(d.properties.name, "Total", svg_tot_details, 5, 10)
            changePieChart(d.properties.name, "Females", svg_female_details, 5, 10)
            changePieChart(d.properties.name, "Males", svg_male_details, 5, 10)

            //Click pays update currentCountry     
            currentCountry = d.properties.name

            //Update distance to currentCountry
            neighborsToCurrentCountry = updateNeighborsToCurrentCountry()
            
            text.html("Country: " + d.properties.name)
            updateSO()
            
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

loadMap()
initFirstPieChart()
//neighborsToCurrentCountry = updateNeighborsToCurrentCountry()
initSO()
});


function getCountryCentroid(country){
  let nodes = svg.selectAll("path").nodes();
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

function updateNeighborsToCurrentCountry() {
  let tmp = []
  let centre1 = getCountryCentroid(currentCountry)
  let centre2 = 0
  let d = 0
  for (const c of correspondingCountries) {
    centre2 = getCountryCentroid(c)
    d = Math.sqrt(Math.pow(centre1[0] - centre2[0], 2) + Math.pow(centre1[1] - centre2[1], 2))
    tmp.push(d)
  }
  return tmp
}

// ---------------- Solar Orbit -------------------- //
textSO = d3.select(".textSO")

function getDMax(c) {
  let dmax = -1.
  let d = 0.

  for (i = 0; i < timeCurrentActivity.length; i++) {
      d = Math.abs(timeCurrentActivity[i] -  timeCurrentActivity[c])
      if (d > dmax) dmax = d
  }
  return dmax
}

function argsort(array) {
  const arrayObject = array.map((value, idx) => { return { value, idx }; });
  arrayObject.sort((a, b) => {

      if (a.value < b.value) {

          return -1;

      }

      if (a.value > b.value) {

          return 1;

      }

      return 0;

  });
  const argIndices = arrayObject.map(data => data.idx);
  return argIndices;
}


let svgSO = d3.select(".solarOrbit").append("svg").attr("width", w).attr("height", h)
let dotR = 8.
let rMax = h/2. - 10.
let centerPosX = w / 2.
let centerPosY = h / 2.
let nbOfScaleCercles = 5
//dessine les échelles
for (i = 0; i < nbOfScaleCercles; i++) {
  svgSO.append("circle")
  .attr('class', 'scaleCercle')
  .attr("cx", centerPosX)
  .attr("cy", centerPosY)
  .attr("r", 0)
  .attr("fill", "none")
  .attr("stroke", "gray")
  .attr("stroke-width", "1")
  .attr("stroke-dasharray", "5,10,5")
}


function initSO(){
  let N = timeCurrentActivity.length
  let rMin = (N * dotR) / Math.PI
  let center = correspondingCountries.indexOf(currentCountry)
  let dMax = getDMax(center) //a update quand center change
  let theta  = 2 * Math.PI / (N + 1)

  //Mais à jour les echelles car N a possiblement change donc rmin aussi
  svgSO.selectAll(".scaleCercle").attr("r", (d, i) => {return (rMax - rMin) * (i) / (nbOfScaleCercles - 1) + rMin})

  svgSO.selectAll("line")
        .data(timeCurrentActivity)
        .enter()
        .append("line")
        .attr("x1", centerPosX)
        .attr("y1", centerPosY)
        .attr("x2", (d, index) => {
            if (index == center) return centerPosX
            let distanceToCenter = Math.abs(d -  timeCurrentActivity[center])
            return (centerPosX + ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.sin(index * theta)))
        })
        .attr("y2", (d, index) => {
            if (index == center) return centerPosY
            let distanceToCenter = Math.abs(d -  timeCurrentActivity[center])
            return (centerPosY - ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.cos(index * theta)))
        })
        .attr('stroke-width', '1')
        .attr('stroke', 'black')
  
  svgSO.selectAll("circle")
        .filter(function() {
          return !this.classList.contains("scaleCercle")
        })
        .data(timeCurrentActivity)
        .enter()
        .append("circle")
        .attr('class', 'dot')
        .attr("r", (d) => dotR)
        .attr("cx", (d, index)=> {
            if(index != center) {
                let distanceToCenter = Math.abs(d -  timeCurrentActivity[center])
                return (centerPosX + ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.sin(index * theta))) 
            }
            else{
                return centerPosX
            }
        })
        .attr("cy", (d, index)=>{ 
            if(index != center) {
                let distanceToCenter = Math.abs(d -  timeCurrentActivity[center])
                return(centerPosY - ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.cos(index * theta)))
            }
            else {
                return centerPosY;
            }
        })
        .attr("fill", (d, index) => {
            color = d3.interpolate("red", "blue")(index / N)
            //color = ((index==center)?"red": "black")
            return color
        })
        .on("mouseover", function(d, index) {
          textSO.html("Country: " + correspondingCountries[index] + "<br>" +
                      "Value: " + d + " min")
        })
}

function updateSO(){
  countryOrder = argsort(neighborsToCurrentCountry)

  let N = timeCurrentActivity.length
  let rMin = (N * dotR) / Math.PI
  let center = correspondingCountries.indexOf(currentCountry)
  let dMax = getDMax(center) //a update quand center change
  let theta  = 2 * Math.PI / (N + 1)
  if (correspondingCountries.includes(currentCountry)) {
    //Mais à jour les echelles car N a possiblement change donc rmin aussi
    svgSO.selectAll(".scaleCercle").attr("r", (d, i) => {return (rMax - rMin) * (i) / (nbOfScaleCercles - 1) + rMin})

    var pathLine = svgSO.selectAll("line").data(timeCurrentActivity)
    pathLine.enter()
          .append("line")
          .merge(pathLine)
          .transition()
          .duration(1000)
          .attr("x1", centerPosX)
          .attr("y1", centerPosY)
          .attr("x2", (d, index) => {
              if (index == center) return centerPosX
              let distanceToCenter = Math.abs(d -  timeCurrentActivity[center])
              return (centerPosX + ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.sin(countryOrder.indexOf(index) * theta)))
          })
          .attr("y2", (d, index) => {
              if (index == center) return centerPosY
              let distanceToCenter = Math.abs(d -  timeCurrentActivity[center])
              return (centerPosY - ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.cos(countryOrder.indexOf(index) * theta)))
          })
    pathLine.exit().remove()
    
    var pathDot = svgSO.selectAll(".dot").data(timeCurrentActivity)
    pathDot.enter()
          .append("circle")
          .merge(pathDot)
          .transition()
          .duration(1000)
          .attr("r", (d) => dotR)
          .attr("cx", (d, index)=> {
              if(index != center) {
                  let distanceToCenter = Math.abs(d -  timeCurrentActivity[center])
                  return (centerPosX + ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.sin(countryOrder.indexOf(index) * theta))) 
              }
              else{
                  return centerPosX
              }
          })
          .attr("cy", (d, index)=>{ 
              if(index != center) {
                  let distanceToCenter = Math.abs(d -  timeCurrentActivity[center])
                  return(centerPosY - ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.cos(countryOrder.indexOf(index) * theta)))
              }
              else {
                  return centerPosY;
              }
          })
          .attr("fill", (d, index) => {
              color = d3.interpolate("red", "blue")(index / N)
              //color = ((index==center)?"red": "black")
              return color
          })
    pathDot.exit().remove()
  }
}
//Fin solar orbit

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
  //Update le solor orbite
  updateSO()
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

  if (i==1) document.getElementById(id).classList.add('selected');
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

var svg_tot_details = d3.select(".charts")
.append("svg")
  .attr("width", width)
  .attr("height", height)
.append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var svg_female_details = d3.select(".charts")
.append("svg")
  .attr("width", width)
  .attr("height", height)
.append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var svg_male_details = d3.select(".charts")
.append("svg")
  .attr("width", width)
  .attr("height", height)
.append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var colorPieChart;

function initPieChart(countryName, sex, svg_graph, start, stop) {
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

  for (let i = start; i < stop; i++) {
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
  colorPieChart = d3.scaleOrdinal()
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
  svg_graph.selectAll('path')
          .data(data_ready)
          .enter()
          .append('path')
          .attr('d', arcGenerator)
          /*.attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
          )*/
          .attr('fill', function(d){ return(colorPieChart(d.data.key)) })
          .attr("stroke", "white")
          .style("stroke-width", "2px")
          .style("opacity", 0.9)
          .on("mouseover", function(d) {
            activityName.transition()        
                .duration(200)
                .style("opacity", .9);      
                activityName.html("Country: " + d.data.key)  
                .style("left", (d3.event.pageX + 30) + "px")     
                .style("top", (d3.event.pageY - 30) + "px")

          })
          .on("mouseout", function(d) {
            activityName.style("opacity", 0);
            activityName.html("")
                  .style("left", "-5000px")
                  .style("top", "-5000px");
          }); 

  /*var k = 3;
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
          .style("font-size", 17)*/

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
  u.enter()
    .append('path')
    .merge(u)
    .transition()
    .duration(1000)
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(radius)
    )
    .attr('fill', function(d){ return(colorPieChart(d.data.key)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.9)

  // remove the group that is not present anymore
  u.exit()
    .remove()
	
}

function changePieChart(countryName, sex, svg_graph, start, stop) {
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
  
    for (let i = start; i < stop; i++) {
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


function initFirstPieChart() {
  initPieChart("France", "Total", svg_tot, 0, 5)
  initPieChart("France", "Females", svg_female, 0, 5)
  initPieChart("France", "Males", svg_male, 0, 5)
  initPieChart("France", "Total", svg_tot_details, 5, 10)
  initPieChart("France", "Females", svg_female_details, 5, 10)
  initPieChart("France", "Males", svg_male_details, 5, 10)
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