import { useEffect, useMemo, useRef } from "react";
import { View, Animated, Easing, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";

// Web'deki frontend/src/components/ThemeDecoration.jsx + TaskFlow.css'teki
// @keyframes'lerin (satır 1028-1419) RN karşılığı. Web'de bunlar
// `position: fixed; z-index: 9999; pointer-events: none` - yani tüm sayfanın
// ÜSTÜNDE, tıklamaları engellemeden gezen saydam bir katman. RN'de aynı şeyi
// mutlak konumlu + pointerEvents="none" bir View ile yapıyoruz.
//
// Web'de her parçacık grubu bir kere üretilip (useMemo) rastgele
// left/size/duration/delay ile CSS animasyonuna bırakılıyor - burada da aynı
// desen, sadece RN'in Animated API'siyle sürülüyor (useNativeDriver: true,
// yeni paket gerekmiyor). Masaüstü için tasarlanmış yoğun parçacık sayıları
// (140 çim, 60 yıldız, 25 toz, 35 aurora yıldızı) mobilde performans için
// düşürüldü.

// alternate: true -> CSS'teki animation-direction: alternate karşılığı
// (0->1->0->1... gidip-gelen), Animated.loop'un varsayılan davranışı (her
// döngüde value'yu 0'a resetleyip baştan başlaması) bunu vermiyor, o yüzden
// alternate'te forward+backward timing'i sequence'leyip onu loop'luyoruz.
function useDelayedLoop(durationSec, delaySec, { easing = Easing.linear, alternate = false } = {}) {
    const value = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        value.setValue(0);
        const singleDuration = durationSec * 1000;
        const loopAnim = alternate
            ? Animated.loop(
                  Animated.sequence([
                      Animated.timing(value, { toValue: 1, duration: singleDuration, easing, useNativeDriver: true }),
                      Animated.timing(value, { toValue: 0, duration: singleDuration, easing, useNativeDriver: true }),
                  ])
              )
            : Animated.loop(
                  Animated.timing(value, { toValue: 1, duration: singleDuration, easing, useNativeDriver: true })
              );

        const animation = Animated.sequence([Animated.delay(delaySec * 1000), loopAnim]);
        animation.start();
        return () => animation.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return value;
}

// ===== Sakura: düşen çiçek yaprakları =====
const PETAL_COUNT = 14;

function SakuraPetal({ left, size, duration, delay, opacity, screenHeight }) {
    const progress = useDelayedLoop(duration, delay);
    const translateY = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, screenHeight * 0.55, screenHeight * 1.15],
    });
    const translateX = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 24, -24],
    });
    const rotate = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ["0deg", "180deg", "360deg"],
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: `${left}%`,
                top: "-10%",
                width: size,
                height: size * 1.25,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
            }}
        >
            <View
                style={{
                    flex: 1,
                    borderRadius: size,
                    backgroundColor: "#e8a0bb",
                }}
            />
        </Animated.View>
    );
}

function SakuraPetals() {
    const { height } = useWindowDimensions();
    const petals = useMemo(
        () =>
            Array.from({ length: PETAL_COUNT }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                size: 6 + Math.random() * 4,
                duration: 9 + Math.random() * 7,
                delay: Math.random() * 10,
                opacity: 0.5 + Math.random() * 0.4,
            })),
        []
    );

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {petals.map((p) => (
                <SakuraPetal key={p.id} {...p} screenHeight={height} />
            ))}
        </View>
    );
}

// ===== Ocean: kayan dalgalar =====
function WaveLayer({ duration, reverse, d, fill, opacity, width, top = null, bottom = 0, height }) {
    const progress = useDelayedLoop(duration, 0);
    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: reverse ? [-width, 0] : [0, -width],
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: 0,
                top,
                bottom: top === null ? bottom : null,
                width: width * 2,
                height,
                transform: [{ translateX }],
            }}
        >
            <Svg width="100%" height="100%" viewBox={`0 0 1200 ${d.viewBoxHeight}`} preserveAspectRatio="none">
                <Path d={d.path} fill={fill} opacity={opacity} />
            </Svg>
        </Animated.View>
    );
}

const OCEAN_WAVES = [
    { duration: 18, reverse: false, fill: "#a9dde6", opacity: 0.55, path: "M0,55 C150,25 450,85 600,55 C750,25 1050,85 1200,55 L1200,100 L0,100 Z" },
    { duration: 12, reverse: true, fill: "#5fb3c4", opacity: 0.8, path: "M0,65 C150,40 450,90 600,65 C750,40 1050,90 1200,65 L1200,100 L0,100 Z" },
    { duration: 8, reverse: false, fill: "#1a7f96", opacity: 1, path: "M0,75 C150,55 450,92 600,75 C750,55 1050,92 1200,75 L1200,100 L0,100 Z" },
];

