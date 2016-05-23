

var map = null;
var placeMarker = null;
var memberDataArray = null;
var markerArray = [];
var spinner = null;

// Build icon types
function iconType(color) {
  return {
    path: "M648 1169q117 0 216 -60t156.5 -161t57.5 -218q0 -115 -70 -258q-69 -109 -158 -225.5t-143 -179.5l-54 -62q-9 8 -25.5 24.5t-63.5 67.5t-91 103t-98.5 128t-95.5 148q-60 132 -60 249q0 88 34 169.5t91.5 142t137 96.5t166.5 36zM652.5 974q-91.5 0 -156.5 -65 t-65 -157t65 -156.5t156.5 -64.5t156.5 64.5t65 156.5t-65 157t-156.5 65z", 
    scale: 0.03,
    rotation: 180,
    fillOpacity:1,
    fillColor: color,
    strokeColor: color
  }
}

// Hold array of different icons for legend
var icons = {
     "Dentist": iconType("green"),
     "Dental Care Professional": iconType("blue"),
     "Visiting Practitioner: Dentist": iconType("yellow"),
     "Temporary Registrant Dentist": iconType("red")
}


function init(){

  
  NE_UK = {lat: 61.108656, lng: 2.501387}
  SW_UK = {lat: 48.817585, lng: -13.890215}

  // Create map to visualize points
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: (NE_UK.lat + SW_UK.lat) /2, lng: (NE_UK.lng + SW_UK.lng)/2},
    scrollwheel: false, 
    zoom: 5
  });

  var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(NE_UK),
    new google.maps.LatLng(SW_UK)
  );

  var input = document.getElementById('postCode');
  var options = {
    bounds: defaultBounds
  };
  console.log(google.maps)
  var searchBox = new google.maps.places.SearchBox(input, options);
  
  // Listener for selected suggestions
  searchBox.addListener('places_changed', function() {
    console.log("length of markerArray is " + markerArray.length)
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Remove all Markers already there (if any)
    markerArray.forEach(function (marker) {
      marker.setMap(null);
      delete marker;
    })

    // Get the first location and update map
    var newLocation = places[0].geometry.location;
    updateBounds(newLocation);
    

    // Place marker
    placeMarker(newLocation, "red", "center point");
  })


  // Listener for when changing distance option
  $("#distance").change(function(e) {
    updateBounds(map.getCenter());
  })

  function updateBounds(centerPoint) {
    var distance = Number($("#distance option:selected").val().split(" ")[0]) * 500;
    var NE_POINT = google.maps.geometry.spherical.computeOffset(centerPoint, distance, 45);
    var SW_POINT = google.maps.geometry.spherical.computeOffset(centerPoint, distance, 180+45);

    // Fit the new bounds to match point and distance
    map.fitBounds(new google.maps.LatLngBounds(SW_POINT, NE_POINT));
  }

  placeMarker = function(point, icon, title) {
    // flag = flag.split(" ").reverse().join()
    // Places a marker on the map at point
    var marker = new google.maps.Marker({
      position: point,
      icon: icon,
      map: map,
      // animation: google.maps.Animation.DROP,
      title: title
    })

    markerArray.push(marker);
    return marker
  }

}

$("document").ready(function() {

  // Save information to csv file
  $("#csvButton").click(function () {
    if(memberDataArray == null) {
      errorToast("No member data to convert to CSV");
    } else {
      // Remove the Position information
      memberDataArray.forEach(function(member){
        delete member.location
      })
      JSONToCSVConvertor(memberDataArray, "Tubules Members", true);
    }
  })

  var legend = $('#legend');

  $.each(icons, function(key, icon) {
    console.log("working")
    // var svg = $("<svg height=10 width=10></svg>")
    var rect = $("<rect x=0 y=0 width=10px height=10px></rect>",{
      style: "fill: " + icon.fill + ";\n" + "strokeColor: " + icon.strokeColor + ";"
    });

    $("#legendSVG").append(rect);
  });

  // Get the spinner ready!

  var opts = {
      lines: 13, // The number of lines to draw
      length: 28, // The length of each line
      width: 10, // The line thickness
      radius: 55, // The radius of the inner circle
      scale: 1, // Scales overall size of the spinner
      corners: 0.5, // Corner roundness (0..1)
      color: '#990000', // #rgb or #rrggbb or array of colors
      opacity: 0, // Opacity of the lines
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      speed: 1.1, // Rounds per second
      trail: 98, // Afterglow percentage
      fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      className: 'spinner', // The CSS class to assign to the spinner
      top: '1000%', // Top position relative to parent
      left: '50%', // Left position relative to parent
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      position: 'absolute' // Element positioning
  }
  spinner = new Spinner(opts);
})


