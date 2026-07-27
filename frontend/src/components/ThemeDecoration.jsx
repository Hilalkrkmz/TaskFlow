import { useMemo } from "react";

const PETAL_COUNT = 14;

function SakuraPetals() {
    const petals = useMemo(() => {
        return Array.from({ length: PETAL_COUNT }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: 6 + Math.random() * 4,
            rotate: Math.random() * 360,
            duration: 9 + Math.random() * 7,
            delay: Math.random() * 10,
            opacity: 0.5 + Math.random() * 0.4
        }));
    }, []);

    return (
        <div className="theme-decoration" aria-hidden="true">
            {petals.map(p => (
                <span
                    key={p.id}
                    className="sakura-petal-wrap"
                    style={{
                        left: `${p.left}%`,
                        width: `${p.size}px`,
                        height: `${p.size * 1.25}px`,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        opacity: p.opacity,
                        transform: `rotate(${p.rotate}deg)`
                    }}
                >
                    <span className="sakura-petal-blob" />
                </span>
            ))}
        </div>
    );
}

function OceanWaves() {
    return (
        <div className="ocean-waves" aria-hidden="true">
            <svg className="wave-layer wave-back" viewBox="0 0 1200 100" preserveAspectRatio="none">
                <path
                    d="M0,55 C150,25 450,85 600,55 C750,25 1050,85 1200,55 L1200,100 L0,100 Z"
                    fill="#a9dde6"
                    opacity="0.55"
                />
            </svg>
            <svg className="wave-layer wave-mid" viewBox="0 0 1200 100" preserveAspectRatio="none">
                <path
                    d="M0,65 C150,40 450,90 600,65 C750,40 1050,90 1200,65 L1200,100 L0,100 Z"
                    fill="#5fb3c4"
                    opacity="0.8"
                />
            </svg>
            <svg className="wave-layer wave-front" viewBox="0 0 1200 100" preserveAspectRatio="none">
                <path
                    d="M0,75 C150,55 450,92 600,75 C750,55 1050,92 1200,75 L1200,100 L0,100 Z"
                    fill="#1a7f96"
                />
            </svg>
        </div>
    );
}

const FIREFLY_COUNT = 12;

const BLADE_COUNT = 140;

function ForestGrass() {
    const blades = useMemo(() => {
        return Array.from({ length: BLADE_COUNT }).map((_, i) => ({
            id: i,
            left: (i / BLADE_COUNT) * 100 + (Math.random() * 2 - 1),
            height: 38 + Math.random() * 48,
            width: 3 + Math.random() * 3,
            duration: 2.2 + Math.random() * 2,
            delay: Math.random() * 2
        }));
    }, []);

    return (
        <div className="forest-grass" aria-hidden="true">
            {blades.map(b => (
                <span
                    key={b.id}
                    className="grass-blade"
                    style={{
                        left: `${b.left}%`,
                        height: `${b.height}px`,
                        width: `${b.width}px`,
                        animationDuration: `${b.duration}s`,
                        animationDelay: `${b.delay}s`
                    }}
                />
            ))}
        </div>
    );
}

function Fireflies() {
    const fireflies = useMemo(() => {
        return Array.from({ length: FIREFLY_COUNT }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            bottom: Math.random() * 70,
            size: 3 + Math.random() * 3,
            duration: 4 + Math.random() * 5,
            delay: Math.random() * 6
        }));
    }, []);

    return (
        <div className="forest-fireflies" aria-hidden="true">
            {fireflies.map(f => (
                <span
                    key={f.id}
                    className="firefly"
                    style={{
                        left: `${f.left}%`,
                        bottom: `${f.bottom}%`,
                        width: `${f.size}px`,
                        height: `${f.size}px`,
                        animationDuration: `${f.duration}s`,
                        animationDelay: `${f.delay}s`
                    }}
                />
            ))}
        </div>
    );
}

function ForestScene() {
    return (
        <>
            <Fireflies />
            <ForestGrass />
        </>
    );
}

const STAR_COUNT = 60;

function SpaceScene() {
    const stars = useMemo(() => {
        return Array.from({ length: STAR_COUNT }).map((_, i) => ({
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: 1 + Math.random() * 2,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 5,
            bright: Math.random() < 0.15
        }));
    }, []);

    const shootingStars = useMemo(() => {
        return [
            { id: 1, top: 12, left: 10, duration: 6, delay: 1 },
            { id: 2, top: 30, left: 55, duration: 7, delay: 5 },
            { id: 3, top: 55, left: 20, duration: 6.5, delay: 9 }
        ];
    }, []);

    return (
        <div className="space-scene" aria-hidden="true">
            {stars.map(s => (
                <span
                    key={s.id}
                    className={`space-star ${s.bright ? "bright" : ""}`}
                    style={{
                        top: `${s.top}%`,
                        left: `${s.left}%`,
                        width: `${s.bright ? s.size + 1.5 : s.size}px`,
                        height: `${s.bright ? s.size + 1.5 : s.size}px`,
                        animationDuration: `${s.duration}s`,
                        animationDelay: `${s.delay}s`
                    }}
                />
            ))}

            {shootingStars.map(s => (
                <span
                    key={s.id}
                    className="space-shooting-star"
                    style={{
                        top: `${s.top}%`,
                        left: `${s.left}%`,
                        animationDuration: `${s.duration}s`,
                        animationDelay: `${s.delay}s`
                    }}
                />
            ))}
        </div>
    );
}

