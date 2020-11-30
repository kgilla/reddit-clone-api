const express = require("express");
const routes = require("./routes");
const path = require("path");

const app = express();

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