function OceanWaves() {
    const { width } = useWindowDimensions();

    return (
        <View style={styles.oceanWaves} pointerEvents="none">
            {OCEAN_WAVES.map((w, i) => (
                <WaveLayer
                    key={i}
                    duration={w.duration}
                    reverse={w.reverse}
                    fill={w.fill}
                    opacity={w.opacity}
                    width={width}
                    height={90}
                    d={{ path: w.path, viewBoxHeight: 100 }}
                />
            ))}
        </View>
    );
}

// ===== Forest: ateş böcekleri + sallanan çimen =====
const FIREFLY_COUNT = 12;
const BLADE_COUNT = 50;

function Firefly({ left, bottom, size, duration, delay }) {
    const progress = useDelayedLoop(duration, delay, { easing: Easing.inOut(Easing.ease) });
    const translateX = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 12, -10],
    });
    const translateY = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, -34, -60],
    });
    const opacity = progress.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0.15, 1, 0.35, 1, 0.15],
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: `${left}%`,
                bottom: `${bottom}%`,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "#e8f78a",
                opacity,
                transform: [{ translateX }, { translateY }],
            }}
        />
    );
}

function GrassBlade({ left, height, width, duration, delay }) {
    const progress = useDelayedLoop(duration, delay, {
        easing: Easing.inOut(Easing.ease),
        alternate: true,
    });
    const rotate = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["-9deg", "9deg"],
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: `${left}%`,
                bottom: 0,
                width,
                height,
                transform: [{ translateY: height / 2 }, { rotate }, { translateY: -height / 2 }],
            }}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: "#57975a",
                    borderTopLeftRadius: width,
                    borderTopRightRadius: width,
                }}
            />
        </Animated.View>
    );
}

function ForestScene() {
    const fireflies = useMemo(
        () =>
            Array.from({ length: FIREFLY_COUNT }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                bottom: Math.random() * 70,
                size: 3 + Math.random() * 3,
                duration: 4 + Math.random() * 5,
                delay: Math.random() * 6,
            })),
        []
    );

    const blades = useMemo(
        () =>
            Array.from({ length: BLADE_COUNT }).map((_, i) => ({
                id: i,
                left: (i / BLADE_COUNT) * 100 + (Math.random() * 2 - 1),
                height: 38 + Math.random() * 48,
                width: 3 + Math.random() * 3,
                duration: 2.2 + Math.random() * 2,
                delay: Math.random() * 2,
            })),
        []
    );

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {fireflies.map((f) => (
                <Firefly key={f.id} {...f} />
            ))}
            <View style={styles.forestGrass}>
                {blades.map((b) => (
                    <GrassBlade key={b.id} {...b} />
                ))}
            </View>
        </View>
    );
}

// ===== Space: titreşen yıldızlar + kayan yıldızlar =====
const STAR_COUNT = 35;

function Star({ top, left, size, duration, delay, bright }) {
    const progress = useDelayedLoop(duration, delay, { easing: Easing.inOut(Easing.ease) });
    const opacity = bright
        ? progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] })
        : progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 1, 0.2] });

    return (
        <Animated.View
            style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "#ffffff",
                opacity,
            }}
        />
    );
}

function ShootingStar({ top, left, duration, delay }) {
    const progress = useDelayedLoop(duration, delay, { easing: Easing.in(Easing.ease) });
    const translateX = progress.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [0, 220, 220],
    });
    const opacity = progress.interpolate({
        inputRange: [0, 0.05, 0.2, 1],
        outputRange: [0, 1, 0, 0],
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                width: 90,
                height: 2,
                backgroundColor: "#ffffff",
                opacity,
                transform: [{ rotate: "25deg" }, { translateX }],
            }}
        />
    );
}

const SHOOTING_STARS = [
    { top: 12, left: 10, duration: 6, delay: 1 },
    { top: 30, left: 55, duration: 7, delay: 5 },
    { top: 55, left: 20, duration: 6.5, delay: 9 },
];

function SpaceScene() {
    const stars = useMemo(
        () =>
            Array.from({ length: STAR_COUNT }).map((_, i) => ({
                id: i,
                top: Math.random() * 100,
                left: Math.random() * 100,
                size: 1 + Math.random() * 2,
                duration: 2 + Math.random() * 3,
                delay: Math.random() * 5,
                bright: Math.random() < 0.15,
            })),
        []
    );

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {stars.map((s) => (
                <Star key={s.id} {...s} />
            ))}
            {SHOOTING_STARS.map((s, i) => (
                <ShootingStar key={i} {...s} />
            ))}
        </View>
    );
}

// ===== Desert: sürüklenen toz + kum tepeleri =====
const DUST_COUNT = 15;

function DustParticle({ top, size, duration, delay, opacity, screenWidth }) {
    const progress = useDelayedLoop(duration, delay);
    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, screenWidth * 1.12],
    });
    const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 30],
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: "-3%",
                top: `${top}%`,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "#c99a4e",
                opacity,
                transform: [{ translateX }, { translateY }],
            }}
        />
    );
}

