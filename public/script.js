function getRecommendation() {
  const category = document.getElementById('category').value;
  fetch(`http://localhost:3000/recommend?category=${category}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const shuffledGames = shuffleArray(data.games);
      localStorage.setItem('lastRecommendation', JSON.stringify(shuffledGames));
      displayRecommendations({ games: shuffledGames });
    })
    .catch(error => showError('Error fetching recommendation. Please try again later. ' + error));
}

function displayRecommendations(data) {
  const recommendationsContainer = document.getElementById('recommendations');
  if (!recommendationsContainer) {
    console.error('Recommendations container not found');
    return;
  }
  
  recommendationsContainer.innerHTML = '';
  
  if (data.error) {
    showError(data.error);
  } else if (data.games && data.games.length > 0) {
    const bookmarkedGames = getBookmarkedGames();
    const gamesHTML = data.games.map(game => `
      <div class="game-recommendation">
        <img src="${game.image}" alt="${game.name}" class="game-image">
        <h3>${game.name}</h3>
        <p><strong>Genres:</strong> ${game.genres}</p>
        <p>${game.summary}</p>
        <button onclick='toggleBookmark(${JSON.stringify(game)})'>
          ${bookmarkedGames.some(g => g.name === game.name) ? 'Remove Bookmark' : 'Bookmark'}
        </button>
      </div>
    `).join('');

    recommendationsContainer.innerHTML = gamesHTML;
  } else {
    showError('No games found for this category.');
  }
}

function showError(message) {
  const errorContainer = document.getElementById('error-container');
  if (!errorContainer) {
    console.error('Error container not found:', message);
    return;
  }
  errorContainer.textContent = message;
}

function getBookmarkedGames() {
  return JSON.parse(localStorage.getItem('bookmarkedGames')) || [];
}

function toggleBookmark(game) {
  let bookmarkedGames = getBookmarkedGames();
  if (bookmarkedGames.some(g => g.name === game.name)) {
    bookmarkedGames = bookmarkedGames.filter(g => g.name !== game.name);
  } else {
    bookmarkedGames.push(game);
  }
  localStorage.setItem('bookmarkedGames', JSON.stringify(bookmarkedGames));
  displayBookmarkedGames();
  displayRecommendations({ games: JSON.parse(localStorage.getItem('lastRecommendation')) || [] });
}

function displayBookmarkedGames() {
  const bookmarkedGames = getBookmarkedGames();
  const bookmarksContainer = document.getElementById('bookmarked-games');
  if (!bookmarksContainer) {
    console.error('Bookmarks container not found');
    return;
  }
  
  bookmarksContainer.innerHTML = bookmarkedGames.map(game => `
    <div class="game-recommendation">
      <img src="${game.image}" alt="${game.name}" class="game-image">
      <h3>${game.name}</h3>
      <p><strong>Genres:</strong> ${game.genres}</p>
      <p>${game.summary}</p>
      <button onclick='toggleBookmark(${JSON.stringify(game)})'>Remove Bookmark</button>
    </div>
  `).join('');
}

function shuffleArray(array) {
  let shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

document.addEventListener('DOMContentLoaded', () => {
  displayBookmarkedGames();
});
