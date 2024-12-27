const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/pages'));

app.get('/', (req, res) => {
  res.render('home');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Visit http://localhost:${PORT}`);
});
