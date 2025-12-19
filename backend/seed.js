const mongoose = require("mongoose");
const Book = require("./models/Book");
const Category = require("./models/Category");

require("./db");

async function seedDatabase() {
  try {
    // Clear existing data
    await Book.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      { name: "Fiction", description: "Fictional novels and stories" },
      { name: "Technology", description: "Technology and programming books" },
      { name: "History", description: "Historical works" },
      { name: "Classics", description: "Classic literature" },
      { name: "Science", description: "Science and research" }
    ]);

    // Create books
    const books = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        price: 150,
        category: categories[3]._id,
        stock: 50,
        description: "A classic American novel set in the Jazz Age",
        image: "📚",
        rating: 4.5,
        reviewsCount: 250,
        popularity: 100
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        price: 160,
        category: categories[3]._id,
        stock: 45,
        description: "A gripping tale of racial injustice and childhood innocence",
        image: "📖",
        rating: 4.7,
        reviewsCount: 300,
        popularity: 120
      },
      {
        title: "1984",
        author: "George Orwell",
        price: 170,
        category: categories[3]._id,
        stock: 40,
        description: "A dystopian novel about totalitarianism",
        image: "📕",
        rating: 4.6,
        reviewsCount: 280,
        popularity: 110
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        price: 450,
        category: categories[1]._id,
        stock: 30,
        description: "A practical guide to writing better code",
        image: "💻",
        rating: 4.8,
        reviewsCount: 500,
        popularity: 200
      },
      {
        title: "JavaScript: The Good Parts",
        author: "Douglas Crockford",
        price: 350,
        category: categories[1]._id,
        stock: 25,
        description: "Essential knowledge for JavaScript developers",
        image: "🔧",
        rating: 4.4,
        reviewsCount: 400,
        popularity: 150
      },
      {
        title: "The Selfish Gene",
        author: "Richard Dawkins",
        price: 280,
        category: categories[4]._id,
        stock: 35,
        description: "A revolutionary look at evolution",
        image: "🧬",
        rating: 4.5,
        reviewsCount: 200,
        popularity: 80
      },
      {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        price: 320,
        category: categories[4]._id,
        stock: 28,
        description: "From the Big Bang to Black Holes",
        image: "🌌",
        rating: 4.3,
        reviewsCount: 350,
        popularity: 140
      },
      {
        title: "The History of Ancient Rome",
        author: "Various Authors",
        price: 420,
        category: categories[2]._id,
        stock: 22,
        description: "Comprehensive history of the Roman Empire",
        image: "🏛️",
        rating: 4.6,
        reviewsCount: 180,
        popularity: 90
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        price: 140,
        category: categories[0]._id,
        stock: 55,
        description: "A romantic novel of manners and marriage",
        image: "💕",
        rating: 4.7,
        reviewsCount: 400,
        popularity: 180
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        price: 200,
        category: categories[0]._id,
        stock: 38,
        description: "Epic science fiction on a desert planet",
        image: "🏜️",
        rating: 4.5,
        reviewsCount: 320,
        popularity: 160
      }
    ];

    await Book.insertMany(books);
    console.log("✅ Database seeded successfully!");
    console.log(`✅ ${categories.length} categories created`);
    console.log(`✅ ${books.length} books created`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
