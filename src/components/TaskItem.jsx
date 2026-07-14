import { useState } from "react";

function TaskItem({task,toggleTask,deleteTask,editingId,setEditingId,updateTask}){
    const [editText, setEditText] = useState(task.text);

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
                kaydet
            </button>
            <button onClick={()=> {
                        setEditText(task.text)
                        setEditingId(null)
                                }}
            >
                 iptal
            </button>
        </div></div>
        
        )
        :(
          <div className="task-item">
    <div className="task-left">
       <input
          type="checkbox"
          checked={task.completed}
          onChange={()=>toggleTask(task.id)}
      />

    <span className={task.completed ? "completed" : ""}>
    {task.text}
    </span>
 </div>
 <div className="task-buttons">
<button onClick={()=> setEditingId(task.id)}>
düzenle
</button>
<button onClick={()=> deleteTask(task.id)}>
sil
</button>
</div>
</div>
        )

    );
}
export default TaskItem;