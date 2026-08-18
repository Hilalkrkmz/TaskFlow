import { useState,useEffect } from "react";
import Header from "./components/Header";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./TaskFlow.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Calendar from "./components/Calendar";
import Statistics from "./components/Statics";
import Settings from "./components/Settings";
import Themes from "./components/Themes";
import ThemeDecoration from "./components/ThemeDecoration";
import Notes from "./components/Notes";
import Focus from "./components/Focus";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import axiosInstance from "./api/axiosInstance";
import { getErrorMessage } from "./api/errorMessage";

const priorityWeight={high:3, medium: 2, low:1};

function App(){

  const [tasks, setTasks]= useState([]);
  const [editingId, setEditingId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [filter, setFilter]= useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "white");
  const [view, setView] = useState("home");

  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState("login");
  const [authChecking, setAuthChecking] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);


const fetchTasks = async () => {
    try {
        const response = await axiosInstance.get("/tasks");
        setTasks(response.data);
    } catch (err) {
        console.error("Görevler yüklenemedi:", err);
    }
};

const fetchNotes = async () => {
    try {
        const response = await axiosInstance.get("/notes");
        setNotes(response.data);
    } catch (err) {
        console.error("Notlar yüklenemedi:", err);
    }
};

const addTask = async (text, priority) => {
    try {
        const response = await axiosInstance.post("/tasks", { text, priority });
        setTasks([...tasks, response.data]);
    } catch (err) {
        alert(getErrorMessage(err, "Couldn't add task. Something went wrong."));
    }
};

const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
        const response = await axiosInstance.patch(`/tasks/${id}`, {
            completed: !task.completed
        });
        setTasks(tasks.map(t => (t.id === id ? response.data : t)));
    } catch (err) {
        alert(getErrorMessage(err, "Couldn't update task. Something went wrong."));
    }
};

const updateTask = async (id, newText) => {
    try {
        const response = await axiosInstance.patch(`/tasks/${id}`, { text: newText });
        setTasks(tasks.map(t => (t.id === id ? response.data : t)));
    } catch (err) {
        alert(getErrorMessage(err, "Couldn't update task. Something went wrong."));
    }
};

const deleteTask = async (id) => {
    try {
        await axiosInstance.delete(`/tasks/${id}`);
        setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
        alert(getErrorMessage(err, "Couldn't delete task. Something went wrong."));
    }
};

// Not: Notes.jsx eskiden bu işlemleri hiç backend'e göndermiyordu (sadece
// yerel state'i değiştiriyordu, yenilemede kaybolurdu) - task fonksiyonlarıyla
// aynı desende gerçek backend çağrılarına bağlandı.
const addNote = async (text) => {
    try {
        const response = await axiosInstance.post("/notes", { text });
        setNotes([response.data, ...notes]);
    } catch (err) {
        alert(getErrorMessage(err, "Couldn't add note. Something went wrong."));
    }
};

const updateNote = async (id, newText) => {
    try {
        const response = await axiosInstance.patch(`/notes/${id}`, { text: newText });
        setNotes(notes.map(n => (n.id === id ? response.data : n)));
    } catch (err) {
        alert(getErrorMessage(err, "Couldn't update note. Something went wrong."));
    }
};

const deleteNote = async (id) => {
    try {
        await axiosInstance.delete(`/notes/${id}`);
        setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
        alert(getErrorMessage(err, "Couldn't delete note. Something went wrong."));
    }
};

useEffect(() => {
    const checkExistingLogin = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setAuthChecking(false);
            return;
        }

        try {
            const response = await axiosInstance.get("/users/me");
            const { fullName, email, theme: userTheme } = response.data;

            setCurrentUser({ fullName, email, theme: userTheme });
            setTheme(userTheme);

            // Giriş geçerliyse, task ve notes'u da hemen çekelim.
            await fetchTasks();
            await fetchNotes();
        } catch (err) {
            localStorage.removeItem("token");
        } finally {
            setAuthChecking(false);
        }
    };

    checkExistingLogin();
}, []);

useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
}, [theme]);

const handleAuthSuccess = async ({ fullName, email, theme: userTheme }) => {
    setCurrentUser({ fullName, email, theme: userTheme });
    setTheme(userTheme);

    // Login/Register başarılı olunca da task ve notes'u çekelim
    await fetchTasks();
    await fetchNotes();
};

const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setAuthView("login");
    setTasks([]);
    setNotes([]);
};

const totalTasks=tasks.length;

const completedTasks=tasks.filter(task=> task.completed).length;

const remainingTasks=totalTasks-completedTasks;

const filteredTasks=tasks.filter(task=>{
  if(filter === "active"){
    return !task.completed;
  }
  if(filter=== "completed"){
    return task.completed;
  }
  return true;
});

 const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });


if (authChecking) {
    return <div className="auth-checking">Loading...</div>;
}

if (!currentUser) {
    if (authView === "login") {
        return (
            <Login
                onLoginSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setAuthView("register")}
                onForgotPassword={() => setAuthView("forgot-password")}
            />
        );
    }

    if (authView === "register") {
        return (
            <Register
                onRegisterSubmitted={(email) => {
                    setPendingVerificationEmail(email);
                    setAuthView("verify-email");
                }}
                onSwitchToLogin={() => setAuthView("login")}
            />
        );
    }

    if (authView === "verify-email") {
        return (
            <VerifyEmail
                email={pendingVerificationEmail}
                onVerifySuccess={handleAuthSuccess}
                onBackToLogin={() => setAuthView("login")}
            />
        );
    }

    if (authView === "forgot-password") {
        return (
            <ForgotPassword
                onBackToLogin={() => setAuthView("login")}
            />
        );
    }
}

return (
  <>
<ThemeDecoration theme={theme} />
<div className="app">
    <Sidebar view={view} onNavigate={setView} />
  
  <div className="container">
     {view === "home" && (
      <>
    <Header/>

    <Dashboard
    totalTasks={totalTasks}
    completedTasks={completedTasks}
    remainingTasks={remainingTasks}
/>

    <TaskForm onAddTask={addTask} />

<div className="task-list-header">
          <h3>My Tasks</h3>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created">Sort: Created</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>

  <div className="filter-buttons">
     <button
      className={filter === "all" ? "active" : ""}
      onClick={() => setFilter("all")}>
       All
    </button>

    <button
      className={filter === "active" ? "active" : ""}
      onClick={() => setFilter("active")}>
        Active
    </button>

    <button
      className={filter === "completed" ? "active" : ""}
      onClick={() => setFilter("completed")}>
        Completed
    </button>
  </div>

    <TaskList
      tasks={sortedTasks}
      toggleTask={toggleTask}
      deleteTask={deleteTask}
      editingId={editingId}
      setEditingId={setEditingId}
      updateTask={updateTask}
    />
  </>
  )}

    {view === "calendar" && <Calendar tasks={tasks} />}
    {view === "notes" && (
      <Notes notes={notes} onAddNote={addNote} onUpdateNote={updateNote} onDeleteNote={deleteNote} />
    )}
     <div style={{ display: view === "focus" ? "block" : "none" }}>
      <Focus tasks={tasks} />
    </div>
    {view === "statistics" && <Statistics tasks={tasks} />}
    {view === "themes" && <Themes theme={theme} setTheme={setTheme} />}
    {view === "settings" && <Settings tasks={tasks} setTasks={setTasks} />}
    {view === "profile" && <Profile currentUser={currentUser} onLogout={handleLogout} />}
  </div>
  
</div>
</>
);

}
export default App;