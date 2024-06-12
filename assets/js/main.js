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
  });

  // Display favorites on page load
  displayFavorites();
});

let timeout = 0;
// Search functionality triggered by button click, pressing Enter, or typing in the search box
function search() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(function () {
    var query = $("#search-input").val(); // Get the value from the input
    var results = idx.search(query); // Use Lunr to search the index
    displayResults(results, "#results"); // Function to display the results
  }, 300);
}

$("#search-button").on("click", search);
$("#search-input").on("keyup", function (event) {
  if (event.key === "Enter" || event.keyCode === 13 || this.value.length > 0) {
    search();
  }
});

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
    <audio preload="none" controls class="w-100 mb-2" src="${doc.audio}"></audio>
    <button class="btn btn-outline-primary ml-4" onclick="toggleFavorite('${doc.id}')"><i class="far fa-heart"></i></button>
    <button class="btn btn-outline-primary ml-4" onclick="download('${doc.audio}')"><i class="fas fa-download"></i></button>
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
