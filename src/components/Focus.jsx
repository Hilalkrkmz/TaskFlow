import { useState, useEffect, useRef } from "react";
import { RefreshCw, Pause, Play, SkipForward, Target } from "lucide-react";

const DURATIONS = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

const SESSIONS_BEFORE_LONG_BREAK = 4;
const RADIUS = 98;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function toDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Focus({ tasks }) {
    const [sessionType, setSessionType] = useState("focus"); // "focus" | "short" | "long"
    const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
    const [isRunning, setIsRunning] = useState(false);
    const [focusCount, setFocusCount] = useState(0);
    const [linkedTaskId, setLinkedTaskId] = useState(null);
    const [pickingTask, setPickingTask] = useState(false);
    const [pomodoroLog, setPomodoroLog] = useState({});
    const firstRender = useRef(true);

    useEffect(() => {
        const saved = localStorage.getItem("pomodoroLog");
        if (saved) setPomodoroLog(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        localStorage.setItem("pomodoroLog", JSON.stringify(pomodoroLog));
    }, [pomodoroLog]);

    useEffect(() => {
        if (!isRunning) return;

        if (timeLeft === 0) {
            advanceSession(true);
            return;
        }

        const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, timeLeft]);

    const advanceSession = (completed) => {
        if (sessionType === "focus") {
            if (completed) {
                const todayKey = toDateKey(new Date());
                setPomodoroLog(prev => ({ ...prev, [todayKey]: (prev[todayKey] || 0) + 1 }));
            }
            const nextCount = focusCount + 1;
            setFocusCount(nextCount);
            if (nextCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
                setSessionType("long");
                setTimeLeft(DURATIONS.long);
            } else {
                setSessionType("short");
                setTimeLeft(DURATIONS.short);
            }
        } else {
            setSessionType("focus");
            setTimeLeft(DURATIONS.focus);
        }
    };

    const toggleRunning = () => setIsRunning(prev => !prev);

    const resetSession = () => {
        setIsRunning(false);
        setTimeLeft(DURATIONS[sessionType]);
    };

    const skipSession = () => {
        setIsRunning(false);
        advanceSession(false);
    };

    const selectSessionType = (type) => {
        if (type === sessionType) return;
        setIsRunning(false);
        setSessionType(type);
        setTimeLeft(DURATIONS[type]);
    };

    const total = DURATIONS[sessionType];
    const progress = (total - timeLeft) / total;
    const dashoffset = CIRCUMFERENCE * (1 - progress);

    const cyclePosition = focusCount % SESSIONS_BEFORE_LONG_BREAK;
    const dotsFilled = cyclePosition === 0 && focusCount > 0 ? SESSIONS_BEFORE_LONG_BREAK : cyclePosition;

    const todayKey = toDateKey(new Date());
    const todayCount = pomodoroLog[todayKey] || 0;

    const linkedTask = tasks.find(t => t.id === linkedTaskId);

    return (
        <div className="focus-page">
            <h2 className="focus-title">Focus Timer</h2>

            <div className="focus-tabs">
                <button
                    className={`focus-tab ${sessionType === "focus" ? "active" : ""}`}
                    onClick={() => selectSessionType("focus")}
                >
                    Focus
                </button>
                <button
                    className={`focus-tab ${sessionType === "short" ? "active" : ""}`}
                    onClick={() => selectSessionType("short")}
                >
                    Short Break
                </button>
                <button
                    className={`focus-tab ${sessionType === "long" ? "active" : ""}`}
                    onClick={() => selectSessionType("long")}
                >
                    Long Break
                </button>
            </div>

            <div className="focus-timer-wrap">
                <svg viewBox="0 0 220 220" width="220" height="220">
                    <circle className="focus-timer-track" cx="110" cy="110" r={RADIUS} />
                    <circle
                        className="focus-timer-progress"
                        cx="110"
                        cy="110"
                        r={RADIUS}
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={dashoffset}
                        transform="rotate(-90 110 110)"
                    />
                </svg>
                <div className="focus-timer-center">
                    <span className="focus-timer-time">{formatTime(timeLeft)}</span>
                    <span className="focus-timer-session">
                        {sessionType === "focus"
                            ? `Session ${cyclePosition + 1} of ${SESSIONS_BEFORE_LONG_BREAK}`
                            : sessionType === "short" ? "Short Break" : "Long Break"}
                    </span>
                </div>
            </div>

            <div className="focus-controls">
                <button className="focus-control-btn" onClick={resetSession} aria-label="Reset">
                    <RefreshCw size={18} />
                </button>
                <button
                    className="focus-control-btn primary"
                    onClick={toggleRunning}
                    aria-label={isRunning ? "Pause" : "Play"}
                >
                    {isRunning ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button className="focus-control-btn" onClick={skipSession} aria-label="Skip">
                    <SkipForward size={18} />
                </button>
            </div>

            <div className="focus-task-link">
                {pickingTask ? (
                    <select
                        className="focus-task-select"
                        value={linkedTaskId ?? ""}
                        onChange={(e) => {
                            setLinkedTaskId(e.target.value ? Number(e.target.value) : null);
                            setPickingTask(false);
                        }}
                        onBlur={() => setPickingTask(false)}
                        autoFocus
                    >
                        <option value="">No task</option>
                        {tasks.filter(t => !t.completed).map(t => (
                            <option key={t.id} value={t.id}>{t.text}</option>
                        ))}
                    </select>
                ) : (
                    <>
                        <div className="focus-task-info">
                            <Target size={15} />
                            <span>
                                {linkedTask ? <>Working on: <strong>{linkedTask.text}</strong></> : "No task linked"}
                            </span>
                        </div>
                        <span className="focus-task-change" onClick={() => setPickingTask(true)}>
                            Change
                        </span>
                    </>
                )}
            </div>

            <div className="focus-dots">
                {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
                    <span key={i} className={`focus-dot ${i < dotsFilled ? "filled" : ""}`} />
                ))}
            </div>
            <p className="focus-dots-label">
                {dotsFilled} of {SESSIONS_BEFORE_LONG_BREAK} pomodoros this cycle · {todayCount} today
            </p>
        </div>
    );
}

export default Focus;