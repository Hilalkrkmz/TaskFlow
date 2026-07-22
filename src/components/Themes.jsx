const themeOptions = [
    { key: "white", name: "White", swatches: ["#ffffff", "#f5f4f0", "#1a1a18"] },
    { key: "sakura", name: "Sakura", swatches: ["#fff5f7", "#fdeaf0", "#d6437a"] },
    { key: "dark", name: "Dark", swatches: ["#0f1115", "#1c1f26", "#e8e6e3"] },
    { key: "ocean", name: "Ocean", swatches: ["#eaf5f7", "#e0f2f5", "#1a7f96"] },
    { key: "forest", name: "Forest", swatches: ["#f2f7ee", "#e2edd8", "#3f7d43"] }
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

            <p className="themes-note">More themes (Sunset, Cat) coming soon.</p>
        </div>
    );
}

export default Themes;