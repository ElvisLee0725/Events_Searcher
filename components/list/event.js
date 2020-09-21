class Event {
  constructor(data) {
    this.data = data;
    this.domElemets = {
      title: null,
      city: null,
      venue: null,
      date: null,
      image: null,
    };
  }
  renderEvent() {
    let $tableRow = $('<tr>');
    let $titleLink = $('<a>', {
      href: this.data.url,
      target: '_blank',
      class: 'text-decoration-none',
    });
    let $title = (this.domElemets.title = $('<td>', {
      text: this.data.name,
    }));
    $titleLink.append($title);

    let $city = (this.domElemets.city = $('<td>', {
      text: this.data._embedded.venues[0].city.name,
    }));
    let $venue = (this.domElemets.venue = $('<td>', {
      text: this.data._embedded.venues[0].name,
    }));

    const eventDate = this.data.dates.start.localDate.split('-');
    const eventTime = this.data.dates.start.localTime
      ? this.data.dates.start.localTime.split(':')
      : '';

    let $date = (this.domElemets.date = $('<td>', {
      text: `${eventDate[1]}/${eventDate[2]}/${eventDate[0]} \n ${
        eventTime && eventTime[0] + ':' + eventTime[1]
      }`,
    }));

    let $imageData = $('<td>');
    let $image = (this.domElemets.image = $('<img>', {
      src: this.data.images[this.findImageIndex(this.data.images)].url,
      class: 'img-fluid',
    }));

    $imageData.append($image);

    $tableRow.append($titleLink, $city, $venue, $date, $imageData);
    return $tableRow;
  }

  findImageIndex(images) {
    // Get the image with suitable size from all images
    let index = images.findIndex((image) => {
      return image.width === 100;
    });
    return index;
  }
}
