import { useState } from "react";

function TaskForm({ tasks , setTasks}){
    const [text, setText]=useState("");

    const addTask= ()=>{
        if(!text.trim()) return;
    const newTask={
                    id:Date.now(),
                    text: text,
                    completed: false
                };
                setTasks([...tasks,newTask]);
                setText("");
    };
    return (
  
        <div>
            <input 
            type="text"
            placeholder="görev gir"
            value={text}
            onChange={(e)=>setText(e.target.value)}
            onKeyDown={(e) => {
            if (e.key === "Enter") {
            addTask();
            }
}}
            />
            <button 
            onClick={addTask}>
             ekle
            </button>
        </div>
    );
}
export default TaskForm;