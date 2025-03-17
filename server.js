const express = require('express');  // Importing the Express library
const axios = require('axios');  // Importing Axios for HTTP requests
const cors = require('cors');  // Importing CORS middleware for cross-origin requests
const fs = require('fs');  // Importing the File System module to work with files
const path = require('path');  // Importing Path module to handle file paths

const app = express();  // Create an Express application
app.use(cors());  // Enable Cross-Origin Resource Sharing for all routes
app.use(express.json());  // Enable parsing of JSON request bodies

const favoritesFilePath = path.join(__dirname, 'favorites.json');  // Path to the favorites JSON file
let favorites = [];  // Define an empty array to store favorite Pokémon

/**
 * Loads the favorites list from 'favorites.json' file.
 * If the file doesn't exist or is empty, initializes the favorites as an empty array.
 */
const loadFavorites = () => {
    try {
        if (fs.existsSync(favoritesFilePath)) {  // Check if the file exists
            const data = fs.readFileSync(favoritesFilePath, 'utf8');  // Read the file content
            if (data.trim() === '') {  // Check if the file is empty
                favorites = [];  // Initialize favorites as an empty array
                saveFavorites();  // Save the empty list to the file
            } else {
                favorites = JSON.parse(data);  // Parse the file content into the favorites array
            }
        } else {
            favorites = [];  // Initialize as empty if the file does not exist
            saveFavorites();  // Save the empty list to the file
        }
    } catch (error) {
        console.error("Error loading favorites:", error);  // Log any errors
        favorites = [];  // Default to empty favorites in case of error
    }
};

/**
 * Saves the favorites list to the 'favorites.json' file.
 */
const saveFavorites = () => {
    try {
        fs.writeFileSync(favoritesFilePath, JSON.stringify(favorites, null, 2), 'utf8');  // Write the favorites list to the file
    } catch (error) {
        console.error("Error saving favorites:", error);  // Log any errors
    }
};

// Load favorites when the server starts
loadFavorites();
const PORT = 5000;  // Port for the server to listen on

/**
 * Fetches a list of Pokémon from the PokeAPI.
 * Supports pagination and search functionality via query parameters.
 */
app.get('/api/pokemon', async (req, res) => {
    try {
        const { searchQuery, limit = 10, offset = 0 } = req.query;  // Get query parameters for search, limit, and offset

        // Construct the URL based on the query parameters
        let url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
        if (searchQuery) {  // If searchQuery is provided, fetch a specific Pokémon by name
            url = `https://pokeapi.co/api/v2/pokemon/${searchQuery}`;
        }

        const response = await axios.get(url);  // Make the request to the Pokémon API

        // Wrap the result in an array if it's a single Pokémon
        let filteredPokemon = response.data.results || [response.data];

        res.json({ results: filteredPokemon });  // Send the response back with the Pokémon data
    } catch (error) {
        res.status(500).json({ error: "Error fetching Pokémon" });  // Handle errors and return a response
    }
});

/**
 * Fetches details of a specific Pokémon by name.
 * If the Pokémon is not found, it returns a 404 error.
 */
app.get('/api/pokemon/:name', async (req, res) => {
    const { name } = req.params;  // Get the Pokémon name from the URL parameters
    console.log(`Searching for Pokémon: ${name}`);  // Log the Pokémon name being searched for
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);  // Fetch detailed Pokémon data
        res.json(response.data);  // Return the full Pokémon data without modification
    } catch (error) {
        console.error(error);  // Log any errors
        res.status(404).json({ error: `Pokémon with name ${name} not found` });  // Return an error if the Pokémon is not found
    }
});

/**
 * Fetches the list of favorite Pokémon.
 * Returns the current favorites list stored on the server.
 */
app.get('/api/favorites', (req, res) => {
    res.status(200).json(favorites);  // Return the favorites list with a 200 OK status
});

/**
 * Adds a Pokémon to the favorites list.
 * If the Pokémon is not already in the list, it adds it and saves the updated list.
 */
app.post('/api/favorites', (req, res) => {
    const { pokemon } = req.body;  // Get the Pokémon to add from the request body
    if (!favorites.includes(pokemon)) {  // Check if the Pokémon is not already in the favorites list
        favorites.push(pokemon);  // Add the Pokémon to the list
        saveFavorites();  // Save the updated list to the file
    }
    res.status(200).json(favorites);  // Return the updated favorites list
});

/**
 * Removes a Pokémon from the favorites list.
 * If the Pokémon is in the list, it removes it and saves the updated list.
 */
app.delete('/api/favorites/:name', (req, res) => {
    const { name } = req.params;  // Get the Pokémon name from the URL parameters
    favorites = favorites.filter(pokemon => pokemon !== name);  // Remove the Pokémon from the list
    saveFavorites();  // Save the updated list to the file
    res.status(200).json(favorites);  // Return the updated favorites list
});

/**
 * Starts the Express server and listens on the specified port.
 * Logs a message to the console when the server is running.
 */
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);  // Log when the server starts
});
