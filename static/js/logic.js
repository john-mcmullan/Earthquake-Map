// Location Coordinates
var worldCoord = [0, 0];
var zoomlevel = 3;


function createMap(highlayer, medlayer, lowlayer, tectoniclayer)
{
    var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

    // grayscale layer
    var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});
    
    //terrain layer
    var terrain = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});


  // Create a baseMaps object to hold the map layer.
    var baseMaps = {
        "Street Map": streetmap,
        "Grayscale": grayscale,
        "Terrain": terrain
      }
    
      // Create an overlayMaps object to hold the magnitude layer.
    var overlayMaps = {
        "High Magnitude Earthquakes": highlayer,
        "Medium Magnitude Earthquakes": medlayer,
        "Low Magnitude Earthquakes": lowlayer,
        "Tectonic Plates": tectoniclayer
      }
    
    var map = L.map("map", {
        center: worldCoord,
        zoom: zoomlevel,
        layers: [streetmap, highlayer, medlayer, lowlayer, tectoniclayer]
    })

    var legend = L.control(
        {
            position: "bottomright"
        }
    )

    legend.onAdd = function()
    {
        var div = L.DomUtil.create("div", "info legend");
        // console.log(div)

        var intervals = [-10, 10, 30, 50, 70, 90];

        var colors = [
            '#00FF00',
            '#66ff00',
            '#ccff00',
            '#FFCC00',
            '#ff6600',
            '#FF0000'
        ]

        for(var i=0; i<intervals.length; i++)
        {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i>" 
            + intervals[i] + (intervals[i+1]  ? ' &ndash; ' + intervals[i+1] + ' <br>': '+')
        }
        return div;
    }
    legend.addTo(map)

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
    }).addTo(map)
}



// create earthquake Markers
function createMarkers(data)
{

    
    quakeInfo = data.features

    Highmag = []
    Medmag = []
    Lowmag = []

    for(i=0; i<quakeInfo.length; i++)
    {
        lat = quakeInfo[i].geometry.coordinates[1]
        lng = quakeInfo[i].geometry.coordinates[0]

        quakeRadius = (quakeInfo[i].properties.mag) * 15000
        var quakeColor;

        if(quakeInfo[i].geometry.coordinates[2] > 90)
        quakeColor = '#FF0000'
        else if(quakeInfo[i].geometry.coordinates[2]> 70)
        quakeColor = '#ff6600'
        else if(quakeInfo[i].geometry.coordinates[2]> 50)
        quakeColor = '#FFCC00'
        else if(quakeInfo[i].geometry.coordinates[2]> 30)
        quakeColor = '#ccff00'
        else if(quakeInfo[i].geometry.coordinates[2]> 10)
        quakeColor = '#66ff00'
        else   
        quakeColor = '#00FF00'
        

        quakeArea = L.circle([lat, lng],{
            fillOpacity: .4,
            color: quakeColor,
            fillColor: quakeColor,
            radius: quakeRadius,
            weight: 1
        }).bindPopup(
            `<h2> ${quakeInfo[i].properties.place}</h2><hr>
            <h3> Date: ${new Date(quakeInfo[i].properties.time)}</h3>
             <h3>Depth: ${quakeInfo[i].geometry.coordinates[2]}</h3>
             <h3>Magnitude: ${quakeInfo[i].properties.mag}`)

        
        if(quakeInfo[i].properties.mag > 6)
            Highmag.push(quakeArea)
        else if(quakeInfo[i].properties.mag > 3.5)
            Medmag.push(quakeArea)
        else   
            Lowmag.push(quakeArea)
        
    }
     

    
    var highlayer = L.layerGroup(Highmag) 
    var medlayer = L.layerGroup(Medmag)
    var lowlayer = L.layerGroup(Lowmag)
    

    createMap(highlayer, medlayer, lowlayer, tectoniclayer)
    
}

d3.json('PB2002_boundaries.json').then(
    function(ldata){
       tectoniclayer = L.geoJson(ldata, {
            color: 'orange',
            weight: 2
        })
    
    },
    createMarkers
)




// Perform call for earthquake information
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(
    // function(data){
    //     console.log(data)
    // },
    createMarkers
)



