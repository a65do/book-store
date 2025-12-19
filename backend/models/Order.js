const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book"
    },
    title: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: Date
});

module.exports = mongoose.model("Order", orderSchema);
