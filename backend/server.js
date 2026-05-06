const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ethara-production-d0e7.up.railway.app/",
    "https://perceptive-encouragement-production-0f8d.up.railway.app"
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});