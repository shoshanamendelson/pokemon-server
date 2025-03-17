const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

let favorites = [];  // Defining the favorites array

// Fetching the Pokémon list
app.get('/api/pokemon', async (req, res) => {
    try {
        const { searchQuery, limit = 10, offset = 0 } = req.query;  // Getting searchQuery, limit, and offset from query params

        // Constructing the URL with pagination and searchQuery (if present)
        let url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
        if (searchQuery) {
            // If a search query is provided, fetch a single Pokémon by name
            url = `https://pokeapi.co/api/v2/pokemon/${searchQuery}`;
        }

        const response = await axios.get(url);

        let filteredPokemon = response.data.results || [response.data]; // If it's a single Pokémon, wrap it in an array

        // Sending the results back to the client
        res.json({ results: filteredPokemon });
    } catch (error) {
        res.status(500).json({ error: "Error fetching Pokémon" });
    }
});

// Fetching Pokémon details by name
app.get('/api/pokemon/:name', async (req, res) => {
    const { name } = req.params;
    console.log(`Searching for Pokémon: ${name}`); // Adding a log to check the Pokémon name
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const isFavorite = favorites.includes(name); // Checking if the Pokémon is in favorites
        res.json({
            ...response.data,
            isFavorite: isFavorite // Adding the isFavorite field
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: `Pokémon with name ${name} not found` });
    }
});

// Fetching the favorites list
app.get('/api/favorites', (req, res) => {
    res.status(200).json(favorites);  // Returning the favorites list
});

// Adding a Pokémon to favorites
app.post('/api/favorites', (req, res) => {
    const { pokemon } = req.body;
    // Adding the Pokémon to the favorites array
    favorites.push(pokemon);

    // Returning the updated favorites list
    res.status(200).json(favorites);
});

// Removing a Pokémon from favorites
app.delete('/api/favorites/:name', (req, res) => {
    const { name } = req.params;
    favorites = favorites.filter(pokemon => pokemon !== name);
    res.status(200).json(favorites);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
