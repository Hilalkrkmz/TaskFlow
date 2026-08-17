import { useEffect, useMemo, useRef } from "react";
import {
    View,
    Animated,
    Easing,
    StyleSheet,
    useWindowDimensions,
} from "react-native";
import Svg, { Path, Rect, Defs, RadialGradient, LinearGradient, Stop } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";

function useDelayedLoop(
    durationSec,
    delaySec,
    { easing = Easing.linear, alternate = false } = {}
) {
    const value = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        value.setValue(0);

        const singleDuration = durationSec * 1000;

        const loopAnim = alternate
            ? Animated.loop(
                  Animated.sequence([
                      Animated.timing(value, {
                          toValue: 1,
                          duration: singleDuration,
                          easing,
                          useNativeDriver: true,
                      }),
                      Animated.timing(value, {
                          toValue: 0,
                          duration: singleDuration,
                          easing,
                          useNativeDriver: true,
                      }),
                  ])
              )
            : Animated.loop(
                  Animated.timing(value, {
                      toValue: 1,
                      duration: singleDuration,
                      easing,
                      useNativeDriver: true,
                  })
              );

        const animation = Animated.sequence([
            Animated.delay(delaySec * 1000),
            loopAnim,
        ]);

        animation.start();

        return () => animation.stop();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return value;
}

// ======================================================
// SAKURA
// ======================================================

const PETAL_COUNT = 15;

// Web'deki .sakura-petal-blob'un (border-radius: 45% 55% 60% 40% / 55% 45%
// 60% 40% + iki radial-gradient) RN karşılığı: düzensiz bir blob path'i +
// aynı iki gradient (pembe taban + beyaz vurgu), react-native-svg ile.
// Yuvarlak blob yerine gözyaşı/yaprak damlası şekli: bir ucu sivri, diğeri
// yuvarlak - "petal" olarak çok daha tanınabilir.
const PETAL_BLOB_PATH =
    "M50,2 C66,2 80,18 82,38 C84,58 76,76 62,88 C56,93 50,97 50,98 C50,97 44,93 38,88 C24,76 16,58 18,38 C20,18 34,2 50,2 Z";

let petalGradientCounter = 0;

function SakuraPetal({
    left,
    size,
    duration,
    delay,
    opacity,
    screenHeight,
}) {
    const progress = useDelayedLoop(duration, delay);
    const gradientId = useRef(`petal-${petalGradientCounter++}`).current;

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
                transform: [
                    { translateX },
                    { translateY },
                    { rotate },
                ],
            }}
        >
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
                <Defs>
                    <RadialGradient id={`${gradientId}-base`} cx="55%" cy="65%" r="75%">
                        <Stop offset="0" stopColor="#f4b3ca" />
                        <Stop offset="0.75" stopColor="#e07a9c" />
                        <Stop offset="1" stopColor="#e07a9c" stopOpacity={0} />
                    </RadialGradient>
                    <RadialGradient id={`${gradientId}-highlight`} cx="35%" cy="28%" r="45%">
                        <Stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
                        <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
                    </RadialGradient>
                </Defs>
                <Path d={PETAL_BLOB_PATH} fill={`url(#${gradientId}-base)`} />
                <Path d={PETAL_BLOB_PATH} fill={`url(#${gradientId}-highlight)`} />
            </Svg>
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
                size: 7 + Math.random() * 5,
                duration: 9 + Math.random() * 7,
                delay: Math.random() * 10,
                opacity: 0.5 + Math.random() * 0.4,
            })),
        []
    );

    return (
        <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
        >
            {petals.map((p) => (
                <SakuraPetal
                    key={p.id}
                    {...p}
                    screenHeight={height}
                />
            ))}
        </View>
    );
}

// ======================================================
// OCEAN
// ======================================================

