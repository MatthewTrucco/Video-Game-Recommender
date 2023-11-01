require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const axios = require('axios');
const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/recommend', async (req, res) => {
  try {
    const category = req.query.category;
    const genreSlug = translateCategoryToGenreSlug(category);
    if (genreSlug === null) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      console.error('API key is not set!');
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const totalPages = 100;
    const randomPage = Math.floor(Math.random() * totalPages) + 1;

    const response = await axios.get(`https://api.rawg.io/api/games`, {
      params: {
        key: apiKey,
        genres: genreSlug,
        page: randomPage,
        page_size: 5
      }
    });

    const games = response.data.results;
    if (!games || games.length === 0) {
      return res.json({ error: 'No games found for this category.' });
    }

    const formattedGames = games.map(game => ({
      name: game.name,
      summary: game.description_raw || game.description || 'No description available',
      image: game.background_image,
      genres: game.genres.map(genre => genre.name).join(', ')
    }));

    res.json({ games: formattedGames });
  } catch (error) {
    console.error('Error fetching game recommendation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function translateCategoryToGenreSlug(category) {
  const mappings = {
    'Action': 'action',
    'Adventure': 'adventure',
    'RPG': 'role-playing-games-rpg',
    'FPS': 'shooter',
    'Strategy': 'strategy',
    'Sports': 'sports',
    'Racing': 'racing',
  };
  return mappings[category] || null;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
