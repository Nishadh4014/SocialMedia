const express = require("express")
const app = express();
const cookieParser = require("cookie-parser");

require("dotenv").config({path: "backend/config/config.env"});

// using middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Importing routes
const post = require("./routes/post");
const user = require("./routes/user");

// using routes
app.use("/api/v1",post);      //  here "api/v1" is the prefix for all post routes
app.use("/api/v2",user);

module.exports = app;