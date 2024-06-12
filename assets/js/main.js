// This script assumes that Lunr and jQuery are included in your HTML.

// Initialize a global variable for the index and data
var idx;
var documents = {};

// Fetch the index data
$.getJSON("/assets/audio/index.json", function (data) {
  // Store the documents in a dictionary for quick lookup
  data.forEach(function (doc) {
    documents[doc.id] = doc;
  });

  // Initialize Lunr index
  idx = lunr(function () {
    this.ref("id"); // The reference field
    this.field("text"); // Field to index

    // Add data to the index
    data.forEach(function (doc) {
      this.add(doc);
    }, this);
    setTimeout(function () {
      // Display favorites on page load
      displayFavorites();
    }, 1000);
  });
});

// Search functionality triggered by button click
$("#search-button").on("click", function () {
  var query = $("#search-input").val(); // Get the value from the input
  var results = idx.search(query); // Use Lunr to search the index
  displayResults(results, "#results"); // Function to display the results
});

// Function to display search results
function displayResults(results, target) {
  var $results = $(target);
  $results.empty(); // Clear previous results

  results.forEach(function (result) {
    var doc = documents[result.ref]; // Look up the document in the stored data
    var item =
      '<li class="list-group-item">' +
      '<audio controls class="w-100 mb-2" src="' +
      doc.audio +
      '"></audio>' +
      "<p>" +
      doc.text +
      "</p>" +
      '<button class="btn btn-outline-primary" onclick="toggleFavorite(\'' +
      doc.id +
      "')\">Toggle Favorite</button>" +
      "</li>";
    $results.append(item);
  });

  // Apply volume setting to all audio elements
  applyVolume();
}

// Function to handle favoriting of audio files
function toggleFavorite(audio_id) {
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  var index = favorites.indexOf(audio_id);
  if (index === -1) {
    favorites.push(audio_id);
  } else {
    favorites.splice(index, 1);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
}

// Function to display favorites
function displayFavorites() {
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  var results = favorites.map(function (audio) {
    return { ref: audio };
  });
  displayResults(results, "#favorites");
}

// Volume control functionality
$("#volume-control").on("input", function () {
  var volume = $(this).val();
  localStorage.setItem("volume", volume);
  applyVolume();
});

function applyVolume() {
  var volume = localStorage.getItem("volume") || 1;
  $("#volume-control").val(volume);
  $("audio").each(function () {
    $(this).prop("volume", volume);
  });
}

// Call applyVolume on page load to set initial volume
applyVolume();
