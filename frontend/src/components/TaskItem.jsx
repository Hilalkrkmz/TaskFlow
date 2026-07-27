import { useState } from "react";
import { Pencil, Trash2, ArrowUp, Minus, ArrowDown } from "lucide-react";

const priorityConfig = {
    high: { label: "High", className: "priority-high", Icon: ArrowUp },
    medium: { label: "Medium", className: "priority-medium", Icon: Minus },
    low: { label: "Low", className: "priority-low", Icon: ArrowDown }
};
 
function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TaskItem({task,toggleTask,deleteTask,editingId,setEditingId,updateTask}){
    const [editText, setEditText] = useState(task.text);
    const priority = priorityConfig[task.priority] || priorityConfig.medium;
    const PriorityIcon = priority.Icon;

    return (
        editingId===task.id
        ?(
        <div className="task-item">
            <div className="edit-container">
            <input
            type="text"
            value={editText}
            onChange={(e)=> setEditText(e.target.value)}
            onKeyDown={(e)=>{
                if(e.key==="Enter"){
                    if(editText.trim()==="") return;

                    updateTask(task.id,editText);
                    setEditingId(null);
                }
            }}
            />

            <button onClick={()=> {
                if(editText.trim()==="") return;

                updateTask(task.id,editText);
                setEditingId(null);
            }}
            >
                Save
            </button>
            <button onClick={()=> {
                        setEditText(task.text)
                        setEditingId(null)
                                }}
            >
                 Cancel
            </button>
          </div>
        </div>
        
        )
        :(
          <div className="task-item">
    <div className="task-left">
       <input
          type="checkbox"
          checked={task.completed}
          onChange={()=>toggleTask(task.id)}
      />
  <div className="task-main">
    <span className={task.completed ? "completed" : ""}>
    {task.text}
    </span>
    <span className={`task-date ${task.completed ? "completed" : ""}`}>
    {formatDate(task.createdAt)}
    </span>
</div>

<span className={`priority-badge ${priority.className}`}>
    <PriorityIcon size={12} />
    {priority.label}
</span>

 <div className="task-buttons">
 {!task.completed && (
<button onClick={()=> setEditingId(task.id)}>
<Pencil size={15} />
</button>
)}
<button className="delete-btn" onClick={()=> deleteTask(task.id)}>
<Trash2 size={15} />
</button>
</div>
</div>
</div>
        )

    );
}
export default TaskItem;