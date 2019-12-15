class EventList {
    constructor(elementConfig) {
        this.processGetDataFromServer = this.processGetDataFromServer.bind(this);
        this.failGetDataFromServer = this.failGetDataFromServer.bind(this);
        this.events = [];
        this.domElements = {
            inputs: {
                eventTitle: $(elementConfig.eventTitle)
            },
            mapArea: $(elementConfig.eventMap),
            eventList: $(elementConfig.eventList)
        };    
        this.eventMap = null;
    }
    getDataFromServer() {
        $.ajax({
            url: `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&apikey=${TICKET_MASTER_APIKEY}`,
            method: 'GET',
            dataType: 'json'
        })
        .done(this.processGetDataFromServer)
        .fail(this.failGetDataFromServer);
    }

    processGetDataFromServer(response) {
        this.loadEvents(response._embedded.events);
        this.displayAllEvents(this.events);
    }

    failGetDataFromServer(error) {
        console.error(error);
    }
    
    loadEvents(eventsData) {
        eventsData.forEach((data) => {
            this.addEvent(data);
        });
    }

    displayAllEvents(events) {
        let eventList = [];
        eventList = events.map((event) => {
            return event.renderEvent();
        });
        this.domElements.eventList.empty().append(eventList);
        let latLngData = this.events.map((event) => {
            return event.data._embedded.venues[0].location;
        });

        console.log(latLngData);
        this.eventMap = new EventMap(latLngData);
        this.eventMap.getMapFromServer();
    }

    addEvent(data) {
        let event = new Event(data);
        this.events.push(event);
        return this.events.length;
    }
}