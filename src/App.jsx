import { useState,useEffect,useRef } from "react";
import Header from "./components/Header";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./TaskFlow.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";

const priorityWeight={high:3, medium: 2, low:1};

function App(){

  const [tasks, setTasks]= useState([]);
//suanki deger ve değişen deger
  const [editingId, setEditingId] = useState(null);

  const [filter, setFilter]= useState("all");

  const [sortBy, setSortBy] = useState("created");

  const firstRender = useRef(true);

const toggleTask =(id)=>{
  setTasks(
    tasks.map(task=>
      task.id === id
      ?{...task,
         completed: !task.completed,
         completedAt: !task.completed ? new Date().toISOString() : null}
      : task
    )
  );
}

const updateTask = (id, newText) => {
  setTasks(
    tasks.map(task =>//butun degerleri dolasıyor
      task.id === id
        ? { ...task, text: newText }
        : task
    )
  );
};

const deleteTask=(id)=>{
  setTasks(tasks.filter(task => task.id !==id));
};

useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
    }
}, []);

useEffect(() => {
    if (firstRender.current) {
        firstRender.current = false;
        return;
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
}, [tasks]);

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

return (
<div className="app">
    <Sidebar />
  
  <div className="container">

    <Header/>

    <Dashboard
    totalTasks={totalTasks}
    completedTasks={completedTasks}
    remainingTasks={remainingTasks}
/>

    <TaskForm
      tasks={tasks}
      setTasks={setTasks}
    />

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

  </div>
  
</div>
);

}
export default App;