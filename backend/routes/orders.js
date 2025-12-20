const express = require("express");
const Order = require("../models/Order");
const Book = require("../models/Book");
const { authenticateToken, authorizeRoles } = require("./middleware/auth");
const router = express.Router();

// Get user orders (specific route MUST come first)
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("items.bookId")
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin only)
router.get("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId")
      .populate("items.bookId")
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//Badr

// Create order
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    
    // Calculate total price, update book popularity, and reduce stock
    let totalPrice = 0;
    for (let item of items) {
      const book = await Book.findById(item.bookId);
      if (book) {
        totalPrice += book.price * item.quantity;
        book.popularity += item.quantity;
        book.stock -= item.quantity; // Reduce stock by quantity ordered
        await book.save();
      }
    }

    const order = new Order({
      userId: req.user.userId || req.user.id,
      items,
      totalPrice,
      status: "pending"
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin only)
router.put("/:orderId", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.delete("/:orderId", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: "cancelled" },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
