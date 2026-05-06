const Project = require("../models/Project");
const User = require("../models/User");

exports.createProject = async (req, res) => {
  try {
    const { name, description, members = [] } = req.body;
    const validMembers = await User.find({ _id: { $in: members } }).select("_id");

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: validMembers.map((user) => user._id)
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to create project", error: error.message });
  }
};

exports.getUserProjects = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { hidden: false };

    const projects = await Project.find(query)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Unable to load projects", error: error.message });
  }
};

exports.toggleProjectVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.hidden = !project.hidden;
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Unable to update project visibility", error: error.message });
  }
};
