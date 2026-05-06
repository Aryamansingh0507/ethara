const mongoose = require("mongoose");
require("dotenv").config();

const Project = require("./models/Project");

async function migrateProjects() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Update all projects to have hidden: false and remove visible field
    const result = await Project.updateMany({}, { $set: { hidden: false }, $unset: { visible: 1 } });
    console.log(`Updated ${result.modifiedCount} projects`);

    console.log("Migration completed");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateProjects();