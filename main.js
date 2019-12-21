$( initializeApp );

function initializeApp() {
    let eventList = new EventList({
        eventTitle: $('#eventTitle'),
        eventType: $('#eventType'),
        eventVenue: $('#eventVenue'),
        eventCity: $('#eventCity'),
        eventRange: $('#eventRange'),
        sortByDate: $('#sortByDate'),
        searchBtn: '#searchBtn',
        eventMap: '#map',
        eventList: '#eventsList'
    });
    // eventList.getDataFromServer();
}
