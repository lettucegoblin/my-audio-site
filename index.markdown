---
layout: default
title: Home
---

<div class="row">
  <!-- tabs for searchbar/favoritesbar on mobile-->
  <div id="mobile-tabs" class="col-md-12 d-md-none">
    <ul class="nav nav-tabs" id="mobile-tabs" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" id="search-tab" data-toggle="tab"  role="tab" aria-controls="search" aria-selected="true">Search</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" id="favorites-tab" data-toggle="tab" role="tab" aria-controls="favorites" aria-selected="false">Favorites</a>
      </li>
    </ul>
  </div>

  <div id="search-bar" class="col-md-8">
    <h2>Search Results</h2>
    <ul id="results" class="list-group"></ul>
  </div>
  <div id="favorites-bar" class="col-md-4 hidden">
    <h2>Favorites</h2>
    <ul id="favorites" class="list-group"></ul>
  </div>
</div>
