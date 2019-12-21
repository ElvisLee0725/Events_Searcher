class EventMap {
    constructor(mapMarkers, callbacks) {
        this.initMap = this.initMap.bind(this);
        this.failInitMap = this.failInitMap.bind(this);
        this.getEventsNearby = this.getEventsNearby.bind(this);

        this.markers = mapMarkers;
        this.callbacks = callbacks;
    }

    getMapFromServer() {
        $.ajax({
            url: `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_APIKEY}`,
            method: 'GET',
            dataType: 'jsonp'
        })
        .done(this.initMap)
        .fail(this.failInitMap);
    }

    initMap() {
        // Initialize the map
        var map = new google.maps.Map(
            document.getElementById('map'), { 
                zoom: 4, 
                center: new google.maps.LatLng(37.0902, -95.7129)
            });
    
        // Iterate all the event markers and position on the map
        for(let i = 0; i < this.markers.length; i++) {
            let latLng = new google.maps.LatLng(this.markers[i].data.latLng.latitude, this.markers[i].data.latLng.longitude);
            let marker = new google.maps.Marker({
                position: latLng,
                map: map
            });
      
            // Render the content of each marker in the info window
            let infowindow = new google.maps.InfoWindow({
                content: this.markers[i].renderContent()
            });
      
            // Open the info window when click
            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
        }

        // Add click event listener for the map. Fire the callback to get events around the LatLng clicked. 
        map.addListener('click', (e) => {
            this.getEventsNearby(e.latLng);
        });
    }

    failInitMap(error) {
        console.error(error);
    }

    getEventsNearby(latLng) {
        this.callbacks.handleClick(this, latLng);
    }
}
