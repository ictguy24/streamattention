import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ColorScheme = "neon" | "sunset" | "ocean" | "forest" | "royal" | "minimal";
export type FontOption = "inter" | "poppins" | "space" | "mono" | "serif";
export type ThemeMode = "dark" | "light";

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  font: FontOption;
  setFont: (font: FontOption) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_SCHEMES: Record<ColorScheme, { primary: string; secondary: string; accent: string }> = {
  neon: { primary: "185 100% 50%", secondary: "270 70% 50%", accent: "320 100% 60%" },
  sunset: { primary: "25 100% 55%", secondary: "340 80% 55%", accent: "45 100% 60%" },
  ocean: { primary: "200 100% 50%", secondary: "230 80% 55%", accent: "180 70% 50%" },
  forest: { primary: "140 70% 45%", secondary: "170 60% 40%", accent: "90 60% 50%" },
  royal: { primary: "260 80% 60%", secondary: "290 70% 50%", accent: "220 80% 55%" },
  minimal: { primary: "0 0% 50%", secondary: "0 0% 40%", accent: "0 0% 60%" },
};

const FONT_FAMILIES: Record<FontOption, string> = {
  inter: "'Inter', system-ui, sans-serif",
  poppins: "'Poppins', system-ui, sans-serif",
  space: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
  serif: "'Playfair Display', serif",
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => 
    (localStorage.getItem("colorScheme") as ColorScheme) || "neon"
  );
  const [font, setFont] = useState<FontOption>(() => 
    (localStorage.getItem("font") as FontOption) || "inter"
  );
  const [mode, setMode] = useState<ThemeMode>(() => 
    (localStorage.getItem("themeMode") as ThemeMode) || "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    const scheme = COLOR_SCHEMES[colorScheme];
    
    root.style.setProperty("--primary", scheme.primary);
    root.style.setProperty("--secondary", scheme.secondary);
    root.style.setProperty("--accent", scheme.accent);
    root.style.setProperty("--ring", scheme.primary);
    root.style.setProperty("--ac-glow", scheme.primary);
    
    localStorage.setItem("colorScheme", colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    document.body.style.fontFamily = FONT_FAMILIES[font];
    localStorage.setItem("font", font);
  }, [font]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (mode === "light") {
      root.style.setProperty("--background", "0 0% 98%");
      root.style.setProperty("--foreground", "0 0% 5%");
      root.style.setProperty("--card", "0 0% 100%");
      root.style.setProperty("--card-foreground", "0 0% 5%");
      root.style.setProperty("--popover", "0 0% 100%");
      root.style.setProperty("--popover-foreground", "0 0% 5%");
      root.style.setProperty("--muted", "0 0% 92%");
      root.style.setProperty("--muted-foreground", "0 0% 40%");
      root.style.setProperty("--border", "0 0% 85%");
      root.style.setProperty("--input", "0 0% 90%");
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.style.setProperty("--background", "0 0% 0%");
      root.style.setProperty("--foreground", "0 0% 98%");
      root.style.setProperty("--card", "0 0% 4%");
      root.style.setProperty("--card-foreground", "0 0% 98%");
      root.style.setProperty("--popover", "0 0% 4%");
      root.style.setProperty("--popover-foreground", "0 0% 98%");
      root.style.setProperty("--muted", "0 0% 10%");
      root.style.setProperty("--muted-foreground", "0 0% 60%");
      root.style.setProperty("--border", "0 0% 15%");
      root.style.setProperty("--input", "0 0% 12%");
      root.classList.remove("light");
      root.classList.add("dark");
    }
    
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleMode = () => setMode(m => m === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, font, setFont, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
