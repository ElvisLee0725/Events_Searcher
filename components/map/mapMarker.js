class MapMarker {
    constructor(data) {
        this.data = data;
        this.domElements = {
            title: null,
            location: null,
            date: null
        };
    }

    renderContent() {
        let $content = $("<div>", {
            id: 'content'
        });
        let $title = this.domElements.title = $("<h6>", {
            text: this.data.title
        });
        let $location = this.domElements.location = $("<p>", {
            text: `At ${this.data.city}, ${this.data.venue}`
        });
        let $date = this.domElements.date = $("<p>", {
            text: `${this.data.date}`
        });

        $content.append($title, $location, $date);
        // Need to return a String instead of DOM
        return $content.prop("outerHTML");
    }
}