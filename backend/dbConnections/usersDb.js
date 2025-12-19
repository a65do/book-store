// DEPRECATED: This file is no longer used.
// The application now uses a single consolidated database: online-bookstore
// Users are stored in the users collection within the main database.
// See backend/db.js for the active database connection.

const mongoose = require("mongoose");

console.warn("⚠️  DEPRECATED: usersDb.js is no longer used. Use db.js instead.");

const usersDbUri = "mongodb://127.0.0.1:27017/users_db";
const usersConnection = mongoose.createConnection(usersDbUri);

module.exports = usersConnection;
