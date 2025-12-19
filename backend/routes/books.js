const express = require("express");
const Book = require("../models/Book");
const Category = require("../models/Category");
const { authenticateToken, authorizeRoles } = require("./middleware/auth");
const router = express.Router();

// Get all books with optional filtering and sorting
router.get("/", async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      query.category = category;
    }

    let books = await Book.find(query).populate("category");

    // Sorting
    if (sortBy === "price-asc") {
      books.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      books.sort((a, b) => b.price - a.price);
    } else if (sortBy === "popularity") {
      books.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === "rating") {
      books.sort((a, b) => b.rating - a.rating);
    }

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single book
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("category");
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create book (admin only)
router.post("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update book (admin only)
router.put("/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete book (admin only)
router.delete("/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
