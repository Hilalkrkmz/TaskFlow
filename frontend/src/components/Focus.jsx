import { useState, useEffect, useRef } from "react";
import { RefreshCw, Pause, Play, SkipForward, Square, Target, Flame, Coffee, Moon, Timer, Trash2, ArrowLeft } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { getErrorMessage } from "../api/errorMessage";

const DURATIONS = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

const SESSION_LABELS = {
    focus: "Focus",
    short: "Short Break",
    long: "Long Break",
    stopwatch: "Stopwatch"
};

const SESSION_TYPE_ICONS = {
    FOCUS: Flame,
    SHORT_BREAK: Coffee,
    LONG_BREAK: Moon,
    STOPWATCH: Timer
};

const SESSION_TYPE_LABELS = {
    FOCUS: "Focus",
    SHORT_BREAK: "Short Break",
    LONG_BREAK: "Long Break",
    STOPWATCH: "Stopwatch"
};

// Focus.jsx'in kendi kucuk-harfli tab id'lerini backend enum string'ine cevirir.
const TAB_TYPE_TO_API_TYPE = {
    focus: "FOCUS",
    short: "SHORT_BREAK",
    long: "LONG_BREAK"
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

function formatStopwatchTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatSessionMinutes(durationSeconds) {
    if (durationSeconds < 60) return `${durationSeconds} sec`;
    return `${Math.round(durationSeconds / 60)} min`;
}

// Backend LocalDateTime offset'siz bekliyor - toISOString() UTC'ye cevirip
// "Z" ekliyor, bu da saatleri kaydırıyor. Yerel saat bilesenlerinden elle kuruyoruz.
function toLocalIso(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function groupLabel(dateKey) {
    const now = new Date();
    const todayKey = toDateKey(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);

    if (dateKey === todayKey) return "Today";
    if (dateKey === yesterdayKey) return "Yesterday";

    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const isCurrentYear = y === now.getFullYear();

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        ...(isCurrentYear ? {} : { year: "numeric" })
    });
}

