# Barbie and Pegasus Game Assets Site

This Jekyll site is designed to showcase and filter audio transcripts from the classic game "Barbie and Pegasus." The transcripts are stored in a folder named `parseAudio`, and the site provides functionalities for users to search through these transcripts based on keywords.

## Project Structure

### `parseAudio` Folder

- **Location:** Root of the Jekyll site directory.
- **Contents:** Contains the transcribed scripts of audio clips from the game "Barbie and Pegasus."
- **Purpose:** The transcriptions are used to populate the search index that allows users to find specific parts of the audio based on the content of the scripts.

### Jekyll Configuration

- **`_config.yml`:** Configures site title, description, and other Jekyll settings.
- **`index.html`:** Serves as the entry point for the website. It includes a search interface where users can filter through the transcripts based on keywords.

## Features

### Search Functionality

The site uses Lunr.js, a powerful JavaScript library, to enable full-text search on the static site. This allows users to:
- **Search by Keywords:** Users can type keywords into a search box, and the site filters the transcripts that contain these words.
- **Dynamic Filtering:** Search results update dynamically based on the user's input, enhancing usability and efficiency.

### Audio Playback

Each search result includes a link to play the corresponding audio file, allowing users to listen to the original game audio that matches their search criteria.

## Implementation Details

### Lunr.js Indexing

- **Index Building:** During the site build process, a Lunr index is created from the `parseAudio` transcripts. This index is then used to perform client-side searches.
- **Customization:** The indexing process is customized to include specific fields from the transcripts, ensuring that searches are both fast and relevant.

### User Interface

- **Responsive Design:** The site is built using Bootstrap, making it responsive and accessible on various devices, including smartphones, tablets, and desktop computers.
- **Accessibility Features:** Care is taken to ensure that the site is accessible, including keyboard navigability and screen reader support.

## Usage

To search for a specific transcript or part of the game dialogue:
1. Navigate to the homepage.
2. Enter a keyword or phrase into the search box.
3. Review the filtered list of transcripts and click on any result to listen to the audio.

## Local Development

To set up the site for local development:
1. Clone the repository.
2. Navigate to the project directory.
3. Run `bundle exec jekyll serve` to start the local server.
4. Open `http://localhost:4000` in a browser to view the site.
