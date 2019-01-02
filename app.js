const express = require("express");
const app = express();
const db = require('./config/keys').mongoURI;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require("./routes/api/users");
const tweets = require("./routes/api/tweets");

const path = require("path");

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/build'));
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(passport.initialize());
require('./config/passport')(passport);

mongoose
    .connect(db, {
        useNewUrlParser: true
    })
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch(err => console.log(err));

/// routes ///
app.get("/", (req, res) => {
    console.log(res);
    res.send("Hello World");
});


app.use("/api/users", users);
app.use("/api/tweets", tweets);
//// end routes ///

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));