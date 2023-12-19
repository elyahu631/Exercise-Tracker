const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

let users = [];
let exercises = [];

app.use(cors())
app.use(express.static('public'))

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = {
    username,
    _id: Date.now().toString()  // simple unique ID generation
  };
  users.push(newUser);
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find(user => user._id === _id);

  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  const newExercise = {
    userId: _id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };
  exercises.push(newExercise);

  res.json({
    username: user.username,
    ...newExercise
  });
});


app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  let log = exercises.filter(ex => ex.userId === _id);

  // Filter by date range
  if (from || to) {
    const fromDate = new Date(from || 0);
    const toDate = new Date(to || Date.now());
    log = log.filter(ex => {
      const exDate = new Date(ex.date);
      return exDate >= fromDate && exDate <= toDate;
    });
  }

  // Apply limit
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    _id,
    username: users.find(user => user._id === _id).username,
    count: log.length,
    log
  });
});



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
