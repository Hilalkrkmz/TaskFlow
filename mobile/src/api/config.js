import { Platform } from "react-native";

// "localhost" mobilde web'deki gibi davranmıyor:
//
// - iOS Simulator  -> "localhost" çalışır (simulator, Mac'in network stack'ini paylaşıyor)
// - Android Emulator (AVD) -> "localhost" ÇALIŞMAZ. Emulator kendi izole network'ünde,
//   kendi "localhost"u kendisi. Host makineye ulaşmak için özel alias: 10.0.2.2
// - Fiziksel cihaz (Expo Go ile telefonda) -> ne localhost ne 10.0.2.2 işe yarar.
//   Telefon ve bilgisayar aynı Wi-Fi'de olmalı, backend'e bilgisayarının GERÇEK LAN IP'siyle
//   ulaşman lazım (örn. 192.168.1.23). "ipconfig" (Windows) ile "IPv4 Address" satırına bak.

const LAN_IP = "192.168.1.106"; // <-- kendi bilgisayarının LAN IP'siyle değiştir

const getBaseUrl = () => {
    if (Platform.OS === "android") {
        // Not: Bu, Android EMULATOR için doğru. Fiziksel Android cihazda test
        // ediyorsan bunu da LAN_IP'ye çevirmen gerekir (aşağıdaki yorum satırına bak).
        //return "http://10.0.2.2:8080/api";
        return `http://${LAN_IP}:8080/api`;
    }
    if (Platform.OS === "ios") {
        return "http://localhost:8080/api";
        // Fiziksel iPhone için: return `http://${LAN_IP}:8080/api`;
    }
    return `http://${LAN_IP}:8080/api`;
};

export const API_BASE_URL = getBaseUrl();