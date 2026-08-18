import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Uygulama foreground'dayken (ekran açıkken) bildirimi banner/ses olarak
// GÖSTERME - zaten kendi bitiş sesimiz (FocusScreen'deki finishPlayer) çalıyor,
// ikisi üst üste binmesin. Bildirim sadece arka plandayken/kilitliyken bir işe
// yarıyor, orada zaten OS kendi banner'ını/sesini native olarak gösteriyor.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

// Android'de bildirimlerin bir "kanala" ait olması zorunlu (Android 8+) -
// kanal olmadan bildirim sessizce hiç görünmeyebilir. iOS'ta kanal kavramı
// yok, bu fonksiyon orada no-op.
export async function configureFocusNotifications() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("focus-timer", {
            name: "Focus Timer",
            importance: Notifications.AndroidImportance.MAX,
        });
    }
}

// Önce mevcut izni kontrol ediyoruz (getPermissionsAsync) - zaten verilmişse
// kullanıcıya tekrar sormaya gerek yok. Yoksa requestPermissionsAsync ile
// sistem izin diyaloğunu açıyoruz (bunu ilk Play'e basılınca çağırıyoruz,
// ekran açılır açılmaz değil - kullanıcı neden izin istendiğini bilsin diye).
export async function requestNotificationPermission() {
    const current = await Notifications.getPermissionsAsync();
    if (current.status === "granted") return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === "granted";
}

const SESSION_NOTIFICATION_CONTENT = {
    focus: { title: "Focus session complete!", body: "Nice work — time for a break." },
    short: { title: "Break's over", body: "Ready to get back to it?" },
    long: { title: "Long break's over", body: "Ready to get back to it?" },
};

// seconds sonra tetiklenecek TEK SEFERLİK (repeats:false) bir bildirim
// planlar, id'sini döner - bu id ile daha sonra cancelScheduledNotification
// çağırıp iptal edebiliyoruz (Pause/Reset/Skip'te).
export async function scheduleSessionEndNotification(sessionType, seconds) {
    const content = SESSION_NOTIFICATION_CONTENT[sessionType] || SESSION_NOTIFICATION_CONTENT.focus;

    return Notifications.scheduleNotificationAsync({
        content,
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.max(1, Math.round(seconds)),
            repeats: false,
        },
    });
}

export async function cancelScheduledNotification(id) {
    if (!id) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
        // Zaten tetiklenmiş ya da iptal edilmiş olabilir - sorun değil.
    }
}
