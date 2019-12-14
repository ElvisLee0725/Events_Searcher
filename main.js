$( initializeApp );

function initializeApp() {
    console.log('Hello APP');

    $.ajax({
        url: `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&apikey=${TICKET_MASTER_APIKEY}`,
        method: 'GET',
        dataType: 'json'
    })
    .done((response) => {
        console.log(response);
    })
    .fail((error) => {
        console.log(error);
    });
}