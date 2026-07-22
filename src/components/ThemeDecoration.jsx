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

const BLADE_COUNT = 90;

function ForestGrass() {
    const blades = useMemo(() => {
        return Array.from({ length: BLADE_COUNT }).map((_, i) => ({
            id: i,
            left: (i / BLADE_COUNT) * 100 + (Math.random() * 2 - 1),
            height: 26 + Math.random() * 34,
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

function ThemeDecoration({ theme }) {
    if (theme === "sakura") return <SakuraPetals />;
    if (theme === "ocean") return <OceanWaves />;
    if (theme === "forest") return <ForestScene />;
    return null;
}

export default ThemeDecoration;