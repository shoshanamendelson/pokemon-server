const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

let favorites = [];  // הגדרת מערך הפייבוריטים

// שליפת רשימת הפוקימונים
app.get('/api/pokemon', async (req, res) => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=150');

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Pokémon list' });
    }
});

// שליפת מידע על פוקימון לפי שם
app.get('/api/pokemon/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const isFavorite = favorites.includes(name);  // בדיקה אם הפוקימון נמצא בפייבוריטים
        res.json({
            ...response.data,
            isFavorite: isFavorite  // הוספת שדה isFavorite
        });
    } catch (error) {
        res.status(404).json({ error: `Pokémon with name ${name} not found` });
    }
});

// שליפת הפייבוריטים
app.get('/api/favorites', (req, res) => {
    res.status(200).json(favorites);  // מחזיר את הפייבוריטים
});

// הוספת פוקימון לפייבוריטים
app.post('/api/favorites', (req, res) => {
    const { pokemon } = req.body;
    // הוספת הפוקימון למערך הפייבוריטים
    favorites.push(pokemon);

    // החזרת רשימת הפייבוריטים העדכנית
    res.status(200).json(favorites);
});

// הסרת פוקימון מהפייבוריטים
app.delete('/api/favorites/:name', (req, res) => {
    const { name } = req.params;
    favorites = favorites.filter(pokemon => pokemon !== name);
    res.status(200).json(favorites);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
