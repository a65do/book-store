const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/online-bookstore")
  .then(() => console.log("MongoDB connected to online-bookstore"))
  .catch(err => console.log(err));

module.exports = mongoose.connection;

