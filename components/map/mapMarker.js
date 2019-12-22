class MapMarker {
    constructor(data) {
        this.data = data;
        this.domElements = {
            title: null,
            location: null,
            date: null, 
            image: null
        };
    }

    renderContent() {
        let $content = $("<div>", {
            id: 'content'
        });
        let $title = this.domElements.title = $("<h6>", {
            text: this.data.title
        });

        let $detailContainer = $("<div>", {
            class: 'container'
        });

        let $detailRow = $("<div>", {
            class: 'row'
        });

        let $detailText = $("<div>", {
            class: 'col-md-8'
        });
        let $location = this.domElements.location = $("<p>", {
            text: `At ${this.data.city}, ${this.data.venue}`
        });
        let $date = this.domElements.date = $("<p>", {
            text: `${this.data.date}`
        });
        $detailText.append($location, $date);

        let $detailImage = $("<div>", {
            class: 'col-md-4'
        });

        let $image = this.domElements.image = $("<img>", {
            src: `${this.data.image}`
        })
        $detailImage.append($image);

        $detailRow.append($detailText, $detailImage);
        $detailContainer.append($detailRow);

        $content.append($title, $detailContainer);
        // Need to return a String instead of DOM
        return $content.prop("outerHTML");
    }
}