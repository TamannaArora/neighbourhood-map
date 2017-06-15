var map; //To store main map
var myloc = {
    lat: 12.9716,
    lng: 77.5946
};
var service;
var infowindow; //Popup window
var locations
var markers = []; // To store markers
var metadata;

function get_Restaurant() {
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search?v=20161016&ll=12.9716%20%2C%2077.5946&query=restaurant&intent=checkin&client_id=683325004422-eggqohup4f220qqj0jhs90v0t0tidgta&client_secret=mdTyQtIVy6MO-GMAmoxvCjcE',
        async: true
    }).done(function(response) {
        metadata = response.response.venues;
        for (var x = 0; x < metadata.length; x++) {
            var lat = metadata[x].location.lat;
            var lng = metadata[x].location.lng;
            var p = {
                loc: {
                    lat,
                    lng
                }
                title: metadata[x].name,
            };
            locations.push(p);
            var marker = new google.maps.Marker({
                loc: {
                    lat,
                    lng
                },
                title: metadata[x].name,
                address: metadata[x].location.address,
                phone_no: metadata[x].contact.phone,
                animation: google.maps.Animation.DROP
                map: map,
            });

            markers.push(marker);
            marker.addListener('click', function() {
                dataInfoWindow(this, infowindow);
            });
        }
        myVModel.init();
    }).fail(function(response, status, error) {
        myVModel.error(true);
        myVModel.errorMessage('The Restaurant could not be loaded');
    });
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: myloc,
        zoom: 13,
    });
    infowindow = new google.maps.InfoWindow({
        maxWidth: 100
    });

    get_Restaurant();

}


function ErrorMethod() {
    myVModel.error('Map cannot be Loaded');
    myVModel.isError(true);
}

//putting the data into the infowindow
function dataInfoWindow(marker, infowindow) {
    var content = marker.sres;

    if (infowindow.marker !== undefined && infowindow.marker !== marker) {
        infowindow.marker.setAnimation(null);
    }

    infowindow.marker = marker;

    infowindow.marker.setAnimation(google.maps.Animation.BOUNCE);

    infowindow.setContent(content);

    infowindow.open(map, marker);

    infowindow.addListener('closeclick', function() {
        infowindow.marker.setAnimation(null);
    });
}

function FocusMarker(mTitle) {

    for (var x in markers) {
        if (markers[x].title == mTitle) {
            dataInfoWindow(markers[x], infowindow);
            return;
        }
    }
}

// function to show markers
function showMarkers() {
    myVModel.sQuery('');
    var bLimit = new google.maps.LatLngBounds();
    for (var x = 0; x < markers.length; x++) {
        markers[x].setMap(map);
        bLimit.extend(markers[x].position);
    }
    map.fitBounds(bLimit);
}
// function to hide markers

function hideMarkers() {
    for (var x = 0; x < markers.length; x++) {
        markers[x].setMap(null);
    }
}


// Creating View model to apply knockout js
var myVModel = {
    Rlist: ko.observableArray([]),
    sQuery: ko.observable(''),
    error: ko.observable(false),
    errorMessage: ko.observable(''),
    init: function() {
        for (var x in locations) {
            myVModel.Rlist.push(locations[x]);
        }
    },
    searchRes: function(query) {
        myVModel.Rlist.removeAll();
        for (var x = 0; x < locations.length; x++) {
            if (locations[x].title.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                markers[x].setMap(map);
                myVModel.Rlist.push(locations[x]);
            } else {
                markers[x].setMap(null);
            }
        }
    },
}

ko.applyBindings(myVModel);
myVModel.sQuery.subscribe(myVModel.searchRes);