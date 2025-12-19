const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticateToken } = require("./middleware/auth");
const router = express.Router();

const JWT_SECRET = "your-secret-key-123"; // Change in production

// Register (Customer)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, address, phone } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Create new user
    user = new User({ 
      username: username.trim(), 
      email: email.toLowerCase().trim(), 
      password, 
      address: address || '', 
      phone: phone || '', 
      role: "customer" 
    });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});

// Login (Customers and Admins)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user (case-insensitive email search)
    const user = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: "i" } });
    
    if (!user) {
      console.log(`[LOGIN] User not found with email: ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log(`[LOGIN] User found: ${user.email}`);

    // Check password - direct comparison without hashing
    if (user.password !== password) {
      console.log(`[LOGIN] Invalid password for user: ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log(`[LOGIN] Login successful for user: ${email}`);

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[LOGIN] Unexpected error:', error);
    res.status(500).json({ error: error.message || "Login failed" });
  }
});

// Get user profile
router.get("/profile/:userId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile/:userId", authenticateToken, async (req, res) => {
  try {
    const { address, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { address, phone },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

