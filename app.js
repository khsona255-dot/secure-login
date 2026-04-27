const express = require("express");
const app = express();
const routes = require("./routes/authRoutes");

app.use(express.json());
app.use("/", routes);

module.exports = app;