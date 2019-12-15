$( initializeApp );

function initializeApp() {
    let eventList = new EventList({
        eventTitle: $('.eventTitle'),
        eventMap: $('#map'),
        eventList: $('#eventsList')
    });
    eventList.getDataFromServer();

}
