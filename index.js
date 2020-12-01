const express = require("express");
const routes = require("./routes");
const passport = require("passport");

// config files
require("dotenv").config();
require("./config/passport.js");

//Set up mongoose connection
const mongoose = require("mongoose");
const mongoDB = process.env.DB_URI;
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const app = express();

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// routes
app.use("/users", routes.user_routes);
app.use("/comments", routes.comment_routes);
app.use("/posts", routes.post_routes);
app.use("/subs", routes.sub_routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Now listening on port ${PORT}`);
});
