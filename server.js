const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Środkowe warstwy
app.use(cors());
app.use(express.json()); // Obsługa JSON w body

// Przykładowe dane
const correctAnswers = {
  1: "Warszawa",
  2: "2004",
  3: "Wisła"
};

// Endpoint do sprawdzania odpowiedzi
app.post('/api/get-correct-answer', (req, res) => {
  try {
    const { question_id } = req.body;

    // Walidacja
    const id = Number(question_id);
    if (!id || !correctAnswers[id]) {
      return res.status(400).json({ error: 'Nieprawidłowe ID pytania' });
    }

    // Zwracamy poprawną odpowiedź
    res.json({
      correct_answer: correctAnswers[id]
    });
  } catch (err) {
    console.error('Błąd serwera:', err.message);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`✅ Serwer działa: http://localhost:${PORT}`);
});
