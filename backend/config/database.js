const mongoose = require("mongoose");
require('dotenv').config({path: "backend/config/config.env"});
const DB_URI = process.env.DB_URI;

// created module named connectDatabase and exported it
exports.connectDatabase = ()=> {
    mongoose.connect(DB_URI,{
        useNewUrlParser : true,
    }).then(()=>console.log("Database connected!")).catch((e)=>console.log(e));
    // mongoose.Promise = global.Promise;
};