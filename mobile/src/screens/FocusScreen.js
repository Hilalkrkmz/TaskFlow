import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/client";
import { useTheme } from "../theme/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DURATIONS = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
};

const SESSION_LABELS = {
    focus: "Focus",
    short: "Short Break",
    long: "Long Break",
};

const SESSIONS_BEFORE_LONG_BREAK = 4;
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const POMODORO_LOG_KEY = "taskflow_pomodoro_log";

function toDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function FocusScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [tasks, setTasks] = useState([]);
    const [sessionType, setSessionType] = useState("focus"); // "focus" | "short" | "long"
    const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
    const [isRunning, setIsRunning] = useState(false);
    const [focusCount, setFocusCount] = useState(0);
    const [linkedTaskId, setLinkedTaskId] = useState(null);
    const [pickingTask, setPickingTask] = useState(false);
    const [pomodoroLog, setPomodoroLog] = useState({});
    const firstRender = useRef(true);

    useFocusEffect(
        useCallback(() => {
            apiClient.get("/tasks").then((res) => setTasks(res.data)).catch(() => {});
        }, [])
    );

    useEffect(() => {
        AsyncStorage.getItem(POMODORO_LOG_KEY).then((saved) => {
            if (saved) setPomodoroLog(JSON.parse(saved));
        });
    }, []);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        AsyncStorage.setItem(POMODORO_LOG_KEY, JSON.stringify(pomodoroLog));
    }, [pomodoroLog]);

    useEffect(() => {
        if (!isRunning) return;

        if (timeLeft === 0) {
            advanceSession(true);
            return;
        }

        const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, timeLeft]);

    const advanceSession = (completed) => {
        if (sessionType === "focus") {
            if (completed) {
                const todayKey = toDateKey(new Date());
                setPomodoroLog((prev) => ({ ...prev, [todayKey]: (prev[todayKey] || 0) + 1 }));
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

    const toggleRunning = () => setIsRunning((prev) => !prev);

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

    // Web'de `transition: stroke-dashoffset 1s linear` ile yumuşak akıyor -
    // RN SVG'de bunun karşılığı yok, o yüzden değeri kendimiz Animated ile
    // 1 saniyede hedefe kaydırıyoruz (native driver stroke'u desteklemiyor,
    // ama tek bir sayısal değer olduğu için JS thread'de sorun yaratmıyor).
    const animatedDashoffset = useRef(new Animated.Value(dashoffset)).current;
    useEffect(() => {
        Animated.timing(animatedDashoffset, {
            toValue: dashoffset,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    }, [dashoffset, animatedDashoffset]);

    const cyclePosition = focusCount % SESSIONS_BEFORE_LONG_BREAK;
    const dotsFilled = cyclePosition === 0 && focusCount > 0 ? SESSIONS_BEFORE_LONG_BREAK : cyclePosition;

    const todayKey = toDateKey(new Date());
    const todayCount = pomodoroLog[todayKey] || 0;

    const linkedTask = tasks.find((t) => t.id === linkedTaskId);
    const incompleteTasks = tasks.filter((t) => !t.completed);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Focus Timer</Text>

                <View style={styles.tabs}>
                    {Object.keys(SESSION_LABELS).map((type) => (
                        <Pressable
                            key={type}
                            style={[styles.tab, sessionType === type && styles.tabActive]}
                            onPress={() => selectSessionType(type)}
                        >
                            <Text style={[styles.tabText, sessionType === type && styles.tabTextActive]}>
                                {SESSION_LABELS[type]}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.timerWrap}>
                    <Svg width={220} height={220} viewBox="0 0 220 220">
                        <Circle
                            cx="110"
                            cy="110"
                            r={RADIUS}
                            stroke={colors.border}
                            strokeWidth={12}
                            fill="none"
                        />
                        <AnimatedCircle
                            cx="110"
                            cy="110"
                            r={RADIUS}
                            stroke={colors.accent}
                            strokeWidth={12}
                            fill="none"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={animatedDashoffset}
                            strokeLinecap="round"
                            rotation="-90"
                            origin="110, 110"
                        />
                    </Svg>
                    <View style={styles.timerCenter}>
                        <Text style={styles.timerTime}>{formatTime(timeLeft)}</Text>
                        <Text style={styles.timerSession}>
                            {sessionType === "focus"
                                ? `Session ${cyclePosition + 1} of ${SESSIONS_BEFORE_LONG_BREAK}`
                                : SESSION_LABELS[sessionType]}
                        </Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <Pressable style={styles.controlBtn} onPress={resetSession}>
                        <Ionicons name="refresh" size={18} color={colors.text} />
                    </Pressable>
                    <Pressable style={[styles.controlBtn, styles.controlBtnPrimary]} onPress={toggleRunning}>
                        <Ionicons
                            name={isRunning ? "pause" : "play"}
                            size={24}
                            color={colors.accentContrast}
                        />
                    </Pressable>
                    <Pressable style={styles.controlBtn} onPress={skipSession}>
                        <Ionicons name="play-skip-forward" size={18} color={colors.text} />
                    </Pressable>
                </View>

                <View style={styles.taskLink}>
                    {pickingTask ? (
                        <View style={styles.taskPicker}>
                            <Pressable
                                style={styles.taskOption}
                                onPress={() => {
                                    setLinkedTaskId(null);
                                    setPickingTask(false);
                                }}
                            >
                                <Text style={styles.taskOptionText}>No task</Text>
                            </Pressable>
                            {incompleteTasks.map((t) => (
                                <Pressable
                                    key={t.id}
                                    style={styles.taskOption}
                                    onPress={() => {
                                        setLinkedTaskId(t.id);
                                        setPickingTask(false);
                                    }}
                                >
                                    <Text style={styles.taskOptionText}>{t.text}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.taskLinkRow}>
                            <View style={styles.taskInfo}>
                                <Ionicons name="locate-outline" size={15} color={colors.text} />
                                <Text style={styles.taskInfoText}>
                                    {linkedTask ? (
                                        <>
                                            Working on:{" "}
                                            <Text style={styles.taskInfoBold}>{linkedTask.text}</Text>
                                        </>
                                    ) : (
                                        "No task linked"
                                    )}
                                </Text>
                            </View>
                            <Pressable onPress={() => setPickingTask(true)}>
                                <Text style={styles.taskChange}>Change</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                <View style={styles.dots}>
                    {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
                        <View key={i} style={[styles.dot, i < dotsFilled && styles.dotFilled]} />
                    ))}
                </View>
                <Text style={styles.dotsLabel}>
                    {dotsFilled} of {SESSIONS_BEFORE_LONG_BREAK} pomodoros this cycle · {todayCount} today
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
        },
        content: {
            padding: 20,
            alignItems: "center",
        },
        title: {
            fontSize: 22,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 16,
            alignSelf: "flex-start",
        },
        tabs: {
            flexDirection: "row",
            gap: 8,
            marginBottom: 24,
        },
        tab: {
            borderWidth: 1,
            borderColor: colors.borderStrong,
            borderRadius: 20,
            paddingVertical: 6,
            paddingHorizontal: 14,
        },
        tabActive: {
            backgroundColor: colors.accent,
            borderColor: colors.accent,
        },
        tabText: {
            fontSize: 13,
            color: colors.text,
        },
        tabTextActive: {
            color: colors.accentContrast,
            fontWeight: "600",
        },
        timerWrap: {
            width: 220,
            height: 220,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
        },
        timerCenter: {
            position: "absolute",
            alignItems: "center",
        },
        timerTime: {
            fontSize: 40,
            fontWeight: "700",
            color: colors.text,
        },
        timerSession: {
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 4,
        },
        controls: {
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
        },
        controlBtn: {
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            alignItems: "center",
            justifyContent: "center",
        },
        controlBtnPrimary: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.accent,
            borderColor: colors.accent,
        },
        taskLink: {
            width: "100%",
            borderWidth: 1,
            borderColor: colors.borderStrong,
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            backgroundColor: colors.surface,
        },
        taskLinkRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        taskInfo: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            flex: 1,
        },
        taskInfoText: {
            fontSize: 13,
            color: colors.text,
            flexShrink: 1,
        },
        taskInfoBold: {
            fontWeight: "600",
        },
        taskChange: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text,
        },
        taskPicker: {
            gap: 2,
        },
        taskOption: {
            paddingVertical: 8,
        },
        taskOptionText: {
            fontSize: 14,
            color: colors.text,
        },
        dots: {
            flexDirection: "row",
            gap: 8,
            marginBottom: 8,
        },
        dot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            backgroundColor: colors.surface,
        },
        dotFilled: {
            backgroundColor: colors.accent,
            borderColor: colors.accent,
        },
        dotsLabel: {
            fontSize: 12,
            color: colors.textSecondary,
        },
    });
}

export default FocusScreen;
