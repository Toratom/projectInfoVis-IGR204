

/* PSEUDO CODE TO TEST TEH REPRSENTATION

CREATE NEW DATA SET RANDOMLY WICH WILL CORREPSOND TO A CERTAIN FEATURE

SELECT A INDEX OF THE ARRAY AND COMPUTE THE DISTANCE TO EACH ELEMENT 

DISPLAY THE ELEMENT ACCORDINGLY TO THE DISTANCE

WITH INDEX SELECTED AT THE CENTER ATTRIBUTE AT EACH DISTANCE A LENTGH AND DISPLAY ELEMENT ACCORDINGLY /
FIND A THETA FOR EACH ELEMENT (THETA-STEP = 360 / NSAMPLES)

COORDINATE ON THE SVG : (X =COS THETA * LENGTH,  Y = SIN THETA * LENGTH ) 







*/
const w = 600
const h = 600
let dataset = []
for (i = 0; i < 20 ; i++){
    dataset = [ Math.random() * 10, ...dataset]
}

function getDMax(c) {
    let dmax = -1.
    let d = 0.

    for (i = 0; i < dataset.length; i++) {
        d = Math.abs(dataset[i] -  dataset[c])
        if (d > dmax) dmax = d
    }
    return dmax
}

let x 
let y

let N = dataset.length
let center = 0
let dotR = 10.
let dMax = getDMax(center) //a update quand center change
let rMin = (N * dotR) / Math.PI
let rMax = 5. * rMin
let theta  = 2 * Math.PI / (N + 1)
let centerPosX = rMax + 10
let centerPosY = rMax + 10
let nbOfScaleCercles = 10


let svg = d3.select("body").append("svg").attr("width", w+100).attr("height", h+100)
//dessine les échelles
for (i = 0; i < nbOfScaleCercles; i++) {
    let r = (rMax - rMin) * (i) / (nbOfScaleCercles - 1) + rMin
    svg.append("circle")
    .attr("cx", centerPosX)
    .attr("cy", centerPosY)
    .attr("r", r)
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("stroke-width", "1")
    .attr("stroke-dasharray", "5,10,5")
}


function draw(){
    svg.selectAll("line")
        .data(dataset)
        .enter()
        .append("line")
        .attr("x1", centerPosX)
        .attr("y1", centerPosY)
        .attr("x2", (d, index) => {
            if (index == center) return centerPosX
            let distanceToCenter = Math.abs(d -  dataset[center])
            return (centerPosX + ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.sin(index * theta)))
        })
        .attr("y2", (d, index) => {
            if (index == center) return centerPosY
            let distanceToCenter = Math.abs(d -  dataset[center])
            return (centerPosY - ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.cos(index * theta)))
        })
        .attr('stroke-width', '1')
        .attr('stroke', 'black')
    
    svg.selectAll("circle").filter("dot") //Pour eviter interference avec les cercles de l'échelle ajoute une classe (?) dot et filtre
        .data(dataset)
        .enter()
        .append("circle")
        .attr("r", (d) => dotR)
        .attr("cx", (d, index)=> {
            if(index != center) {
                let distanceToCenter = Math.abs(d -  dataset[center])
                return (centerPosX + ((rMax - rMin) * distanceToCenter / dMax + rMin) * (Math.sin(index * theta))) 
            }
            else{
                return centerPosX
            }
        })
        .attr("cy", (d, index)=>{ 
            if(index != center) {
                let distanceToCenter = Math.abs(d -  dataset[center])
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
        
        console.log("test")
        // svg.append("g")
        // .attr("class", "x axis")
        // .attr("transform", "translate(0, " + (h)  +")")
        // .call(d3.axisBottom(x))
        // svg.append("g")
        //     .attr("class", "y axis")
        //     .call(d3.axisRight(y))
    
}

draw()
       


        

  