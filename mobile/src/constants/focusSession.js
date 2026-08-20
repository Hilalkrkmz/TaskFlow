// Emoji yerine uygulamanin geri kalaniyla tutarli Ionicons isimleri -
// FocusScreen/SessionHistoryScreen bunlari <Ionicons name={...}> ile ciziyor.
export const SESSION_TYPE_ICONS = {
    FOCUS: "flame",
    SHORT_BREAK: "cafe",
    LONG_BREAK: "moon",
    STOPWATCH: "stopwatch",
};

export const SESSION_TYPE_LABELS = {
    FOCUS: "Focus",
    SHORT_BREAK: "Short Break",
    LONG_BREAK: "Long Break",
    STOPWATCH: "Stopwatch",
};

// FocusScreen'in kendi kucuk-harfli tab id'lerini backend enum string'ine cevirir.
export const TAB_TYPE_TO_API_TYPE = {
    focus: "FOCUS",
    short: "SHORT_BREAK",
    long: "LONG_BREAK",
};

export function formatSessionMinutes(durationSeconds) {
    // 1 dakikanin altindaki gercek sureleri "1 min"e yuvarlamak yaniltici
    // oluyordu (1 saniyelik bir test bile "1 min" gorunuyordu) - dakikanin
    // altinda saniye olarak gosteriyoruz, gercek sureyi yansitsin.
    if (durationSeconds < 60) {
        return `${durationSeconds} sec`;
    }
    return `${Math.round(durationSeconds / 60)} min`;
}
