class EventMap {
    constructor(latLngData) {
        this.initMap = this.initMap.bind(this);
        this.failInitMap = this.failInitMap.bind(this);

        var uluru = {lat: -25.344, lng: 131.036};
        var irvine = {lat: 33.6846, lng: -117.8265};
        var newYork = {lat: 40.7128, lng: -74.006};
        this.locations = [uluru, irvine, newYork];

        this.data = latLngData;
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
        var map = new google.maps.Map(
            document.getElementById('map'), { 
                zoom: 3, 
                center: new google.maps.LatLng(2.8,-187.3)
            });
    
        for(let i = 0; i < this.data.length; i++) {
            let latLng = new google.maps.LatLng(this.data[i].latitude, this.data[i].longitude);
            let marker = new google.maps.Marker({
                position: latLng,
                map: map
            });
        }
    }

    failInitMap(error) {
        console.error(error);
    }
}