function WaveLayer({
    duration,
    reverse,
    d,
    fill,
    opacity,
    width,
    top = null,
    bottom = 0,
    height,
}) {
    const progress = useDelayedLoop(duration, 0);

    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: reverse
            ? [-width, 0]
            : [0, -width],
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
            <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 1200 ${d.viewBoxHeight}`}
                preserveAspectRatio="none"
            >
                <Path
                    d={d.path}
                    fill={fill}
                    opacity={opacity}
                />
            </Svg>
        </Animated.View>
    );
}

const OCEAN_WAVES = [
    {
        duration: 18,
        reverse: false,
        fill: "#a9dde6",
        opacity: 0.55,
        path:
            "M0,55 C150,25 450,85 600,55 C750,25 1050,85 1200,55 L1200,100 L0,100 Z",
    },
    {
        duration: 12,
        reverse: true,
        fill: "#5fb3c4",
        opacity: 0.8,
        path:
            "M0,65 C150,40 450,90 600,65 C750,40 1050,90 1200,65 L1200,100 L0,100 Z",
    },
    {
        duration: 8,
        reverse: false,
        fill: "#1a7f96",
        opacity: 1,
        path:
            "M0,75 C150,55 450,92 600,75 C750,55 1050,92 1200,75 L1200,100 L0,100 Z",
    },
];

function OceanWaves() {
    const { width } = useWindowDimensions();

    return (
        <View
            style={styles.oceanWaves}
            pointerEvents="none"
        >
            {OCEAN_WAVES.map((w, i) => (
                <WaveLayer
                    key={i}
                    duration={w.duration}
                    reverse={w.reverse}
                    fill={w.fill}
                    opacity={w.opacity}
                    width={width}
                    height={90}
                    d={{
                        path: w.path,
                        viewBoxHeight: 100,
                    }}
                />
            ))}
        </View>
    );
}

// ======================================================
// FOREST
// ======================================================

const FIREFLY_COUNT = 12;

const GRASS_COLORS = [
    "#265a2c",
    "#487a4c",
    "#3f7d43",
    "#57975a",
    "#6fae56",
];

const GRASS_MAX_HEIGHT = 80;

function Firefly({
    left,
    bottom,
    size,
    duration,
    delay,
}) {
    const progress = useDelayedLoop(
        duration,
        delay,
        {
            easing: Easing.inOut(Easing.ease),
        }
    );

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
                transform: [
                    { translateX },
                    { translateY },
                ],
            }}
        />
    );
}

// ------------------------------------------------------
// GRASS BLADE
// ------------------------------------------------------

function GrassBlade({
    left,
    height,
    width,
    duration,
    delay,
    color,
    opacity,
    pathType,
}) {
    const progress = useDelayedLoop(
        duration,
        delay,
        {
            easing: Easing.inOut(Easing.ease),
            alternate: true,
        }
    );

    const rotate = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["-8deg", "8deg"],
    });

    const extendedHeight = height + 12;

    let pathData = "";

    if (pathType === 0) {
        pathData = `
            M 0 ${extendedHeight}
            Q ${width * 0.12} ${extendedHeight * 0.48}
              ${width * 0.5} 0
            Q ${width * 0.78} ${extendedHeight * 0.5}
              ${width} ${extendedHeight}
            Z
        `;
    }

    else if (pathType === 1) {
        pathData = `
            M 0 ${extendedHeight}
            Q ${width * 0.3} ${extendedHeight * 0.55}
              ${width * 0.82} 0
            Q ${width * 0.92} ${extendedHeight * 0.48}
              ${width} ${extendedHeight}
            Z
        `;
    }

    else if (pathType === 2) {
        pathData = `
            M 0 ${extendedHeight}
            Q ${width * 0.08} ${extendedHeight * 0.45}
              ${width * 0.2} 0
            Q ${width * 0.65} ${extendedHeight * 0.55}
              ${width} ${extendedHeight}
            Z
        `;
    }

    else {
        pathData = `
            M 0 ${extendedHeight}
            Q ${width * 0.15} ${extendedHeight * 0.45}
              ${width * 0.55} 0
            Q ${width * 0.72} ${extendedHeight * 0.45}
              ${width} ${extendedHeight}
            Z
        `;
    }

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: `${left}%`,
                bottom: -6,
                width,
                height: extendedHeight,
                opacity,
                transform: [
                    { translateY: extendedHeight / 2 },
                    { rotate },
                    { translateY: -extendedHeight / 2 },
                ],
            }}
        >
            <Svg
                width={width}
                height={extendedHeight}
                viewBox={`0 0 ${width} ${extendedHeight}`}
            >
                <Path
                    d={pathData}
                    fill={color}
                />
            </Svg>
        </Animated.View>
    );
}

// ------------------------------------------------------
// FOREST SCENE
// ------------------------------------------------------

function ForestScene() {
    const { width: screenWidth } =
        useWindowDimensions();

    const fireflies = useMemo(
        () =>
            Array.from({
                length: FIREFLY_COUNT,
            }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                bottom: Math.random() * 70,
                size: 4 + Math.random() * 3,
                duration: 4 + Math.random() * 5,
                delay: Math.random() * 6,
            })),
        []
    );

    const blades = useMemo(() => {
        const count = Math.max(
            55,
            Math.min(
                90,
                Math.round(screenWidth / 7)
            )
        );

        return Array.from({
            length: count,
        }).map((_, i) => ({
            id: i,

            left:
                (i / count) * 100 +
                (Math.random() * 2 - 1),

            height:
                48 +
                Math.random() *
                    (GRASS_MAX_HEIGHT - 48),

            width:
                7 +
                Math.random() * 6,

            duration:
                1.8 +
                Math.random() * 2.2,

            delay:
                Math.random() * 2,

            color:
                GRASS_COLORS[
                    i % GRASS_COLORS.length
                ],

            opacity:
                0.75 +
                Math.random() * 0.18,

            pathType:
                i % 4,
        }));
    }, [screenWidth]);

    return (
        <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
        >
            {fireflies.map((f) => (
                <Firefly
                    key={f.id}
                    {...f}
                />
            ))}

            <View style={styles.forestGrass}>
                {blades.map((b) => (
                    <GrassBlade
                        key={b.id}
                        {...b}
                    />
                ))}
            </View>
        </View>
    );
}

// ======================================================
// SPACE
// ======================================================

const STAR_COUNT = 45;
const BRIGHT_STAR_COUNT = 4;

function Star({
    top,
    left,
    size,
    duration,
    delay,
    bright,
    id,
}) {
    const progress = useDelayedLoop(
        duration,
        delay,
        {
            easing: Easing.inOut(Easing.ease),
        }
    );

    // Parlak yıldızlar tamamen kaybolmuyor - normal yıldızlarla aynı soluk
    // seviyede (0.2) kalıp, arada yavaşça 1'e (tam parlak) çıkıp yine
    // yavaşça iniyor (ani flaş değil, yumuşak bir "nefes alma" efekti).
    const opacity = bright
        ? progress.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0.2, 0.2, 1, 0.2, 0.2],
          })
        : progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.2, 1, 0.2],
          });

    if (bright) {
        // Parlak yıldızlar: yumuşak bir radial-gradient hale (glow) +
        // üstünde daha belirgin bir çekirdek nokta - normal yıldızlardan
        // görsel olarak ayrışsın diye.
        const coreSize = size * 1.8;
        const glowSize = coreSize * 5;
        const gradientId = `star-glow-${id}`;

        return (
            <Animated.View
                style={{
                    position: "absolute",
                    top: `${top}%`,
                    left: `${left}%`,
                    width: glowSize,
                    height: glowSize,
                    marginLeft: -glowSize / 2,
                    marginTop: -glowSize / 2,
                    opacity,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Svg width={glowSize} height={glowSize} style={StyleSheet.absoluteFill}>
                    <Defs>
                        <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                            <Stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
                            <Stop offset="0.35" stopColor="#ffffff" stopOpacity={0.35} />
                            <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
                </Svg>
                <View
                    style={{
                        width: coreSize,
                        height: coreSize,
                        borderRadius: coreSize / 2,
                        backgroundColor: "#ffffff",
                    }}
                />
            </Animated.View>
        );
    }

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

function ShootingStar({
    top,
    left,
    duration,
    delay,
    id,
}) {
    const progress = useDelayedLoop(
        duration,
        delay,
        {
            easing: Easing.in(Easing.ease),
        }
    );

    const translateX = progress.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [0, 220, 220],
    });

    const opacity = progress.interpolate({
        inputRange: [0, 0.05, 0.2, 1],
        outputRange: [0, 1, 0, 0],
    });

    const gradientId = `shooting-star-${id}`;

    return (
        <Animated.View
            style={{
                position: "absolute",
                top: `${top}%`,
                left: `${left}%`,
                width: 90,
                height: 3,
                opacity,
                transform: [
                    { rotate: "25deg" },
                    { translateX },
                ],
            }}
        >
            <Svg width="100%" height="100%">
                <Defs>
                    <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0" stopColor="#ffffff" stopOpacity={0} />
                        <Stop offset="1" stopColor="#ffffff" stopOpacity={1} />
                    </LinearGradient>
                </Defs>
                <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    rx="1.5"
                    fill={`url(#${gradientId})`}
                />
            </Svg>
        </Animated.View>
    );
}

