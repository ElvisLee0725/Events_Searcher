class EventList {
  constructor(elementConfig) {
    this.getDataFromServer = this.getDataFromServer.bind(this);
    this.processGetDataFromServer = this.processGetDataFromServer.bind(this);
    this.failGetDataFromServer = this.failGetDataFromServer.bind(this);
    this.sortEventList = this.sortEventList.bind(this);
    this.handleEventsFromMapClick = this.handleEventsFromMapClick.bind(this);
    this.handlePrevBtnClick = this.handlePrevBtnClick.bind(this);
    this.handleNextBtnClick = this.handleNextBtnClick.bind(this);

    this.events = [];
    this.domElements = {
      inputs: {
        eventTitle: $(elementConfig.eventTitle),
        eventType: $(elementConfig.eventType),
        eventCity: $(elementConfig.eventCity),
        eventState: $(elementConfig.eventState),
        searchBtn: $(elementConfig.searchBtn),
        sortBy: $(elementConfig.sortBy),
      },
      mapArea: $(elementConfig.eventMap),
      noResultMsg: $(elementConfig.noResultMsg),
      eventsPagination: $(elementConfig.eventsPagination),
      pagination: {
        prevBtn: null,
        nextBtn: null,
        pageNumber: $(elementConfig.pageNumber),
      },
      eventList: $(elementConfig.eventList),
    };
    // Initialize the map. ** We only want to load the map once! After each search just change the markers on it.
    // If we destroy the previous map and build a new one each time after search, there will be warnings in console.
    this.eventMap = new EventMap(this.domElements.mapArea, {
      handleClick: this.handleEventsFromMapClick,
    });
    this.eventMap.getMapFromServer();

    this.latLng = {};
    this.searchTitle = '';
    this.searchType = '';
    this.searchCity = '';
    this.searchState = '';
    // Use .toISOString() to get the format for TicketMaster start date search
    this.startDate = new Date().toISOString().split('.')[0] + 'Z';
    this.pageNumber = null;
    this.totalPages = null;
    this.totalEvents = null;
    this.pageSize = null;
    this.addEventListeners();
  }

  addEventListeners() {
    this.domElements.inputs.searchBtn.click(this.getDataFromServer);
    this.domElements.inputs.sortBy.change(this.sortEventList);
  }

  getSearchUrl(elements) {
    this.searchTitle = elements['eventTitle'].value
      ? elements['eventTitle'].value
      : '';

    this.searchType = elements['eventType'].value
      ? elements['eventType'].value
      : '';

    this.searchCity = elements['eventCity'].value
      ? elements['eventCity'].value
      : '';

    this.searchState = elements['eventState'].value
      ? elements['eventState'].value
      : '';

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${this.searchTitle}&classificationName=${this.searchType}&city=${this.searchCity}&stateCode=${this.searchState}&startDateTime=${this.startDate}&sort=date,asc&countryCode=US&apikey=${TICKET_MASTER_APIKEY}`;
    return url;
  }

  getDataFromServer(e) {
    e.preventDefault();
    this.latLng = {};
    const searchUrl = this.getSearchUrl(e.currentTarget.form.elements);
    $.ajax({
      url: `${searchUrl}`,
      method: 'GET',
      dataType: 'json',
    })
      .done(this.processGetDataFromServer)
      .fail(this.failGetDataFromServer);

    // Show pagination after click on search button
    let $paginationUl = $('<ul>', {
      class: 'pagination justify-content-end',
    });

    let $prevBtn = $('<li>', {
      class: 'page-item disabled',
      id: 'prevBtn',
    });
    let $prevBtnA = $('<a>', {
      class: 'page-link',
      href: '#',
      tabIndex: '-1',
      text: 'Prev',
    });
    $prevBtn.append($prevBtnA);

    let $nextBtn = $('<li>', {
      class: 'page-item disabled',
      id: 'nextBtn',
    });
    let $nextBtnA = $('<a>', {
      class: 'page-link',
      href: '#',
      tabIndex: '-1',
      text: 'Next',
    });
    $nextBtn.append($nextBtnA);

    $paginationUl.append($prevBtn, $nextBtn);

    this.domElements.eventsPagination.empty().append($paginationUl);
    this.domElements.pagination.prevBtn = $('#prevBtn');
    this.domElements.pagination.nextBtn = $('#nextBtn');
    this.domElements.pagination.prevBtn.click(this.handlePrevBtnClick);
    this.domElements.pagination.nextBtn.click(this.handleNextBtnClick);
  }

  handleEventsFromMapClick(eventMap, latLng) {
    // Get value from jQuery Objects
    this.searchTitle = this.domElements.inputs.eventTitle[0].value
      ? this.domElements.inputs.eventTitle[0].value
      : '';

    this.searchType = this.domElements.inputs.eventType[0].value
      ? this.domElements.inputs.eventType[0].value
      : '';

    this.latLng.lat = latLng.lat();
    this.latLng.lng = latLng.lng();
    // Use .lat() and .lng() to get the latitude and longitude strings
    $.ajax({
      url: `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${
        this.searchTitle
      }&classificationName=${
        this.searchType
      }&latlong=${latLng.lat()},${latLng.lng()}&radius=200&unit=miles&sort=date,asc&countryCode=US&apikey=${TICKET_MASTER_APIKEY}`,
      method: 'GET',
      dataType: 'json',
    })
      .done(this.processGetDataFromServer)
      .fail(this.failGetDataFromServer);
  }

  processGetDataFromServer(response) {
    if (response._embedded) {
      this.events = [];
      this.pageNumber = response.page.number;
      this.totalPages = response.page.totalPages;
      this.totalEvents = response.page.totalElements;
      this.pageSize = response.page.size;

      // When there are more than 1 page in the search result, show next page button
      if (this.totalPages > 1 && this.pageNumber + 1 !== this.totalPages) {
        this.domElements.pagination.nextBtn.removeClass('disabled');
        this.domElements.pagination.nextBtn
          .children(':first')
          .removeAttr('tabindex');
      } else {
        this.domElements.pagination.nextBtn.addClass('disabled');
        this.domElements.pagination.nextBtn.children(':first').attr('tabindex');
      }
      this.loadEvents(response._embedded.events);
      this.domElements.pagination.pageNumber.text(
        `${this.pageSize * this.pageNumber + 1} - ${
          this.pageSize * this.pageNumber + this.events.length
        }, total: ${this.totalEvents}`
      );
      this.displayAllEvents(this.events);

      this.domElements.noResultMsg.empty();
    } else {
      this.domElements.noResultMsg.empty();
      // If there is no result, show message in the map area and clean up the event list area.
      let $noResult = $('<h4>', {
        text: 'No results were found',
        class: 'text-center my-4',
      });
      this.domElements.noResultMsg.append($noResult);
      this.domElements.eventList.empty();
      this.domElements.pagination.prevBtn.addClass('disabled');
      this.domElements.pagination.prevBtn
        .children(':first')
        .attr('tabindex', '-1');
      this.domElements.pagination.nextBtn.addClass('disabled');
      this.domElements.pagination.nextBtn
        .children(':first')
        .attr('tabindex', '-1');
      this.domElements.pagination.pageNumber.text('');
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

    let $thead = $('<thead>');
    let $headerRow = $('<tr>');
    let $thTitle = $('<th>', {
      text: 'Title',
      scope: 'col',
    });
    let $thCity = $('<th>', {
      text: 'City',
      scope: 'col',
    });
    let $thVenue = $('<th>', {
      text: 'Venue',
      scope: 'col',
    });
    let $thDate = $('<th>', {
      text: 'Date',
      scope: 'col',
    });
    let $thPhoto = $('<th>', {
      text: 'Photo',
      scope: 'col',
    });

    let $tbody = $('<tbody>');
    $headerRow.append($thTitle, $thCity, $thVenue, $thDate, $thPhoto);
    $thead.append($headerRow);
    $tbody.append(rows);

    this.domElements.eventList.empty().append($thead, $tbody);
  }

  renderMap(events) {
    this.eventMap.deleteMarkers();
    // Create customized mapMarker data structure for the map to transform to Google markers
    let mapMarkers = events.map((event) => {
      let data = {};
      data.title = event.data.name;
      data.city = event.data._embedded.venues[0].city.name;
      data.venue = event.data._embedded.venues[0].name;
      data.date = event.data.dates.start.localDate;
      data.image =
        event.data.images[event.findImageIndex(event.data.images)].url;
      data.latLng = event.data._embedded.venues[0].location;

      const mapMarker = new MapMarker(data);
      return mapMarker;
    });

    this.eventMap.renderMarkersOnMap(mapMarkers);
  }

  addEvent(data) {
    let event = new Event(data);
    this.events.push(event);
    return this.events.length;
  }

  sortEventList(e) {
    const sortBy = e.target.value;

    if (sortBy === 'byDate') {
      if (this.events.length > 0) {
        this.events.sort((e1, e2) => {
          if (
            Date.parse(e1.data.dates.start.localDate) ===
            Date.parse(e2.data.dates.start.localDate)
          ) {
            return 0;
          }
          return Date.parse(e1.data.dates.start.localDate) <
            Date.parse(e2.data.dates.start.localDate)
            ? -1
            : 1;
        });
        this.render(this.events);
      }
    } else if (sortBy === 'byVenue') {
      if (this.events.length > 0) {
        this.events.sort((e1, e2) => {
          if (
            e1.data._embedded.venues[0].name ===
            e2.data._embedded.venues[0].name
          ) {
            return 0;
          }
          return e1.data._embedded.venues[0].name <
            e2.data._embedded.venues[0].name
            ? -1
            : 1;
        });
        this.render(this.events);
      }
    }
  }
  // Check if this.pageNumber === 0 or is the last page. If so, return
  // Else, this.pageNumber++ (to next) or this.pageNumber-- (to prev) and fire the TM API with page=this.pageNumber
  // After getting the data, empty the current events [] with new data
  handlePrevBtnClick(e) {
    e.preventDefault();
    // When current page is already the 1st page, do nothing.
    if (this.pageNumber !== null && this.pageNumber === 0) {
      return;
    }

    this.pageNumber--;
    // After decreasing page number, if it becomes the first page, disable the prev button
    if (this.pageNumber !== null && this.pageNumber === 0) {
      this.domElements.pagination.prevBtn.addClass('disabled');
      this.domElements.pagination.prevBtn
        .children(':first')
        .attr('tabindex', '-1');
    }

    // Remove 'disabled' from NextBtn when it's not the last page.
    if (this.pageNumber + 1 < this.totalPages) {
      this.domElements.pagination.nextBtn.removeClass('disabled');
      this.domElements.pagination.nextBtn
        .children(':first')
        .removeAttr('tabindex');
    }
    this.getDataFromServerWithPage();
  }

  handleNextBtnClick(e) {
    e.preventDefault();
    // When current page is the last page, do nothing.
    if (this.pageNumber !== null && this.pageNumber + 1 === this.totalPages) {
      return;
    }

    this.pageNumber++;
    // After adding current page number, if it becomes the last page, disable the next button
    if (this.pageNumber !== null && this.pageNumber + 1 === this.totalPages) {
      this.domElements.pagination.nextBtn.addClass('disabled');
      this.domElements.pagination.nextBtn
        .children(':first')
        .attr('tabindex', '-1');
    }

    // Remove 'disabled' from PrevBtn when it's not the 1st page.
    if (this.pageNumber > 0) {
      this.domElements.pagination.prevBtn.removeClass('disabled');
      this.domElements.pagination.prevBtn
        .children(':first')
        .removeAttr('tabindex');
    }
    this.getDataFromServerWithPage();
  }

  getDataFromServerWithPage() {
    // If the previous search is made with map click, get previous latlng with page search
    if (this.latLng.lat && this.latLng.lng) {
      $.ajax({
        url: `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${this.searchTitle}&classificationName=${this.searchType}&city=${this.searchCity}&stateCode=${this.searchState}&startDateTime=${this.startDate}&page=${this.pageNumber}&latlong=${this.latLng.lat},${this.latLng.lng}&radius=200&unit=miles&sort=date,asc&countryCode=US&apikey=${TICKET_MASTER_APIKEY}`,
        method: 'GET',
        dataType: 'json',
      })
        .done(this.processGetDataFromServer)
        .fail(this.failGetDataFromServer);
    } else {
      $.ajax({
        url: `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${this.searchTitle}&classificationName=${this.searchType}&city=${this.searchCity}&stateCode=${this.searchState}&startDateTime=${this.startDate}&page=${this.pageNumber}&sort=date,asc&countryCode=US&apikey=${TICKET_MASTER_APIKEY}`,
        method: 'GET',
        dataType: 'json',
      })
        .done(this.processGetDataFromServer)
        .fail(this.failGetDataFromServer);
    }
  }
}
