"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");
const BASE_URL = "http://api.tvmaze.com/";

const NO_IMAGE_URL = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const showData = await axios.get(`${BASE_URL}search/shows`, {
    params: { q: term, limit: "10" },
  });

  const showDataList = showData.data;

  const shows = await showDataList.map((show) => {
    let eachShow = show.show;
    return {
      id: eachShow.id,
      name: eachShow.name,
      summary: eachShow.summary,
      image: eachShow.image.medium || NO_IMAGE_URL,
      episodes: getEpisodesOfShow(eachShow.id).then(data => data),
    };
  });

  console.log(shows)
  // TODO: START TIMER HERE.

  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="picture of ${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide(); // hiding until we click a button
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const episodeData = await axios.get(`${BASE_URL}shows/${id}/episodes`);

  const episodeDataList = episodeData.data;

  const episodes = episodeDataList.map(({ id, name, season, number }) => {
    return { id, name, season, number };
  });

  return episodes;
}

/** Given episodes object, adds to the DOM list elements formatted properly
 * with bespoke episode information
 */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const { id, name, season, number } = episode;
    const $episode = $(
      `<li data-episode-id=${id}>${name} (season ${season}, number ${number})</li>`
    );

    $episodesList.append($episode);
  }
}

/**
 * Handles a click of the episodes button. Retrieve specified shows' episodes
 * and adds them to the dom (shows previously hidden episodes area).
 */
async function handleEpisodeClick(evt) {
  const $show = $(evt.target).closest(".Show");
  const showId = $show.data("showId");

  const episodes = await getEpisodesOfShow(showId);

  populateEpisodes(episodes);

  $episodesArea.show();
}

$showsList.on("click", "button", handleEpisodeClick);

// daniels test

// axios to get shows with search term. // 1 call
// ^ limit of 10

// axios per show that is returned
// ^ potential issue if we ping more than 20 shows
// ^ limit 10

// reloading timer of 10 seconds

//idea 2
// 1 call to return all shows // this one doesnt work

/* const response = await axios.get(HOST_NAME, {
  params: { q: $searchTerm, api_key: API_KEY, limit: "1" },
}); */
