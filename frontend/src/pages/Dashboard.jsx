import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api";
import LoadingSpinner from "../components/LoadingSpinner";

const statusOptions = ["Todo", "In Progress", "Completed"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, completed: 0, overdue: 0 });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", projectId: "" });
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", projectId: "", dueDate: "", status: "Todo" });
  const [savingTask, setSavingTask] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [summaryRes, projectsRes, tasksRes] = await Promise.all([
          API.get("/tasks/summary"),
          API.get("/projects"),
          API.get("/tasks", { params: filters })
        ]);

        setSummary(summaryRes.data);
        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, navigate]);

  const projectOptions = useMemo(
    () => projects.filter(project => user?.role === "Admin" || !project.hidden).map((project) => ({ value: project._id, label: project.name })),
    [projects, user]
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setSavingProject(true);

    try {
      await API.post("/projects", projectForm);
      toast.success("Project created");
      setProjectForm({ name: "", description: "" });
      const projectsRes = await API.get("/projects");
      setProjects(projectsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create project");
    } finally {
      setSavingProject(false);
    }
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    setSavingTask(true);

    try {
      await API.post("/tasks", taskForm);
      toast.success("Task created successfully");
      setTaskForm({ title: "", description: "", projectId: "", dueDate: "", status: "Todo" });
      const tasksRes = await API.get("/tasks", { params: filters });
      setTasks(tasksRes.data);
      const summaryRes = await API.get("/tasks/summary");
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create task");
    } finally {
      setSavingTask(false);
    }
  };

  const toggleProjectVisibility = async (projectId) => {
    try {
      const { data } = await API.patch(`/projects/${projectId}/visibility`);
      setProjects((current) => current.map((project) => (project._id === projectId ? data : project)));
      toast.success(`Project visibility updated to ${data.hidden ? "hidden" : "visible"}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update project visibility");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((current) =>
        current.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task))
      );
      const summaryRes = await API.get("/tasks/summary");
      setSummary(summaryRes.data);
      toast.success("Task status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update task");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Project dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold">Hello, {user?.name || "User"}</h1>
            <p className="mt-2 text-slate-400">Manage projects, assign tasks, and track deadlines.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">{user?.role || "Member"}</span>
            <button onClick={handleLogout} className="rounded-2xl bg-slate-700 px-4 py-2 text-sm text-white transition hover:bg-slate-600">
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Total tasks</p>
            <p className="mt-3 text-4xl font-semibold text-white">{summary.total}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Completed tasks</p>
            <p className="mt-3 text-4xl font-semibold text-emerald-400">{summary.completed}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
            <p className="text-sm text-slate-400">Overdue tasks</p>
            <p className="mt-3 text-4xl font-semibold text-rose-400">{summary.overdue}</p>
          </div>
        </section>

        {user?.role === "Admin" && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Admin Controls</h2>
            <p className="text-sm text-slate-400">Manage project visibility.</p>
            <div className="mt-4 space-y-4">
              {projects.map((project) => (
                <div key={project._id} className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-slate-400">{project.description}</p>
                  </div>
                  <button
                    onClick={() => toggleProjectVisibility(project._id)}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${
                      !project.hidden
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {!project.hidden ? "Visible" : "Hidden"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Tasks</h2>
                <p className="text-sm text-slate-400">Search, filter, and update task status in one place.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Search tasks"
                  className="min-w-[200px] rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                >
                  <option value="">All statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={filters.projectId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, projectId: e.target.value }))}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                >
                  <option value="">All projects</option>
                  {projectOptions.map((project) => (
                    <option key={project.value} value={project.value}>{project.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
                  No tasks match your filters.
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">{task.description || "No description provided."}</p>
                        <p className="mt-3 text-sm text-slate-400">
                          Project: <span className="font-medium text-slate-200">{task.project?.name || "Unknown"}</span>
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Assigned to: <span className="font-medium text-slate-200">{task.assignedTo?.name || "Unassigned"}</span>
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Due: <span className="font-medium text-slate-200">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}</span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:items-end">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <span className={`rounded-full px-3 py-1 text-sm ${task.status === "Completed" ? "bg-emerald-500/15 text-emerald-200" : task.status === "In Progress" ? "bg-blue-500/15 text-blue-200" : "bg-slate-700/70 text-slate-200"}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            {user?.role === "Admin" && (
              <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Create project</h2>
                <p className="mt-1 text-sm text-slate-400">Admin only: add team projects so members can assign tasks.</p>
                <form onSubmit={handleProjectSubmit} className="mt-5 space-y-4">
                  <input
                    value={projectForm.name}
                    onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Project name"
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  />
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Project description"
                    rows="4"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={savingProject}
                    className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                  >
                    {savingProject ? "Creating..." : "Create project"}
                  </button>
                </form>
              </section>
            )}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Create task</h2>
              <p className="mt-1 text-sm text-slate-400">Assign new work and track due dates.</p>
              <form onSubmit={handleTaskSubmit} className="mt-5 space-y-4">
                <input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Task title"
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                />
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description"
                  rows="3"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                />
                <select
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, projectId: e.target.value }))}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                >
                  <option value="">Select a project</option>
                  {projectOptions.map((project) => (
                    <option key={project.value} value={project.value}>{project.label}</option>
                  ))}
                </select>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    type="date"
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  />
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {savingTask ? "Saving..." : "Add task"}
                </button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
