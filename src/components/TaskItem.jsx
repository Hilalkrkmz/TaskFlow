function TaskItem({task,toggleTask,deleteTask}){
    return (
<div>
    <input
    type="checkbox"
    checked={task.completed}
    onChange={()=>toggleTask(task.id)}
    />
    <span className={task.completed ? "completed" : ""}>
    {task.text}
</span>

<button onClick={()=> deleteTask(task.id)}>
sil
</button>

</div>
    );
}
export default TaskItem;