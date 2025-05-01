const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Import routes
const authRoutes = require("./Routes/authRoutes");

//middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Server is up and running!");
  });
  
  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
  