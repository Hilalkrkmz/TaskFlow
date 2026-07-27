import TaskItem from "./TaskItem";

function TaskList({tasks,toggleTask,deleteTask,editingId,setEditingId,updateTask}){
    return (
 
        <div className="task-list">
            {
                tasks.map(task=>(
                    <TaskItem
                        key={task.id}
                        task={task}
                        toggleTask={toggleTask}
                        deleteTask={deleteTask}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        updateTask={updateTask}
                    />
        
                ))}
        </div>
    );
}
export default TaskList;