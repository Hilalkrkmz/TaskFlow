import { useState } from "react";
import Header from "./components/Header";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./TaskFlow.css";

function App(){

  const [tasks, setTasks]= useState([]);
//suanki deger ve değişen deger
  const [editingId, setEditingId] = useState(null);

  const [filter, setFilter]= useState("all");

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