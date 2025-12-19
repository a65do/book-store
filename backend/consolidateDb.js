// DEPRECATED: This file is no longer needed.
// The application now uses a single consolidated database: online-bookstore
// This script was used to consolidate data from separate databases (books_db, users_db, admins_db)
// back into a single unified database, which is now the permanent architecture.
//
// The consolidation is complete. All data is stored in:
// - Database: mongodb://127.0.0.1:27017/online-bookstore
// - Collections: users, books, categories, orders

console.log("❌ This script is deprecated. Database consolidation is already complete.");
console.log("✅ All data is in: online-bookstore database");
console.log("📊 Collections: users, books, categories, orders");
