import { useState } from "react";
import { Plus } from "lucide-react";

function TaskForm({ tasks , setTasks}){
    const [text, setText]=useState("");
    const [priority, setPriority] = useState("medium");
    const addTask= ()=>{
        if(!text.trim()) return;
    const newTask={
                    id:Date.now(),
                    text: text,
                    completed: false,
                    priority: priority,
                    createdAt: new Date().toISOString(),
                    completedAt: null
                };
                setTasks([...tasks,newTask]);
                setText("");
                setPriority("medium");
    };
    return (
     <div className="task-form-card">
        <div className="task-form">
            <input 
            type="text"
            placeholder="What do you want to do?"
            value={text}
            onChange={(e)=>setText(e.target.value)}
            onKeyDown={(e) => {
            if (e.key === "Enter") {
            addTask();
            }
          }}
        />

    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
    </select>

            <button 
            onClick={addTask}>
                <Plus size={16} />
             Add Task
            </button>
        </div>
    </div>
    );
}
export default TaskForm;