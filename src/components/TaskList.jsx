import TaskItem from "./TaskItem";

function TaskList({tasks,toggleTask,deleteTask}){
    return (
 
        <div className="task-list">
            {
                tasks.map(task=>(
                    <TaskItem
                        key={task.id}
                        task={task}
                        toggleTask={toggleTask}
                        deleteTask={deleteTask}
                    />
        
                ))}
        </div>
    );
}
export default TaskList;