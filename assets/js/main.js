// This script assumes that Lunr and jQuery are included in your HTML.

// Initialize a global variable for the index and data
var idx;
var documents = {};
// Constants and state variables
var pageSize = 5; // Number of results to show per page
var pageIndex = 0; // Current page index
var currentResults = []; // Store current search results

function nGramTokenizer(obj, metadata) {
  var str = obj.toString().toLowerCase();
  var nGrams = [];
  var length = str.length;
  var n = 3; // You can adjust 'n' based on how small you want the fragments to be

  for (var i = 0; i <= length - n; i++) {
    var gram = str.substring(i, i + n);
    nGrams.push(gram);
  }

  return nGrams.map(function (gram) {
    return new lunr.Token(gram, lunr.utils.clone(metadata));
  });
}

$(document).ready(function () {
  // Load the data and create the index
  $.getJSON(baseUrl + "/assets/audio/index.json", function (data) {
    // Store the documents in a dictionary for quick lookup
    data.forEach(function (doc) {
      documents[doc.id] = doc;
    });

    // Initialize Lunr index
    idx = lunr(function () {
      this.tokenizer = nGramTokenizer;
      this.pipeline.remove(lunr.stopWordFilter);
      this.ref("id"); // The reference field
      this.field("text"); // Field to index
      // Add data to the index
      for (var i = 0; i < data.length; i++) {
        this.add(data[i]);
      }
    });

    // Check if a search parameter is present in the URL
    var queryParams = new URLSearchParams(window.location.search);
    var searchQuery = queryParams.get("q") || "";
    //if (searchQuery) {
    $("#search-input").val(searchQuery);
    search(searchQuery);
    displayFavorites(); // Display favorites on page load
    //}
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
  //if (!query) return;
  var results = idx.search(query); // Use Lunr to search the index
  currentResults = results; // Store results in a global variable
  pageIndex = 0; // Reset page index
  displayResults(); // Function to display the results
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
function displayResults(loadMore = false) {
  var $results = $("#results");
  if (!loadMore) $results.empty(); // Clear previous results
  

  // Calculate the slice of results to display
  var start = pageIndex * pageSize;
  var end = start + pageSize;
  var slicedResults = currentResults.slice(start, end);

  slicedResults.forEach(function (result) {
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

  // check if the Load More button already exists
  let $loadMore = $("#load-more");
  if ($loadMore.length == 0) {
    $results.after(
      '<button id="load-more" class="btn btn-primary w-100">Load More</button>'
    );
    // Bind click event to the Load More button dynamically

    $(document).on("click", "#load-more", loadMore);
    
    $loadMore = $("#load-more");
    observer.observe($loadMore[0]);  // Start observing the Load More button
  }

  // Check if there are more results to load
  if (end < currentResults.length) {
    $loadMore.show(); // Show the Load More button
  } else {
    $loadMore.hide(); // Hide the Load More button
  }

  // Apply volume setting to all audio elements and bind their volume change event
  applyVolume();
  bindAudioElements();
}

function loadMore() {
  pageIndex++;
  displayResults(true);
}

// Function to handle favoriting of audio files
function toggleFavorite(audioId) {
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  var index = favorites.indexOf(audioId);
  if (index === -1) {
      favorites.push(audioId);
  } else {
      favorites.splice(index, 1);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites(); // Update the favorites display
}

// Function to display favorites
function displayFavorites() {
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  var favoriteResults = favorites.map(function(id) {
      return documents[id] ? { ref: id } : undefined;
  }).filter(function(result) { return result !== undefined; });

  // Clear previous favorites results
  var $favorites = $("#favorites");
  $favorites.empty();

  // Display each favorite by creating elements similar to search results
  favoriteResults.forEach(function(result) {
      var doc = documents[result.ref];
      if (doc) {
          var item = `<li class="list-group-item">
              <p>${doc.text}</p>
              <div class="d-flex justify-content-between align-items-center">
                  <audio preload="none" controls class="w-100 mb-2" src="${baseUrl}${doc.audio}"></audio>
                  <button class="btn btn-outline-primary ml-4" onclick="toggleFavorite('${doc.id}')">
                      <i class="fas fa-heart-broken"></i> Unfavorite
                  </button>
              </div>
          </li>`;
          $favorites.append(item);
      }
  });
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
var observer;

function setupIntersectionObserver() {
    var options = {
        root: null,  // observing changes to intersections relative to the viewport
        rootMargin: '0px',
        threshold: 1.0  // trigger when 100% of the observed target is visible
    };

    observer = new IntersectionObserver(handleIntersect, options);
}

let observerTimeout;
function handleIntersect(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (observerTimeout) {
            clearTimeout(observerTimeout);
          }
          observerTimeout = setTimeout(() => {
            loadMore();
          }, 500);
        }
    });
}

// Call this function on page ready or after search initialization
setupIntersectionObserver();
