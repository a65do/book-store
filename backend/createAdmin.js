const mongoose = require("mongoose");
const User = require("./models/User");

require("./db");

async function createAdmin() {
  try {
    // Check if admin already exists
    let admin = await User.findOne({ email: "admin@bookstore.com" });
    
    if (admin) {
      console.log("✅ Admin user already exists!");
      process.exit(0);
    }

    // Create admin user
    admin = new User({
      username: "admin",
      email: "admin@bookstore.com",
      password: "admin123456",
      role: "admin",
      address: "Admin Office",
      phone: "0123456789"
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@bookstore.com");
    console.log("Password: admin123456");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();

