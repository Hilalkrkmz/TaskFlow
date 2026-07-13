import { useState } from "react";
import Header from "./components/Header";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./TaskFlow.css";

function App(){

  const [tasks, setTasks]= useState([]);
//suanki deger ve değişen deger

const toggleTask =(id)=>{
  setTasks(
    tasks.map(task=>
      task.id === id
      ?{...task, completed: !task.completed}
      : task
    )
  );
}

const deleteTask=(id)=>{
  setTasks(tasks.filter(task => task.id !==id));
};

return (
  <div>
    <Header />
    <TaskForm
    tasks={tasks}
    setTasks={setTasks}  
    />
    <TaskList 
    tasks={tasks}
    toggleTask={toggleTask}
    deleteTask={deleteTask}
    />
  </div>
);



}
export default App;