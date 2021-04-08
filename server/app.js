const fs = require('fs');
const path = require('path');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// routes import
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();
app.use(cors());

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// use routes
app.use('/api/places', placesRoutes); //=>/api/places/..
app.use('/api/users', usersRoutes); //=>/api/users/..

// middleware
app.use((req, res, next) => {
  const error = new HttpError('Not found', 404);
  throw error;
});
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'Something wrong please try later' });
});

mongoose
  .connect(
    'mongodb+srv://prakash:prakash6565@cluster0.2xgsb.mongodb.net/places',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((error) => {
    console.log(error);
  });
