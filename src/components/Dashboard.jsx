import { ClipboardList, CheckCircle2, Hourglass } from "lucide-react";

function Dashboard({
    totalTasks,
    completedTasks,
    remainingTasks
}) {
    return (
        <div className="dashboard">

            <div className="stat-card">
                <div className="stat-icon" style={{ background: "var(--surface-muted)", color: "var(--stat-total)" }}>
                <ClipboardList size={18} />
                </div>
                <h4>Total Tasks</h4>
                <p>{totalTasks}</p>
            </div>

            <div className="stat-card">
                <div className="stat-icon" style={{ background: "var(--surface-muted)", color: "var(--stat-completed)" }}>
                <CheckCircle2 size={18} />
                </div>
                <h4>Completed</h4>
                <p>{completedTasks}</p>
            </div>

            <div className="stat-card">
                <div className="stat-icon" style={{ background: "var(--surface-muted)", color: "var(--stat-remaining)" }}>
                <Hourglass size={18} />
                </div>
                <h4>Remaining</h4>
                <p>{remainingTasks}</p>
            </div>

        </div>
    );
}

export default Dashboard;