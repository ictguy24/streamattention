import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Grid3X3, Lock, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoriesContainer } from "./containers";

type GalleryView = "discover" | "vault" | "curated";

const GalleryMode = () => {
  const [view, setView] = useState<GalleryView>("discover");

  const viewConfig = useMemo(
    () => ({
      discover: {
        title: "Discover Gallery",
        subtitle: "Ephemeral moments from people you follow",
      },
      vault: {
        title: "Private Vault",
        subtitle: "Saved memories and private streak moments",
      },
      curated: {
        title: "Curated Reels",
        subtitle: "Handpicked visuals based on your attention graph",
      },
    }),
    []
  );

  const cards = [
    { title: "Aesthetic", color: "from-fuchsia-500/30 to-violet-500/30" },
    { title: "Travel", color: "from-cyan-500/30 to-blue-500/30" },
    { title: "Lifestyle", color: "from-amber-500/30 to-orange-500/30" },
  ];

  return (
    <div className="px-4 space-y-4">
      <div className="rounded-2xl border border-border/40 bg-card/60 p-4 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary/70 mb-1">Social Gallery</p>
            <h3 className="text-lg font-semibold text-foreground">{viewConfig[view].title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{viewConfig[view].subtitle}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            {view === "vault" ? (
              <Lock className="w-4 h-4 text-primary" />
            ) : view === "curated" ? (
              <Wand2 className="w-4 h-4 text-primary" />
            ) : (
              <Grid3X3 className="w-4 h-4 text-primary" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(["discover", "vault", "curated"] as GalleryView[]).map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={cn(
                "rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                view === option ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option === "discover" ? "Discover" : option === "vault" ? "Vault" : "Curated"}
            </button>
          ))}
        </div>
      </div>

      {view === "curated" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cards.map((card) => (
            <motion.button
              key={card.title}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative h-28 rounded-xl border border-border/30 overflow-hidden text-left p-3",
                "bg-gradient-to-br",
                card.color
              )}
            >
              <div className="absolute inset-0 bg-background/30" />
              <div className="relative z-10">
                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Tap to open themed feed</p>
              </div>
              <Sparkles className="relative z-10 w-4 h-4 text-foreground/80 mt-4" />
            </motion.button>
          ))}
        </div>
      ) : (
        <StoriesContainer showVault={view === "vault"} destination="gallery" />
      )}
    </div>
  );
};

export default GalleryMode;
