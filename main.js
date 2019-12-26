$( initializeApp );

function initializeApp() {
    const eventList = new EventList({
        eventTitle: '#eventTitle',
        eventType: '#eventType',
        eventVenue: '#eventVenue',
        eventCity: '#eventCity',
        eventRange: '#eventRange',
        sortBy: '#sort',
        searchBtn: '#searchBtn',
        eventMap: '#map',
        eventList: '#eventsList'
    });
}
