# Fun Searcher

Users can do customized search for events through the Ticket Master API, and get search results on Google Map with markers pointing the event location.

## Technologies Used

- JavaScript (ES5/ES6)
- jQuery
- Ticketmaster API
- Google Maps API
- Bootstrap 4
- AWS EC2

## Live Demo

Try this application live at https://fun-searcher.elvislee.com

## Features

- User can start a search with event name, event type, and city or with either one of them
- The search result will display as lists in the table with pagination
- The location of the event will also shown on the Google Map as markers
- User can click on a marker and see event details
- User can also start a search by clicking on the Google Map, events meet the search terms within 200 miles of the clicking point will be found

## Preview

### Start a search with inputs

![search-events](preview/search-events.gif)

### Search in specific location by clicking on the map

![search-by-map-click](preview/search-by-map-click.gif)

## Development

### System Requirements

- A Ticketmaster API key
- A Google Maps API key

### Getting Started

1. Clone the repository.

```
git clone https://github.com/ElvisLee0725/fun-searcher.git
```

2. Create an apis.js file

```
const TICKET_MASTER_APIKEY =    // Your Ticketmaster API key
const GOOGLE_MAPS_APIKEY =      // Your Google Maps API key
```

3. Start the project by opening the index.html file with a web browser
