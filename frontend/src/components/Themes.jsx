const themeOptions = [
    { key: "white", name: "White", swatches: ["#ffffff", "#f5f4f0", "#1a1a18"] },
    { key: "sakura", name: "Sakura", swatches: ["#fff5f7", "#fdeaf0", "#d6437a"] },
    { key: "dark", name: "Dark", swatches: ["#0f1115", "#1c1f26", "#e8e6e3"] },
    { key: "ocean", name: "Ocean", swatches: ["#eaf5f7", "#e0f2f5", "#1a7f96"] },
    { key: "forest", name: "Forest", swatches: ["#f2f7ee", "#e2edd8", "#3f7d43"] },
    { key: "space", name: "Space", swatches: ["#0a0a1a", "#1b1b38", "#8b7cf6"] },
    { key: "desert", name: "Desert", swatches: ["#fbeecb", "#f3e2b8", "#c99a4e"] },
    { key: "aurora", name: "Aurora", swatches: ["#0d1225", "#1c2444", "#5ee6a8"] },
    { key: "mint", name: "Mint", swatches: ["#eafbf4", "#d3f5e6", "#2ea876"] }
];

function Themes({ theme, setTheme }) {
    return (
        <div className="themes-page">
            <h2 className="themes-title">Themes</h2>

            <div className="themes-grid">
                {themeOptions.map(opt => (
                    <button
                        key={opt.key}
                        className={`theme-card ${theme === opt.key ? "active" : ""}`}
                        onClick={() => setTheme(opt.key)}
                    >
                        <div className="theme-swatches">
                            {opt.swatches.map((c, i) => (
                                <span key={i} className="theme-swatch" style={{ background: c }} />
                            ))}
                        </div>
                        <span className="theme-name">{opt.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Themes;