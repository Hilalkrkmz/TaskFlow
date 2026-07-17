import { useState,useEffect,useRef } from "react";
import Header from "./components/Header";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./TaskFlow.css";

function App(){

  const [tasks, setTasks]= useState([]);
//suanki deger ve değişen deger
  const [editingId, setEditingId] = useState(null);

  const [filter, setFilter]= useState("all");

  const firstRender = useRef(true);

const toggleTask =(id)=>{
  setTasks(
    tasks.map(task=>
      task.id === id
      ?{...task, completed: !task.completed}
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

return (
  <div className="container">

    <Header
      totalTasks={totalTasks}
      completedTasks={completedTasks}
      remainingTasks={remainingTasks}
    />

    <TaskForm
      tasks={tasks}
      setTasks={setTasks}
    />

  <div className="filter-buttons">
    <button onClick={() => setFilter("all")}>
        Hepsi
    </button>

    <button onClick={() => setFilter("active")}>
        Aktif
    </button>

    <button onClick={() => setFilter("completed")}>
        Tamamlanan
    </button>
  </div>

    <TaskList
      tasks={filteredTasks}
      toggleTask={toggleTask}
      deleteTask={deleteTask}
      editingId={editingId}
      setEditingId={setEditingId}
      updateTask={updateTask}
    />

  </div>
);

}
export default App;