function formatClock(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Focus({ tasks }) {
    const [sessionType, setSessionType] = useState("focus"); // "focus" | "short" | "long" | "stopwatch"
    const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
    const [isRunning, setIsRunning] = useState(false);
    const [focusCount, setFocusCount] = useState(0);
    const [linkedTaskId, setLinkedTaskId] = useState(null);
    const [pickingTask, setPickingTask] = useState(false);
    const [focusSessions, setFocusSessions] = useState([]);
    const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
    const [stopwatchRunning, setStopwatchRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // { atMs, baseSeconds } - kronometrenin gercek zamandan hesaplanmasi icin.
    // Bu component App.jsx'te display:none ile hep mount kaliyor (bkz. App.jsx),
    // o yuzden mobile'daki gibi modul-seviyesi bir store'a gerek yok.
    const stopwatchAnchorRef = useRef(null);
    const stopwatchStartedAtRef = useRef(null);

    useEffect(() => {
        axiosInstance
            .get("/focus-sessions")
            .then((res) => setFocusSessions(res.data))
            .catch((err) => console.error("Focus sessions couldn't be loaded:", err));
    }, []);

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

    useEffect(() => {
        if (!stopwatchRunning) return;
        const id = setTimeout(() => {
            const { atMs, baseSeconds } = stopwatchAnchorRef.current;
            setStopwatchSeconds(baseSeconds + Math.round((Date.now() - atMs) / 1000));
        }, 1000);
        return () => clearTimeout(id);
    }, [stopwatchRunning, stopwatchSeconds]);

    // Sekme arka planda kalıp geri gelince tarayıcı setTimeout'ları
    // yavaşlatabiliyor/durdurabiliyor - gerçek zamandan yeniden hesaplayıp
    // düzeltiyoruz (mobile'daki AppState resync'in web karşılığı).
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState !== "visible") return;
            if (stopwatchRunning && stopwatchAnchorRef.current) {
                const { atMs, baseSeconds } = stopwatchAnchorRef.current;
                setStopwatchSeconds(baseSeconds + Math.round((Date.now() - atMs) / 1000));
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, [stopwatchRunning]);

    // Focus/Short/Long/Stopwatch fark etmeksizin, sadece GERÇEKTEN tamamlanan
    // (skip/reset edilmeyen) bir oturumu backend'e kaydediyor.
    const logSession = async (apiType, startTime, endTime, durationSeconds) => {
        try {
            const response = await axiosInstance.post("/focus-sessions", {
                type: apiType,
                taskId: linkedTaskId,
                startTime: toLocalIso(startTime),
                endTime: toLocalIso(endTime),
                durationSeconds
            });
            setFocusSessions(prev => [response.data, ...prev]);
        } catch (err) {
            console.error("Focus session couldn't be logged:", err);
        }
    };

    const advanceSession = async (completed) => {
        if (completed) {
            const durationSeconds = DURATIONS[sessionType];
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - durationSeconds * 1000);
            await logSession(TAB_TYPE_TO_API_TYPE[sessionType], startTime, endTime, durationSeconds);
        }

        if (sessionType === "focus") {
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

    const startStopwatch = () => {
        stopwatchStartedAtRef.current = new Date();
        stopwatchAnchorRef.current = { atMs: Date.now(), baseSeconds: 0 };
        setStopwatchSeconds(0);
        setStopwatchRunning(true);
        setIsPaused(false);
    };

    const pauseStopwatch = () => {
        const { atMs, baseSeconds } = stopwatchAnchorRef.current;
        const current = baseSeconds + Math.round((Date.now() - atMs) / 1000);
        stopwatchAnchorRef.current = null;
        setStopwatchSeconds(current);
        setStopwatchRunning(false);
        setIsPaused(true);
    };

    const resumeStopwatch = () => {
        stopwatchAnchorRef.current = { atMs: Date.now(), baseSeconds: stopwatchSeconds };
        setStopwatchRunning(true);
        setIsPaused(false);
    };

    // Kaydetmeden baştan başlatır - Stop'tan farkı bu, kullanıcı "bu denemeyi
    // saymayayım" diyebilir.
    const resetStopwatch = () => {
        stopwatchAnchorRef.current = null;
        stopwatchStartedAtRef.current = null;
        setStopwatchRunning(false);
        setIsPaused(false);
        setStopwatchSeconds(0);
    };

    const stopStopwatch = async () => {
        let finalSeconds = stopwatchSeconds;
        if (stopwatchRunning && stopwatchAnchorRef.current) {
            const { atMs, baseSeconds } = stopwatchAnchorRef.current;
            finalSeconds = baseSeconds + Math.round((Date.now() - atMs) / 1000);
        }
        const startedAt = stopwatchStartedAtRef.current;

        stopwatchAnchorRef.current = null;
        stopwatchStartedAtRef.current = null;
        setStopwatchRunning(false);
        setIsPaused(false);
        setStopwatchSeconds(0);

        if (finalSeconds > 0 && startedAt) {
            await logSession("STOPWATCH", startedAt, new Date(), finalSeconds);
        }
    };

    const selectSessionType = (type) => {
        if (type === sessionType) return;
        setIsRunning(false);

        if (sessionType === "stopwatch") {
            // Stopwatch'tan başka bir tab'a geçiliyor - devam eden/duraklatılmış
            // bir oturum varsa kaydetmeden (Stop'a basılmadığı için) sıfırlanır.
            stopwatchAnchorRef.current = null;
            stopwatchStartedAtRef.current = null;
            setStopwatchRunning(false);
            setIsPaused(false);
            setStopwatchSeconds(0);
        }

        setSessionType(type);
        if (type === "stopwatch") {
            setStopwatchSeconds(0);
            setIsPaused(false);
        } else {
            setTimeLeft(DURATIONS[type]);
        }
    };

    const deleteSession = async (id) => {
        try {
            await axiosInstance.delete(`/focus-sessions/${id}`);
            setFocusSessions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert(getErrorMessage(err, "Couldn't delete session. Something went wrong."));
        }
    };

    const total = sessionType === "stopwatch" ? 0 : DURATIONS[sessionType];
    const progress = sessionType === "stopwatch" ? 0 : (total - timeLeft) / total;
    const dashoffset = CIRCUMFERENCE * (1 - progress);

    const cyclePosition = focusCount % SESSIONS_BEFORE_LONG_BREAK;
    const dotsFilled = cyclePosition === 0 && focusCount > 0 ? SESSIONS_BEFORE_LONG_BREAK : cyclePosition;

    const todayKey = toDateKey(new Date());
    const todaysSessions = focusSessions
        .filter(s => toDateKey(s.startTime) === todayKey)
        .slice()
        .reverse();

    const linkedTask = tasks.find(t => t.id === linkedTaskId);
    const incompleteTasks = tasks.filter(t => !t.completed);

    if (showHistory) {
        const map = new Map();
        focusSessions.forEach(s => {
            const key = toDateKey(s.startTime);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(s);
        });
        const sections = Array.from(map.entries())
            .sort((a, b) => (a[0] < b[0] ? 1 : -1))
            .map(([key, items]) => ({ title: groupLabel(key), items }));

        return (
            <div className="focus-page">
                <div className="focus-history-header">
                    <button className="focus-history-back" onClick={() => setShowHistory(false)}>
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
                <h2 className="focus-title">Session History</h2>

                {sections.length === 0 ? (
                    <p className="focus-summary-empty">No sessions logged yet.</p>
                ) : (
                    sections.map(section => (
                        <div key={section.title} className="focus-history-section">
                            <p className="focus-history-section-title">{section.title}</p>
                            {section.items.map(item => {
                                const Icon = SESSION_TYPE_ICONS[item.type];
                                return (
                                    <div key={item.id} className="focus-history-row">
                                        <Icon size={16} />
                                        <div className="focus-history-row-main">
                                            <span className="focus-history-row-type">
                                                {SESSION_TYPE_LABELS[item.type]}
                                            </span>
                                            {item.taskText && (
                                                <span className="focus-history-row-task">{item.taskText}</span>
                                            )}
                                            <span className="focus-history-row-time">
                                                {formatClock(item.startTime)} – {formatClock(item.endTime)}
                                            </span>
                                        </div>
                                        <span className="focus-history-row-duration">
                                            {formatSessionMinutes(item.durationSeconds)}
                                        </span>
                                        <button
                                            className="focus-history-delete"
                                            onClick={() => deleteSession(item.id)}
                                            aria-label="Delete session"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>
        );
    }

    return (
        <div className="focus-page">
            <h2 className="focus-title">Focus Timer</h2>

            <div className="focus-tabs">
                {Object.keys(SESSION_LABELS).map(type => (
                    <button
                        key={type}
                        className={`focus-tab ${sessionType === type ? "active" : ""}`}
                        onClick={() => selectSessionType(type)}
                    >
                        {SESSION_LABELS[type]}
                    </button>
                ))}
            </div>

            <div className="focus-timer-wrap">
                <svg viewBox="0 0 220 220" width="220" height="220">
                    <circle className="focus-timer-track" cx="110" cy="110" r={RADIUS} />
                    {sessionType !== "stopwatch" && (
                        <circle
                            className="focus-timer-progress"
                            cx="110"
                            cy="110"
                            r={RADIUS}
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={dashoffset}
                            transform="rotate(-90 110 110)"
                        />
                    )}
                </svg>
                <div className="focus-timer-center">
                    <span className="focus-timer-time">
                        {sessionType === "stopwatch" ? formatStopwatchTime(stopwatchSeconds) : formatTime(timeLeft)}
                    </span>
                    <span className="focus-timer-session">
                        {sessionType === "stopwatch"
                            ? (stopwatchRunning ? "Running" : isPaused ? "Paused" : "Ready")
                            : sessionType === "focus"
                                ? `Session ${cyclePosition + 1} of ${SESSIONS_BEFORE_LONG_BREAK}`
                                : SESSION_LABELS[sessionType]}
                    </span>
                </div>
            </div>

            {sessionType === "stopwatch" ? (
                <div className="focus-controls">
                    <button
                        className="focus-control-btn"
                        onClick={resetStopwatch}
                        disabled={stopwatchSeconds === 0 && !stopwatchRunning && !isPaused}
                        aria-label="Reset"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        className="focus-control-btn primary"
                        onClick={stopwatchRunning ? pauseStopwatch : isPaused ? resumeStopwatch : startStopwatch}
                        aria-label={stopwatchRunning ? "Pause" : "Start"}
                    >
                        {stopwatchRunning ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                        className="focus-control-btn"
                        onClick={stopStopwatch}
                        disabled={!stopwatchRunning && !isPaused}
                        aria-label="Stop"
                    >
                        <Square size={18} />
                    </button>
                </div>
            ) : (
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
            )}

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
                        {incompleteTasks.map(t => (
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
                {dotsFilled} of {SESSIONS_BEFORE_LONG_BREAK} pomodoros this cycle
            </p>

            <div className="focus-summary-block">
                <p className="focus-summary-title">Today's Focus</p>
                {todaysSessions.length === 0 ? (
                    <p className="focus-summary-empty">Nothing logged today yet.</p>
                ) : (
                    todaysSessions.map(s => {
                        const Icon = SESSION_TYPE_ICONS[s.type];
                        return (
                            <div key={s.id} className="focus-summary-row">
                                <Icon size={14} />
                                <span>{formatSessionMinutes(s.durationSeconds)} {SESSION_TYPE_LABELS[s.type]}</span>
                            </div>
                        );
                    })
                )}
                <span className="focus-summary-link" onClick={() => setShowHistory(true)}>
                    View all sessions →
                </span>
            </div>
        </div>
    );
}

export default Focus;