const DUST_COUNT = 25;

function DesertScene() {
    const dust = useMemo(() => {
        return Array.from({ length: DUST_COUNT }).map((_, i) => ({
            id: i,
            top: Math.random() * 100,
            size: 2 + Math.random() * 3,
            duration: 10 + Math.random() * 10,
            delay: Math.random() * 10,
            opacity: 0.3 + Math.random() * 0.4
        }));
    }, []);

    return (
        <div className="desert-scene" aria-hidden="true">
            {dust.map(d => (
                <span
                    key={d.id}
                    className="desert-dust"
                    style={{
                        top: `${d.top}%`,
                        width: `${d.size}px`,
                        height: `${d.size}px`,
                        opacity: d.opacity,
                        animationDuration: `${d.duration}s`,
                        animationDelay: `${d.delay}s`
                    }}
                />
            ))}

            <svg className="desert-dunes" viewBox="0 0 400 60" preserveAspectRatio="none">
                <path
                    d="M0,60 L0,35 Q75,15 150,32 Q225,48 300,25 Q350,12 400,28 L400,60 Z"
                    fill="#d9a441"
                    opacity="0.6"
                />
                <path
                    d="M0,60 L0,45 Q90,25 180,42 Q260,55 340,35 Q370,28 400,38 L400,60 Z"
                    fill="#a56a1e"
                />
            </svg>
        </div>
    );
}

const AURORA_STAR_COUNT = 35;

function AuroraScene() {
    const stars = useMemo(() => {
        return Array.from({ length: AURORA_STAR_COUNT }).map((_, i) => ({
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: 1 + Math.random() * 1.5,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 5
        }));
    }, []);

    return (
        <div className="aurora-scene" aria-hidden="true">
            {stars.map(s => (
                <span
                    key={s.id}
                    className="space-star"
                    style={{
                        top: `${s.top}%`,
                        left: `${s.left}%`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        animationDuration: `${s.duration}s`,
                        animationDelay: `${s.delay}s`
                    }}
                />
            ))}

            <svg className="aurora-layer aurora-1" viewBox="0 0 1200 220" preserveAspectRatio="none">
                <path
                    d="M0,40 C150,10 450,70 600,40 C750,10 1050,70 1200,40 L1200,0 L0,0 Z"
                    fill="#5ee6a8"
                    opacity="0.3"
                />
            </svg>
            <svg className="aurora-layer aurora-2" viewBox="0 0 1200 220" preserveAspectRatio="none">
                <path
                    d="M0,70 C150,30 450,100 600,60 C750,20 1050,90 1200,50 L1200,0 L0,0 Z"
                    fill="#8b7cf6"
                    opacity="0.28"
                />
            </svg>
            <svg className="aurora-layer aurora-3" viewBox="0 0 1200 220" preserveAspectRatio="none">
                <path
                    d="M0,30 C150,60 450,10 600,50 C750,80 1050,20 1200,55 L1200,0 L0,0 Z"
                    fill="#5fb3c4"
                    opacity="0.25"
                />
            </svg>
        </div>
    );
}

const BUBBLE_COUNT = 20;

function MintBubbles() {
    const bubbles = useMemo(() => {
        return Array.from({ length: BUBBLE_COUNT }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: 6 + Math.random() * 10,
            duration: 8 + Math.random() * 8,
            delay: Math.random() * 10,
            opacity: 0.3 + Math.random() * 0.3
        }));
    }, []);

    return (
        <div className="mint-bubbles" aria-hidden="true">
            {bubbles.map(b => (
                <span
                    key={b.id}
                    className="mint-bubble"
                    style={{
                        left: `${b.left}%`,
                        width: `${b.size}px`,
                        height: `${b.size}px`,
                        opacity: b.opacity,
                        animationDuration: `${b.duration}s`,
                        animationDelay: `${b.delay}s`
                    }}
                />
            ))}
        </div>
    );
}

function ThemeDecoration({ theme }) {
    if (theme === "sakura") return <SakuraPetals />;
    if (theme === "ocean") return <OceanWaves />;
    if (theme === "forest") return <ForestScene />;
    if (theme === "space") return <SpaceScene />;
    if (theme === "desert") return <DesertScene />;
    if (theme === "aurora") return <AuroraScene />;
    if (theme === "mint") return <MintBubbles />;
    return null;
}

export default ThemeDecoration;