const SHOOTING_STARS = [
    {
        top: 12,
        left: 10,
        duration: 6,
        delay: 1,
    },
    {
        top: 30,
        left: 55,
        duration: 7,
        delay: 5,
    },
    {
        top: 55,
        left: 20,
        duration: 6.5,
        delay: 9,
    },
];

// 4 sabit köşe/bölge - her birine bir parlak yıldız düşsün diye ekran 2x2
// bölünüyor, her bölgenin ortasına yakın (kenarlara değmeyecek şekilde)
// rastgele bir nokta seçiliyor. Böylece 4 parlak yıldız hep birbirinden uzak.
const BRIGHT_STAR_QUADRANTS = [
    { top: 0, left: 0 },
    { top: 0, left: 50 },
    { top: 50, left: 0 },
    { top: 50, left: 50 },
];

function SpaceScene() {
    const stars = useMemo(
        () =>
            Array.from({
                length: STAR_COUNT,
            }).map((_, i) => ({
                id: i,
                top: Math.random() * 100,
                left: Math.random() * 100,
                size: 1.8 + Math.random() * 2.6,
                duration:
                    2 + Math.random() * 3,
                delay: Math.random() * 5,
                bright: false,
            })),
        []
    );

    const brightStars = useMemo(
        () =>
            BRIGHT_STAR_QUADRANTS.slice(0, BRIGHT_STAR_COUNT).map((q, i) => ({
                id: `bright-${i}`,
                top: q.top + 15 + Math.random() * 20,
                left: q.left + 15 + Math.random() * 20,
                size: 1.5 + Math.random() * 1,
                duration: 7 + Math.random() * 5,
                delay: Math.random() * 6,
                bright: true,
            })),
        []
    );

    return (
        <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
        >
            {stars.map((s) => (
                <Star
                    key={s.id}
                    {...s}
                />
            ))}

            {brightStars.map((s) => (
                <Star
                    key={s.id}
                    {...s}
                />
            ))}

            {SHOOTING_STARS.map(
                (s, i) => (
                    <ShootingStar
                        key={i}
                        id={i}
                        {...s}
                    />
                )
            )}
        </View>
    );
}

