class EventList {
    constructor(elementConfig) {
        this.getDataFromServer = this.getDataFromServer.bind(this);
        this.processGetDataFromServer = this.processGetDataFromServer.bind(this);
        this.failGetDataFromServer = this.failGetDataFromServer.bind(this);
        this.sortEventsByDate = this.sortEventsByDate.bind(this);
        this.handleEventsFromMapClick = this.handleEventsFromMapClick.bind(this);

        this.events = [];
        this.domElements = {
            inputs: {
                eventTitle: $(elementConfig.eventTitle),
                eventType: $(elementConfig.eventType),
                eventVenue: $(elementConfig.eventVenue),
                eventCity: $(elementConfig.eventCity),
                eventRange: $(elementConfig.eventRange),
                searchBtn: $(elementConfig.searchBtn),
                sortByDate: $(elementConfig.sortByDate)
            },
            mapArea: $(elementConfig.eventMap),
            eventList: $(elementConfig.eventList)
        };    
        this.eventMap = null;
        this.addEventListeners();
        
    }

    addEventListeners() {
        this.domElements.inputs.searchBtn.click(this.getDataFromServer);
        this.domElements.inputs.sortByDate.change(this.sortEventsByDate);
    }

    getSearchUrl(elements) {
        const title = elements['eventTitle'].value;
        const type = elements['eventType'].value;
        // const venue = elements['eventVenue'].value;
        const city = elements['eventCity'].value;
        // const range = elements['eventRange'].value;
        let url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${title}&classificationName=${type}&city=${city}&countryCode=US&apikey=${TICKET_MASTER_APIKEY}`;
        return url;
    }

    getDataFromServer(e) {
        e.preventDefault();
        this.domElements.inputs.sortByDate.prop("checked", false);
        const searchUrl = this.getSearchUrl(e.currentTarget.form.elements);
        $.ajax({
            url: `${searchUrl}`,
            method: 'GET',
            dataType: 'json'
        })
        .done(this.processGetDataFromServer)
        .fail(this.failGetDataFromServer);
    }

    handleEventsFromMapClick(eventMap, latLng) {
        $.ajax({
            url: `https://app.ticketmaster.com/discovery/v2/events.json?latlong=${latLng.lat()},${latLng.lng()}&countryCode=US&apikey=${TICKET_MASTER_APIKEY}`,
            method: 'GET',
            dataType: 'json'
        })
        .done(this.processGetDataFromServer)
        .fail(this.failGetDataFromServer);
    }

    processGetDataFromServer(response) {
        if(response._embedded) {
            this.events = [];
            this.loadEvents(response._embedded.events);
            this.displayAllEvents(this.events);
        }
        else {
            let $noResult = $("<h4>", {
                text: 'No search results found.'
            })
            this.domElements.mapArea.empty().append($noResult);
        }
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
        this.render(events);
        this.renderMap(events);
    }

    render(eventList) {
        let rows = eventList.map((event) => {
            return event.renderEvent();
        });
        this.domElements.eventList.empty().append(rows);
    }

    renderMap(events) {
        let mapMarkers = events.map((event) => {
            let data = {};
            data.title = event.data.name;
            data.city = event.data._embedded.venues[0].city.name;
            data.venue = event.data._embedded.venues[0].name;
            data.date = event.data.dates.start.localDate;
            data.latLng = event.data._embedded.venues[0].location;

            const mapMarker = new MapMarker(data);
            return mapMarker;
        });

        // Clean the mapArea before generating a new one
        if(this.domElements.mapArea.children().length > 0) {
            this.domElements.mapArea.empty();
        }
        this.eventMap = new EventMap(mapMarkers, { handleClick: this.handleEventsFromMapClick });
        this.eventMap.getMapFromServer();
    }

    addEvent(data) {
        let event = new Event(data);
        this.events.push(event);
        return this.events.length;
    }

    sortEventsByDate() {
        // Do sorting when sort by date is checked
        if(this.domElements.inputs.sortByDate[0].checked && this.events.length > 0) {
            this.events.sort((e1, e2) => {
                if(Date.parse(e1.data.dates.start.localDate) === Date.parse(e2.data.dates.start.localDate)) {
                    return 0;
                }
                return Date.parse(e1.data.dates.start.localDate) < Date.parse(e2.data.dates.start.localDate) ? -1 : 1;
            });
            this.render(this.events);
        }
    }
}