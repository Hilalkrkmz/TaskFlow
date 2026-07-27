import { useMemo } from "react";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCurrentStreak(dateKeySet) {
    let streak = 0;
    let cursor = new Date();

    if (!dateKeySet.has(toDateKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
    }

    while (dateKeySet.has(toDateKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
}

function Statistics({ tasks }) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const countsByDay = useMemo(() => {
        const map = {};
        tasks.forEach(task => {
            if (!task.completedAt) return;
            const key = toDateKey(task.completedAt);
            map[key] = (map[key] || 0) + 1;
        });
        return map;
    }, [tasks]);

    const currentStreak = useMemo(() => {
        return getCurrentStreak(new Set(Object.keys(countsByDay)));
    }, [countsByDay]);

    const last7Days = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = toDateKey(d);
            days.push({
                key,
                label: WEEKDAY_LABELS[d.getDay()],
                count: countsByDay[key] || 0,
                isToday: i === 0
            });
        }
        return days;
    }, [countsByDay]);

    const maxCount = Math.max(1, ...last7Days.map(d => d.count));

    const priorityCounts = useMemo(() => {
        const counts = { high: 0, medium: 0, low: 0 };
        tasks.forEach(task => {
            const p = task.priority || "medium";
            if (counts[p] !== undefined) counts[p]++;
        });
        return counts;
    }, [tasks]);

    const maxPriority = Math.max(1, priorityCounts.high, priorityCounts.medium, priorityCounts.low);

    return (
        <div className="stats-page">
            <h2 className="stats-title">Statistics</h2>

            <div className="stats-cards">
                <div className="stats-card">
                    <p className="stats-card-label">Completion rate</p>
                    <p className="stats-card-value">{completionRate}%</p>
                </div>
                <div className="stats-card">
                    <p className="stats-card-label">Current streak</p>
                    <p className="stats-card-value">{currentStreak} <span>days</span></p>
                </div>
                <div className="stats-card">
                    <p className="stats-card-label">Total completed</p>
                    <p className="stats-card-value">{completedTasks}</p>
                </div>
            </div>

            <div className="stats-panel">
                <p className="stats-panel-title">Last 7 days</p>
                <div className="stats-bars">
                    {last7Days.map(day => (
                        <div key={day.key} className="stats-bar-col">
                            <span className="stats-bar-count">{day.count}</span>
                            <div className="stats-bar-track">
                                <div
                                    className={`stats-bar-fill ${day.count === 0 ? "empty" : ""}`}
                                    style={{ height: `${Math.max(4, (day.count / maxCount) * 100)}%` }}
                                />
                            </div>
                            <span className={`stats-bar-label ${day.isToday ? "today" : ""}`}>{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="stats-panel">
                <p className="stats-panel-title">Priority breakdown</p>

                <div className="stats-priority-row">
                    <span className="stats-priority-label">High</span>
                    <div className="stats-priority-track">
                        <div
                            className="stats-priority-fill priority-fill-high"
                            style={{ width: `${(priorityCounts.high / maxPriority) * 100}%` }}
                        />
                    </div>
                    <span className="stats-priority-count">{priorityCounts.high}</span>
                </div>

                <div className="stats-priority-row">
                    <span className="stats-priority-label">Medium</span>
                    <div className="stats-priority-track">
                        <div
                            className="stats-priority-fill priority-fill-medium"
                            style={{ width: `${(priorityCounts.medium / maxPriority) * 100}%` }}
                        />
                    </div>
                    <span className="stats-priority-count">{priorityCounts.medium}</span>
                </div>

                <div className="stats-priority-row">
                    <span className="stats-priority-label">Low</span>
                    <div className="stats-priority-track">
                        <div
                            className="stats-priority-fill priority-fill-low"
                            style={{ width: `${(priorityCounts.low / maxPriority) * 100}%` }}
                        />
                    </div>
                    <span className="stats-priority-count">{priorityCounts.low}</span>
                </div>
            </div>
        </div>
    );
}

export default Statistics;