// ======================================================
// DESERT
// ======================================================

const DUST_COUNT = 15;

function DustParticle({
    top,
    size,
    duration,
    delay,
    opacity,
    screenWidth,
}) {
    const progress =
        useDelayedLoop(
            duration,
            delay
        );

    const translateX =
        progress.interpolate({
            inputRange: [0, 1],
            outputRange: [
                0,
                screenWidth * 1.12,
            ],
        });

    const translateY =
        progress.interpolate({
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
                borderRadius:
                    size / 2,
                backgroundColor:
                    "#c99a4e",
                opacity,
                transform: [
                    { translateX },
                    { translateY },
                ],
            }}
        />
    );
}

function DesertScene() {
    const { width } =
        useWindowDimensions();

    const dust = useMemo(
        () =>
            Array.from({
                length: DUST_COUNT,
            }).map((_, i) => ({
                id: i,
                top: Math.random() * 100,
                size:
                    2 + Math.random() * 3,
                duration:
                    10 +
                    Math.random() * 10,
                delay:
                    Math.random() * 10,
                opacity:
                    0.3 +
                    Math.random() * 0.4,
            })),
        []
    );

    return (
        <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
        >
            {dust.map((d) => (
                <DustParticle
                    key={d.id}
                    {...d}
                    screenWidth={width}
                />
            ))}

            <View
                style={styles.desertDunes}
            >
                <Svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 400 60"
                    preserveAspectRatio="none"
                >
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

// ======================================================
// AURORA
// ======================================================

const AURORA_STAR_COUNT = 20;

const AURORA_LAYERS = [
    {
        duration: 26,
        reverse: false,
        fill: "#5ee6a8",
        opacity: 0.3,
        path:
            "M0,40 C150,10 450,70 600,40 C750,10 1050,70 1200,40 L1200,0 L0,0 Z",
    },
    {
        duration: 19,
        reverse: true,
        fill: "#8b7cf6",
        opacity: 0.28,
        path:
            "M0,70 C150,30 450,100 600,60 C750,20 1050,90 1200,50 L1200,0 L0,0 Z",
    },
    {
        duration: 32,
        reverse: false,
        fill: "#5fb3c4",
        opacity: 0.25,
        path:
            "M0,30 C150,60 450,10 600,50 C750,80 1050,20 1200,55 L1200,0 L0,0 Z",
    },
];

function AuroraScene() {
    const { width } =
        useWindowDimensions();

    const stars = useMemo(
        () =>
            Array.from({
                length: AURORA_STAR_COUNT,
            }).map((_, i) => ({
                id: i,
                top: Math.random() * 100,
                left: Math.random() * 100,
                size:
                    1 +
                    Math.random() * 1.5,
                duration:
                    2 +
                    Math.random() * 3,
                delay: Math.random() * 5,
                bright: false,
            })),
        []
    );

    return (
        <View
            style={styles.auroraScene}
            pointerEvents="none"
        >
            {stars.map((s) => (
                <Star
                    key={s.id}
                    {...s}
                />
            ))}

            {AURORA_LAYERS.map(
                (l, i) => (
                    <WaveLayer
                        key={i}
                        duration={
                            l.duration
                        }
                        reverse={
                            l.reverse
                        }
                        fill={l.fill}
                        opacity={
                            l.opacity
                        }
                        width={width}
                        height={200}
                        top={0}
                        d={{
                            path: l.path,
                            viewBoxHeight: 220,
                        }}
                    />
                )
            )}
        </View>
    );
}

// ======================================================
// MINT
// ======================================================

const BUBBLE_COUNT = 20;

function Bubble({
    left,
    size,
    duration,
    delay,
    screenHeight,
}) {
    const progress =
        useDelayedLoop(
            duration,
            delay,
            {
                easing: Easing.in(
                    Easing.ease
                ),
            }
        );

    const translateX =
        progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
        });

    const translateY =
        progress.interpolate({
            inputRange: [0, 1],
            outputRange: [
                0,
                -screenHeight * 1.15,
            ],
        });

    const opacity =
        progress.interpolate({
            inputRange: [0, 0.1, 1],
            outputRange: [0, 1, 0],
        });

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: `${left}%`,
                bottom: "-5%",
                width: size,
                height: size,
                borderRadius:
                    size / 2,
                borderWidth: 1.5,
                borderColor: "#4fc98a",
                backgroundColor:
                    "rgba(79, 201, 138, 0.08)",
                opacity,
                transform: [
                    { translateX },
                    { translateY },
                ],
            }}
        />
    );
}