function getMembers() {
  // Start the spinner
  console.log(spinner);

  var target = document.getElementById('submitBtn')
  spinner.spin(target)
  console.log(spinner);
  // Extract distance information
  var distance = Number($("#distance option:selected").val().split(" ")[0]);
  // Make ajax request

  $.ajax({
      url: "/members",
      data: {
        "distance": distance,
        "lat": map.getCenter().lat,
        "lng": map.getCenter().lng
      },
      success: function(response) {
        memberDataArray = response.data;

        if (response.data.length == 0) {
          errorToast("No members found")
        }
        processData(response.data)

        // Stop the spinner
        spinner.stop();
      },
      error: function(error) {
        errorToast("Something went wrong :(")
        console.log(error);
        spinner.stop();
      }
  });
}

function processData(data) {
  // Place markers for each onto map
  data.forEach(function(d) {
    var icon = icons(d["Registrant Type"])
    var m = placeMarker(d.location, icon, d["Registrant Type"])

    // info window
    var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h3 id="firstHeading" class="firstHeading">' + d["firstname"] + ' ' + d["surname"] + '</h3>'+
      '<div id="bodyContent">'+
      '<p>' + d["address"] + '</p>'+
      '</div>'+
      '</div>';

    var infoWindow = new google.maps.InfoWindow({
      content: contentString
    })

    m.addListener("click", function() {
      infoWindow.open(map, m);
    });
  });
}


// Returns Jquery DOM element of succesfull button
function successBtn(){
  var div = $("<div/>", {
    class:  "col-sm-12 alert-block alert alert-danger fade-in"
  }).html("No members found from that point with that distance")

  div.append($("<a/>", {
    "class": "close",
    "data-dismiss":"alert",
    "aria-label":"close",
  }).html("&times;"))
  return div;
}

function errorToast(string) {
  $.notify({message: string},{type:'danger'})
}


function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
  //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
  var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
  
  var CSV = '';    
  //Set Report title in first row or line
  
  CSV += ReportTitle + '\r\n\n';

  //This condition will generate the Label/Header
  if (ShowLabel) {
      var row = "";
      
      //This loop will extract the label from 1st index of on array
      for (var index in arrData[0]) {
          
          //Now convert each value to string and comma-seprated
          row += index + ',';
      }

      row = row.slice(0, -1);
      
      //append Label row with line break
      CSV += row + '\r\n';
  }
  
  //1st loop is to extract each row
  for (var i = 0; i < arrData.length; i++) {
      var row = "";
      
      //2nd loop will extract each column and convert it in string comma-seprated
      for (var index in arrData[i]) {
          row += '"' + arrData[i][index] + '",';
      }

      row.slice(0, row.length - 1);
      
      //add a line break after each row
      CSV += row + '\r\n';
  }

  if (CSV == '') {        
      alert("Invalid data");
      return;
  }   
  
  //Generate a file name
  var fileName = "MyReport_";
  //this will remove the blank-spaces from the title and replace it with an underscore
  fileName += ReportTitle.replace(/ /g,"_");   
  
  //Initialize file format you want csv or xls
  var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
  
  // Now the little tricky part.
  // you can use either>> window.open(uri);
  // but this will not work in some browsers
  // or you will not get the correct file extension    
  
  //this trick will generate a temp <a /> tag
  var link = document.createElement("a");    
  link.href = uri;
  
  //set the visibility hidden so it will not effect on your web-layout
  link.style = "visibility:hidden";
  link.download = fileName + ".csv";
  
  //this part will append the anchor tag and remove it after automatic click
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}