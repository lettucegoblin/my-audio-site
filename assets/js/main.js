// This script assumes that Lunr and jQuery are included in your HTML.

// Initialize a global variable for the index and data
var idx;
var documents = {};

// Fetch the index data
$.getJSON('/assets/audio/index.json', function(data) {
    // Store the documents in a dictionary for quick lookup
    data.forEach(function(doc) {
        documents[doc.id] = doc;
    });

    // Initialize Lunr index
    idx = lunr(function () {
        this.ref('id');    // The reference field
        this.field('text'); // Field to index
        this.field('speaker'); // Another field to index

        // Add data to the index
        data.forEach(function (doc) {
            this.add(doc);
        }, this);
    });
});

// Search functionality triggered by button click
$('#search-button').on('click', function() {
    var query = $('#search-input').val(); // Get the value from the input
    var results = idx.search(query); // Use Lunr to search the index
    displayResults(results); // Function to display the results
});

// Function to display search results
function displayResults(results) {
    var $results = $('#results');
    $results.empty(); // Clear previous results

    results.forEach(function(result) {
        var doc = documents[result.ref]; // Look up the document in the stored data
        var item = '<li>' +
                   '<audio controls src="' + doc.audio + '"></audio>' +
                   '<p>' + doc.text + ' (Speaker: ' + doc.speaker + ')</p>' +
                   '<button onclick="favorite(\'' + doc.audio + '\')">Favorite</button>' +
                   '</li>';
        $results.append(item);
    });
}

// Function to handle favoriting of audio files
function favorite(audio) {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(audio)) {
        favorites.push(audio);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    displayFavorites();
}

// Function to display favorites
function displayFavorites() {
    var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    var $favorites = $('#favorites');
    $favorites.empty();

    favorites.forEach(function(audio) {
        var item = '<li><audio controls src="' + audio + '"></audio></li>';
        $favorites.append(item);
    });
}

// Call displayFavorites on page load to show already favorited items
displayFavorites();
