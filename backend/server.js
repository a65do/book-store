const express = require("express");
const cors = require("cors");
require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/books", require("./routes/books"));
app.use("/users", require("./routes/users"));
app.use("/orders", require("./routes/orders"));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