function MintBubbles() {
    const { height } =
        useWindowDimensions();

    const bubbles = useMemo(
        () =>
            Array.from({
                length: BUBBLE_COUNT,
            }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                size:
                    6 +
                    Math.random() * 10,
                duration:
                    8 +
                    Math.random() * 8,
                delay:
                    Math.random() * 10,
            })),
        []
    );

    return (
        <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
        >
            {bubbles.map((b) => (
                <Bubble
                    key={b.id}
                    {...b}
                    screenHeight={height}
                />
            ))}
        </View>
    );
}

// ======================================================
// THEME DECORATION
// ======================================================

function ThemeDecoration() {
    const { themeKey } =
        useTheme();

    if (themeKey === "sakura") {
        return <SakuraPetals />;
    }

    if (themeKey === "ocean") {
        return <OceanWaves />;
    }

    if (themeKey === "forest") {
        return <ForestScene />;
    }

    if (themeKey === "space") {
        return <SpaceScene />;
    }

    if (themeKey === "desert") {
        return <DesertScene />;
    }

    if (themeKey === "aurora") {
        return <AuroraScene />;
    }

    if (themeKey === "mint") {
        return <MintBubbles />;
    }

    return null;
}

// ======================================================
// STYLES
// ======================================================

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
        height: GRASS_MAX_HEIGHT,
        overflow: "hidden",
        zIndex: 99,
        elevation: 99,
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
        height: 200,
        overflow: "hidden",
    },
});

export default ThemeDecoration;