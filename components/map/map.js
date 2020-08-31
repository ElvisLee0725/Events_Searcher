class EventMap {
  constructor(mapDom, callbacks) {
    this.initMap = this.initMap.bind(this);
    this.failInitMap = this.failInitMap.bind(this);
    this.getEventsNearby = this.getEventsNearby.bind(this);

    this.domElements = {
      map: mapDom,
    };
    // This array stores the real Google Map markers instead of the MapMarker class I created
    this.markers = [];
    this.callbacks = callbacks;
    this.map = null;
  }

  getMapFromServer() {
    $.ajax({
      url: `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_APIKEY}`,
      method: 'GET',
      dataType: 'jsonp',
    })
      .done(this.initMap)
      .fail(this.failInitMap);
  }

  initMap() {
    // Initialize the map
    this.map = new google.maps.Map(this.domElements.map[0], {
      zoom: 4,
      center: new google.maps.LatLng(37.0902, -95.7129),
    });

    // Add click event listener for the map. Fire the callback to get events around the LatLng clicked.
    this.map.addListener('click', (e) => {
      this.getEventsNearby(e.latLng);
    });
  }

  failInitMap(error) {
    console.error(error);
  }

  getEventsNearby(latLng) {
    this.callbacks.handleClick(this, latLng);
  }

  renderMarkersOnMap(mapMarkers) {
    // Keep track of the previous open infoWindow so when a new one is click, previous one can be closed.
    let prev_infoWindow = false;

    // Iterate all customized event markers data and transform them to Google Map markers
    mapMarkers.forEach((m) => {
      let latLng = new google.maps.LatLng(
        m.data.latLng.latitude,
        m.data.latLng.longitude
      );
      let marker = new google.maps.Marker({
        position: latLng,
        // map: this.map
      });

      // Render the content of each marker in the info window
      let infowindow = new google.maps.InfoWindow({
        content: m.renderContent(),
      });

      // Open the info window when click
      marker.addListener('click', function () {
        if (prev_infoWindow) {
          prev_infoWindow.close();
        }
        prev_infoWindow = infowindow;
        infowindow.open(this.map, marker);
      });

      // Add the new Google Map marker into the markers array
      this.markers.push(marker);
    });

    // Set all markers in the array onto the map
    this.setMapOnAll(this.map);
  }

  // Sets a map with all markers in markers []
  setMapOnAll(map) {
    // Iterate each marker in the array and either setMap with either null or the map itself
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
      // Make sure the map exists since clearMarkers will set the map to null
      if (map && i === 0) {
        map.panTo(this.markers[i].position);
        map.setZoom(13);
      }
    }
  }

  // Remove the markers from map but keeps them in markers array
  clearMarkers() {
    this.setMapOnAll(null);
  }

  // Actually delete the markers array
  deleteMarkers() {
    this.clearMarkers();
    this.markers = [];
  }
}