function DesertScene() {
    const { width } = useWindowDimensions();
    const dust = useMemo(
        () =>
            Array.from({ length: DUST_COUNT }).map((_, i) => ({
                id: i,
                top: Math.random() * 100,
                size: 2 + Math.random() * 3,
                duration: 10 + Math.random() * 10,
                delay: Math.random() * 10,
                opacity: 0.3 + Math.random() * 0.4,
            })),
        []
    );

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {dust.map((d) => (
                <DustParticle key={d.id} {...d} screenWidth={width} />
            ))}
            <View style={styles.desertDunes}>
                <Svg width="100%" height="100%" viewBox="0 0 400 60" preserveAspectRatio="none">
                    <Path
                        d="M0,60 L0,35 Q75,15 150,32 Q225,48 300,25 Q350,12 400,28 L400,60 Z"
                        fill="#d9a441"
                        opacity={0.6}
                    />
                    <Path
                        d="M0,60 L0,45 Q90,25 180,42 Q260,55 340,35 Q370,28 400,38 L400,60 Z"
                        fill="#a56a1e"
                    />
                </Svg>
            </View>
        </View>
    );
}

// ===== Aurora: kayan ışık dalgaları + yıldızlar =====
const AURORA_STAR_COUNT = 20;
const AURORA_LAYERS = [
    { duration: 26, reverse: false, fill: "#5ee6a8", opacity: 0.3, path: "M0,40 C150,10 450,70 600,40 C750,10 1050,70 1200,40 L1200,0 L0,0 Z" },
    { duration: 19, reverse: true, fill: "#8b7cf6", opacity: 0.28, path: "M0,70 C150,30 450,100 600,60 C750,20 1050,90 1200,50 L1200,0 L0,0 Z" },
    { duration: 32, reverse: false, fill: "#5fb3c4", opacity: 0.25, path: "M0,30 C150,60 450,10 600,50 C750,80 1050,20 1200,55 L1200,0 L0,0 Z" },
];

function AuroraScene() {
    const { width } = useWindowDimensions();
    const stars = useMemo(
        () =>
            Array.from({ length: AURORA_STAR_COUNT }).map((_, i) => ({
                id: i,
                top: Math.random() * 100,
                left: Math.random() * 100,
                size: 1 + Math.random() * 1.5,
                duration: 2 + Math.random() * 3,
                delay: Math.random() * 5,
                bright: false,
            })),
        []
    );

    return (
        <View style={styles.auroraScene} pointerEvents="none">
            {stars.map((s) => (
                <Star key={s.id} {...s} />
            ))}
            {AURORA_LAYERS.map((l, i) => (
                <WaveLayer
                    key={i}
                    duration={l.duration}
                    reverse={l.reverse}
                    fill={l.fill}
                    opacity={l.opacity}
                    width={width}
                    height={140}
                    top={0}
                    d={{ path: l.path, viewBoxHeight: 220 }}
                />
            ))}
        </View>
    );
}

// ===== Mint: yükselen kabarcıklar =====
const BUBBLE_COUNT = 20;

function Bubble({ left, size, duration, delay, screenHeight }) {
    const progress = useDelayedLoop(duration, delay, { easing: Easing.in(Easing.ease) });
    const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
    const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -screenHeight * 1.15] });
    const opacity = progress.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 0] });

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: `${left}%`,
                bottom: "-5%",
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 1.5,
                borderColor: "#4fc98a",
                backgroundColor: "rgba(79, 201, 138, 0.08)",
                opacity,
                transform: [{ translateX }, { translateY }],
            }}
        />
    );
}

function MintBubbles() {
    const { height } = useWindowDimensions();
    const bubbles = useMemo(
        () =>
            Array.from({ length: BUBBLE_COUNT }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                size: 6 + Math.random() * 10,
                duration: 8 + Math.random() * 8,
                delay: Math.random() * 10,
            })),
        []
    );

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {bubbles.map((b) => (
                <Bubble key={b.id} {...b} screenHeight={height} />
            ))}
        </View>
    );
}

function ThemeDecoration() {
    const { themeKey } = useTheme();

    if (themeKey === "sakura") return <SakuraPetals />;
    if (themeKey === "ocean") return <OceanWaves />;
    if (themeKey === "forest") return <ForestScene />;
    if (themeKey === "space") return <SpaceScene />;
    if (themeKey === "desert") return <DesertScene />;
    if (themeKey === "aurora") return <AuroraScene />;
    if (themeKey === "mint") return <MintBubbles />;
    return null;
}

const styles = StyleSheet.create({
    oceanWaves: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
        overflow: "hidden",
    },
    forestGrass: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
        overflow: "hidden",
    },
    desertDunes: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 60,
    },
    auroraScene: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 140,
        overflow: "hidden",
    },
});

export default ThemeDecoration;
