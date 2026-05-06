const Task = require("../models/Task");
const Project = require("../models/Project");

exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, status = "Todo" } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isProjectMember = project.owner.equals(req.user._id) || project.members.some((member) => member.equals(req.user._id));
    if (!isProjectMember) {
      return res.status(403).json({ message: "You are not allowed to add tasks to this project" });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
      dueDate,
      status
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const userProjects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).select("_id");

    const authFilter = {
      $or: [{ project: { $in: userProjects } }, { assignedTo: req.user._id }]
    };

    const filters = [authFilter];

    if (req.query.status) {
      filters.push({ status: req.query.status });
    }

    if (req.query.projectId) {
      filters.push({ project: req.query.projectId });
    }

    if (req.query.search) {
      filters.push({
        $or: [
          { title: { $regex: req.query.search, $options: "i" } },
          { description: { $regex: req.query.search, $options: "i" } }
        ]
      });
    }

    const tasks = await Task.find(filters.length > 1 ? { $and: filters } : authFilter)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Unable to load tasks", error: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dueDate } = req.body;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const canUpdate = task.assignedTo?.equals(req.user._id) || task.createdBy.equals(req.user._id) || req.user.role === "Admin";
    if (!canUpdate) {
      return res.status(403).json({ message: "You cannot update this task" });
    }

    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Unable to update task", error: error.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const userProjects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).select("_id");

    const tasks = await Task.find({
      $or: [{ project: { $in: userProjects } }, { assignedTo: req.user._id }]
    });

    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "Completed").length;
    const overdue = tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed"
    ).length;

    res.json({ total, completed, overdue });
  } catch (error) {
    res.status(500).json({ message: "Unable to load dashboard summary", error: error.message });
  }
};
