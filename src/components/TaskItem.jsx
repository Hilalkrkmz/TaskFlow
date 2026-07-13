function TaskItem({task,toggleTask,deleteTask}){
    return (
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
 
<button onClick={()=> deleteTask(task.id)}>
sil
</button>

</div>
    );
}
export default TaskItem;