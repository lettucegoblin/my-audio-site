// This script assumes that Lunr and jQuery are included in your HTML.

// Initialize a global variable for the index and data
var idx;
var documents = {};

$(document).ready(function () {
  // Load the data and create the index
  $.getJSON(baseUrl + "/assets/audio/index.json", function (data) {
    // Store the documents in a dictionary for quick lookup
    data.forEach(function (doc) {
      documents[doc.id] = doc;
    });

    // Initialize Lunr index
    idx = lunr(function () {
      this.ref("id"); // The reference field
      this.field("text"); // Field to index
      // Add data to the index
      for (var i = 0; i < data.length; i++) {
        this.add(data[i]);
      }
    });

    // Check if a search parameter is present in the URL
    var queryParams = new URLSearchParams(window.location.search);
    var searchQuery = queryParams.get("q");
    if (searchQuery) {
      $("#search-input").val(searchQuery);
      search(searchQuery);
    }
  });

  // Bind the search button click event
  $("#search-button").on("click", function () {
    var query = $("#search-input").val();
    search(query);
  });

  // Bind the search input keyup event to update URL and search dynamically
  $("#search-input").on("keyup", function () {
    var query = $(this).val();
    updateUrl(query);
    search(query);
  });
});

function search(query) {
  if (!query) return;
  var results = idx.search(query); // Use Lunr to search the index
  displayResults(results, "#results"); // Function to display the results
}

function updateUrl(query) {
  history.pushState(null, "", "?q=" + encodeURIComponent(query));
}

// Function to download an audio file
function download(url) {
  var a = document.createElement("a");
  a.href = url;
  a.download = url.split("/").pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to display search results
function displayResults(results, target) {
  var $results = $(target);
  $results.empty(); // Clear previous results

  results.forEach(function (result) {
    var doc = documents[result.ref]; // Look up the document in the stored data
    var item = `
<li class="list-group-item">
  <p>${doc.text}</p>
  <div class="d-flex justify-content-between align-items-center">
    <audio preload="none" controls class="w-100 mb-2" src="${baseUrl}${doc.audio}"></audio>
    <button class="btn btn-outline-primary ml-4" onclick="toggleFavorite('${doc.id}')"><i class="far fa-heart"></i></button>
    <button class="btn btn-outline-primary ml-4" onclick="download('${baseUrl}${doc.audio}')"><i class="fas fa-download"></i></button>
  </div>
</li>`;
    $results.append(item);
  });

  // Apply volume setting to all audio elements and bind their volume change event
  applyVolume();
  bindAudioElements();
}

// Function to handle favoriting of audio files
function toggleFavorite(audio) {
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  var index = favorites.indexOf(audio);
  if (index === -1) {
    favorites.push(audio);
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
  var volume = localStorage.getItem("volume") || 0.15;
  $("#volume-control").val(volume);
  $("audio").each(function () {
    $(this).prop("volume", volume);
  });
}

function bindAudioElements() {
  $("audio").on("volumechange", function () {
    var volume = this.volume;
    localStorage.setItem("volume", volume);
    $("#volume-control").val(volume);
  });
}

// Call applyVolume and bindAudioElements on page load to set initial volume and bind events
applyVolume();
bindAudioElements();
