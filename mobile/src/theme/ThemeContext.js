import { createContext, useContext, useMemo, useState } from "react";
import { THEMES, DEFAULT_THEME } from "./themes";

const ThemeContext = createContext(null);

// initialTheme: RootNavigator, currentUser?.theme ?? "white" geçiriyor.
// Kullanıcı login/logout yaptığında currentUser değişip bu prop yeniden
// mount tetiklemez (Provider zaten NavigationContainer'ı sarıyor) - bu yüzden
// ThemesScreen, seçim yapıldığında context'teki setThemeKey'i çağırıyor,
// RootNavigator'daki currentUser.theme güncellemesine bağlı kalmıyor.
export function ThemeProvider({ initialTheme, children }) {
    const [themeKey, setThemeKey] = useState(initialTheme || DEFAULT_THEME);

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
