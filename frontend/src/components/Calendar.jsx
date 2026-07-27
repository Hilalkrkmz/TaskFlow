import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function toDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getHeatLevel(count) {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
}

function Calendar({ tasks }) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState(null);

    const countsByDay = useMemo(() => {
        const map = {};
        tasks.forEach(task => {
            if (!task.completedAt) return;
            const key = toDateKey(task.completedAt);
            map[key] = (map[key] || 0) + 1;
        });
        return map;
    }, [tasks]);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) {
        cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    const goToPrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    const selectedTasks = selectedDate
        ? tasks.filter(task => task.completedAt && toDateKey(task.completedAt) === selectedDate)
        : [];

    return (
        <div className="calendar-page">
            <div className="calendar-header">
                <h2>{MONTH_NAMES[month]} {year}</h2>
                <div className="calendar-nav">
                    <button onClick={goToPrevMonth} aria-label="Önceki ay">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={goToNextMonth} aria-label="Sonraki ay">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {WEEKDAYS.map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                ))}

                {cells.map((date, i) => {
                    if (!date) {
                        return <div key={i} className="calendar-cell empty" />;
                    }
                    const key = toDateKey(date);
                    const count = countsByDay[key] || 0;
                    const level = getHeatLevel(count);
                    const isSelected = selectedDate === key;

                    return (
                        <button
                            key={i}
                            className={`calendar-cell heat-${level} ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedDate(isSelected ? null : key)}
                            title={count > 0 ? `${count} görev tamamlandı` : "Tamamlanan görev yok"}
                        >
                            <span className="calendar-daynum">{date.getDate()}</span>
                        </button>
                    );
                })}
            </div>

            <div className="calendar-legend">
                <span>low</span>
                <span className="calendar-cell heat-0 legend-swatch" />
                <span className="calendar-cell heat-1 legend-swatch" />
                <span className="calendar-cell heat-2 legend-swatch" />
                <span className="calendar-cell heat-3 legend-swatch" />
                <span className="calendar-cell heat-4 legend-swatch" />
                <span>high</span>
            </div>

            {selectedDate && (
                <div className="calendar-day-detail">
                    <h4>
                        {new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                        {" — completed tasks"}
                    </h4>
                    {selectedTasks.length === 0 ? (
                        <p className="calendar-empty-msg">No tasks completed this day.</p>
                    ) : (
                        <ul>
                            {selectedTasks.map(task => (
                                <li key={task.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <CheckCircle2 size={15} color="var(--stat-completed)" />
                                    {task.text}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default Calendar;