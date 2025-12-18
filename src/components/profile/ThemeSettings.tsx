import { motion } from "framer-motion";
import { Sun, Moon, Check, Palette, Type } from "lucide-react";
import { useTheme, ColorScheme, FontOption } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const COLOR_SCHEMES: { id: ColorScheme; name: string; colors: string[] }[] = [
  { id: "neon", name: "Neon Cyber", colors: ["#00d4ff", "#8b5cf6", "#ff0080"] },
  { id: "sunset", name: "Sunset Glow", colors: ["#ff8c00", "#ff3366", "#ffd700"] },
  { id: "ocean", name: "Ocean Breeze", colors: ["#0099ff", "#4169e1", "#00b3b3"] },
  { id: "forest", name: "Forest Zen", colors: ["#22c55e", "#2dd4bf", "#84cc16"] },
  { id: "royal", name: "Royal Purple", colors: ["#9333ea", "#d946ef", "#3b82f6"] },
  { id: "minimal", name: "Minimal Gray", colors: ["#808080", "#666666", "#999999"] },
];

const FONT_OPTIONS: { id: FontOption; name: string; preview: string }[] = [
  { id: "inter", name: "Inter", preview: "Aa" },
  { id: "poppins", name: "Poppins", preview: "Aa" },
  { id: "space", name: "Space Grotesk", preview: "Aa" },
  { id: "mono", name: "JetBrains Mono", preview: "Aa" },
  { id: "serif", name: "Playfair", preview: "Aa" },
];

const ThemeSettings = () => {
  const { colorScheme, setColorScheme, font, setFont, mode, toggleMode } = useTheme();

  return (
    <div className="space-y-6">
      {/* Dark/Light Mode Toggle */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === "dark" ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">Appearance</p>
              <p className="text-xs text-muted-foreground">
                {mode === "dark" ? "Dark mode" : "Light mode"}
              </p>
            </div>
          </div>
          <Switch checked={mode === "light"} onCheckedChange={toggleMode} />
        </div>
      </div>

      {/* Color Schemes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Color Scheme</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_SCHEMES.map((scheme) => (
            <motion.button
              key={scheme.id}
              className={cn(
                "glass-card rounded-xl p-3 text-left transition-all relative overflow-hidden",
                colorScheme === scheme.id && "ring-2 ring-primary"
              )}
              whileTap={{ scale: 0.98 }}
              onClick={() => setColorScheme(scheme.id)}
            >
              <div className="flex gap-1.5 mb-2">
                {scheme.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-foreground">{scheme.name}</p>
              {colorScheme === scheme.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Font Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Font Style</span>
        </div>
        <div className="space-y-2">
          {FONT_OPTIONS.map((fontOpt) => (
            <motion.button
              key={fontOpt.id}
              className={cn(
                "glass-card rounded-xl p-3 w-full flex items-center justify-between transition-all",
                font === fontOpt.id && "ring-2 ring-primary"
              )}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFont(fontOpt.id)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-medium text-primary"
                  style={{ 
                    fontFamily: fontOpt.id === "inter" ? "'Inter'" :
                               fontOpt.id === "poppins" ? "'Poppins'" :
                               fontOpt.id === "space" ? "'Space Grotesk'" :
                               fontOpt.id === "mono" ? "'JetBrains Mono'" :
                               "'Playfair Display'"
                  }}
                >
                  {fontOpt.preview}
                </div>
                <span className="font-medium text-foreground">{fontOpt.name}</span>
              </div>
              {font === fontOpt.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
