import { View, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

// Web'deki .auth-page arka planının (TaskFlow.css satır 1818-1833) birebir
// karşılığı - auth ekranları (Login/Register/VerifyEmail/ForgotPassword)
// web'de hiç temaya bağlı değil, her zaman aynı sabit renkli "blob" gradient
// arka planla açılıyor. RN'de radial-gradient yok, react-native-svg'nin
// RadialGradient'ıyla aynı 6 blob'u (renk/konum/opaklık aynı) yeniden çiziyoruz.
const BLOBS = [
    { cx: "8%", cy: "10%", r: "25%", color: "#d6437a", opacity: 0.35 },
    { cx: "85%", cy: "5%", r: "25%", color: "#1a7f96", opacity: 0.32 },
    { cx: "90%", cy: "85%", r: "25%", color: "#8b7cf6", opacity: 0.3 },
    { cx: "10%", cy: "90%", r: "25%", color: "#c99a4e", opacity: 0.3 },
    { cx: "-5%", cy: "50%", r: "22%", color: "#2ea876", opacity: 0.28 },
    { cx: "105%", cy: "45%", r: "22%", color: "#2f6b34", opacity: 0.25 },
];

function AuthBackground({ children }) {
    const { width, height } = useWindowDimensions();

    return (
        <View style={styles.container}>
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
                <Defs>
                    {BLOBS.map((b, i) => (
                        <RadialGradient key={i} id={`blob${i}`} cx={b.cx} cy={b.cy} r={b.r}>
                            <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity} />
                            <Stop offset="1" stopColor={b.color} stopOpacity={0} />
                        </RadialGradient>
                    ))}
                </Defs>
                {BLOBS.map((_, i) => (
                    <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#blob${i})`} />
                ))}
            </Svg>
            <SafeAreaView style={styles.content}>{children}</SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f3f0",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
    },
});

export default AuthBackground;
