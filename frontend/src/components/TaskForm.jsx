import { useState } from "react";
import { Plus } from "lucide-react";

function TaskForm({ onAddTask }){
    const [text, setText]=useState("");
    const [priority, setPriority] = useState("medium");
    const addTask= ()=>{
        if(!text.trim()) return;
                onAddTask(text, priority);
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