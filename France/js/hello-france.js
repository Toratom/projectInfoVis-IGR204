

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
for (i = 0; i < 10 ; i++){
    dataset = [ Math.random() * 10, ...dataset]
}


let x 
let y 


let theta  = 2 * Math.PI / (dataset.length + 1)
center= 2

let svg = d3.select("body").append("svg").attr("width", w+100).attr("height", h+100)


console.log("test")



function draw(){
    svg.selectAll("circle")
        
        .data(dataset)
        .enter()
        .append("circle")
        .attr("r",(d)=> 10)
        .attr("cx", (d, index)=> { console.log(index);
            if(index != center){
            return(Math.abs(d -  dataset[center])* 10 * (Math.cos(index* theta)  ) +300    ) 

            }
            else{
                return 300
            }
        })
        .attr("cy", (d, index)=>{ 
            if(index != center){
                console.log(index)
                console.log(center)
                return(Math.abs(d -  dataset[center]) * 10* (Math.sin(index* theta)) +300 )
            }
            else{
                return(300);
            }
        })

        .attr("fill", (d,index) => ((index==center)?"red": "black"))
        
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

        
       


        

  