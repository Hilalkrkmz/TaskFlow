import { useState } from "react";
import Header from "./components/Header";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./TaskFlow.css";

function App(){

  const [tasks, setTasks]= useState([]);
//suanki deger ve değişen deger
  const [editingId, setEditingId] = useState(null);

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

return (
  <div className="container">
    <Header />
    <TaskForm
    tasks={tasks}
    setTasks={setTasks}  
    />
    <TaskList 
    tasks={tasks}
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