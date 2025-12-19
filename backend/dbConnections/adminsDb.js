// DEPRECATED: This file is no longer used.
// The application now uses a single consolidated database: online-bookstore
// Admins are stored in the users collection within the main database with role: "admin".
// See backend/db.js for the active database connection.

const mongoose = require("mongoose");

console.warn("⚠️  DEPRECATED: adminsDb.js is no longer used. Use db.js instead.");

const adminsDbUri = "mongodb://127.0.0.1:27017/admins_db";
const adminsConnection = mongoose.createConnection(adminsDbUri);

module.exports = adminsConnection;
