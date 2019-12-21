class Event {
    constructor(data) {
        this.data = data;
        this.domElemets = {
            title: null,
            city: null,
            venue: null,
            date: null,
            image: null
        };
    }
    renderEvent() {
        let $tableRow = $('<tr>');
        let $title = this.domElemets.title = $('<td>', {
            text: this.data.name
        });
        let $city = this.domElemets.city = $('<td>', {
            text: this.data._embedded.venues[0].city.name
        });
        let $venue = this.domElemets.venue = $('<td>', {
            text: this.data._embedded.venues[0].name
        });
        let $date = this.domElemets.date = $('<td>', {
            text: this.data.dates.start.localDate
        });
        let $imageData = $('<td>');
        let $image = this.domElemets.image = $('<img>', {
            src: this.data.images[this.findImageIndex(this.data.images)].url,
            class: 'img-fluid'
        });
        $imageData.append($image);

        $tableRow.append($title, $city, $venue, $date, $imageData);
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