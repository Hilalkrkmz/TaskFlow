import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { THEMES, DEFAULT_THEME } from "./themes";

const ThemeContext = createContext(null);

// initialTheme: RootNavigator, currentUser?.theme geçiriyor. Provider,
// auth ekranları görünürken (currentUser henüz null) zaten mount olmuş
// oluyor - bu yüzden sadece ilk mount'taki initialTheme'i almak yetmiyor,
// login/auto-login tamamlanıp gerçek theme değeri geldiğinde de senkron
// olması için initialTheme değiştikçe themeKey'i güncelliyoruz.
export function ThemeProvider({ initialTheme, children }) {
    const [themeKey, setThemeKey] = useState(initialTheme || DEFAULT_THEME);

    useEffect(() => {
        if (initialTheme) {
            setThemeKey(initialTheme);
        }
    }, [initialTheme]);

    const value = useMemo(
        () => ({
            themeKey,
            setThemeKey,
            colors: THEMES[themeKey] || THEMES[DEFAULT_THEME],
        }),
        [themeKey]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return ctx;
}
