import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { 
  GripVertical, Trophy, BarChart3, Grid, Clock, Palette, 
  Mic, ShoppingBag, Sparkles, ChevronRight, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Widget {
  id: string;
  name: string;
  icon: typeof Trophy;
  enabled: boolean;
  content?: React.ReactNode;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: "achievements", name: "Achievements", icon: Trophy, enabled: true },
  { id: "stats", name: "Activity Overview", icon: BarChart3, enabled: true },
  { id: "media", name: "Media Grid", icon: Grid, enabled: true },
  { id: "insights", name: "Visitor Insights", icon: Eye, enabled: true },
  { id: "timeline", name: "Timeline", icon: Clock, enabled: false },
  { id: "voice", name: "Voice Intro", icon: Mic, enabled: false },
  { id: "shop", name: "Mini Shop", icon: ShoppingBag, enabled: false },
  { id: "theme", name: "Theme Settings", icon: Palette, enabled: false },
];

interface CustomizableWidgetsProps {
  onWidgetOrderChange?: (widgets: Widget[]) => void;
}

const CustomizableWidgets = ({ onWidgetOrderChange }: CustomizableWidgetsProps) => {
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [isEditing, setIsEditing] = useState(false);

  const toggleWidget = (id: string) => {
    setWidgets(prev => 
      prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    );
  };

  const handleReorder = (newOrder: Widget[]) => {
    setWidgets(newOrder);
    onWidgetOrderChange?.(newOrder);
  };

  const enabledWidgets = widgets.filter(w => w.enabled);
  const disabledWidgets = widgets.filter(w => !w.enabled);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Profile Widgets</h3>
        </div>
        <motion.button
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            isEditing 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Done" : "Edit"}
        </motion.button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Enabled Widgets - Reorderable */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
              Active Widgets (drag to reorder)
            </p>
            <Reorder.Group 
              axis="y" 
              values={enabledWidgets} 
              onReorder={(newEnabled) => {
                const newWidgets = [...newEnabled, ...disabledWidgets];
                handleReorder(newWidgets);
              }}
              className="space-y-2"
            >
              {enabledWidgets.map((widget) => (
                <Reorder.Item
                  key={widget.id}
                  value={widget}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    className="glass-card rounded-xl p-3 flex items-center gap-3"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <div className="p-2 rounded-lg bg-primary/10">
                      <widget.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="flex-1 font-medium text-foreground">{widget.name}</span>
                    <motion.button
                      className="p-2 rounded-lg bg-muted hover:bg-destructive/20 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleWidget(widget.id)}
                    >
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Disabled Widgets */}
          {disabledWidgets.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                Available Widgets
              </p>
              <div className="space-y-2">
                {disabledWidgets.map((widget) => (
                  <motion.div
                    key={widget.id}
                    className="glass-card rounded-xl p-3 flex items-center gap-3 opacity-60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                  >
                    <div className="w-5" />
                    <div className="p-2 rounded-lg bg-muted">
                      <widget.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="flex-1 font-medium text-foreground">{widget.name}</span>
                    <motion.button
                      className="p-2 rounded-lg bg-muted hover:bg-primary/20 transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleWidget(widget.id)}
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Preview Mode - Show enabled widgets */
        <div className="space-y-2">
          {enabledWidgets.slice(0, 4).map((widget, index) => (
            <motion.div
              key={widget.id}
              className="glass-card rounded-xl p-3 flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <widget.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="flex-1 font-medium text-foreground">{widget.name}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          ))}
          {enabledWidgets.length > 4 && (
            <p className="text-xs text-muted-foreground text-center">
              +{enabledWidgets.length - 4} more widgets
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomizableWidgets;
